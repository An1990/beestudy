import { useState, useEffect } from 'react';
import { useApp } from '../../lib/store';
import { api, type Task } from '../../lib/api';
import { Check, X } from 'lucide-react';

const SUBJECTS = [
  { id: 0, name: '语文', char: '语', color: '--s0', bg: '--s0b' },
  { id: 1, name: '数学', char: '数', color: '--s1', bg: '--s1b' },
  { id: 2, name: '英语', char: '英', color: '--s2', bg: '--s2b' },
];

const CATEGORIES: Record<string, { color: string; bg: string }> = {
  '复习': { color: '--bl', bg: '--blb' },
  '预习': { color: '--or', bg: '--orb' },
  '作业': { color: '--gr', bg: '--grb' },
};

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function ParentCenter() {
  const { tasks, pending, todayCheckins, refreshTasks, refreshPending, refreshCheckins, refreshStats } = useApp();
  const [message, setMessage] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ subject_id: 0, category: '复习' as string, title: '', description: '', weekdays: [] as number[] });
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('全部');

  useEffect(() => {
    api.getMessage().then(data => setMessage(data.message));
  }, []);

  const today = new Date();
  const todayTasks = tasks.filter(t => !t.weekdays || t.weekdays.includes(today.getDay()));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleApproveCheckin = async (id: number) => {
    try {
      await api.approveCheckin(id);
      await Promise.all([refreshPending(), refreshCheckins(), refreshStats()]);
      showToast('已确认');
    } catch (err) {
      showToast('操作失败');
    }
  };

  const handleRejectCheckin = async (id: number) => {
    try {
      await api.rejectCheckin(id);
      await Promise.all([refreshPending(), refreshCheckins()]);
      showToast('已打回，孩子需要重新打卡');
    } catch (err) {
      showToast('操作失败');
    }
  };

  const handleApproveRedemption = async (id: number) => {
    try {
      await api.approveRedemption(id);
      await refreshPending();
      showToast('已批准');
    } catch (err) {
      showToast('操作失败');
    }
  };

  const handleRejectRedemption = async (id: number) => {
    try {
      await api.rejectRedemption(id);
      await refreshPending();
      showToast('已拒绝，星星已退回');
    } catch (err) {
      showToast('操作失败');
    }
  };

  const handleSaveMessage = async () => {
    try {
      await api.saveMessage(message);
      showToast('已保存');
    } catch (err) {
      showToast('保存失败');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      showToast('请先填写任务名称');
      return;
    }
    try {
      const weekdays = newTask.weekdays.length === 0 || newTask.weekdays.length === 7 ? null : newTask.weekdays;
      if (editingTask) {
        await api.updateTask(editingTask, { ...newTask, weekdays });
        showToast('已保存修改');
      } else {
        await api.createTask({ ...newTask, weekdays });
        showToast('已添加任务');
      }
      await refreshTasks();
      setNewTask({ subject_id: 0, category: '复习', title: '', description: '', weekdays: [] });
      setEditingTask(null);
    } catch (err) {
      showToast('操作失败');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task.id);
    setNewTask({
      subject_id: task.subject_id,
      category: task.category,
      title: task.title,
      description: task.description || '',
      weekdays: task.weekdays || [],
    });
    document.getElementById('task-form')?.scrollIntoView({ block: 'center' });
  };

  const handleDeleteTask = async (id: string) => {
    if (tasks.length <= 1) {
      showToast('至少保留 1 项任务');
      return;
    }
    try {
      await api.deleteTask(id);
      if (editingTask === id) {
        setEditingTask(null);
        setNewTask({ subject_id: 0, category: '复习', title: '', description: '', weekdays: [] });
      }
      await refreshTasks();
      showToast('已删除任务');
    } catch (err) {
      showToast('删除失败');
    }
  };

  const toggleWeekday = (day: number) => {
    setNewTask(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const pendingCount = pending.checkins.length + pending.redemptions.length;

  const filteredTasks = filter === '全部' ? tasks : tasks.filter(t => t.category === filter);

  return (
    <>
      <div className="hd">
        <div>
          <p className="s">小明 · 三年级 2 班</p>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>家长中心</h1>
        </div>
        <span className="pill">待处理 {pendingCount} 项</span>
      </div>

      <div className="g2">
        <div className="card">
          <h2 className="t">待确认的打卡</h2>
          {pending.checkins.length > 0 ? (
            pending.checkins.map(c => (
              <div key={c.id} className="row" style={{ borderTop: '1px solid var(--ln)', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p className="t p15">{SUBJECTS[c.subject_id].name}·{c.title}</p>
                  <p className="s">
                    {c.checkin_date} · {c.minutes} 分钟 · 自评 {['加油', '还不错', '很棒'][c.mood]}
                  </p>
                </div>
                <button className="btn sm" onClick={() => handleApproveCheckin(c.id)}>确认</button>
                <button className="chip" onClick={() => handleRejectCheckin(c.id)}>打回重做</button>
              </div>
            ))
          ) : (
            <p className="s">暂时没有需要确认的打卡</p>
          )}
          <p className="s">已确认 {pending.checkins.filter(c => c.status === 'approved').length} 项</p>
        </div>

        <div className="card" style={{ gap: 16 }}>
          <h2 className="t">今日学科完成度</h2>
          {SUBJECTS.map(subject => {
            const subjectTasks = todayTasks.filter(t => t.subject_id === subject.id);
            const done = subjectTasks.filter(t => todayCheckins[t.id]).length;
            const total = subjectTasks.length;
            return (
              <div key={subject.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="hd">
                  <span className="t p15">{subject.name}</span>
                  <span className="s">{done} / {total}</span>
                </div>
                <div className="bar">
                  <div style={{ width: `${total ? done / total * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <label className="t" htmlFor="message">给孩子的一句话</label>
        <textarea
          id="message"
          rows={3}
          placeholder="例如：这周坚持得很好，继续加油"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button className="btn sm" style={{ alignSelf: 'flex-start' }} onClick={handleSaveMessage}>
          保存并显示给孩子
        </button>
      </div>

      <div className="card">
        <h2 className="t">兑换申请</h2>
        {pending.redemptions.length > 0 ? (
          pending.redemptions.map(r => (
            <div key={r.id} className="row" style={{ borderTop: '1px solid var(--ln)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p className="t p15">{r.reward_name}</p>
                <p className="s">{r.request_date} · {r.star_cost} 颗星</p>
              </div>
              <button className="btn sm" onClick={() => handleApproveRedemption(r.id)}>批准</button>
              <button className="chip" onClick={() => handleRejectRedemption(r.id)}>拒绝</button>
            </div>
          ))
        ) : (
          <p className="s">暂时没有兑换申请</p>
        )}
      </div>

      <div className="card" id="task-form">
        <div className="hd">
          <h2 className="t">任务管理</h2>
        </div>
        <div className="fl" style={{ marginBottom: 8 }}>
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
        <p className="s">共 {tasks.length} 项，今天要做 {todayTasks.length} 项</p>

        {filteredTasks.map(task => {
          const cat = CATEGORIES[task.category];
          return (
            <div key={task.id} className="row" style={{ borderTop: '1px solid var(--ln)', flexWrap: 'wrap' }}>
              <div className="sb" style={{
                width: 36, height: 36, fontSize: 16,
                background: `var(${SUBJECTS[task.subject_id].bg})`,
                color: `var(${SUBJECTS[task.subject_id].color})`,
              }}>
                {SUBJECTS[task.subject_id].char}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <p className="t p15">{task.title}</p>
                <p className="s">
                  {task.description} · {task.weekdays && task.weekdays.length > 0
                    ? task.weekdays.map(d => '周' + WEEKDAYS[d]).join(' ')
                    : '每天'}
                </p>
              </div>
              <span className="tag" style={{ background: `var(${cat.bg})`, color: `var(${cat.color})` }}>
                {task.category}
              </span>
              <button className="chip" onClick={() => handleEditTask(task)}>编辑</button>
              <button className="chip" onClick={() => handleDeleteTask(task.id)}>删除</button>
            </div>
          );
        })}

        <h3 className="t" style={{ margin: '8px 0 0' }}>{editingTask ? '修改任务' : '添加新任务'}</h3>
        <div className="fl">
          <label className="s">
            学科
            <br />
            <select
              value={newTask.subject_id}
              onChange={e => setNewTask(prev => ({ ...prev, subject_id: parseInt(e.target.value) }))}
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="s">
            类型
            <br />
            <select
              value={newTask.category}
              onChange={e => setNewTask(prev => ({ ...prev, category: e.target.value }))}
            >
              {Object.keys(CATEGORIES).map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="s">
          任务名称
          <br />
          <input
            style={{ width: '100%' }}
            value={newTask.title}
            onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
          />
        </label>
        <label className="s">
          任务说明（可不写）
          <br />
          <input
            style={{ width: '100%' }}
            value={newTask.description}
            onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="s">哪几天要做（都不选表示每天）</legend>
          <div className="fl" style={{ marginTop: 6 }}>
            {[1, 2, 3, 4, 5, 6, 0].map(day => (
              <label key={day} className="chip" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={newTask.weekdays.includes(day)}
                  onChange={() => toggleWeekday(day)}
                />
                周{WEEKDAYS[day]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="fl">
          <button className="btn sm" onClick={handleAddTask}>
            {editingTask ? '保存修改' : '添加任务'}
          </button>
          {editingTask && (
            <button className="chip" onClick={() => {
              setEditingTask(null);
              setNewTask({ subject_id: 0, category: '复习', title: '', description: '', weekdays: [] });
            }}>
              取消修改
            </button>
          )}
        </div>
      </div>

      {toast && <div className="toast on">{toast}</div>}
    </>
  );
}
