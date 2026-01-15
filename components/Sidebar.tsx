
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onNewProject: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onNewProject, user, onLogout }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Panel Control', icon: 'dashboard' },
    { id: View.REPORTS, label: 'Analítica', icon: 'analytics' },
    { id: View.PROJECT_LIST, label: 'Proyectos', icon: 'layers' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-mod-border bg-mod-dark flex flex-col justify-between p-6">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mod-blue flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">grid_view</span>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tighter italic">MOD <span className="font-light not-italic text-slate-400">TRACKER</span></h1>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-4 px-3 py-3 transition-all cursor-pointer border-l-2 ${
                currentView === item.id
                  ? 'text-mod-blue border-mod-blue bg-mod-blue/5'
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
          <div className="flex items-center gap-4 px-3 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer border-l-2 border-transparent">
            <span className="material-symbols-outlined text-xl">settings</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Sistema</p>
          </div>
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between py-4 border-t border-mod-border group relative">
          <div className="flex items-center gap-3">
            <img 
              src={`https://picsum.photos/seed/${user.avatarSeed}/100`}
              className="w-10 h-10 grayscale border border-mod-border object-cover" 
              alt="avatar"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="text-xs font-bold tracking-tight uppercase text-white truncate max-w-[100px]">{user.username}</p>
              <p className="text-[10px] text-slate-500 font-medium">Operador</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-600 hover:text-red-500 transition-colors"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 h-11 px-4 bg-white text-mod-dark text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Nuevo Proyecto</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
