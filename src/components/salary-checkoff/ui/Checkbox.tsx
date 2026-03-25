import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 border-2 rounded transition-all
            ${checked
              ? 'bg-[#008080] border-[#008080]'
              : 'bg-white border-slate-300'
            }
            ${!disabled && 'hover:border-[#008080]'}
          `}
        >
          {checked && (
            <Check className="h-4 w-4 text-white absolute top-0 left-0" strokeWidth={3} />
          )}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-slate-700">{label}</span>
      )}
    </label>
  );
}
