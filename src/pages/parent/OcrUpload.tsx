import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/store';
import { subjects } from '../../lib/mock-data';
import { Card, SubjectBadge } from '../../components/ui';
import { recognizeImage, parseQuestions, type OcrResult, type ParsedQuestion } from '../../lib/ocr';
import type { SubjectCode } from '../../lib/types';
import {
  Camera, Upload, X, CheckCircle2, AlertCircle, Loader2,
  FileText, Image as ImageIcon, Scan, Plus, Trash2, Edit3, Save, Columns3
} from 'lucide-react';

type Step = 'upload' | 'recognizing' | 'review' | 'done';

export default function ParentOcrUpload() {
  const navigate = useNavigate();
  const { student, addTask } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode>('math');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [taskTitle, setTaskTitle] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('请上传图片或 PDF 文件');
      return;
    }

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setStep('recognizing');
    setProgress(0);

    // 模拟识别进度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    recognizeImage(file).then(result => {
      clearInterval(progressInterval);
      setProgress(100);
      setOcrResult(result);
      const parsed = parseQuestions(result.text, selectedSubject);
      setQuestions(parsed);
      setSelectedQuestions(new Set(parsed.map((_, i) => i)));
      setTimeout(() => setStep('review'), 500);
    });
  }, [selectedSubject]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const toggleQuestion = (index: number) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updateQuestionPrompt = (index: number, prompt: string) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, prompt } : q));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleSaveAsTask = () => {
    const selected = questions.filter((_, i) => selectedQuestions.has(i));
    if (selected.length === 0) return;

    const title = taskTitle || `拍照录题 - ${subjects.find(s => s.code === selectedSubject)?.name || '未知'}`;

    // 如果只有一道题且是竖式，直接传递竖式信息
    const isSingleVertical = selected.length === 1 && selected[0].format === 'vertical';

    // 描述文本：只使用 prompt（已清理过，不含竖式行）
    const description = selected.map(q => q.prompt).join('\n\n---\n\n');

    addTask({
      id: `task-ocr-${Date.now()}`,
      studentId: student.id,
      subjectCode: selectedSubject,
      title,
      description,
      taskType: 'homework',
      plannedDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: selected.length * 3,
      priority: 2,
      completionCriteria: `完成 ${selected.length} 道题目`,
      requiresParentReview: true,
      status: 'planned',
      sortOrder: 0,
      pointsReward: selected.length * 2,
      createdAt: new Date().toISOString(),
      // 竖式信息
      ...(isSingleVertical ? {
        verticalLines: selected[0].verticalLines,
        verticalOperator: selected[0].verticalOperator,
      } : {}),
    });

    setStep('done');
  };

  const reset = () => {
    setStep('upload');
    setPreview('');
    setFileName('');
    setOcrResult(null);
    setQuestions([]);
    setSelectedQuestions(new Set());
    setTaskTitle('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const typeLabels = { choice: '选择题', fill: '填空题', calc: '计算题', text: '问答题' };
  const typeColors = {
    choice: 'bg-blue-100 text-blue-700',
    fill: 'bg-purple-100 text-purple-700',
    calc: 'bg-amber-100 text-amber-700',
    text: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-7 h-7 text-primary-500" /> 拍照录题
          </h1>
          <p className="text-gray-500 text-sm mt-1">上传作业照片或文档，自动识别题目并录入系统</p>
        </div>
        {step !== 'upload' && (
          <button onClick={reset} className="btn-ghost text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> 重新上传
          </button>
        )}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Subject Selection */}
          <Card className="!p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">选择学科</p>
            <div className="flex gap-2">
              {subjects.map(s => (
                <button key={s.code}
                  onClick={() => setSelectedSubject(s.code)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedSubject === s.code
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {s.name}
                  <span className="text-xs opacity-70">({s.publisher})</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Upload Area */}
          <Card
            className="!p-8 cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">拖拽图片到此处，或点击上传</h3>
              <p className="text-sm text-gray-500 mb-4">支持 JPG、PNG、PDF 格式，建议图片清晰、光线充足</p>
              <div className="flex justify-center gap-3">
                <button className="btn-primary flex items-center gap-2" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <ImageIcon className="w-4 h-4" /> 选择图片
                </button>
                <button className="btn-ghost flex items-center gap-2" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Camera className="w-4 h-4" /> 拍照上传
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={onFileChange}
            />
          </Card>

          {/* Tips */}
          <Card className="!p-4 bg-amber-50 border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> 拍摄建议
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 保持纸张平整，避免褶皱和阴影</li>
              <li>• 光线充足，避免反光和过暗</li>
              <li>• 拍摄时保持手机与纸张平行</li>
              <li>• 确保文字清晰可辨，分辨率不低于 1080p</li>
              <li>• 文件名包含学科关键词可提高识别准确度（如"数学作业.jpg"）</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Step 2: Recognizing */}
      {step === 'recognizing' && (
        <Card className="!p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {preview && (
              <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={preview} alt="预览" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">正在识别题目...</h3>
                  <p className="text-sm text-gray-500">{fileName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{progress < 30 ? '上传图片...' : progress < 60 ? '文字识别中...' : progress < 90 ? '题目解析中...' : '即将完成...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 'review' && ocrResult && (
        <div className="space-y-6">
          {/* OCR Result Summary */}
          <Card className="!p-4 bg-green-50 border-green-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-800">识别完成！</p>
                <p className="text-sm text-green-600">
                  置信度 {Math.round(ocrResult.confidence * 100)}% · 共识别 {questions.length} 道题目 · 已选 {selectedQuestions.size} 道
                </p>
              </div>
            </div>
          </Card>

          {/* Image Preview + OCR Text */}
          <div className="grid md:grid-cols-2 gap-4">
            {preview && (
              <Card className="!p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> 原图
                </h4>
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img src={preview} alt="原图" className="w-full h-auto max-h-64 object-contain" />
                </div>
              </Card>
            )}
            <Card className="!p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 识别文本
              </h4>
              <div className="bg-gray-50 rounded-xl p-3 max-h-64 overflow-auto text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {ocrResult.text}
              </div>
            </Card>
          </div>

          {/* Task Title */}
          <Card className="!p-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">任务标题</label>
            <input
              className="input-field"
              placeholder="输入任务标题（可选，默认自动生成）"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
            />
          </Card>

          {/* Question List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">识别到的题目</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedQuestions(new Set(questions.map((_, i) => i)))}
                  className="text-xs text-primary-500 hover:text-primary-600"
                >
                  全选
                </button>
                <button
                  onClick={() => setSelectedQuestions(new Set())}
                  className="text-xs text-gray-500 hover:text-gray-600"
                >
                  取消全选
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => {
                const isSelected = selectedQuestions.has(i);
                const isVertical = q.format === 'vertical' && q.verticalLines && q.verticalLines.length > 0;
                return (
                  <Card key={i} className={`!p-4 transition-all ${isSelected ? 'border-primary-200 bg-primary-50/30' : 'opacity-60'}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestion(i)}
                        className="w-5 h-5 rounded mt-0.5 accent-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                          <span className={`badge ${typeColors[q.type]}`}>{typeLabels[q.type]}</span>
                          {isVertical && <span className="badge bg-indigo-100 text-indigo-700 flex items-center gap-1"><Columns3 className="w-3 h-3" />竖式</span>}
                          <SubjectBadge code={q.subjectCode} name={subjects.find(s => s.code === q.subjectCode)?.name || ''} />
                        </div>
                        {isVertical ? (
                          // 竖式题目：用等宽字体展示多行
                          <div className="bg-gray-100 rounded-lg p-3 font-mono text-base leading-relaxed">
                            {q.verticalLines!.map((line, li) => (
                              <div key={li} className="text-right tracking-wider" style={{ letterSpacing: '0.15em' }}>
                                {line}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            className="w-full text-sm text-gray-700 bg-transparent border-none resize-none focus:outline-none"
                            value={q.prompt}
                            onChange={e => updateQuestionPrompt(i, e.target.value)}
                            rows={2}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeQuestion(i)}
                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="删除此题"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 删除
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 btn-ghost" onClick={reset}>重新上传</button>
            <button
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={selectedQuestions.size === 0}
              onClick={handleSaveAsTask}
            >
              <Save className="w-4 h-4" /> 保存为任务 ({selectedQuestions.size} 题)
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && (
        <Card className="!p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">题目已成功录入！</h3>
          <p className="text-gray-500 mb-6">
            已创建 {selectedQuestions.size} 道题目的学习任务，可在「每日计划」中查看和管理
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn-ghost" onClick={reset}>继续上传</button>
            <button className="btn-primary" onClick={() => navigate('/parent/daily-plan')}>查看每日计划</button>
          </div>
        </Card>
      )}
    </div>
  );
}
