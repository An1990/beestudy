import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, taskStatusLabels, knowledgePoints } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge } from '../../components/ui';
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';
import VerticalProblemDisplay from '../../components/ui/VerticalProblemDisplay';
import { extractVerticalFromDescription } from '../../lib/vertical-extractor';

export default function ParentTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useApp();
  const task = tasks.find(t => t.id === id);
  const [reviewNote, setReviewNote] = useState('');
  const [showReview, setShowReview] = useState(false);

  if (!task) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">任务未找到</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/parent/tasks')}>返回</button>
      </div>
    );
  }

  const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
  const subject = subjects.find(s => s.code === task.subjectCode);
  const statusInfo = taskStatusLabels[task.status];
  const kp = knowledgePoints.find(k => k.id === task.knowledgePointId);

  // 竖式信息：优先用 verticalLines，否则从描述中提取
  const verticalInfo = task.verticalLines && task.verticalLines.length > 0
    ? { lines: task.verticalLines, operator: task.verticalOperator || '+', question: '' }
    : extractVerticalFromDescription(task.description);

  const handleApprove = () => {
    updateTask(task.id, { status: 'completed' });
    setShowReview(false);
  };

  const handleReject = () => {
    if (!reviewNote.trim()) return;
    updateTask(task.id, { status: 'needs_revision' });
    setShowReview(false);
    setReviewNote('');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>

      <Card className="!p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${typeInfo.color}`}>
            {typeInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
              {subject && <SubjectBadge code={subject.code} name={subject.name} />}
              <span className={`text-xs px-2.5 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
            <p className="text-gray-500 mt-2">{task.description}</p>

            {/* 竖式题目展示 */}
            {verticalInfo && (
              <VerticalProblemDisplay
                lines={verticalInfo.lines}
                operator={verticalInfo.operator}
                question={verticalInfo.question}
              />
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div><span className="text-gray-400">计划日期</span><p className="font-medium">{task.plannedDate}</p></div>
              <div><span className="text-gray-400">预计时长</span><p className="font-medium">{task.estimatedMinutes} 分钟</p></div>
              <div><span className="text-gray-400">优先级</span><p className="font-medium">P{task.priority}</p></div>
              <div><span className="text-gray-400">奖励积分</span><p className="font-medium text-warm-500">+{task.pointsReward} XP</p></div>
            </div>
          </div>
        </div>
      </Card>

      {kp && (
        <Card className="!p-4">
          <p className="text-sm text-gray-500">关联知识点</p>
          <p className="font-medium text-gray-700 mt-1">{kp.unitTitle} → {kp.title}</p>
        </Card>
      )}

      <Card className="!p-4 bg-primary-50 border-primary-100">
        <p className="text-sm text-primary-700 font-medium">完成标准</p>
        <p className="text-gray-700 mt-1">{task.completionCriteria}</p>
      </Card>

      {/* Review Section */}
      {task.status === 'submitted' && (
        <Card className="!p-6 border-amber-200 bg-amber-50">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> 家长验收
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">验收意见 {task.status === 'submitted' && <span className="text-red-500">*退回必填</span>}</label>
              <textarea className="input-field !h-20 resize-none" placeholder="写下你的评价或订正建议..." value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 btn-ghost flex items-center justify-center gap-2" onClick={() => setShowReview(true)}>
                <XCircle className="w-4 h-4" /> 退回订正
              </button>
              <button className="flex-1 btn-success flex items-center justify-center gap-2" onClick={handleApprove}>
                <CheckCircle2 className="w-4 h-4" /> 通过验收
              </button>
            </div>
          </div>
        </Card>
      )}

      {task.status === 'completed' && (
        <Card className="!p-6 text-center bg-green-50 border-green-200">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">已通过验收</h3>
          <p className="text-gray-500 mt-1">积分 +{task.pointsReward} 已发放</p>
        </Card>
      )}

      {task.status === 'needs_revision' && (
        <Card className="!p-6 text-center bg-red-50 border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">已退回订正</h3>
          <p className="text-gray-500 mt-1">孩子需要修改后重新提交</p>
        </Card>
      )}
    </div>
  );
}
