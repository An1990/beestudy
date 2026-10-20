import { useState } from 'react';
import { subjects, knowledgePoints } from '../../lib/mock-data';
import { Card, SubjectBadge, Badge, EmptyState } from '../../components/ui';
import { GraduationCap, ChevronRight, ChevronDown, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ParentCurriculum() {
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const filteredKps = knowledgePoints.filter(kp => {
    if (filterSubject === 'all') return true;
    return kp.subjectCode === filterSubject;
  });

  const units = [...new Set(filteredKps.map(kp => `${kp.subjectCode}|${kp.unitTitle}`))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary-500" /> 教材与知识点
        </h1>
        <p className="text-gray-500 text-sm mt-1">管理学科教材版本、单元和知识点</p>
      </div>

      {/* Subject Filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilterSubject('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterSubject === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          全部学科
        </button>
        {subjects.map(s => (
          <button key={s.code} onClick={() => setFilterSubject(s.code)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterSubject === s.code ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s.name}（{s.publisher}）
          </button>
        ))}
      </div>

      {/* Curriculum Tree */}
      <div className="space-y-3">
        {units.map(unitKey => {
          const [subjectCode, unitTitle] = unitKey.split('|');
          const unitKps = filteredKps.filter(kp => kp.subjectCode === subjectCode && kp.unitTitle === unitTitle);
          const isExpanded = expandedUnit === unitKey;
          const subject = subjects.find(s => s.code === subjectCode);
          const allVerified = unitKps.every(kp => kp.verificationStatus === 'verified');

          return (
            <Card key={unitKey} className="overflow-hidden">
              <div className="flex items-center gap-4 cursor-pointer p-2" onClick={() => setExpandedUnit(isExpanded ? null : unitKey)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  subjectCode === 'chinese' ? 'bg-red-100' : subjectCode === 'math' ? 'bg-blue-100' : 'bg-emerald-100'
                }`}>
                  {subject?.icon || ''}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{unitTitle}</h3>
                    {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                    {allVerified ? (
                      <Badge variant="success">已核验</Badge>
                    ) : (
                      <Badge variant="warm">待核验</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{unitKps.length} 个知识点 · {subject?.publisher} · 二年级上</p>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {unitKps.map(kp => (
                    <div key={kp.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      {kp.verificationStatus === 'verified' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{kp.title}</p>
                        <p className="text-xs text-gray-400">
                          {kp.verificationStatus === 'verified' ? '已核验' : '演示内容，尚未绑定正式教材版本'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredKps.length === 0 && <EmptyState icon="" title="暂无知识点" description="选择学科查看对应知识点" />}
    </div>
  );
}
