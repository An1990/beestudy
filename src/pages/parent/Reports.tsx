import { useState } from 'react';
import { dailyReports } from '../../lib/mock-data';
import { Card, ProgressBar } from '../../components/ui';
import { FileText, TrendingUp, Calendar, Clock, Target, Brain } from 'lucide-react';

export default function ParentReports() {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
  const today = new Date().toISOString().split('T')[0];
  const todayReport = dailyReports.find(r => r.date === today);
  const weekData = dailyReports.slice(-7);
  const weekTotal = weekData.reduce((s, r) => s + r.completedTasks, 0);
  const weekPlanned = weekData.reduce((s, r) => s + r.plannedTasks, 0);
  const weekMinutes = weekData.reduce((s, r) => s + r.studyMinutes, 0);
  const weekPoints = weekData.reduce((s, r) => s + r.pointsEarned, 0);
  const weekWrongCorrected = weekData.reduce((s, r) => s + r.reviewItems, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary-500" /> 学习报告
          </h1>
          <p className="text-gray-500 text-sm mt-1">查看学习数据和成长趋势</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPeriod('daily')} className={`px-4 py-2 rounded-xl text-sm font-medium ${period === 'daily' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>今日</button>
          <button onClick={() => setPeriod('weekly')} className={`px-4 py-2 rounded-xl text-sm font-medium ${period === 'weekly' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>本周</button>
        </div>
      </div>

      {period === 'daily' && todayReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="!p-4 text-center">
              <Target className="w-6 h-6 text-primary-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{todayReport.completedTasks}/{todayReport.plannedTasks}</p>
              <p className="text-xs text-gray-500">任务完成</p>
            </Card>
            <Card className="!p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{todayReport.studyMinutes}</p>
              <p className="text-xs text-gray-500">学习时长(分钟)</p>
            </Card>
            <Card className="!p-4 text-center">
              <TrendingUp className="w-6 h-6 text-warm-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">+{todayReport.pointsEarned}</p>
              <p className="text-xs text-gray-500">获得积分</p>
            </Card>
            <Card className="!p-4 text-center">
              <Brain className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{todayReport.reviewItems}</p>
              <p className="text-xs text-gray-500">需复习错题</p>
            </Card>
          </div>

          <Card>
            <h3 className="font-bold text-gray-800 mb-3">今日完成率</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <ProgressBar value={todayReport.completedTasks} max={Math.max(todayReport.plannedTasks, 1)} color="primary" />
              </div>
              <span className="text-2xl font-bold text-primary-600">{Math.round((todayReport.completedTasks / Math.max(todayReport.plannedTasks, 1)) * 100)}%</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
              <div><p className="text-lg font-bold text-green-600">{todayReport.completedTasks}</p><p className="text-xs text-gray-500">已完成</p></div>
              <div><p className="text-lg font-bold text-amber-600">{todayReport.pendingReview}</p><p className="text-xs text-gray-500">待验收</p></div>
              <div><p className="text-lg font-bold text-red-600">{todayReport.needsRevision}</p><p className="text-xs text-gray-500">需订正</p></div>
              <div><p className="text-lg font-bold text-gray-400">{todayReport.plannedTasks - todayReport.completedTasks - todayReport.pendingReview - todayReport.needsRevision}</p><p className="text-xs text-gray-500">待开始</p></div>
            </div>
          </Card>
        </div>
      )}

      {period === 'weekly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="!p-4 text-center">
              <Target className="w-6 h-6 text-primary-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{weekTotal}/{weekPlanned}</p>
              <p className="text-xs text-gray-500">本周完成任务</p>
            </Card>
            <Card className="!p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{weekMinutes}</p>
              <p className="text-xs text-gray-500">本周学习(分钟)</p>
            </Card>
            <Card className="!p-4 text-center">
              <TrendingUp className="w-6 h-6 text-warm-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">+{weekPoints}</p>
              <p className="text-xs text-gray-500">本周积分</p>
            </Card>
            <Card className="!p-4 text-center">
              <Brain className="w-6 h-6 text-red-500 mx-auto" />
              <p className="text-2xl font-bold text-gray-800 mt-1">{weekWrongCorrected}</p>
              <p className="text-xs text-gray-500">错题订正</p>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">每日完成情况</h3>
            <div className="flex items-end gap-3 h-40">
              {weekData.map((r, i) => {
                const maxVal = Math.max(...weekData.map(d => d.plannedTasks), 1);
                const completedH = (r.completedTasks / maxVal) * 100;
                const plannedH = (r.plannedTasks / maxVal) * 100;
                const isToday = r.date === today;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">{r.completedTasks}/{r.plannedTasks}</span>
                    <div className="w-full flex gap-1 items-end" style={{ height: '120px' }}>
                      <div className="flex-1 rounded-t-md bg-gray-200 relative" style={{ height: `${plannedH}%` }}>
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400" style={{ height: `${r.plannedTasks > 0 ? (r.completedTasks / r.plannedTasks) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <span className={`text-[10px] ${isToday ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                      {['一', '二', '三', '四', '五', '六', '日'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" /> 计划</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-500" /> 完成</span>
            </div>
          </Card>

          {/* Daily Breakdown */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">每日明细</h3>
            <div className="space-y-2">
              {weekData.map((r, i) => {
                const rate = Math.round((r.completedTasks / Math.max(r.plannedTasks, 1)) * 100);
                return (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50">
                    <span className="text-sm text-gray-500 w-16">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]}</span>
                    <span className="text-sm text-gray-400 w-20">{r.date}</span>
                    <div className="flex-1">
                      <ProgressBar value={r.completedTasks} max={Math.max(r.plannedTasks, 1)} color="primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">{rate}%</span>
                    <span className="text-xs text-gray-400 w-16 text-right">{r.studyMinutes}分钟</span>
                    <span className="text-xs text-warm-500 w-12 text-right">+{r.pointsEarned}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
