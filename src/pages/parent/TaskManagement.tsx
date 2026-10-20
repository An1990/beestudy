import { useState } from 'react';
import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, taskStatusLabels } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import { Target, Search, Filter, CheckCircle2, XCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ParentTasks() {
  const { tasks, deleteTask } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterSubject !== 'all' && t.subjectCode !== filterSubject) return false;
    if (search && !t.title.includes(search)) return false;
    return true;
  }).sort((a, b) => b.plannedDate.localeCompare(a.plannedDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-7 h-7 text-primary-500" /> 任务管理
        </h1>
        <p className="text-gray-500 text-sm mt-1">查看所有任务的状态和管理任务</p>
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
              {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <select className="input-field !w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">全部状态</option>
              {Object.entries(taskStatusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(taskStatusLabels).map(([key, val]) => {
          const count = tasks.filter(t => t.status === key).length;
          return (
            <Card key={key} className="!p-3 flex items-center gap-3 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus(key)}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${val.bgColor}`}>
                {key === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                 key === 'needs_revision' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                 key === 'submitted' ? <Clock className="w-5 h-5 text-amber-500" /> :
                 <Target className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-500">{val.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <EmptyState icon="" title="没有找到任务" description="试试调整筛选条件" />
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
            const subject = subjects.find(s => s.code === task.subjectCode);
            const statusInfo = taskStatusLabels[task.status];

            return (
              <Card key={task.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/parent/tasks/${task.id}`)}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
                      {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{task.plannedDate}</span>
                      <span>{task.estimatedMinutes}分钟</span>
                      {task.requiresParentReview && <span className="text-amber-600">需验收</span>}
                    </div>
                  </div>
                  {task.status === 'submitted' && (
                    <button className="btn-warm text-sm" onClick={e => { e.stopPropagation(); navigate(`/parent/tasks/${task.id}`); }}>验收</button>
                  )}
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
    </div>
  );
}
