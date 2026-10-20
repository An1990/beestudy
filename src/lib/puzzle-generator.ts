// 竖式字谜题目生成器
// 生成"汉字代表数字"的加法/乘法竖式谜题

export interface CryptarithmeticPuzzle {
  id: string;
  // 题目描述
  description: string;
  // 竖式行（从下到上：加数1, 加数2, ..., 结果）
  rows: string[];
  // 运算符
  operator: '+' | '×';
  // 汉字到数字的映射（答案）
  solution: Record<string, number>;
  // 所有涉及的汉字
  chars: string[];
  // 问题：求哪些汉字的和
  question: string;
  // 答案值
  answer: number;
  // 难度 1-5
  difficulty: number;
}

const charPool = '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥蛇马羊猴鸡狗鼠牛虎兔龙';

// 生成随机不重复的汉字
function pickChars(count: number, exclude: string[] = []): string[] {
  const available = charPool.split('').filter(c => !exclude.includes(c));
  const result: string[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result;
}

// 生成加法竖式字谜
function generateAdditionPuzzle(difficulty: number): CryptarithmeticPuzzle | null {
  // 根据难度决定位数
  const digitCount = difficulty <= 2 ? 2 : difficulty <= 4 ? 3 : 4;
  const addendCount = difficulty <= 2 ? 2 : difficulty <= 4 ? 2 : 3;

  // 随机生成数字，确保首位不为0
  const addends: number[] = [];
  for (let i = 0; i < addendCount; i++) {
    const min = Math.pow(10, digitCount - 1);
    const max = Math.pow(10, digitCount) - 1;
    addends.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  const sum = addends.reduce((a, b) => a + b, 0);
  const sumStr = sum.toString();

  // 检查位数是否合理（结果位数不超过加数位数+1）
  if (sumStr.length > digitCount + 1) return null;

  // 收集所有数字位上的字符
  const allDigits = [...addends.map(String), sumStr].join('');
  const uniqueDigits = [...new Set(allDigits)];

  if (uniqueDigits.length > 10) return null; // 超过10个不同数字，无法映射

  // 为每个数字分配汉字
  const digitToChar: Record<string, string> = {};
  const chars = pickChars(uniqueDigits.length);

  for (let i = 0; i < uniqueDigits.length; i++) {
    digitToChar[uniqueDigits[i]] = chars[i];
  }

  // 确保首位汉字不映射到0
  const firstDigits = addends.map(a => a.toString()[0]);
  firstDigits.push(sumStr[0]);
  for (const fd of firstDigits) {
    if (digitToChar[fd] && digitToChar[fd] === chars[chars.length - 1] && Number(fd) === 0) {
      return null; // 首位为0，无效
    }
  }

  // 构建竖式行
  const rows = addends.map(a =>
    a.toString().split('').map(d => digitToChar[d] || d).join('')
  );
  rows.push(sumStr.split('').map(d => digitToChar[d] || d).join(''));

  // 构建解答映射
  const solution: Record<string, number> = {};
  for (const [digit, char] of Object.entries(digitToChar)) {
    solution[char] = Number(digit);
  }

  // 选择2-4个汉字求和作为问题
  const questionChars = chars.slice(0, Math.min(chars.length, 2 + Math.floor(Math.random() * 3)));
  const answer = questionChars.reduce((sum, c) => sum + solution[c], 0);

  return {
    id: `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: `如图竖式中，相同的汉字代表相同的数字，不同的汉字代表不同的数字`,
    rows,
    operator: '+',
    solution,
    chars,
    question: questionChars.join('+'),
    answer,
    difficulty,
  };
}

// 生成乘法竖式字谜（简单版：一位数 × 多位数）
function generateMultiplicationPuzzle(difficulty: number): CryptarithmeticPuzzle | null {
  const digitCount = difficulty <= 2 ? 2 : 3;
  const multiplier = Math.floor(Math.random() * 8) + 2; // 2-9
  const multiplicand = Math.floor(Math.random() * (Math.pow(10, digitCount) - Math.pow(10, digitCount - 1))) + Math.pow(10, digitCount - 1);
  const product = multiplier * multiplicand;

  const allDigits = [...multiplicand.toString(), multiplier.toString(), ...product.toString()].join('');
  const uniqueDigits = [...new Set(allDigits)];

  if (uniqueDigits.length > 10) return null;

  const chars = pickChars(uniqueDigits.length);
  const digitToChar: Record<string, string> = {};
  for (let i = 0; i < uniqueDigits.length; i++) {
    digitToChar[uniqueDigits[i]] = chars[i];
  }

  const rows = [
    multiplicand.toString().split('').map(d => digitToChar[d] || d).join(''),
    product.toString().split('').map(d => digitToChar[d] || d).join(''),
  ];

  const solution: Record<string, number> = {};
  for (const [digit, char] of Object.entries(digitToChar)) {
    solution[char] = Number(digit);
  }

  const questionChars = chars.slice(0, Math.min(chars.length, 3));
  const answer = questionChars.reduce((sum, c) => sum + solution[c], 0);

  return {
    id: `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: `如图竖式中，相同的汉字代表相同的数字，不同的汉字代表不同的数字`,
    rows,
    operator: '×',
    solution,
    chars,
    question: questionChars.join('+'),
    answer,
    difficulty,
  };
}

// 主生成函数
export function generatePuzzle(difficulty: number = 2, type: 'addition' | 'multiplication' | 'random' = 'random'): CryptarithmeticPuzzle | null {
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    const puzzleType = type === 'random' ? (Math.random() > 0.3 ? 'addition' : 'multiplication') : type;
    const puzzle = puzzleType === 'addition'
      ? generateAdditionPuzzle(difficulty)
      : generateMultiplicationPuzzle(difficulty);
    if (puzzle) return puzzle;
  }
  return null;
}

// 批量生成
export function generatePuzzles(count: number, difficulty: number = 2): CryptarithmeticPuzzle[] {
  const puzzles: CryptarithmeticPuzzle[] = [];
  for (let i = 0; i < count; i++) {
    const puzzle = generatePuzzle(difficulty);
    if (puzzle) puzzles.push(puzzle);
  }
  return puzzles;
}
