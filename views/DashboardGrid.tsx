import React, { useState } from 'react';
import { Project, User, Role } from '../types';

interface DashboardGridProps {
  projects: (Project & { sessionOrigin?: string; isHiddenForUser?: boolean })[];
  currentUser: User;
  showHidden: boolean;
  onToggleTimer: (projectId: string) => void;
  onStartWithTime: (projectId: string) => void;
  onToggleHide: (projectId: string) => void;
  onToggleShowHidden: () => void;
  onNewProject: () => void;
  onReorderProjects: (newOrder: string[]) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  projects, 
  currentUser, 
  showHidden, 
  onToggleTimer, 
  onStartWithTime,
  onToggleHide, 
  onToggleShowHidden, 
  onNewProject,
  onReorderProjects
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const isAdmin = currentUser.role === Role.ADMIN;

  const formatTimerWithSeconds = (seconds: number, isRunning: boolean) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    const separator = isRunning ? <span className="timer-blink">:</span> : <span>:</span>;
    return (
      <span className="flex items-center">
        {h}{separator}{m}{separator}{s}
      </span>
    );
  };

  const currentOrder = localOrder || currentUser.projectOrder || projects.map(p => p.id);
  const fullOrder = Array.from(new Set([...currentOrder, ...projects.map(p => p.id)]));
  const sortedProjects = [...projects].sort((a, b) => fullOrder.indexOf(a.id) - fullOrder.indexOf(b.id));
  
  const filteredProjects = sortedProjects.filter(p => {
    const isActuallyHidden = p.isHiddenForUser;
    const isInactive = p.isActive === false;
    
    if (!isAdmin && isInactive) return false;
    return showHidden || !isActuallyHidden;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setLocalOrder(fullOrder);
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const newOrder = [...fullOrder];
    const oldIndex = newOrder.indexOf(draggedId);
    const newIndex = newOrder.indexOf(targetId);
    if (oldIndex !== -1 && newIndex !== -1) {
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, draggedId);
      setLocalOrder(newOrder);
    }
  };

  const handleDragEnd = () => {
    if (draggedId && localOrder) onReorderProjects(localOrder);
    setDraggedId(null);
    setLocalOrder(null);
  };

  return (
    <div className="p-4 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="mb-6 lg:mb-10 flex items-center justify-between">
        <h2 className="text-xl lg:text-4xl font-light text-white uppercase tracking-tighter">GRID <span className="font-bold">MOD</span></h2>
        <button 
          onClick={onToggleShowHidden}
          className={`flex items-center gap-2 px-3 py-1.5 border text-[8px] font-black uppercase tracking-widest ${showHidden ? 'bg-white text-mod-dark border-white' : 'bg-transparent text-slate-500 border-mod-border'}`}
        >
          <span className="material-symbols-outlined text-[12px]">{showHidden ? 'visibility' : 'visibility_off'}</span>
          <span className="hidden sm:inline">{showHidden ? 'Ocultar' : 'Ver Todos'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 landscape:grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-6 transition-all duration-300">
        {filteredProjects.map((project) => {
          const isRunning = project.status === 'Running';
          const isHidden = project.isHiddenForUser;
          const isInactive = project.isActive === false;
          const isLight = ['vibrant-cyan', 'vibrant-yellow', 'vibrant-lime', 'vibrant-emerald'].includes(project.color);

          return (
            <div 
              key={project.id}
              draggable
              onDragStart={(e) => handleDragStart(e, project.id)}
              onDragEnter={(e) => handleDragEnter(e, project.id)}
              onDragEnd={handleDragEnd}
              className={`
                group relative flex flex-col justify-between aspect-square p-4 lg:p-8 cursor-pointer transition-all duration-300
                ${project.color} ${isRunning ? 'active-project-card scale-[1.03]' : 'opacity-90 hover:brightness-110'}
                ${isLight ? 'text-black' : 'text-white'}
                ${isHidden || isInactive ? 'grayscale opacity-30 brightness-50' : ''}
              `}
              onClick={() => !isInactive && onToggleTimer(project.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className={`text-[7px] lg:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 ${isRunning ? (isLight ? 'bg-black text-white' : 'bg-white text-black') : 'bg-black/20'}`}>
                    {isRunning ? 'TX' : project.department.slice(0,3)}
                  </span>
                  {isInactive && (
                    <span className={`text-[6px] lg:text-[8px] font-black uppercase tracking-widest px-1 py-0.5 bg-red-600 text-white`}>
                      INACTIVO
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!isInactive && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleHide(project.id); }}
                        className={`w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center border transition-all hover:scale-110 ${isLight ? 'border-black/20 hover:bg-black hover:text-white' : 'border-white/20 hover:bg-white hover:text-mod-dark'}`}
                        title={isHidden ? "Mostrar" : "Ocultar"}
                      >
                        <span className="material-symbols-outlined text-sm lg:text-lg">{isHidden ? 'visibility' : 'visibility_off'}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onStartWithTime(project.id); }}
                        className={`w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center border transition-all hover:scale-110 ${isLight ? 'border-black/20 hover:bg-black hover:text-white' : 'border-white/20 hover:bg-white hover:text-mod-dark'}`}
                        title="Cargar/Iniciar con tiempo"
                      >
                        <span className="material-symbols-outlined text-sm lg:text-lg">more_time</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleTimer(project.id); }}
                        className={`w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center border transition-all hover:scale-110 ${isRunning ? (isLight ? 'bg-black text-white border-black' : 'bg-white text-mod-dark border-white') : (isLight ? 'border-black/20 hover:bg-black hover:text-white' : 'border-white/20 hover:bg-white hover:text-mod-dark')}`}
                      >
                        <span className="material-symbols-outlined text-sm lg:text-lg">{isRunning ? 'pause' : 'play_arrow'}</span>
                      </button>
                    </>
                  )}
                  {isInactive && isAdmin && (
                    <div className="text-[10px] font-black uppercase opacity-50">Solo Admin</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs lg:text-2xl font-black uppercase tracking-tighter truncate drop-shadow-sm">{project.name}</h3>
                <p className="text-[7px] lg:text-[10px] font-bold uppercase opacity-60 truncate">{project.category}</p>
              </div>

              <div className="space-y-2 lg:space-y-4 pointer-events-none">
                <div className="text-xl lg:text-4xl font-mono font-bold tracking-tighter">
                  {formatTimerWithSeconds(project.currentDaySeconds, isRunning)}
                </div>
                <div className="h-0.5 w-full bg-black/10">
                   <div className={`h-full bg-current transition-all duration-300 ${isRunning ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredProjects.length < 12 && (
          <div 
            onClick={onNewProject}
            className="border-2 border-dashed border-mod-border hover:border-white/50 flex flex-col items-center justify-center aspect-square text-slate-500 hover:text-white transition-all bg-mod-card/20"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
            <span className="text-[8px] font-black uppercase mt-2">Nuevo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGrid;