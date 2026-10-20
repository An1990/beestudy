import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePuzzle, type CryptarithmeticPuzzle } from '../../lib/puzzle-generator';
import { Card } from '../../components/ui';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, HelpCircle, Lightbulb, Zap, Trophy } from 'lucide-react';

export default function ChildPuzzlePractice() {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<CryptarithmeticPuzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'answering' | 'correct' | 'wrong'>('answering');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [difficulty, setDifficulty] = useState(2);
  const [showHint, setShowHint] = useState(false);
  const [charValues, setCharValues] = useState<Record<string, string>>({});

  const newPuzzle = () => {
    const p = generatePuzzle(difficulty, 'addition');
    if (p) {
      setPuzzle(p);
      setUserAnswer('');
      setStatus('answering');
      setShowHint(false);
      setCharValues({});
    }
  };

  useEffect(() => {
    newPuzzle();
  }, [difficulty]);

  const handleSubmit = () => {
    if (!puzzle || !userAnswer.trim()) return;
    const num = parseInt(userAnswer.trim());
    setTotal(t => t + 1);
    if (num === puzzle.answer) {
      setStatus('correct');
      setScore(s => s + 1);
    } else {
      setStatus('wrong');
    }
  };

  const handleCharValueChange = (char: string, value: string) => {
    setCharValues(prev => ({ ...prev, [char]: value }));
  };

  if (!puzzle) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">题目生成中...</p>
      </div>
    );
  }

  const maxRowLen = Math.max(...puzzle.rows.map(r => r.length));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            答对 <strong className="text-green-600">{score}</strong> / {total}
          </span>
          {total > 0 && (
            <span className="text-sm font-medium text-warm-500">
              {Math.round((score / total) * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" /> 竖式字谜挑战
        </h1>
        <p className="text-gray-500 text-sm mt-1">相同的汉字代表相同的数字，不同的汉字代表不同的数字</p>
      </div>

      {/* Difficulty */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map(d => (
          <button key={d} onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              difficulty === d ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {'⭐'.repeat(d)}
          </button>
        ))}
      </div>

      {/* Puzzle Card */}
      <Card className="!p-6">
        <p className="text-center text-sm text-gray-500 mb-4">{puzzle.description}</p>

        {/* Vertical Format */}
        <div className="flex justify-center mb-6">
          <div className="inline-block">
            {puzzle.rows.map((row, idx) => {
              const isLast = idx === puzzle.rows.length - 1;
              const isOperatorRow = idx === puzzle.rows.length - 2;
              const paddedRow = row.padStart(maxRowLen, ' ');

              return (
                <div key={idx} className="flex items-center">
                  {isOperatorRow && (
                    <span className="w-8 text-center text-xl font-bold text-gray-600">{puzzle.operator}</span>
                  )}
                  {!isOperatorRow && !isLast && <span className="w-8" />}
                  <div className="flex">
                    {paddedRow.split('').map((char, ci) => (
                      <span key={ci} className={`w-10 h-12 flex items-center justify-center text-xl font-bold ${
                        isLast ? 'text-primary-600 border-t-2 border-gray-800 pt-2 mt-1' : 'text-gray-800'
                      }`}>
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">
            那么：<span className="text-primary-600 font-bold">{puzzle.question} = </span>
            {status === 'answering' ? (
              <input
                type="number"
                className="w-20 text-center text-xl font-bold text-primary-600 border-b-2 border-primary-300 focus:border-primary-500 outline-none bg-transparent"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="?"
                autoFocus
              />
            ) : status === 'correct' ? (
              <span className="text-green-600 font-bold text-xl">{puzzle.answer} <CheckCircle2 className="w-5 h-5 inline text-green-500" /></span>
            ) : (
              <span className="text-red-500 font-bold text-xl line-through">{userAnswer} <XCircle className="w-5 h-5 inline" /></span>
            )}
          </p>
        </div>

        {/* Hint: Character-Value Mapping */}
        {showHint && (
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-amber-800 mb-2">提示：尝试给每个汉字分配数字</p>
            <div className="flex flex-wrap gap-2">
              {puzzle.chars.map(char => (
                <div key={char} className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
                  <span className="font-bold text-gray-800">{char}</span>
                  <span className="text-gray-400">=</span>
                  <input
                    type="number"
                    min="0"
                    max="9"
                    className="w-8 text-center text-sm font-bold text-amber-600 border border-amber-200 rounded outline-none focus:border-amber-400"
                    value={charValues[char] || ''}
                    onChange={e => handleCharValueChange(char, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {status === 'correct' && (
          <div className="text-center py-3 bg-green-50 rounded-xl mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
            <p className="text-green-700 font-medium">回答正确！太棒了！</p>
          </div>
        )}
        {status === 'wrong' && (
          <div className="text-center py-3 bg-red-50 rounded-xl mb-4">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
            <p className="text-red-700 font-medium">再想想看～</p>
            <p className="text-sm text-red-500 mt-1">
              正确答案是 <strong>{puzzle.answer}</strong>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {status === 'answering' && (
            <>
              <button
                onClick={() => setShowHint(!showHint)}
                className="btn-ghost flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" /> {showHint ? '隐藏提示' : '提示'}
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex items-center gap-2"
                disabled={!userAnswer.trim()}
              >
                提交答案
              </button>
            </>
          )}
          {status !== 'answering' && (
            <button onClick={newPuzzle} className="btn-primary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> 下一题
            </button>
          )}
          <button onClick={newPuzzle} className="btn-ghost flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> 换一题
          </button>
        </div>
      </Card>

      {/* Solution (shown after wrong answer) */}
      {status === 'wrong' && (
        <Card className="!p-4 bg-blue-50 border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> 解题思路
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. 从竖式最右边（个位）开始分析</p>
            <p>2. 观察哪些汉字出现在相同位置</p>
            <p>3. 利用"相同汉字=相同数字"的条件逐步推理</p>
            <p>4. 注意首位汉字不能为 0</p>
          </div>
          <div className="mt-3 p-3 bg-white rounded-xl">
            <p className="text-xs text-gray-500 mb-1">本题解答：</p>
            <div className="flex flex-wrap gap-2">
              {puzzle.chars.map(char => (
                <span key={char} className="text-sm">
                  <strong className="text-gray-800">{char}</strong>
                  <span className="text-gray-400"> = </span>
                  <strong className="text-primary-600">{puzzle.solution[char]}</strong>
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
