import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: 'teal' | 'blue' | 'purple' | 'amber';
}
export function StatCard({
  label,
  value,
  trend,
  icon,
  color = 'teal'
}: StatCardProps) {
  const colorStyles = {
    teal: 'bg-[#E0F2F2] text-[#008080]',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700'
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>{icon}</div>
      </div>
      {trend &&
      <div className="mt-4 flex items-center text-sm">
          {trend.isPositive ?
        <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" /> :

        <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
        }
          <span
          className={`font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>

            {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-slate-500">from last month</span>
        </div>
      }
    </div>);

}