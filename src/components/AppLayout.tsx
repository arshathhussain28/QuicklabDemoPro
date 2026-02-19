import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Cpu, FlaskConical,
  ClipboardList, FileText, LogOut, Activity, ChevronLeft, Menu
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Salespersons', path: '/admin/salespersons', icon: Users },
  { label: 'Distributors', path: '/admin/distributors', icon: Building2 },
  { label: 'Machines', path: '/admin/machines', icon: Cpu },
  { label: 'Kit Parameters', path: '/admin/kits', icon: FlaskConical },
  { label: 'Demo Requests', path: '/admin/requests', icon: ClipboardList },
];

const salesNav: NavItem[] = [
  { label: 'New Request', path: '/sales/request-form', icon: FileText },
  { label: 'My Requests', path: '/sales/my-requests', icon: ClipboardList },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navItems = user?.role === 'admin' ? adminNav : salesNav;

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-blue-900/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobileMenuOpen) && (
          <div className="ml-3 flex flex-col justify-center animate-fade-in">
            <div className="font-extrabold text-lg leading-none tracking-tight">
              <span className="text-secondary">Q</span>
              <span className="text-white">UICK</span>
              <span className="text-secondary">LAB</span>
            </div>
            <span className="text-[10px] font-medium text-sidebar-foreground/60 uppercase tracking-widest mt-0.5">
              Demo Pro
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(!collapsed || mobileMenuOpen) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {(!collapsed || mobileMenuOpen) && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-sidebar-foreground/60">Signed in as</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-primary capitalize">{user.role}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!mobileMenuOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hidden md:flex"
            >
              {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
          {(!collapsed || mobileMenuOpen) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex-1 justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Mobile Header - Fixed at top */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-card/80 backdrop-blur-md border-b flex items-center justify-between px-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="font-extrabold text-lg leading-none tracking-tight flex flex-col">
            <div>
              <span className="text-secondary">Q</span>
              <span className="text-foreground">UICK</span>
              <span className="text-secondary">LAB</span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Demo Pro
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay with Animation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-72 flex flex-col animate-slide-in-left border-r border-sidebar-border shadow-2xl h-full z-50"
            style={{ background: 'var(--gradient-sidebar)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-sidebar-foreground/50 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-col border-r border-sidebar-border no-print shadow-sm z-30`}
        style={{ background: 'var(--gradient-sidebar)' }}
      >
        <SidebarContent />
      </aside>

      {/* Main content - Adjusted for fixed header on mobile */}
      <main id="main-content" className="flex-1 overflow-auto h-screen pt-16 md:pt-0 scroll-smooth">
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto animate-fade-in pb-24 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
