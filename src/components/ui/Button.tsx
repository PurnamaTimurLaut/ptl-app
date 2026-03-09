'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-opacity active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-ios-blue)] text-white',
    secondary: 'bg-[var(--color-ios-gray-5)] dark:bg-[var(--color-ios-gray-5-dark)] text-black dark:text-white',
    danger: 'bg-[var(--color-ios-red)] text-white',
    ghost: 'bg-transparent text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-gray-6)] dark:hover:bg-[var(--color-ios-gray-6-dark)]',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-[17px]', // iOS default body size
    lg: 'h-14 px-8 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
