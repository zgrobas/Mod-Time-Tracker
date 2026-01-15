
import React from 'react';

interface HeaderProps {
  title: string;
  onSearch: (query: string) => void;
  activeTime?: string;
  onActionButton: () => void;
  actionLabel: string;
}

const Header: React.FC<HeaderProps> = ({ title, onSearch, activeTime, onActionButton, actionLabel }) => {
  return (
    <header className="flex items-center justify-between border-b border-mod-border bg-mod-dark px-10 py-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-mod-dark text-2xl font-bold">emergency</span>
          </div>
          <h2 className="text-white text-xl font-black tracking-tight uppercase">{title}</h2>
        </div>
        <div className="h-8 w-px bg-mod-border mx-4"></div>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <span className="material-symbols-outlined text-lg">search</span>
          </div>
          <input
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-transparent border-b border-mod-border focus:border-mod-blue transition-all text-xs outline-none focus:ring-0 placeholder-slate-600 uppercase tracking-widest"
            placeholder="BUSCAR EN REGISTRO..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-8">
        {activeTime && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Actividad esta Sesión</span>
            <span className="text-lg font-mono font-light tracking-tighter text-mod-blue">{activeTime}</span>
          </div>
        )}
        <button 
          onClick={onActionButton}
          className="flex items-center gap-2 h-10 px-6 bg-white text-mod-dark text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>{actionLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
