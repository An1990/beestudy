import type { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`card p-5 ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: 'success' | 'warm' | 'primary' | 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function ProgressBar({ value, max, color = 'primary' }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, string> = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-success-400 to-success-500',
    warm: 'from-warm-300 to-warm-500',
    amber: 'from-amber-400 to-amber-500',
  };
  return (
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${colorMap[color] || colorMap.primary} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

export function StatCard({ icon, label, value, color = 'primary' }: { icon: string; label: string; value: string | number; color?: string }) {
  const iconBg: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-50 text-success-500',
    warm: 'bg-warm-50 text-warm-500',
    amber: 'bg-amber-50 text-amber-500',
  };
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg[color] || iconBg.primary}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function SubjectBadge({ code, name }: { code: string; name: string }) {
  const colors: Record<string, string> = {
    chinese: 'bg-red-100 text-red-700',
    math: 'bg-blue-100 text-blue-700',
    english: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={`badge ${colors[code] || 'bg-gray-100 text-gray-600'}`}>
      {name}
    </span>
  );
}
