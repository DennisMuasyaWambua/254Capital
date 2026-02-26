import React from 'react';
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}
export function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  action
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>

      {(title || subtitle || action) &&
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            {title &&
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          }
            {subtitle &&
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          }
          </div>
          {action && <div>{action}</div>}
        </div>
      }
      <div className="p-6">{children}</div>
      {footer &&
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      }
    </div>);

}