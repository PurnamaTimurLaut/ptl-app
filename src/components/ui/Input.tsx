import React, { InputHTMLAttributes, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  className = '',
  label,
  error,
  id,
  ...props
}: InputProps) {
  const reactId = useId();
  const generatedId = id || reactId;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-[var(--color-ios-gray-1)] pl-2">
          {label}
        </label>
      )}
      <input
        id={generatedId}
        className={`
          w-full h-12 px-4 rounded-xl text-[17px] 
          bg-white dark:bg-[var(--color-ios-gray-6-dark)]
          border border-[var(--color-ios-gray-4)] dark:border-[var(--color-ios-gray-4-dark)]
          text-black dark:text-white
          focus:outline-none focus:ring-2 focus:ring-[var(--color-ios-blue)] focus:border-transparent
          placeholder:text-[var(--color-ios-gray-2)]
          transition-colors
          ${error ? 'border-[var(--color-ios-red)] ring-1 ring-[var(--color-ios-red)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-sm text-[var(--color-ios-red)] pl-2">{error}</span>}
    </div>
  );
}
