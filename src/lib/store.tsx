import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { api, type Task, type CheckinLog, type Stats, type RewardItem, type Redemption, type PendingItem } from './api';

interface AppState {
  tasks: Task[];
  todayCheckins: Record<string, CheckinLog>;
  history: Record<string, number>;
  stats: Stats;
  rewards: RewardItem[];
  redemptions: Redemption[];
  pending: PendingItem;
  parentMessage: string;
  role: 'child' | 'parent';
  loading: boolean;
  refreshTasks: () => Promise<void>;
  refreshCheckins: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshRewards: () => Promise<void>;
  refreshRedemptions: () => Promise<void>;
  refreshPending: () => Promise<void>;
  refreshMessage: () => Promise<void>;
  switchRole: (role: 'child' | 'parent') => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<Record<string, CheckinLog>>({});
  const [history, setHistory] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Stats>({ total: 0, streak: 0, categories: {}, subjects: {} });
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pending, setPending] = useState<PendingItem>({ checkins: [], redemptions: [] });
  const [parentMessage, setParentMessage] = useState('');
  const [role, setRole] = useState<'child' | 'parent'>('child');
  const [loading, setLoading] = useState(true);

  const refreshTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      // 使用默认任务数据
      setTasks([
        { id: 'c1', subject_id: 0, category: '复习', title: '古诗背诵', description: '《静夜思》默写 1 遍', weekdays: null, is_default: true },
        { id: 'c2', subject_id: 0, category: '预习', title: '第 9 课《曹冲称象》', description: '朗读 3 遍，圈出生字', weekdays: null, is_default: true },
        { id: 'c3', subject_id: 0, category: '作业', title: '生字练习', description: '第 8 课生字各写 3 遍', weekdays: null, is_default: true },
        { id: 'm1', subject_id: 1, category: '复习', title: '错题整理', description: '本周错题 3 道', weekdays: null, is_default: true },
        { id: 'm2', subject_id: 1, category: '预习', title: '第五单元', description: '读课本 42–45 页', weekdays: null, is_default: true },
        { id: 'm3', subject_id: 1, category: '作业', title: '口算练习', description: '20 题 · 限时 10 分钟', weekdays: null, is_default: true },
        { id: 'e1', subject_id: 2, category: '复习', title: 'Unit 2 单词听写', description: '听写 10 个', weekdays: null, is_default: true },
        { id: 'e2', subject_id: 2, category: '预习', title: 'Unit 3 跟读', description: '跟读录音 2 遍', weekdays: null, is_default: true },
        { id: 'e3', subject_id: 2, category: '作业', title: '抄写单词', description: 'Unit 3 各 2 遍', weekdays: null, is_default: true },
      ]);
    }
  };

  const refreshCheckins = async () => {
    try {
      const data = await api.getTodayCheckins();
      setTodayCheckins(data);
    } catch (err) {
      console.error('Failed to load checkins:', err);
    }
  };

  const refreshHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const refreshStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const refreshRewards = async () => {
    try {
      const data = await api.getRewards();
      setRewards(data);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      // 使用默认奖励数据
      setRewards([
        { id: 1, name: '看动画片 30 分钟', star_cost: 20, description: '周末可用' },
        { id: 2, name: '新文具一份', star_cost: 40, description: '自己挑选' },
        { id: 3, name: '周末去公园', star_cost: 50, description: '全家一起' },
        { id: 4, name: '选一本课外书', star_cost: 60, description: '书店任选' },
        { id: 5, name: '家庭电影夜', star_cost: 90, description: '选片权归你' },
        { id: 6, name: '乐园一日游', star_cost: 150, description: '每学期限 1 次' },
      ]);
    }
  };

  const refreshRedemptions = async () => {
    try {
      const data = await api.getRedemptions();
      setRedemptions(data);
    } catch (err) {
      console.error('Failed to load redemptions:', err);
    }
  };

  const refreshPending = async () => {
    try {
      const data = await api.getPending();
      setPending(data);
    } catch (err) {
      console.error('Failed to load pending:', err);
    }
  };

  const refreshMessage = async () => {
    try {
      const data = await api.getMessage();
      setParentMessage(data.message);
    } catch (err) {
      console.error('Failed to load message:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        refreshTasks(),
        refreshCheckins(),
        refreshHistory(),
        refreshStats(),
        refreshRewards(),
        refreshRedemptions(),
        refreshPending(),
        refreshMessage(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const switchRole = (newRole: 'child' | 'parent') => {
    setRole(newRole);
  };

  return (
    <AppContext.Provider value={{
      tasks, todayCheckins, history, stats, rewards, redemptions, pending, parentMessage, role, loading,
      refreshTasks, refreshCheckins, refreshHistory, refreshStats, refreshRewards, refreshRedemptions, refreshPending, refreshMessage,
      switchRole,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
