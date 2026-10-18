import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMagnetic } from '../../hooks/useMagnetic';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  withArrow?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = false,
  withArrow = false,
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}, forwardedRef) => {
  const { ref: magneticRef, x, y, onMouseMove, onMouseLeave } = useMagnetic(8, 80);

  const sizeClasses = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-3 gap-2',
    lg: 'text-base px-8 py-4 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-signal text-[#09090B] font-semibold hover:shadow-[0_0_30px_rgba(212,255,58,0.35)] active:brightness-95',
    secondary: 'bg-transparent text-text border border-border-strong hover:border-white/30 hover:bg-white/[0.04] active:bg-white/[0.08]',
    outline: 'bg-surface text-text border border-border hover:border-border-strong active:bg-surface-2',
    ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-white/[0.04]',
  }[variant];

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {withArrow && (
        <ArrowRight 
          strokeWidth={1.5} 
          className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" 
        />
      )}
    </>
  );

  if (magnetic && !disabled) {
    return (
      <motion.button
        ref={(node) => {
          (magneticRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        style={{ x, y }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled}
        onClick={onClick}
        className={`group inline-flex items-center justify-center rounded-pill cursor-pointer select-none transition-[color,background-color,border-color,box-shadow] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...(props as any)}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      ref={forwardedRef}
      disabled={disabled}
      onClick={onClick}
      className={`group inline-flex items-center justify-center rounded-pill cursor-pointer select-none transition-all duration-200 ease-out hover:-translate-y-[1px] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';
