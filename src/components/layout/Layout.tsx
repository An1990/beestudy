import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../../lib/store';
import { Home, BookOpen, Gift, Star, Users } from 'lucide-react';

const childNav = [
  { to: '/child', icon: Home, label: '今天', end: true },
  { to: '/child/subjects', icon: BookOpen, label: '学科中心' },
  { to: '/child/rewards', icon: Gift, label: '奖励中心' },
  { to: '/child/growth', icon: Star, label: '我的成长' },
];

const parentNav = [
  { to: '/parent', icon: Users, label: '家长中心' },
];

export function ChildLayout() {
  const { role, switchRole } = useApp();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <aside className="sd">
        <p style={{ fontSize: 20, fontWeight: 900, padding: '0 12px 16px' }}>每日打卡</p>
        {childNav.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nv ${isActive ? 'nv-active' : ''}`}
          >
            <n.icon size={20} />
            {n.label}
          </NavLink>
        ))}
        {role === 'parent' && parentNav.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nv ${isActive ? 'nv-active' : ''}`}
          >
            <n.icon size={20} />
            {n.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <div className="row" style={{ padding: '0 8px' }}>
          <div className="ic" style={{ borderRadius: 22, background: 'var(--amb)', color: 'var(--amt)', fontWeight: 900 }}>明</div>
          <div>
            <p className="t p15">小明</p>
            <p className="s">{role === 'parent' ? '家长模式' : '孩子模式'}</p>
          </div>
        </div>
        <button className="chip" style={{ marginTop: 8 }} onClick={() => switchRole(role === 'child' ? 'parent' : 'child')}>
          {role === 'child' ? '切换到家长视图' : '切换到孩子视图'}
        </button>
      </aside>
      <main className="mn">
        <Outlet />
      </main>
    </div>
  );
}

export function ParentLayout() {
  const { role, switchRole } = useApp();

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <aside className="sd">
        <p style={{ fontSize: 20, fontWeight: 900, padding: '0 12px 16px' }}>每日打卡</p>
        {childNav.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nv ${isActive ? 'nv-active' : ''}`}
          >
            <n.icon size={20} />
            {n.label}
          </NavLink>
        ))}
        {parentNav.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `nv ${isActive ? 'nv-active' : ''}`}
          >
            <n.icon size={20} />
            {n.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <div className="row" style={{ padding: '0 8px' }}>
          <div className="ic" style={{ borderRadius: 22, background: 'var(--amb)', color: 'var(--amt)', fontWeight: 900 }}>家</div>
          <div>
            <p className="t p15">家长</p>
            <p className="s">家长模式</p>
          </div>
        </div>
        <button className="chip" style={{ marginTop: 8 }} onClick={() => switchRole('child')}>
          切换到孩子视图
        </button>
      </aside>
      <main className="mn">
        <Outlet />
      </main>
    </div>
  );
}
