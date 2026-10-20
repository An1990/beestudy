import { useState } from 'react';
import { wrongQuestions, subjects, errorReasonLabels } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import { Brain, RotateCcw, CheckCircle2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function ChildWrongQuestions() {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = wrongQuestions.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: '待复习', color: 'bg-red-100 text-red-700' },
    reviewing: { label: '复习中', color: 'bg-amber-100 text-amber-700' },
    provisionally_resolved: { label: '已掌握', color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-7 h-7 text-red-500" /> 错题本
        </h1>
        <p className="text-gray-500 text-sm mt-1">错题是学习线索，不是惩罚依据。每一次订正都是进步！</p>
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

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'open', label: '待复习' },
          { key: 'reviewing', label: '复习中' },
          { key: 'provisionally_resolved', label: '已掌握' },
        ].map(f => (
          <button key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Wrong Question List */}
      {filtered.length === 0 ? (
        <EmptyState icon="🎉" title="太棒了！" description="这个分类下没有错题" />
      ) : (
        <div className="space-y-3">
          {filtered.map(wq => {
            const subject = subjects.find(s => s.code === wq.subjectCode);
            const isExpanded = expandedId === wq.id;
            const statusInfo = statusLabels[wq.status] || { label: wq.status, color: 'bg-gray-100 text-gray-600' };

            return (
              <Card key={wq.id} className="overflow-hidden">
                <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : wq.id)}>
                  <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-lg flex-shrink-0">
                    {subject?.icon || '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{wq.prompt}</h3>
                      {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>错误原因：{errorReasonLabels[wq.errorReason] || wq.errorReason}</span>
                      <span>复习次数：{wq.reviewCount}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-red-50">
                        <p className="text-xs text-red-600 font-medium mb-1">你的答案</p>
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
                    {wq.status !== 'provisionally_resolved' && (
                      <div className="flex gap-2">
                        <button className="btn-primary flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" /> 再练一次
                        </button>
                        <button className="btn-ghost flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> 查看知识点
                        </button>
                      </div>
                    )}
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
