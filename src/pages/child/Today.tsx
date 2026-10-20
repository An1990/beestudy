import { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Check, BookOpen, Sun, PenTool, Star } from 'lucide-react';

const SUBJECTS = [
  { id: 0, name: '语文', char: '语', color: '--s0', bg: '--s0b' },
  { id: 1, name: '数学', char: '数', color: '--s1', bg: '--s1b' },
  { id: 2, name: '英语', char: '英', color: '--s2', bg: '--s2b' },
];

const CATEGORIES = {
  '复习': { color: '--bl', bg: '--blb', icon: BookOpen },
  '预习': { color: '--or', bg: '--orb', icon: Sun },
  '作业': { color: '--gr', bg: '--grb', icon: PenTool },
};

export default function Today() {
  const { tasks, todayCheckins, history, stats, parentMessage, refreshCheckins, refreshStats, refreshHistory } = useApp();
  const [dialogTask, setDialogTask] = useState<any>(null);
  const [minutes, setMinutes] = useState(30);
  const [mood, setMood] = useState(1);
  const [toast, setToast] = useState('');

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 11 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  const todayTasks = tasks.filter(t => !t.weekdays || t.weekdays.includes(today.getDay()));
  const doneCount = todayTasks.filter(t => todayCheckins[t.id]).length;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      day: d,
      dateStr,
      hasCheckin: history[dateStr] && history[dateStr] > 0,
    };
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleCheckin = async () => {
    if (!dialogTask) return;
    try {
      await api.checkin(dialogTask.id, minutes, mood);
      await Promise.all([refreshCheckins(), refreshStats(), refreshHistory()]);
      setDialogTask(null);
      showToast('打卡成功，+1 颗星');
    } catch (err) {
      showToast('打卡失败');
    }
  };

  const handleUndo = async (taskId: string) => {
    try {
      await api.undoCheckin(taskId);
      await Promise.all([refreshCheckins(), refreshStats(), refreshHistory()]);
      showToast('已撤销打卡');
    } catch (err) {
      showToast('撤销失败');
    }
  };

  const renderTask = (task: any, showTag = false) => {
    const checkin = todayCheckins[task.id];
    const cat = CATEGORIES[task.category as keyof typeof CATEGORIES];

    return (
      <div key={task.id} className="row">
        <button
          className={`ck ${checkin ? 'on' : ''}`}
          onClick={() => checkin ? handleUndo(task.id) : setDialogTask(task)}
          aria-label={checkin ? '撤销打卡' : '打卡'}
        >
          {checkin && <Check size={20} />}
        </button>
        <div style={{ flex: 1 }}>
          <p className="t p15">{task.title}</p>
          <p className="s">
            {task.description}
            {checkin && ` · ${checkin.minutes} 分钟 · ${checkin.status === 'approved' ? '家长已确认' : '待家长确认'}`}
          </p>
        </div>
        {showTag && (
          <span className="tag" style={{ background: `var(${cat.bg})`, color: `var(${cat.color})` }}>
            {task.category}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="hd">
        <div>
          <p className="s">{today.getMonth() + 1}月{today.getDate()}日 周{['日', '一', '二', '三', '四', '五', '六'][today.getDay()]}</p>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>{greeting}，小明</h1>
        </div>
        <span className="pill">
          连续打卡 {stats.streak} 天
        </span>
      </div>

      {parentMessage && (
        <div className="card" style={{ background: 'var(--amb)' }}>
          <p className="s" style={{ color: 'var(--amt)' }}>家长的话</p>
          <p className="p15">{parentMessage}</p>
        </div>
      )}

      <div className="g2">
        <div className="card dk">
          <div className="hd">
            <span>今日进度</span>
            <span style={{ fontSize: 36, fontWeight: 900 }}>
              {doneCount}<span style={{ fontSize: 18, fontWeight: 400 }}> / {todayTasks.length}</span>
            </span>
          </div>
          <div className="bar">
            <div style={{ width: `${todayTasks.length ? (doneCount / todayTasks.length * 100) : 0}%` }} />
          </div>
          <p className="s">
            {todayTasks.length === 0 ? '今天没有安排任务，好好休息' :
             doneCount === todayTasks.length ? '今天全部完成，全勤加成 +3 颗星已到账' :
             `再完成 ${todayTasks.length - doneCount} 项，今天就能拿到全勤加成`}
          </p>
        </div>

        <div className="card">
          <div className="hd">
            <h2 className="t">本周打卡</h2>
            <span className="s">已连续 {stats.streak} 天</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {weekDays.map(({ day, dateStr, hasCheckin }) => (
              <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span className="s">周{['日', '一', '二', '三', '四', '五', '六'][day.getDay()]}</span>
                <span style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: hasCheckin ? 'var(--ink)' : 'var(--cd)',
                  color: hasCheckin ? 'var(--bg)' : 'inherit',
                  border: `2px solid ${hasCheckin ? 'var(--ink)' : dateStr === today.toISOString().split('T')[0] ? 'var(--am)' : 'var(--ln)'}`,
                }}>
                  {hasCheckin && <Check size={18} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="g3">
        {Object.keys(CATEGORIES).map(cat => {
          const catTasks = todayTasks.filter(t => t.category === cat);
          const doneInCat = catTasks.filter(t => todayCheckins[t.id]).length;
          const catInfo = CATEGORIES[cat as keyof typeof CATEGORIES];
          const Icon = catInfo.icon;

          return (
            <div key={cat} className="card">
              <div className="row" style={{ minHeight: 44 }}>
                <div className="ic" style={{ background: `var(${catInfo.bg})`, color: `var(${catInfo.color})` }}>
                  <Icon size={22} />
                </div>
                <h2 className="t" style={{ flex: 1, fontSize: 18 }}>{cat}</h2>
                <span className="s">{doneInCat} / {catTasks.length}</span>
              </div>
              {catTasks.map(t => (
                <div key={t.id}>
                  {renderTask(t)}
                  <p className="s" style={{ margin: '-8px 0 0 56px' }}>{SUBJECTS[t.subject_id].name}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {dialogTask && (
        <dialog open onClose={() => setDialogTask(null)}>
          <h2 className="t" style={{ fontSize: 20 }}>{dialogTask.title}</h2>
          <p className="s">
            {SUBJECTS[dialogTask.subject_id].name} · {dialogTask.category} · {dialogTask.description}
          </p>
          <p className="t" style={{ marginTop: 16 }}>用了多长时间</p>
          <div className="fl" style={{ marginTop: 8 }}>
            {[15, 30, 45, 60].map(m => (
              <button
                key={m}
                className={`chip ${m === minutes ? 'on' : ''}`}
                onClick={() => setMinutes(m)}
              >
                {m} 分钟
              </button>
            ))}
          </div>
          <p className="t" style={{ marginTop: 16 }}>今天做得怎么样</p>
          <div className="fl" style={{ marginTop: 8 }}>
            {['加油', '还不错', '很棒'].map((label, i) => (
              <button
                key={i}
                className={`chip ${i === mood ? 'on' : ''}`}
                onClick={() => setMood(i)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="fl" style={{ marginTop: 24 }}>
            <button className="btn" onClick={handleCheckin} style={{ flex: 1, background: 'var(--am)', color: '#2A2433' }}>
              完成打卡
            </button>
            <button className="chip" onClick={() => setDialogTask(null)}>取消</button>
          </div>
        </dialog>
      )}

      {toast && <div className="toast on">{toast}</div>}
    </>
  );
}
