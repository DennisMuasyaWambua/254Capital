import React from 'react';
import { Bell, Menu } from 'lucide-react';
interface HeaderProps {
  title: string;
  role: 'employee' | 'hr' | 'admin';
  onMenuClick: () => void;
  onRoleChange: (role: 'employee' | 'hr' | 'admin') => void;
}
export function Header({
  title,
  role,
  onMenuClick,
  onRoleChange
}: HeaderProps) {
  return (
    <header className="bg-[#11103a] h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-4 text-white/70 hover:text-white lg:hidden focus:outline-none">

          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Role Switcher (Demo Only) */}
        <div className="hidden md:flex items-center space-x-2 mr-4 bg-white/10 p-1 rounded-lg border border-white/20">
          <span className="text-xs font-medium text-white/50 px-2">
            View as:
          </span>
          {(['employee', 'hr', 'admin'] as const).map((r) =>
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={`
                px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize
                ${role === r ? 'bg-white text-[#11103a] shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}
              `}>

              {r}
            </button>
          )}
        </div>

        <button className="relative p-2 text-white/70 hover:text-white transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-400 rounded-full ring-2 ring-[#11103a]" />
        </button>

        <div className="h-8 w-px bg-white/20 mx-2" />

        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">
              {role === 'employee' ?
              'John Kamau' :
              role === 'hr' ?
              'Mary Wanjiku' :
              'Admin User'}
            </p>
            <p className="text-xs text-white/50 capitalize">{role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center font-medium border border-white/30">
            {role === 'employee' ? 'JK' : role === 'hr' ? 'MW' : 'AD'}
          </div>
        </div>
      </div>
    </header>);

}