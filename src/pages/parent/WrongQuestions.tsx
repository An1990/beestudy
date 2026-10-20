import { useState } from 'react';
import { wrongQuestions, subjects, errorReasonLabels } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import { Brain, CalendarPlus, ChevronDown, ChevronUp } from 'lucide-react';

export default function ParentWrongQuestions() {
  const [filter, setFilter] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = wrongQuestions.filter(w => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (filterSubject !== 'all' && w.subjectCode !== filterSubject) return false;
    return true;
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: '待复习', color: 'bg-red-100 text-red-700' },
    reviewing: { label: '复习中', color: 'bg-amber-100 text-amber-700' },
    provisionally_resolved: { label: '已掌握', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-7 h-7 text-red-500" /> 错题与复习
          </h1>
          <p className="text-gray-500 text-sm mt-1">管理错题记录和复习计划</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <CalendarPlus className="w-4 h-4" /> 安排复习
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{wrongQuestions.filter(w => w.status === 'open').length}</p>
          <p className="text-xs text-gray-500 mt-1">待复习</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{wrongQuestions.filter(w => w.status === 'reviewing').length}</p>
          <p className="text-xs text-gray-500 mt-1">复习中</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{wrongQuestions.filter(w => w.status === 'provisionally_resolved').length}</p>
          <p className="text-xs text-gray-500 mt-1">已掌握</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'open', 'reviewing', 'provisionally_resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {f === 'all' ? '全部' : statusLabels[f]?.label || f}
          </button>
        ))}
        <select className="input-field !w-auto ml-auto" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="all">全部学科</option>
          {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon="" title="没有错题记录" description="这个分类下暂无错题" />
      ) : (
        <div className="space-y-3">
          {filtered.map(wq => {
            const subject = subjects.find(s => s.code === wq.subjectCode);
            const isExpanded = expandedId === wq.id;
            const statusInfo = statusLabels[wq.status] || { label: wq.status, color: 'bg-gray-100 text-gray-600' };

            return (
              <Card key={wq.id} className="overflow-hidden">
                <div className="flex items-start gap-4 cursor-pointer p-2" onClick={() => setExpandedId(isExpanded ? null : wq.id)}>
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg flex-shrink-0">
                    {subject?.icon || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-sm">{wq.prompt}</h3>
                      {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>错误原因：{errorReasonLabels[wq.errorReason]}</span>
                      <span>首次错误：{wq.firstWrongAt}</span>
                      <span>复习 {wq.reviewCount} 次</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 px-2 pb-2">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-red-50">
                        <p className="text-xs text-red-600 font-medium mb-1">孩子的答案</p>
                        <p className="text-sm text-gray-700">{wq.studentAnswer}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-50">
                        <p className="text-xs text-green-600 font-medium mb-1">正确答案</p>
                        <p className="text-sm text-gray-700">{wq.correctAnswer}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50">
                      <p className="text-xs text-blue-600 font-medium mb-1">解析</p>
                      <p className="text-sm text-gray-700">{wq.explanation}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm">安排复习任务</button>
                      <button className="btn-ghost text-sm">调整复习日期</button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
