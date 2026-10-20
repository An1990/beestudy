import { useState } from 'react';
import { useApp } from '../../lib/store';
import { rewardItems } from '../../lib/mock-data';
import { Card, Badge, EmptyState } from '../../components/ui';
import { Gift, Zap, ShoppingBag, CheckCircle2, Clock, XCircle, Star } from 'lucide-react';

type Tab = 'shop' | 'my-redemptions';

export default function ChildShop() {
  const { student, redemptions, redeemReward } = useApp();
  const [tab, setTab] = useState<Tab>('shop');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    pending: '待批准',
    approved: '已批准',
    fulfilled: '已完成',
    rejected: '已拒绝',
  };

  const handleRedeem = (itemId: string) => {
    setSelectedItem(itemId);
    setShowConfirm(true);
  };

  const confirmRedeem = () => {
    if (selectedItem) {
      redeemReward(selectedItem);
      setShowConfirm(false);
      setSelectedItem(null);
    }
  };

  const selectedReward = rewardItems.find(r => r.id === selectedItem);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-primary-500" /> 奖励商城
        </h1>
        <p className="text-gray-500 text-sm mt-1">用积分兑换你喜欢的奖励吧！</p>
      </div>

      {/* Points Balance Card */}
      <Card className="bg-gradient-to-br from-amber-400 to-orange-500 !text-white !border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">我的积分</p>
            <p className="text-4xl font-bold mt-1">{student.totalPoints.toLocaleString()}</p>
            <p className="text-white/70 text-xs mt-1">连续打卡 {student.streak} 天</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'shop', label: '商品列表', icon: ShoppingBag },
          { key: 'my-redemptions', label: '我的兑换', icon: Gift },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`flex-1 px-5 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === t.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardItems
              .filter(item => item.enabled)
              .map(item => {
                const canAfford = student.totalPoints >= item.pointsCost;
                return (
                  <Card
                    key={item.id}
                    className={`hover:shadow-lg transition-all ${
                      canAfford ? 'cursor-pointer hover:-translate-y-1' : 'opacity-60'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-warm-500" />
                            <span className="font-bold text-warm-500">{item.pointsCost}</span>
                            <span className="text-xs text-gray-400">积分</span>
                          </div>
                          <button
                            onClick={() => handleRedeem(item.id)}
                            disabled={!canAfford}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              canAfford
                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? '兑换' : '积分不足'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {tab === 'my-redemptions' && (
        <div className="space-y-3">
          {redemptions.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-12 h-12 text-gray-300" />}
              title="还没有兑换记录"
              description="去商城兑换你喜欢的奖励吧！"
            />
          ) : (
            redemptions.map(rd => (
              <Card key={rd.id} className="!p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center text-2xl">
                    
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{rd.rewardName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(rd.requestedAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${statusColors[rd.status]}`}>
                      {statusLabels[rd.status]}
                    </span>
                    <span className="font-bold text-warm-500 text-sm">{rd.pointsCost} 积分</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && selectedReward && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl mx-auto mb-3">
                {selectedReward.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800">确认兑换</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedReward.name}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">奖励说明</p>
                <p className="text-sm text-gray-700">{selectedReward.description}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
                <span className="text-sm text-gray-700">需要积分</span>
                <span className="font-bold text-warm-500">{selectedReward.pointsCost} 积分</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50">
                <span className="text-sm text-gray-700">兑换后剩余</span>
                <span className="font-bold text-primary-600">
                  {student.totalPoints - selectedReward.pointsCost} 积分
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 btn-ghost"
                onClick={() => setShowConfirm(false)}
              >
                取消
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={confirmRedeem}
              >
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
