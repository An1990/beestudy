import { useApp } from '../../lib/store';
import { Card } from '../../components/ui';
import { Settings, User, Globe, Bell, Shield, Database, Palette, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ParentSettings() {
  const { student } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem('learnworld_tasks');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-7 h-7 text-gray-500" /> 设置
        </h1>
        <p className="text-gray-500 text-sm mt-1">管理家庭和孩子的基本设置</p>
      </div>

      {/* Child Profile */}
      <Card className="!p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" /> 孩子档案
        </h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">昵称</label>
              <input className="input-field" defaultValue={student.nickname} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">年级</label>
              <select className="input-field" defaultValue={student.grade}>
                {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}年级</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">学期</label>
              <select className="input-field" defaultValue={student.term}>
                <option value="spring">春季</option>
                <option value="autumn">秋季</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">状态</label>
              <select className="input-field" defaultValue="active">
                <option value="active">启用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Textbook Versions */}
      <Card className="!p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-500" /> 教材版本
        </h3>
        <div className="space-y-3">
          {[
            { name: '语文', publisher: '统编版', grade: '二年级', term: '上册', status: '已确认' },
            { name: '数学', publisher: '北京版', grade: '二年级', term: '上册', status: '已确认' },
            { name: '英语', publisher: '北京版', grade: '二年级', term: '上册', status: '已确认' },
          ].map((textbook, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-gray-800">{textbook.name}</p>
                <p className="text-xs text-gray-400">{textbook.publisher} · {textbook.grade}{textbook.term}</p>
              </div>
              <span className="badge badge-success">{textbook.status}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Timezone */}
      <Card className="!p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" /> 时区设置
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">家庭时区</label>
            <select className="input-field" defaultValue="Asia/Shanghai">
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">每日学习窗口（可选）</label>
            <div className="flex gap-2">
              <input type="time" className="input-field" defaultValue="16:00" />
              <span className="text-gray-400 self-center">至</span>
              <input type="time" className="input-field" defaultValue="20:00" />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="!p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" /> 提醒偏好
        </h3>
        <div className="space-y-3">
          {['任务完成提醒', '待验收提醒', '错题复习提醒', '周报推送'].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item}</span>
              <div className="w-10 h-6 rounded-full bg-green-500 flex items-center justify-end px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card className="!p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> 隐私与安全
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>儿童资料和作业附件默认私有，不公开分享。</p>
          <p>提供数据导出和删除路径。</p>
          <div className="flex gap-3 mt-4">
            <button className="btn-ghost text-sm">导出数据</button>
            <button className="btn-ghost text-sm text-red-500 hover:text-red-600">删除账户</button>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="!p-6 border-red-100 bg-red-50/30">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" /> 数据管理
        </h3>
        <p className="text-sm text-gray-600 mb-4">清除所有本地保存的任务数据，恢复到初始状态。</p>
        {!showConfirm ? (
          <button
            className="btn-ghost text-sm text-red-500 hover:text-red-600 flex items-center gap-2"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="w-4 h-4" /> 清除所有任务数据
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600 font-medium">确定要清除所有数据吗？</span>
            <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600" onClick={handleClearData}>
              确定清除
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300" onClick={() => setShowConfirm(false)}>
              取消
            </button>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <button className="btn-primary px-8">保存设置</button>
      </div>
    </div>
  );
}
