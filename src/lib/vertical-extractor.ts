// 从描述文本中提取竖式信息（回退逻辑，用于旧任务）
export interface ExtractedVertical {
  question: string;
  lines: string[];
  operator: string;
}

export function extractVerticalFromDescription(description: string): ExtractedVertical | null {
  if (!description) return null;

  // 查找竖式关键词
  const hasVerticalKeyword = /竖式|竖着|列竖式/i.test(description);
  if (!hasVerticalKeyword) return null;

  // 找到"那么："或"求"之后的内容作为竖式部分
  const verticalMatch = description.match(/(?:那么[：:]?\s*|求\s*)(.+)$/s);
  if (!verticalMatch) return null;

  const afterKeyword = verticalMatch[1].trim();

  // 尝试从文本中提取竖式行
  // 模式：多行由空格/换行分隔，最后一行是结果，前面有运算符
  // 例如："乙+已+蛇+年=17·蛇年 巳 蛇年 +乙已蛇年 2025"
  // 或："蛇年\n巳\n蛇年\n+乙已蛇年\n2025"

  // 先尝试按换行分割
  let parts = afterKeyword.split(/\n+/).map(s => s.trim()).filter(s => s);

  // 如果没有换行，尝试按特定模式分割
  if (parts.length <= 1) {
    // 尝试用 · 或特殊分隔符
    parts = afterKeyword.split(/[·•]/).map(s => s.trim()).filter(s => s);
  }

  // 修复 OCR 错误：合并被错误拆分的行
  // 例如："巳" + "蛇年" → "巳蛇年"
  // 规则：单字符行 + 下一行 = 合并（如果下一行不以运算符开头）
  const mergedParts: string[] = [];
  let i = 0;
  while (i < parts.length) {
    const current = parts[i];
    const next = parts[i + 1];
    
    // 如果当前行是单字符，且下一行存在且不以运算符开头，合并
    if (current.length === 1 && next && !/^[+××*]/.test(next) && !/=/.test(next)) {
      mergedParts.push(current + next);
      i += 2; // 跳过下一行
    } else {
      mergedParts.push(current);
      i++;
    }
  }
  parts = mergedParts;

  if (parts.length < 3) return null;

  // 提取运算符
  let operator = '+';
  let operatorIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    if (/^[+××*]/.test(parts[i])) {
      operator = parts[i][0] === '*' ? '×' : parts[i][0];
      operatorIndex = i;
      break;
    }
  }

  // 如果没找到运算符行，检查是否嵌在文本中
  if (operatorIndex === -1) {
    for (let i = 0; i < parts.length; i++) {
      if (/[+××*]/.test(parts[i]) && !/=/.test(parts[i])) {
        // 这行包含运算符但不是等式
        const opMatch = parts[i].match(/([+××*])(.+)/);
        if (opMatch) {
          operator = opMatch[1] === '*' ? '×' : opMatch[1];
          parts[i] = opMatch[1] + opMatch[2]; // 确保运算符在开头
          operatorIndex = i;
          break;
        }
      }
    }
  }

  // 分离问题描述和竖式行
  // 第一行可能包含问题（如 "乙+已+蛇+年=17"）
  let question = '';
  let verticalLines: string[] = [];

  if (parts.length >= 3) {
    // 检查第一行是否是问题（包含等号）
    if (/=/.test(parts[0]) && !/^[+××*]/.test(parts[0])) {
      question = parts[0];
      verticalLines = parts.slice(1);
    } else {
      verticalLines = parts;
    }
  }

  if (verticalLines.length < 3) return null;

  // 确保运算符行格式正确
  if (operatorIndex >= 0 && !/^[+××*]/.test(verticalLines[operatorIndex - (question ? 1 : 0)] || '')) {
    // 调整运算符行
    const adjustedIndex = question ? operatorIndex - 1 : operatorIndex;
    if (adjustedIndex >= 0 && adjustedIndex < verticalLines.length) {
      const line = verticalLines[adjustedIndex];
      if (!/^[+××*]/.test(line)) {
        verticalLines[adjustedIndex] = operator + line;
      }
    }
  }

  return {
    question: question || '',
    lines: verticalLines,
    operator,
  };
}
