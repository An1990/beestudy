import { useApp } from '../../lib/store';
import { Star } from 'lucide-react';

const SUBJECTS = [
  { id: 0, name: '语文', char: '语' },
  { id: 1, name: '数学', char: '数' },
  { id: 2, name: '英语', char: '英' },
];

const LEVELS = [
  [0, '新手'],
  [10, '小能手'],
  [30, '好学生'],
  [60, '勤奋小星'],
  [100, '学习之星'],
];

export default function Growth() {
  const { stats, history, tasks } = useApp();

  const totalCheckins = stats.total;
  const currentLevel = LEVELS.reduce((lvl, [threshold, name], i) => {
    return totalCheckins >= threshold ? i : lvl;
  }, 0);

  const weekCheckins = Object.entries(history)
    .filter(([date]) => {
      const d = new Date(date);
      const now = new Date();
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 6;
    })
    .reduce((sum, [, count]) => sum + count, 0);

  const earnedStars = (() => {
    let n = totalCheckins;
    return n;
  })();

  const last28Days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: history[dateStr] || 0,
    };
  });

  const badges = [
    { name: '复习达人', color: '--bl', bg: '--blb', earned: (stats.categories['复习'] || 0) >= 5, desc: '复习满 5 次' },
    { name: '早起预习', color: '--or', bg: '--orb', earned: (stats.categories['预习'] || 0) >= 5, desc: '预习满 5 次' },
    { name: '作业全勤', color: '--gr', bg: '--grb', earned: (stats.categories['作业'] || 0) >= 5, desc: '作业满 5 次' },
    { name: '错题小能手', color: '--bl', bg: '--blb', earned: (stats.subjects[1] || 0) >= 3, desc: '数学复习满 3 次' },
    { name: '百日坚持', color: '--or', bg: '--orb', earned: totalCheckins >= 100, desc: '累计 100 次' },
    { name: '全科之星', color: '--gr', bg: '--grb', earned: SUBJECTS.every(s => (stats.subjects[s.id] || 0) >= 5), desc: '每科满 5 次' },
  ];

  return (
    <>
      <div className="hd">
        <div>
          <p className="s">累计 {totalCheckins} 次打卡</p>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>我的成长</h1>
        </div>
        <span className="pill">
          Lv.{currentLevel + 1} {LEVELS[currentLevel][1]}
        </span>
      </div>

      <div className="g3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="card" style={{ gap: 2 }}>
          <span style={{ fontSize: 34, fontWeight: 900 }}>{stats.streak}</span>
          <span className="s">连续打卡（天）</span>
        </div>
        <div className="card" style={{ gap: 2 }}>
          <span style={{ fontSize: 34, fontWeight: 900 }}>{weekCheckins}</span>
          <span className="s">近 7 天完成</span>
        </div>
        <div className="card" style={{ gap: 2 }}>
          <span style={{ fontSize: 34, fontWeight: 900 }}>{totalCheckins}</span>
          <span className="s">累计打卡</span>
        </div>
        <div className="card" style={{ gap: 2 }}>
          <span style={{ fontSize: 34, fontWeight: 900 }}>{earnedStars}</span>
          <span className="s">我的星星</span>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <h2 className="t">近 28 天打卡</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {last28Days.map(({ date, count }) => (
              <div
                key={date}
                role="img"
                aria-label={`${date} 完成 ${count} 项`}
                style={{
                  aspectRatio: '1',
                  maxHeight: 48,
                  borderRadius: 10,
                  border: `2px solid ${count ? 'transparent' : 'var(--ln)'}`,
                  background: count === 0 ? 'var(--cd)' : count < 4 ? '#FDE68A' : count < 9 ? 'var(--am)' : 'var(--ink)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="t">我的徽章</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 8px' }}>
            {badges.map(badge => (
              <div
                key={badge.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: badge.earned ? 1 : 0.5,
                  textAlign: 'center',
                }}
              >
                <div
                  className="ic"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    background: `var(${badge.bg})`,
                    color: `var(${badge.color})`,
                  }}
                >
                  <Star size={30} />
                </div>
                <span className="t" style={{ fontSize: 14 }}>{badge.name}</span>
                <span className="s">{badge.earned ? '已获得' : badge.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="t">成长等级</h2>
        <div className="fl" style={{ flexWrap: 'nowrap', gap: 4 }}>
          {LEVELS.map(([threshold, name], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                background: i < currentLevel ? 'var(--ink)' : i === currentLevel ? 'var(--am)' : 'var(--cd)',
                color: i < currentLevel ? 'var(--bg)' : i === currentLevel ? '#2A2433' : 'var(--mut)',
                border: `2px solid ${i <= currentLevel ? 'var(--ink)' : 'var(--ln)'}`,
              }}>
                {i + 1}
              </div>
              <span className="s" style={{ textAlign: 'center' }}>{name}</span>
            </div>
          ))}
        </div>
        <p className="s">
          {currentLevel < 4
            ? `距离 Lv.${currentLevel + 2} 还差 ${LEVELS[currentLevel + 1][0] - totalCheckins} 次打卡`
            : '已经是最高等级啦'}
        </p>
      </div>
    </>
  );
}
