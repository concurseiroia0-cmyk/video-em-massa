import { useState, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Download, Layers, FileVideo, FolderOpen,
  Megaphone, Calendar, Users, Send, ChevronLeft, ChevronRight,
  Zap, Settings, Bell, Search
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/coletar', label: 'Coletar', icon: Download },
  { path: '/fila', label: 'Fila de Importação', icon: Layers },
  { path: '/templates', label: 'Templates', icon: FileVideo },
  { path: '/biblioteca', label: 'Biblioteca', icon: FolderOpen },
  { path: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/contas', label: 'Contas Sociais', icon: Users },
  { path: '/publicacoes', label: 'Publicações', icon: Send },
];

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} 
          flex flex-col border-r border-slate-700/50 bg-slate-900 transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-electric">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-white">
              Batch<span className="text-purple-electric">Post</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-purple-electric/15 text-purple-electric'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-purple-electric' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-slate-700/50 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar vídeos, campanhas..."
                className="w-80 rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 outline-none transition-colors focus:border-purple-electric/50 focus:ring-1 focus:ring-purple-electric/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-purple-electric" />
            </button>
            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-3 border-l border-slate-700 pl-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-electric to-neon-green flex items-center justify-center text-xs font-bold text-white">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
