import { useApp } from '../../lib/store';
import { subjects, taskTypeLabels, taskStatusLabels, wrongQuestions, rewardItems, redemptions, dailyReports } from '../../lib/mock-data';
import { Card, Badge, ProgressBar, StatCard, SubjectBadge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import {
  Star, Flame, Zap, Target, CheckCircle2, Clock, BookOpen, TrendingUp,
  ArrowRight, Sparkles, Award, Gift, Brain, ChevronRight, Timer, Puzzle
} from 'lucide-react';

export default function ChildDashboard() {
  const { student, tasks } = useApp();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const todayTasksList = tasks.filter(t => t.plannedDate === today);
  const completedCount = todayTasksList.filter(t => t.status === 'completed').length;
  const inProgressCount = todayTasksList.filter(t => t.status === 'in_progress').length;
  const totalEstimated = todayTasksList.reduce((s, t) => s + t.estimatedMinutes, 0);
  const todayReport = dailyReports.find(r => r.date === today);

  const todayStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  const activeTasks = todayTasksList.filter(t => t.status === 'in_progress' || t.status === 'planned')
    .sort((a, b) => a.priority - b.priority || a.sortOrder - b.sortOrder);

  const openWrongQs = wrongQuestions.filter(w => w.status === 'open' || w.status === 'reviewing');
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending' || r.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 p-6 md:p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-4 right-8 text-3xl opacity-30">✨</div>
        <div className="absolute bottom-6 left-1/3 text-2xl opacity-20">⭐</div>
        <div className="absolute top-1/2 right-1/4 text-xl opacity-20">🌟</div>

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl border-2 border-white/30">
              🦸
            </div>
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                <Zap className="w-3 h-3" /> Lv.{student.level}
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="flex-1">
            <p className="text-white/80 text-sm">{greeting}! ☀️</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              欢迎回来，{student.nickname}! 🚀
            </h1>
            <p className="text-white/70 text-sm mt-1">Star Explorer · {student.grade}年级</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-sm px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-300" /> {student.streak} Day Streak!
              </span>
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-sm px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-amber-300" /> {student.totalPoints.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Right Stats */}
          <div className="hidden md:block space-y-3 min-w-[220px]">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/80">Level {student.level} Progress</span>
                <span className="font-semibold">{Math.round((student.xp / student.xpToNext) * 100)}%</span>
              </div>
              <ProgressBar value={student.xp} max={student.xpToNext} color="amber" />
              <p className="text-xs text-white/60 mt-1.5">{student.xp} XP / {student.xpToNext} XP</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-white/80 mb-2">🎯 Daily Goal</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    i <= Math.ceil(todayTasksList.length / 3) && completedCount >= i * 2
                      ? 'bg-success-500 text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {i <= Math.ceil(todayTasksList.length / 3) && completedCount >= i * 2
                      ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-2 border-white/30" />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60 mt-2">{completedCount}/{todayTasksList.length} lessons done today!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="⭐" label="Total Points" value={student.totalPoints.toLocaleString()} color="warm" />
        <StatCard icon="📚" label="Lessons Done" value={dailyReports.reduce((s, r) => s + r.completedTasks, 0)} color="primary" />
        <StatCard icon="" label="Perfect Scores" value={dailyReports.filter(r => r.needsRevision === 0 && r.completedTasks > 0).length} color="success" />
        <StatCard icon="⏱️" label="Time Spent" value={`${Math.floor(dailyReports.reduce((s, r) => s + r.studyMinutes, 0) / 60)}h ${dailyReports.reduce((s, r) => s + r.studyMinutes, 0) % 60}m`} color="amber" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Tasks (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" /> 今日任务
              </h2>
              <Badge variant="primary">{completedCount}/{todayTasksList.length} Done</Badge>
            </div>

            <div className="space-y-3">
              {activeTasks.map(task => {
                const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
                const subject = subjects.find(s => s.code === task.subjectCode);
                const statusInfo = taskStatusLabels[task.status];
                const isCompleted = task.status === 'completed';

                return (
                  <Card key={task.id} className={`transition-all hover:shadow-md cursor-pointer ${isCompleted ? 'opacity-70' : ''} ${task.priority === 1 ? 'border-l-4 border-l-warm-400' : ''}`}
                    onClick={() => navigate(`/child/tasks/${task.id}`)}>
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{task.title}</h3>
                          {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Timer className="w-3 h-3" /> {task.estimatedMinutes}分钟
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-warm-500 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> +{task.pointsReward} XP
                          </span>
                        </div>
                      </div>
                      <button className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        task.status === 'planned' ? 'btn-primary' :
                        task.status === 'in_progress' ? 'btn-success' : 'btn-ghost'
                      }`}>
                        {task.status === 'planned' ? '开始' : task.status === 'in_progress' ? '继续' : '查看'}
                        <ArrowRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </Card>
                );
              })}

              {activeTasks.length === 0 && (
                <Card>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎉</div>
                    <p className="text-gray-600 font-medium">今天的任务都完成了！</p>
                    <p className="text-sm text-gray-400 mt-1">太棒了，继续保持！</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* My Subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> 我的学科
              </h2>
              <button onClick={() => navigate('/child/tasks')} className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                全部课程 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjects.map(sub => {
                const subTasks = todayTasksList.filter(t => t.subjectCode === sub.code);
                const subCompleted = subTasks.filter(t => t.status === 'completed').length;
                return (
                  <Card key={sub.code} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/child/tasks')}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: sub.color + '15' }}>
                        {sub.icon || (sub.code === 'chinese' ? '' : '📐')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{sub.name}</h3>
                        <p className="text-xs text-gray-400">{sub.publisher} · 二年级上</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{subCompleted}/{subTasks.length} 已完成</span>
                      <ProgressBar value={subCompleted} max={Math.max(subTasks.length, 1)} color={sub.code === 'chinese' ? 'warm' : sub.code === 'math' ? 'primary' : 'success'} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Puzzle Challenge Entry */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/child/puzzles')}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Puzzle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">竖式字谜挑战</h3>
                <p className="text-sm text-gray-500 mt-0.5">汉字代表数字，推理出答案！锻炼逻辑思维</p>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Wrong Questions Reminder */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-500" /> 错题提醒
              </h3>
              <button onClick={() => navigate('/child/wrong-questions')} className="text-xs text-primary-500">查看全部</button>
            </div>
            <div className="space-y-2">
              {openWrongQs.slice(0, 3).map(wq => {
                const subject = subjects.find(s => s.code === wq.subjectCode);
                return (
                  <div key={wq.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/child/wrong-questions')}>
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm">
                      {subject?.icon || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{wq.prompt}</p>
                      <p className="text-xs text-gray-400">{subject?.name} · 待复习</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Rewards */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Gift className="w-5 h-5 text-warm-500" /> 奖励兑换
              </h3>
              <button onClick={() => navigate('/child/growth')} className="text-xs text-primary-500">查看全部</button>
            </div>
            <div className="space-y-2">
              {rewardItems.slice(0, 3).map(rw => (
                <div key={rw.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                  <span className="text-xl">{rw.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{rw.name}</p>
                    <p className="text-xs text-warm-500 font-medium">{rw.pointsCost} 积分</p>
                  </div>
                </div>
              ))}
            </div>
            {pendingRedemptions.length > 0 && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs">
                你有 {pendingRedemptions.length} 个待处理的兑换申请
              </div>
            )}
          </Card>

          {/* Weekly Trend */}
          <Card>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-success-500" /> 本周趋势
            </h3>
            <div className="flex items-end gap-2 h-32">
              {dailyReports.slice(-7).map((r, i) => {
                const maxVal = Math.max(...dailyReports.slice(-7).map(d => d.completedTasks), 1);
                const height = (r.completedTasks / maxVal) * 100;
                const isToday = r.date === today;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{r.completedTasks}</span>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        background: isToday ? 'linear-gradient(to top, #6366f1, #818cf8)' : 'linear-gradient(to top, #e0e7ff, #c7d2fe)',
                      }} />
                    <span className={`text-[10px] ${isToday ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                      {['一', '二', '三', '四', '五', '六', '日'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Today Summary */}
          {todayReport && (
            <Card className="bg-gradient-to-br from-primary-50 to-purple-50 border-primary-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" /> 今日小结
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">已完成任务</span>
                  <span className="font-semibold text-gray-700">{todayReport.completedTasks} 项</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">学习时长</span>
                  <span className="font-semibold text-gray-700">{todayReport.studyMinutes} 分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">获得积分</span>
                  <span className="font-semibold text-warm-500">+{todayReport.pointsEarned} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">待复习错题</span>
                  <span className="font-semibold text-gray-700">{todayReport.reviewItems} 道</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
