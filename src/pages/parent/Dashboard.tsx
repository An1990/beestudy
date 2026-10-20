import { useApp } from '../../lib/store';
import { subjects, todayTasks, wrongQuestions, dailyReports, taskTypeLabels, taskStatusLabels } from '../../lib/mock-data';
import { Card, StatCard, SubjectBadge, ProgressBar } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import {
  Home, CalendarPlus, CheckCircle2, Clock, AlertCircle, BookOpen,
  TrendingUp, ArrowRight, Users, Target, Brain, Gift, Camera
} from 'lucide-react';

export default function ParentDashboard() {
  const { student, tasks } = useApp();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const todayList = tasks.filter(t => t.plannedDate === today);
  const completed = todayList.filter(t => t.status === 'completed').length;
  const pendingReview = todayList.filter(t => t.status === 'submitted').length;
  const needsRevision = todayList.filter(t => t.status === 'needs_revision').length;
  const openWrongQs = wrongQuestions.filter(w => w.status === 'open').length;
  const todayReport = dailyReports.find(r => r.date === today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="w-7 h-7 text-primary-500" /> 家庭概览
          </h1>
          <p className="text-gray-500 text-sm mt-1">{student.nickname} · 二年级 · {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/parent/ocr-upload')}>
            <Camera className="w-4 h-4" /> 拍照录题
          </button>
          <button className="btn-ghost flex items-center gap-2" onClick={() => navigate('/parent/daily-plan')}>
            <CalendarPlus className="w-4 h-4" /> 创建任务
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="" label="今日完成" value={`${completed}/${todayList.length}`} color="success" />
        <StatCard icon="" label="待验收" value={pendingReview} color="warm" />
        <StatCard icon="" label="需订正" value={needsRevision} color="primary" />
        <StatCard icon="" label="待复习错题" value={openWrongQs} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">今日任务</h2>
            <button onClick={() => navigate('/parent/tasks')} className="text-sm text-primary-500">管理任务 →</button>
          </div>

          {todayList.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-3"></div>
                <p className="text-gray-600 font-medium">今天还没有安排任务</p>
                <button className="btn-primary mt-4" onClick={() => navigate('/parent/daily-plan')}>
                  <CalendarPlus className="w-4 h-4 inline mr-2" /> 添加任务
                </button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayList.map(task => {
                const typeInfo = taskTypeLabels[task.taskType] || { label: task.taskType, icon: '', color: 'bg-gray-100 text-gray-600' };
                const subject = subjects.find(s => s.code === task.subjectCode);
                const statusInfo = taskStatusLabels[task.status];

                return (
                  <Card key={task.id} className="hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/parent/tasks/${task.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
                          {subject && <SubjectBadge code={subject.code} name={subject.name} />}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-gray-400">{task.estimatedMinutes}分钟</span>
                          {task.requiresParentReview && <span className="text-xs text-amber-600">需验收</span>}
                        </div>
                      </div>
                      {task.status === 'submitted' && (
                        <button className="btn-warm text-sm" onClick={e => { e.stopPropagation(); navigate(`/parent/tasks/${task.id}`); }}>
                          验收
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Subject Progress */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" /> 学科进度
            </h3>
            <div className="space-y-3">
              {subjects.map(sub => {
                const subTasks = todayList.filter(t => t.subjectCode === sub.code);
                const subDone = subTasks.filter(t => t.status === 'completed').length;
                return (
                  <div key={sub.code}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{sub.name}（{sub.publisher}）</span>
                      <span className="text-gray-500">{subDone}/{subTasks.length}</span>
                    </div>
                    <ProgressBar value={subDone} max={Math.max(subTasks.length, 1)}
                      color={sub.code === 'chinese' ? 'warm' : sub.code === 'math' ? 'primary' : 'success'} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Wrong Questions Reminder */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-500" /> 错题提醒
            </h3>
            <div className="space-y-2">
              {wrongQuestions.filter(w => w.status === 'open').slice(0, 3).map(wq => {
                const subject = subjects.find(s => s.code === wq.subjectCode);
                return (
                  <div key={wq.id} className="p-2.5 rounded-xl bg-red-50 text-sm">
                    <p className="text-gray-700 font-medium truncate">{wq.prompt}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{subject?.name} · 待复习</p>
                  </div>
                );
              })}
            </div>
            {openWrongQs > 0 && (
              <button className="w-full text-sm text-primary-500 mt-3 hover:text-primary-600"
                onClick={() => navigate('/parent/wrong-questions')}>
                查看全部错题 →
              </button>
            )}
          </Card>

          {/* Today Summary */}
          {todayReport && (
            <Card className="bg-gradient-to-br from-primary-50 to-purple-50 border-primary-100">
              <h3 className="font-bold text-gray-800 mb-3">今日数据</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">完成率</span><span className="font-semibold">{Math.round((todayReport.completedTasks / Math.max(todayReport.plannedTasks, 1)) * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">学习时长</span><span className="font-semibold">{todayReport.studyMinutes} 分钟</span></div>
                <div className="flex justify-between"><span className="text-gray-500">获得积分</span><span className="font-semibold text-warm-500">+{todayReport.pointsEarned}</span></div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
