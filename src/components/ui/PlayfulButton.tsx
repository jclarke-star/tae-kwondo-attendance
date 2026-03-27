import React from 'react';
import { cn } from '@/lib/utils';
interface PlayfulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'blue' | 'yellow' | 'green' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const PlayfulButton = React.forwardRef<HTMLButtonElement, PlayfulButtonProps>(
  ({ variant = 'blue', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      red: 'bg-kidRed text-white',
      blue: 'bg-kidBlue text-white',
      yellow: 'bg-kidYellow text-black',
      green: 'bg-kidGreen text-white',
      white: 'bg-white text-black',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-xl',
      xl: 'px-10 py-6 text-2xl',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'playful-btn flex items-center justify-center gap-2 select-none active:scale-95 disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-playful',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PlayfulButton.displayName = 'PlayfulButton';