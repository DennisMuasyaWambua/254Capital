import React from 'react';
interface Tab {
  id: string;
  label: string;
  count?: number;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}
export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${isActive ? 'border-[#008080] text-[#008080]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
              aria-current={isActive ? 'page' : undefined}>

              {tab.label}
              {tab.count !== undefined &&
              <span
                className={`
                  ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                  ${isActive ? 'bg-[#E0F2F2] text-[#004D4D]' : 'bg-slate-100 text-slate-600'}
                `}>

                  {tab.count}
                </span>
              }
            </button>);

        })}
      </nav>
    </div>);

}