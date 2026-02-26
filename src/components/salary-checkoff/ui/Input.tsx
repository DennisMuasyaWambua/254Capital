import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  return (
    <div className="w-full">
      {label &&
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 mb-1.5">

          {label}
        </label>
      }
      <div className="relative">
        {leftIcon &&
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        }
        <input
          id={inputId}
          className={`
            block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400
            focus:border-[#008080] focus:outline-none focus:ring-1 focus:ring-[#008080]
            disabled:bg-slate-50 disabled:text-slate-500
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props} />

      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error &&
      <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      }
    </div>);

}