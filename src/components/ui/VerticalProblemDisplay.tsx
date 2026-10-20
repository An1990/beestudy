import React from 'react';

interface VerticalProblemDisplayProps {
  lines: string[];
  operator: string;
  question?: string; // 题目描述文字（如 "乙+已+蛇+年=?"）
}

// 竖式题目展示组件
// 将多行竖式以右对齐方式渲染，带横线和运算符
export default function VerticalProblemDisplay({ lines, operator, question }: VerticalProblemDisplayProps) {
  // 找到最长的一行，用于计算宽度
  const maxLen = Math.max(...lines.map(l => l.replace(/^[+×]\s*/, '').length));

  // 分离运算行（带 + 或 × 的行）和其他行
  const operatorLineIndex = lines.findIndex(l => /^[+×]/.test(l.trim()));

  return (
    <div className="my-4">
      {question && (
        <p className="text-gray-700 mb-3 text-sm leading-relaxed">{question}</p>
      )}
      <div className="inline-block bg-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="font-mono text-lg leading-relaxed">
          {lines.map((line, i) => {
            const isOperatorLine = i === operatorLineIndex;
            const isLastLine = i === lines.length - 1;
            const cleanText = line.replace(/^[+×]\s*/, '');
            const prefix = isOperatorLine ? (line.trim()[0] || operator) : '';

            return (
              <React.Fragment key={i}>
                <div className="flex items-center justify-end gap-1 min-h-[1.8em]">
                  {prefix && (
                    <span className="text-gray-800 font-bold w-5 text-right">{prefix}</span>
                  )}
                  <span
                    className="text-gray-800 tracking-wider"
                    style={{
                      minWidth: `${maxLen}ch`,
                      textAlign: 'right',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {cleanText}
                  </span>
                </div>
                {/* 在最后一行运算数之后画横线 */}
                {isOperatorLine && i === lines.length - 2 && (
                  <div
                    className="border-t-2 border-gray-800 my-1"
                    style={{ width: `${(maxLen + 2) * 0.95}em`, marginLeft: 'auto' }}
                  />
                )}
                {/* 如果是最后一行（结果），也画横线 */}
                {isLastLine && !isOperatorLine && operatorLineIndex >= 0 && (
                  <div
                    className="border-t-2 border-gray-800 my-1"
                    style={{ width: `${(maxLen + 2) * 0.95}em`, marginLeft: 'auto' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
