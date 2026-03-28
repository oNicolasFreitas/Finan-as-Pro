import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { TabsNav, navItems } from './TabsNav';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0">
        <div className="p-8">
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-white shadow-sm">
              <TrendingUp size={18} />
            </div>
            Administrador de Riqueza
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-gold text-white shadow-md shadow-gold/20" 
                  : "text-muted hover:text-text hover:bg-surface"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-muted hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-border p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-text flex items-center gap-2">
              <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center text-white">
                <TrendingUp size={16} />
              </div>
              Administrador de Riqueza
            </h1>
            <button onClick={() => signOut()} className="text-muted p-2">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <TabsNav />
    </div>
  );
};
