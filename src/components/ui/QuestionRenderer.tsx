import React, { useState } from 'react';

interface QuestionRendererProps {
  text: string;
}

// 题目文本渲染组件
// 自动检测等式模式，将等号后面渲染为可填写的输入框
// 支持：乙+巳+蛇+年=17  或  乙+巳+蛇+年=___  或  乙+巳+蛇+年=
export default function QuestionRenderer({ text }: QuestionRendererProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // 用正则把文本按等号分割，但保留等号
  // 匹配模式：任意内容 = 数字/下划线/空格
  // 例如："乙+巳+蛇+年=17" → ["乙+巳+蛇+年", "=17"]
  const segments = text.split(/(?==)/);

  let inputIndex = 0;

  return (
    <div className="text-gray-700 text-base leading-relaxed flex flex-wrap items-baseline gap-1">
      {segments.map((segment, i) => {
        // 检查是否以 = 开头
        if (segment.startsWith('=')) {
          // 提取 = 后面的内容（数字、下划线、空格等）
          const afterEquals = segment.slice(1);
          // 匹配开头的数字/下划线/空格部分作为答案区域
          const answerMatch = afterEquals.match(/^([\s_0-9.]*)/);
          const answerPart = answerMatch ? answerMatch[1] : '';
          const restPart = afterEquals.slice(answerPart.length);

          const currentInputIndex = inputIndex++;
          const currentValue = answers[currentInputIndex] || answerPart.trim();

          return (
            <React.Fragment key={i}>
              <span>=</span>
              <input
                type="text"
                value={currentValue}
                onChange={(e) => {
                  const newAnswers = { ...answers, [currentInputIndex]: e.target.value };
                  setAnswers(newAnswers);
                }}
                className="inline-block w-24 text-center border-b-2 border-red-400 bg-transparent focus:outline-none focus:border-red-500 font-bold text-red-600 mx-1"
                placeholder="___"
                style={{ minWidth: '60px' }}
              />
              {restPart && <span>{restPart}</span>}
            </React.Fragment>
          );
        }

        return <span key={i}>{segment}</span>;
      })}
    </div>
  );
}
