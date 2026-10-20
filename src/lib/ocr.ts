// 百度 OCR API 配置（通过 Vite 代理，避免 CORS 问题）
// 通用文字识别（标准版）+ 高精度版
// 文档：https://ai.baidu.com/ai-doc/OCR

const BAIDU_OCR = {
  apiKey: 'VupAUGDHODlslQPJcHrbZOSS',
  secretKey: 'CgjxX6C73ecpm1Sqzj17I85QqPXIrBYN',
  // 通过 Vite 代理转发，避免浏览器 CORS 限制
  standardUrl: '/api/baidu-ocr/rest/2.0/ocr/v1/general_basic',
  accurateUrl: '/api/baidu-ocr/rest/2.0/ocr/v1/accurate_basic',
  tokenUrl: '/api/baidu-ocr/oauth/2.0/token',
};

export interface OcrResult {
  text: string;
  confidence: number;
  lines: OcrLine[];
}

export interface OcrLine {
  text: string;
  confidence: number;
}

export interface ParsedQuestion {
  prompt: string;
  type: 'choice' | 'fill' | 'calc' | 'text';
  subjectCode: 'chinese' | 'math' | 'english';
  // 竖式格式：保留多行结构
  format?: 'normal' | 'vertical';
  verticalLines?: string[];
  verticalOperator?: string;
}

// 获取百度 Access Token（带缓存，有效期 30 天）
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${BAIDU_OCR.tokenUrl}?grant_type=client_credentials&client_id=${BAIDU_OCR.apiKey}&client_secret=${BAIDU_OCR.secretKey}`,
    { method: 'POST' }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`获取 Token 失败: ${data.error_description || data.error}`);
  }

  // Token 有效期 2592000 秒（30天），提前 1 天刷新
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 86400) * 1000,
  };

  return cachedToken.token;
}

// 调用百度 OCR API
async function callBaiduOcr(imageBase64: string, useAccurate = false): Promise<OcrResult> {
  const token = await getAccessToken();
  const url = `${useAccurate ? BAIDU_OCR.accurateUrl : BAIDU_OCR.standardUrl}?access_token=${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `image=${encodeURIComponent(imageBase64)}&language_type=CHN_ENG&detect_direction=true&paragraph=true`,
  });

  const data = await response.json();

  if (data.error_code) {
    throw new Error(`OCR 识别失败: ${data.error_msg} (code: ${data.error_code})`);
  }

  const lines: OcrLine[] = (data.words_result || []).map((item: { words: string; prob?: { average?: number } }) => ({
    text: item.words,
    confidence: item.prob?.average ?? 0.9,
  }));

  const text = lines.map(l => l.text).join('\n');
  const avgConfidence = lines.length > 0
    ? lines.reduce((sum: number, l: OcrLine) => sum + l.confidence, 0) / lines.length
    : 0;

  return { text, confidence: avgConfidence, lines };
}

// 文件转 Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 主识别函数 - 优先标准版，失败自动降级高精度版
export async function recognizeImage(file: File, useAccurate = false): Promise<OcrResult> {
  const base64 = await fileToBase64(file);

  try {
    return await callBaiduOcr(base64, useAccurate);
  } catch (error: any) {
    console.warn('标准版识别失败，尝试高精度版:', error.message);
    if (!useAccurate) {
      return await callBaiduOcr(base64, true);
    }
    throw error;
  }
}

