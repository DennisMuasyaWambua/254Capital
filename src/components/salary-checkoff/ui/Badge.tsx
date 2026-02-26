import React from 'react';
export type BadgeVariant =
'pending' |
'approved' |
'declined' |
'disbursed' |
'under-review' |
'default';
interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}
export function Badge({
  variant = 'default',
  children,
  className = ''
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-[#E0F2F2] text-[#008080]',
    declined: 'bg-red-100 text-red-800',
    disbursed: 'bg-blue-100 text-blue-800',
    'under-review': 'bg-[#E0F2F2] text-[#008080]'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>

      {children}
    </span>);

}