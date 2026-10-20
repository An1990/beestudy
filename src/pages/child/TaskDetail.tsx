import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, taskStatusLabels, knowledgePoints } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, ProgressBar } from '../../components/ui';
import { ArrowLeft, Timer, Zap, CheckCircle2, Clock, AlertCircle, Send, Pause, Play, HelpCircle, Columns3 } from 'lucide-react';
import VerticalProblemDisplay from '../../components/ui/VerticalProblemDisplay';
import QuestionRenderer from '../../components/ui/QuestionRenderer';
import { extractVerticalFromDescription } from '../../lib/vertical-extractor';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, student } = useApp();
  const task = tasks.find(t => t.id === id);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selfAssessment, setSelfAssessment] = useState<'easy' | 'okay' | 'hard' | 'need_help'>('okay');
  const [note, setNote] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">任务未找到</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/child/tasks')}>返回</button>
      </div>
    );
  }

  const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
  const subject = subjects.find(s => s.code === task.subjectCode);
  const statusInfo = taskStatusLabels[task.status];
  const kp = knowledgePoints.find(k => k.id === task.knowledgePointId);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // 竖式信息：优先用 verticalLines，否则从描述中提取
  const verticalInfo = task.verticalLines && task.verticalLines.length > 0
    ? { lines: task.verticalLines, operator: task.verticalOperator || '+', question: '' }
    : extractVerticalFromDescription(task.description);

  const handleStart = () => {
    if (task.status === 'planned') {
      updateTask(task.id, { status: 'in_progress' });
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);
  const handleResume = () => setIsRunning(true);

  const handleSubmit = () => {
    const newStatus = task.requiresParentReview ? 'submitted' : 'completed';
    updateTask(task.id, {
      status: newStatus,
      actualMinutes: Math.max(minutes, 1),
      selfAssessment,
    });
    setShowSubmit(false);
  };

  const selfAssessmentLabels = { easy: '简单', okay: '适中', hard: '困难', need_help: '需要帮助' };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>

      {/* Task Header */}
      <Card className="!p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${typeInfo.color}`}>
            {typeInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
              {subject && <SubjectBadge code={subject.code} name={subject.name} />}
              <span className={`text-xs px-2.5 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            {/* 题目描述（带填空输入框） */}
            <div className="mt-2">
              <QuestionRenderer text={task.description} />
            </div>

            {/* 竖式题目展示 */}
            {verticalInfo && (
              <VerticalProblemDisplay
                lines={verticalInfo.lines}
                operator={verticalInfo.operator}
                question={verticalInfo.question}
              />
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Timer className="w-4 h-4" /> 预计 {task.estimatedMinutes} 分钟
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-500 font-medium">
                <Zap className="w-4 h-4" /> +{task.pointsReward} XP
              </div>
              {task.requiresParentReview && <Badge variant="warm">需家长验收</Badge>}
            </div>
          </div>
        </div>
      </Card>

      {/* Knowledge Point */}
      {kp && (
        <Card className="!p-4">
          <p className="text-sm text-gray-500">关联知识点</p>
          <p className="font-medium text-gray-700 mt-1">{kp.unitTitle} → {kp.title}</p>
        </Card>
      )}

      {/* Completion Criteria */}
      <Card className="!p-4 bg-primary-50 border-primary-100">
        <p className="text-sm text-primary-700 font-medium">完成标准</p>
        <p className="text-gray-700 mt-1">{task.completionCriteria}</p>
      </Card>

      {/* Timer & Actions */}
      {(task.status === 'planned' || task.status === 'in_progress') && (
        <Card className="!p-6 text-center">
          <div className="text-5xl font-mono font-bold text-gray-800 mb-4">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-3">
            {task.status === 'planned' && !isRunning && (
              <button className="btn-primary px-8 py-3 text-lg" onClick={handleStart}>
                <Play className="w-5 h-5 inline mr-2" /> 开始任务
              </button>
            )}
            {task.status === 'in_progress' && !isRunning && (
              <button className="btn-primary px-8 py-3 text-lg" onClick={handleResume}>
                <Play className="w-5 h-5 inline mr-2" /> 继续
              </button>
            )}
            {isRunning && (
              <button className="btn-warm px-8 py-3 text-lg" onClick={handlePause}>
                <Pause className="w-5 h-5 inline mr-2" /> 暂停
              </button>
            )}
            {(task.status === 'in_progress' || isRunning) && (
              <button className="btn-success px-8 py-3 text-lg" onClick={() => setShowSubmit(true)}>
                <Send className="w-5 h-5 inline mr-2" /> 提交完成
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Completed State */}
      {task.status === 'completed' && (
        <Card className="!p-6 text-center bg-success-50 border-success-200">
          <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">任务已完成！</h3>
          <p className="text-gray-500 mt-1">用时 {task.actualMinutes} 分钟 · 获得 +{task.pointsReward} XP</p>
        </Card>
      )}

      {task.status === 'submitted' && (
        <Card className="!p-6 text-center bg-amber-50 border-amber-200">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">已提交，等待家长验收</h3>
          <p className="text-gray-500 mt-1">家长验收通过后将获得积分奖励</p>
        </Card>
      )}

      {task.status === 'needs_revision' && (
        <Card className="!p-6 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">需要订正</h3>
          <p className="text-gray-500 mt-1">请根据家长的反馈进行修改后重新提交</p>
        </Card>
      )}

      {/* Submit Dialog */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">提交任务</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">自评难度</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(selfAssessmentLabels) as [string, string][]).map(([key, label]) => (
                    <button key={key}
                      onClick={() => setSelfAssessment(key as typeof selfAssessment)}
                      className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                        selfAssessment === key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">备注（可选）</label>
                <textarea className="input-field !h-20 resize-none" placeholder="说说你的完成情况..." value={note} onChange={e => setNote(e.target.value)} />
              </div>

              <div className="flex gap-3">
                <button className="flex-1 btn-ghost" onClick={() => setShowSubmit(false)}>取消</button>
                <button className="flex-1 btn-primary" onClick={handleSubmit}>确认提交</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
