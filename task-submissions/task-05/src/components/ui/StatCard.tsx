import type { ReactNode } from 'react';

export function StatCard({ label, value, caption, tone = 'default' }: { label: string; value: ReactNode; caption: string; tone?: 'default' | 'proposed' }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__value">{value}</div>
      <p className="stat-card__caption">{caption}</p>
    </div>
  );
}
