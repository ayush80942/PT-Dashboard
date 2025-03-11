import clsx from 'clsx';
import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /**
   * Variants available: default, destructive, outline, secondary, ghost, link
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /**
   * Sizes available: default, sm, lg
   */
  size?: 'default' | 'sm' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'default',
  ...rest
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    default:
      'bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600 focus-visible:outline-blue-500',
    destructive:
      'bg-red-500 text-white hover:bg-red-400 active:bg-red-600 focus-visible:outline-red-500',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    secondary:
      'bg-gray-500 text-white hover:bg-gray-400 active:bg-gray-600 focus-visible:outline-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    link: 'underline text-blue-500 hover:text-blue-400 active:text-blue-600',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    default: 'h-10 px-4 text-sm',
    sm: 'h-9 px-3',
    lg: 'h-11 px-6',
  };

  return (
    <button
      {...rest}
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </button>
  );
}
