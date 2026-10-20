import { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Star, Gift } from 'lucide-react';

const RULES = [
  ['完成 1 项打卡', '+1'],
  ['当天所有任务全部完成', '+3'],
  ['自评「很棒」且家长确认', '+2'],
];

const LEVELS = [
  [0, '新手'],
  [10, '小能手'],
  [30, '好学生'],
  [60, '勤奋小星'],
  [100, '学习之星'],
];

export default function Rewards() {
  const { stats, rewards, redemptions, refreshRedemptions, refreshStats } = useApp();
  const [toast, setToast] = useState('');

  const totalCheckins = stats.total;
  const approvedCount = Object.values(redemptions).filter(r => r.status === 'approved').length;
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const spentStars = redemptions
    .filter(r => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + r.star_cost, 0);

  const earnedStars = (() => {
    let n = totalCheckins;
    n += Object.values(stats.categories).reduce((sum, count) => {
      const allDoneDays = Math.floor(count / 3);
      return sum + allDoneDays * 3;
    }, 0);
    return n - spentStars;
  })();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleRedeem = async (reward: any) => {
    if (earnedStars < reward.star_cost) return;
    try {
      await api.redeem(reward.id, reward.star_cost, reward.name);
      await Promise.all([refreshRedemptions(), refreshStats()]);
      showToast('已提交，等家长批准');
    } catch (err) {
      showToast('兑换失败');
    }
  };

  return (
    <>
      <div className="hd">
        <div>
          <p className="s">打卡赚星星，星星换心愿</p>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>奖励中心</h1>
        </div>
        <span className="pill">
          <Star size={20} />
          {earnedStars} 颗
        </span>
      </div>

      <div className="g2">
        <div className="card dk">
          <p>我的星星</p>
          <p style={{ fontSize: 48, fontWeight: 900 }}>{earnedStars}</p>
          <p className="s">累计打卡 {totalCheckins} 次 · 已兑换 {approvedCount} 件奖励</p>
        </div>
        <div className="card">
          <h2 className="t">怎样获得星星</h2>
          {RULES.map(([rule, points], i) => (
            <div key={i} className="kv">
              <span>{rule}</span>
              <span className="tag" style={{ background: 'var(--amb)', color: 'var(--amt)', fontSize: 14 }}>
                {points}
              </span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="t" style={{ fontSize: 20 }}>奖励商店</h2>
      <div className="g3">
        {rewards.map(reward => (
          <div key={reward.id} className="card">
            <div className="row">
              <div className="ic" style={{ background: 'var(--amb)', color: 'var(--amt)' }}>
                <Gift size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="t">{reward.name}</p>
                <p className="s">{reward.description}</p>
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amt)' }}>
              <Star size={22} />
              {reward.star_cost}
            </p>
            {earnedStars < reward.star_cost && (
              <div className="bar">
                <div style={{ width: `${Math.min(100, earnedStars / reward.star_cost * 100)}%` }} />
              </div>
            )}
            <button
              className="btn sm"
              onClick={() => handleRedeem(reward)}
              disabled={earnedStars < reward.star_cost}
            >
              {earnedStars >= reward.star_cost ? '申请兑换' : `还差 ${reward.star_cost - earnedStars} 颗星`}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="t">兑换记录</h2>
        {pendingRedemptions.length > 0 && pendingRedemptions.map(r => (
          <div key={r.id} className="kv">
            <span>{r.reward_name}</span>
            <span className="tag" style={{ background: 'var(--amb)', color: 'var(--amt)' }}>
              等待家长批准 · −{r.star_cost}
            </span>
          </div>
        ))}
        {redemptions.filter(r => r.status === 'approved').length > 0 ? (
          redemptions.filter(r => r.status === 'approved').reverse().map(r => (
            <div key={r.id} className="kv">
              <span>{r.reward_name}</span>
              <span className="s">{r.approved_date} · −{r.star_cost} 颗</span>
            </div>
          ))
        ) : (
          pendingRedemptions.length === 0 && <p className="s">还没有兑换，加油攒星星吧</p>
        )}
      </div>

      {toast && <div className="toast on">{toast}</div>}
    </>
  );
}
