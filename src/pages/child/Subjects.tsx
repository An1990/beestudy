import { useState } from 'react';
import { useApp } from '../../lib/store';
import { api } from '../../lib/api';
import { Check, BookOpen, Sun, PenTool } from 'lucide-react';

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

export default function Subjects() {
  const { tasks, todayCheckins, refreshCheckins, refreshStats, refreshHistory } = useApp();
  const [filter, setFilter] = useState('全部');
  const [dialogTask, setDialogTask] = useState<any>(null);
  const [minutes, setMinutes] = useState(30);
  const [mood, setMood] = useState(1);
  const [toast, setToast] = useState('');

  const today = new Date();
  const todayTasks = tasks.filter(t => !t.weekdays || t.weekdays.includes(today.getDay()));
  const doneCount = todayTasks.filter(t => todayCheckins[t.id]).length;

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

  const undoneBySubject = SUBJECTS.map(s => ({
    ...s,
    undone: todayTasks.filter(t => t.subject_id === s.id && !todayCheckins[t.id]).length,
  })).sort((a, b) => b.undone - a.undone);

  return (
    <>
      <div className="hd">
        <div>
          <p className="s">今日各科完成情况</p>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>学科中心</h1>
        </div>
        <span className="pill">今日完成 {doneCount} / {todayTasks.length}</span>
      </div>

      <div className="fl">
        {['全部', '复习', '预习', '作业'].map(f => (
          <button
            key={f}
            className={`chip ${f === filter ? 'on' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="g3">
        {SUBJECTS.map(subject => {
          const subjectTasks = todayTasks.filter(t => t.subject_id === subject.id);
          const doneInSubject = subjectTasks.filter(t => todayCheckins[t.id]).length;
          const percent = subjectTasks.length ? Math.round(doneInSubject / subjectTasks.length * 100) : 0;
          const filteredTasks = subjectTasks.filter(t => filter === '全部' || t.category === filter);

          return (
            <div key={subject.id} className="card">
              <div className="row">
                <div className="sb" style={{ background: `var(${subject.bg})`, color: `var(${subject.color})` }}>
                  {subject.char}
                </div>
                <h2 style={{ flex: 1, fontSize: 20, fontWeight: 900 }}>{subject.name}</h2>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 26, fontWeight: 900 }}>{percent}%</p>
                  <p className="s">今日完成</p>
                </div>
              </div>
              <div className="bar">
                <div style={{ width: `${percent}%` }} />
              </div>
              {filteredTasks.map(t => renderTask(t, true))}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 className="t">小提醒</h2>
        <p className="p15">
          {undoneBySubject[0].undone === 0
            ? '各科今天都完成啦，太棒了！'
            : `${undoneBySubject[0].name}今天还有 ${undoneBySubject[0].undone} 项没做，加油！`}
        </p>
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