// 从 OCR 文本中解析出题目
// 核心逻辑：以题号（如 "3." "4、"）作为题目分隔符，同一题的多行合并
export function parseQuestions(text: string, subjectCode: 'chinese' | 'math' | 'english' = 'math'): ParsedQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const questions: ParsedQuestion[] = [];

  // 判断一行是否是新题目的开始（以题号开头）
  function isNewQuestionStart(line: string): boolean {
    return /^\d{1,3}[.、)\s]/.test(line);
  }

  // 判断是否是纯标题/大题号（如 "一、计算题" "第3题"）
  function isSectionHeader(line: string): boolean {
    if (/^[一二三四五六七八九十]+[、.]\s*$/.test(line)) return true;
    if (/^第[一二三四五六七八九十\d]+[题部分章]/.test(line)) return true;
    if (/^（[一二三四五六七八九十\d]+）/.test(line)) return true;
    return false;
  }

  // 判断题目类型
  function detectType(text: string): ParsedQuestion['type'] {
    if (/[+\-×÷=]/.test(text) && /\d/.test(text)) return 'calc';
    if (/A[.、\s]|B[.、\s]|C[.、\s]|D[.、\s]/.test(text) || /选择/.test(text)) return 'choice';
    if (/\(\s*\)/.test(text) || /_{2,}/.test(text) || /____/.test(text) || /（\s*）/.test(text)) return 'fill';
    return 'text';
  }

  // 检测是否为竖式题目（多行堆叠的加法/乘法）
  function detectVertical(block: string[]): { isVertical: boolean; lines: string[]; operator: string } {
    if (block.length < 3) return { isVertical: false, lines: [], operator: '' };
    // 检查是否有多行纯数字/汉字（无运算符），且其中一行有 + 或 ×
    const hasOperator = block.some(l => /^[+×]/.test(l.trim()) || l.trim().includes('+') || l.trim().includes('×'));
    const allSimple = block.every(l => /^[\d\u4e00-\u9fff\s+×\-·.（）()]+$/.test(l.trim()));
    if (hasOperator && allSimple && block.length >= 3) {
      // 合并被 OCR 错误拆分的单字符行（如 "巳" + "蛇年" → "巳蛇年"）
      const merged: string[] = [];
      let j = 0;
      while (j < block.length) {
        const cur = block[j].trim();
        const nxt = block[j + 1]?.trim();
        if (cur.length === 1 && nxt && !/^[+××*]/.test(nxt) && !/=/.test(nxt)) {
          merged.push(cur + nxt);
          j += 2;
        } else {
          merged.push(cur);
          j++;
        }
      }
      // 提取运算符
      let operator = '+';
      for (const l of merged) {
        if (l.startsWith('+')) operator = '+';
        else if (l.startsWith('×') || l.startsWith('*')) operator = '×';
      }
      return { isVertical: true, lines: merged, operator };
    }
    return { isVertical: false, lines: [], operator: '' };
  }

  // 分组：将文本按题号分成多个题目块
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (isSectionHeader(line)) {
      // 大题标题，跳过但开始新块
      if (currentBlock.length > 0) blocks.push(currentBlock);
      currentBlock = [];
      continue;
    }

    if (isNewQuestionStart(line)) {
      // 新题目开始，保存之前的块
      if (currentBlock.length > 0) blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      //  continuation line，追加到当前块
      if (currentBlock.length === 0) {
        // 没有题号的独立行，单独成块
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);

  // 清除等式中的答案数字（如 "乙+已+蛇+年=17" → "乙+已+蛇+年="）
  function removeAnswerFromEquation(text: string): string {
    // 匹配 "xxx=数字" 模式，去掉等号后面的数字
    return text.replace(/=(\d+(?:\.\d+)?)/g, '=');
  }

  // 将每个块合并为一道题
  for (const block of blocks) {
    // 检测竖式格式
    const vertical = detectVertical(block);

    if (vertical.isVertical) {
      // 竖式题目：分离题目描述和竖式内容
      const firstLine = block[0];
      
      // 题目描述只取第一行（去掉题号）
      let questionText = isNewQuestionStart(firstLine)
        ? firstLine.replace(/^\d{1,3}[.、)\s]+\s*/, '')
        : firstLine;
      
      // 清除等式中的答案（如 "乙+巳+蛇+年=17" → "乙+巳+蛇+年="）
      questionText = removeAnswerFromEquation(questionText);
      
      // 竖式内容完整保留（包括底部的结果数字如2025，这是题目的一部分）
      const vLines = [...vertical.lines];

      questions.push({
        prompt: questionText,
        type: 'calc',
        subjectCode,
        format: 'vertical',
        verticalLines: vLines,
        verticalOperator: vertical.operator,
      });
      continue;
    }

    // 普通题目：合并多行
    const fullText = block.join('\n');

    // 提取题号（如果有）
    const firstLine = block[0];
    let prompt = isNewQuestionStart(firstLine)
      ? fullText.replace(/^\d{1,3}[.、)\s]+\s*/, '')
      : fullText;

    // 清除等式中的答案
    prompt = removeAnswerFromEquation(prompt);

    if (prompt.length < 2) continue; // 跳过太短的

    questions.push({
      prompt,
      type: detectType(fullText),
      subjectCode,
      format: 'normal',
    });
  }

  return questions;
}
