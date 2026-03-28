import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  Wallet, 
  Target, 
  Settings 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/receitas', icon: TrendingUp, label: 'Receitas' },
  { to: '/despesas', icon: Receipt, label: 'Despesas' },
  { to: '/investimentos', icon: Wallet, label: 'Investimentos' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/configuracoes', icon: Settings, label: 'Ajustes' },
];

export const TabsNav = () => {
  console.log('[TabsNav]', 'render');
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => console.log('[TabsNav]', 'navigate', { to: item.to })}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px] relative",
            isActive ? "text-gold" : "text-muted"
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute -bottom-1 w-1 h-1 bg-gold rounded-full" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
