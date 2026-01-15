
import React from 'react';
import { Project } from '../types';

interface DashboardGridProps {
  projects: Project[];
  onToggleTimer: (projectId: string) => void;
  onNewProject: () => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ projects, onToggleTimer, onNewProject }) => {
  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="p-10 max-w-[1400px] mx-auto">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-light tracking-tighter text-white">GRID DE <span className="font-bold">PROYECTOS</span></h2>
          <div className="h-1 w-20 bg-mod-blue mt-2"></div>
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Panel de Monitoreo Operativo v2.4</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => {
          const isRunning = project.status === 'Running';
          const isLightColor = project.color === 'vibrant-cyan' || project.color === 'vibrant-yellow' || project.color === 'vibrant-lime' || project.color === 'vibrant-emerald';
          const textColorClass = isLightColor ? 'text-black' : 'text-white';
          const buttonBgClass = isLightColor ? 'bg-black/10' : 'bg-white/10';
          const buttonBorderClass = isLightColor ? 'border-black/20' : 'border-white/30';

          return (
            <div 
              key={project.id}
              onClick={() => onToggleTimer(project.id)}
              className={`group transition-all duration-300 hover:brightness-110 cursor-pointer p-8 flex flex-col justify-between aspect-square relative ${project.color} ${isRunning ? 'active-project-card' : ''} ${textColorClass}`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isRunning ? (isLightColor ? 'bg-black text-white px-2 py-1' : 'bg-white text-black px-2 py-1') : 'opacity-70'}`}>
                  {isRunning ? 'SESIÓN ACTIVA' : project.department}
                </span>
                <h3 className="text-2xl font-black mt-4 tracking-tight leading-none uppercase drop-shadow-md">{project.name}</h3>
                <p className={`text-[10px] mt-2 font-bold uppercase opacity-80`}>{project.category}</p>
              </div>
              <div className="space-y-4">
                <p className="text-4xl font-mono font-bold tracking-tighter drop-shadow-lg">{formatTimer(project.currentDaySeconds)}</p>
                <button 
                  className={`w-full ${buttonBgClass} ${buttonBorderClass} border py-3 font-bold text-[10px] uppercase tracking-widest transition-all`}
                  onClick={(e) => { e.stopPropagation(); onToggleTimer(project.id); }}
                >
                  {isRunning ? 'Detener Tiempo' : 'Iniciar Seguimiento'}
                </button>
              </div>
            </div>
          );
        })}
        
        <div 
          onClick={onNewProject}
          className="p-8 border-4 border-dashed border-mod-border hover:border-white/50 flex flex-col items-center justify-center aspect-square text-slate-500 hover:text-white transition-all group cursor-pointer"
        >
          <span className="material-symbols-outlined text-5xl mb-4 group-hover:scale-110 transition-transform font-light">add_box</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Nuevo Proyecto</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
