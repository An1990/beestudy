import { useState } from 'react';
import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, taskStatusLabels } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import { Filter, ArrowRight, Timer, Zap, Search } from 'lucide-react';

export default function ChildTasks() {
  const { tasks } = useApp();
  const navigate = useNavigate();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(t => {
    if (filterSubject !== 'all' && t.subjectCode !== filterSubject) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.title.includes(search)) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority || a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">学习任务</h1>
        <p className="text-gray-500 text-sm mt-1">查看所有学科的学习任务</p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pl-9" placeholder="搜索任务..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="input-field !w-auto" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="all">全部学科</option>
              {subjects.map(s => <option key={s.code} value={s.code}>{s.name}（{s.publisher}）</option>)}
            </select>
            <select className="input-field !w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">全部状态</option>
              {Object.entries(taskStatusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Task List */}
      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="没有找到任务" description="试试调整筛选条件" />
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
            const subject = subjects.find(s => s.code === task.subjectCode);
            const statusInfo = taskStatusLabels[task.status];

            return (
              <Card key={task.id} className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/child/tasks/${task.id}`)}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{task.title}</h3>
                      {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {task.estimatedMinutes}分钟
                      </span>
                      <span className="text-xs text-warm-500 font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" /> +{task.pointsReward} XP
                      </span>
                      {task.requiresParentReview && (
                        <Badge variant="warm">需家长验收</Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-2" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
