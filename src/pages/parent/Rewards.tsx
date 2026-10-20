import { useState } from 'react';
import { rewardItems, redemptions, pointLedger } from '../../lib/mock-data';
import { Card, Badge, EmptyState } from '../../components/ui';
import { Gift, Zap, CheckCircle2, XCircle, Clock, Plus, Edit2 } from 'lucide-react';

export default function ParentRewards() {
  const [tab, setTab] = useState<'rules' | 'ledger' | 'items' | 'redemptions'>('items');

  const rewardRules = [
    { event: 'task_started_on_time', label: '按时开始任务', points: 2, enabled: true },
    { event: 'task_completed', label: '完成任务', points: 3, enabled: true },
    { event: 'task_checked', label: '完成后检查', points: 2, enabled: true },
    { event: 'wrong_question_corrected', label: '独立订正错题', points: 3, enabled: true },
    { event: 'daily_plan_completed', label: '完成当日计划', points: 5, enabled: true },
    { event: 'weekly_plan_completed', label: '完成每周计划', points: 10, enabled: true },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    pending: '待批准', approved: '已批准', fulfilled: '已完成', rejected: '已拒绝',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Gift className="w-7 h-7 text-warm-500" /> 积分与奖励
        </h1>
        <p className="text-gray-500 text-sm mt-1">管理积分规则、奖励项目和兑换申请</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'rules', label: '积分规则' },
          { key: 'ledger', label: '积分流水' },
          { key: 'items', label: '奖励项目' },
          { key: 'redemptions', label: '兑换申请' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rules' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800">积分规则配置</h3>
            <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> 添加规则</button>
          </div>
          {rewardRules.map((rule, i) => (
            <Card key={i} className="!p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{rule.label}</p>
                <p className="text-xs text-gray-400 font-mono">{rule.event}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-warm-500">+{rule.points}</span>
                <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${rule.enabled ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'ledger' && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 mb-2">积分流水（不可修改）</h3>
          {pointLedger.map(ledger => (
            <Card key={ledger.id} className="!p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{ledger.note}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ledger.eventType} · {new Date(ledger.createdAt).toLocaleString('zh-CN')}</p>
                </div>
                <span className={`font-bold text-lg ${ledger.pointsDelta > 0 ? 'text-warm-500' : 'text-red-500'}`}>
                  {ledger.pointsDelta > 0 ? '+' : ''}{ledger.pointsDelta}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'items' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800">奖励项目</h3>
            <button className="btn-primary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> 添加奖励</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewardItems.map(rw => (
              <Card key={rw.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{rw.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{rw.name}</h4>
                    <p className="text-xs text-gray-500">{rw.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-warm-500 font-bold">{rw.pointsCost} 积分</span>
                      <Badge variant={rw.enabled ? 'success' : 'gray'}>{rw.enabled ? '启用' : '停用'}</Badge>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'redemptions' && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 mb-2">兑换申请</h3>
          {redemptions.length === 0 ? (
            <EmptyState icon="" title="暂无兑换申请" description="孩子提交兑换申请后会显示在这里" />
          ) : (
            redemptions.map(rd => (
              <Card key={rd.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-lg"></div>
                    <div>
                      <p className="font-medium text-gray-800">{rd.rewardName}</p>
                      <p className="text-xs text-gray-400">{new Date(rd.requestedAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusColors[rd.status]}`}>{statusLabels[rd.status]}</span>
                    <span className="font-bold text-warm-500">{rd.pointsCost} 积分</span>
                    {rd.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="btn-success text-sm">批准</button>
                        <button className="btn-ghost text-sm">拒绝</button>
                      </div>
                    )}
                    {rd.status === 'approved' && (
                      <button className="btn-primary text-sm">标记履约</button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
