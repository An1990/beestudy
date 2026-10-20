import { useState } from 'react';
import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, knowledgePoints } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import type { StudyTask, TaskType, SubjectCode } from '../../lib/types';
import { CalendarPlus, X, Save, Copy, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const taskTypes: { value: TaskType; label: string }[] = [
  { value: 'review', label: '复习' }, { value: 'mental_math', label: '口算' },
  { value: 'homework', label: '作业' }, { value: 'wrong_question', label: '错题订正' },
  { value: 'preview', label: '预习' }, { value: 'reading', label: '朗读' },
  { value: 'writing', label: '写字' }, { value: 'listening', label: '听力' },
  { value: 'speaking', label: '口语' }, { value: 'habit', label: '习惯' }, { value: 'quiz', label: '小测' },
];

export default function ParentDailyPlan() {
  const { tasks, addTask, deleteTask, student } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', subjectCode: 'math' as SubjectCode,
    taskType: 'homework' as TaskType, estimatedMinutes: 10, priority: 2 as 1 | 2 | 3,
    completionCriteria: '', requiresParentReview: false, pointsReward: 5,
  });

  const dayTasks = tasks.filter(t => t.plannedDate === selectedDate).sort((a, b) => a.sortOrder - b.sortOrder);

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const newTask: StudyTask = {
      id: `task-${Date.now()}`, studentId: student.id, ...form,
      plannedDate: selectedDate, sortOrder: dayTasks.length,
      status: 'planned', createdAt: new Date().toISOString(),
    };
    addTask(newTask);
    setForm({ title: '', description: '', subjectCode: 'math', taskType: 'homework', estimatedMinutes: 10, priority: 2, completionCriteria: '', requiresParentReview: false, pointsReward: 5 });
    setShowForm(false);
  };

  const dateLabel = new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">每日计划</h1>
          <p className="text-gray-500 text-sm mt-1">为 {student.nickname} 安排每日学习任务</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <CalendarPlus className="w-4 h-4" /> 新建任务
        </button>
      </div>

      {/* Date Navigator */}
      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center">
            <p className="font-bold text-gray-800">{dateLabel}</p>
            {isToday && <Badge variant="primary">今天</Badge>}
          </div>
          <button onClick={() => shiftDate(1)} className="p-2 rounded-xl hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </Card>

      {/* Task List */}
      {dayTasks.length === 0 ? (
        <EmptyState icon="" title="这天还没有任务" description="点击「新建任务」开始安排" />
      ) : (
        <div className="space-y-3">
          {dayTasks.map((task, idx) => {
            const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
            const subject = subjects.find(s => s.code === task.subjectCode);
            return (
              <Card key={task.id} className="!p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 font-mono w-6">{idx + 1}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
                      {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{task.estimatedMinutes}分钟</span>
                      <span>优先级 P{task.priority}</span>
                      {task.requiresParentReview && <span className="text-amber-600">需验收</span>}
                      <span className="text-warm-500">+{task.pointsReward} XP</span>
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title={confirmDeleteId === task.id ? '确认删除？再次点击' : '删除任务'}
                    onClick={e => {
                      e.stopPropagation();
                      if (confirmDeleteId === task.id) {
                        deleteTask(task.id);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(task.id);
                        setTimeout(() => setConfirmDeleteId(null), 3000);
                      }
                    }}
                  >
                    <Trash2 className={`w-4 h-4 ${confirmDeleteId === task.id ? 'text-red-500' : ''}`} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">新建任务</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">任务标题 *</label>
                <input className="input-field" placeholder="例如：乘法口诀练习" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">任务说明</label>
                <textarea className="input-field !h-20 resize-none" placeholder="描述任务内容和要求..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">学科</label>
                  <select className="input-field" value={form.subjectCode} onChange={e => setForm({ ...form, subjectCode: e.target.value as SubjectCode })}>
                    {subjects.map(s => <option key={s.code} value={s.code}>{s.name}（{s.publisher}）</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">任务类型</label>
                  <select className="input-field" value={form.taskType} onChange={e => setForm({ ...form, taskType: e.target.value as TaskType })}>
                    {taskTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">预计时长(分钟)</label>
                  <input type="number" className="input-field" min={1} max={240} value={form.estimatedMinutes} onChange={e => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">优先级</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) as 1 | 2 | 3 })}>
                    <option value={1}>P1 高</option>
                    <option value={2}>P2 中</option>
                    <option value={3}>P3 低</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">奖励积分</label>
                  <input type="number" className="input-field" min={0} value={form.pointsReward} onChange={e => setForm({ ...form, pointsReward: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">完成标准</label>
                <input className="input-field" placeholder="例如：正确率达到80%以上" value={form.completionCriteria} onChange={e => setForm({ ...form, completionCriteria: e.target.value })} />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.requiresParentReview} onChange={e => setForm({ ...form, requiresParentReview: e.target.checked })} />
                <span className="text-sm text-gray-700">需要家长验收</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 btn-ghost" onClick={() => setShowForm(false)}>取消</button>
                <button className="flex-1 btn-primary flex items-center justify-center gap-2" onClick={handleSubmit}>
                  <Save className="w-4 h-4" /> 保存任务
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
