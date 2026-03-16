import React from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MoneyInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  value,
  onChange,
  ...props
}: MoneyInputProps) {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');

    // Only allow numbers and decimal point
    if (rawValue && !/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }

    // Create a synthetic event with the unformatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: rawValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  // Format the displayed value
  const displayValue = value ? formatNumberWithCommas(parseFormattedNumber(value)) : '';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`
            block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900
            placeholder:text-slate-400
            focus:border-[#008080] focus:outline-none focus:ring-1 focus:ring-[#008080]
            disabled:bg-slate-50 disabled:text-slate-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
