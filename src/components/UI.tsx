import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, title, subtitle, ...props }: any) => (
  <div className={cn("bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-border animate-fade-in", className)} {...props}>
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h3 className="text-base sm:text-lg md:text-xl font-bold text-text">{title}</h3>}
        {subtitle && <p className="text-xs sm:text-sm text-muted">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: any) => {
  const variants: any = {
    primary: 'bg-gold text-white hover:bg-gold-strong shadow-sm',
    secondary: 'bg-white border border-gold text-text hover:bg-gold-soft/10',
    outline: 'border border-border text-muted hover:bg-surface',
    ghost: 'text-muted hover:bg-surface',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };
  
  const sizes: any = {
    sm: 'px-2.5 py-1.5 text-xs sm:text-sm',
    md: 'px-4 py-2 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className, ...props }: any) => (
  <input 
    className={cn(
      "w-full px-4 py-2 text-sm sm:text-base rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-gold-soft focus:border-gold transition-all bg-surface",
      className
    )}
    {...props}
  />
);

export const Select = ({ className, children, ...props }: any) => (
  <select 
    className={cn(
      "w-full px-4 py-2 text-sm sm:text-base rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all bg-white",
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export const LoadingState = ({ message = 'Carregando...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    <p className="text-muted font-medium animate-pulse">{message}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }: { message: string, onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
      <span className="text-2xl">!</span>
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-text">Ocorreu um erro</h3>
      <p className="text-sm text-muted max-w-xs">{message}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    )}
  </div>
);

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  action?: { label: string, onClick: () => void } 
}) => (
  <Card className="text-center py-12 flex flex-col items-center">
    <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mb-4">
      <Icon className="text-zinc-300" size={32} />
    </div>
    <h3 className="font-bold text-text mb-1">{title}</h3>
    <p className="text-muted text-sm mb-6 max-w-xs">{description}</p>
    {action && (
      <Button size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </Card>
);
