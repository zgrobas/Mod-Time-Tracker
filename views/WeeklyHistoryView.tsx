
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { User, Project, DailyLog, Role } from '../types';

interface WeeklyHistoryViewProps {
  currentUser: User;
}

const WeeklyHistoryView: React.FC<WeeklyHistoryViewProps> = ({ currentUser }) => {
  const [data, setData] = useState<{ users: User[], logs: DailyLog[], projects: Project[] }>({ users: [], logs: [], projects: [] });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [u, l, p] = await Promise.all([db.getUsers(), db.getLogs(), db.getProjects()]);
      setData({ users: u, logs: l, projects: p });
    };
    load();
  }, []);

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekRange = (week: number, year: number) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (week - 1) * 7;
    const start = new Date(year, 0, firstDayOfYear.getDay() <= 4 ? firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1 + days : firstDayOfYear.getDate() + 8 - firstDayOfYear.getDay() + days);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Agrupar estadísticas semanales para el usuario seleccionado
  const getUserWeeklyStats = (userId: string) => {
    const userLogs = data.logs.filter(l => l.userId === userId);
    const weeks: Record<string, { total: number, projects: Record<string, number>, weekNum: number, year: number }> = {};

    userLogs.forEach(log => {
      const date = new Date(log.date);
      if (isNaN(date.getTime())) return;
      const weekNum = getWeekNumber(date);
      const year = date.getFullYear();
      const key = `${year}-W${weekNum}`;

      if (!weeks[key]) weeks[key] = { total: 0, projects: {}, weekNum, year };
      weeks[key].total += log.durationSeconds;
      weeks[key].projects[log.projectName] = (weeks[key].projects[log.projectName] || 0) + log.durationSeconds;
    });

    return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Obtener resumen rápido del usuario para la tarjeta del grid
  const getUserSummary = (userId: string) => {
    const userLogs = data.logs.filter(l => l.userId === userId);
    const currentWeekNum = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();
    
    const weekSeconds = userLogs
      .filter(l => {
        const d = new Date(l.date);
        return getWeekNumber(d) === currentWeekNum && d.getFullYear() === currentYear;
      })
      .reduce((acc, l) => acc + l.durationSeconds, 0);

    const activeProjectCount = new Set(userLogs.map(l => l.projectId)).size;

    return {
      weekTime: formatTime(weekSeconds),
      projects: activeProjectCount,
      totalTime: formatTime(userLogs.reduce((acc, l) => acc + l.durationSeconds, 0))
    };
  };

  const filteredUsers = currentUser.role === Role.ADMIN ? data.users : data.users.filter(u => u.id === currentUser.id);

  return (
    <div className="p-10 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 flex items-end justify-between border-b border-mod-border pb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-mod-blue text-4xl">history</span>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">CRONOGRAMA <span className="text-slate-500 font-light not-italic">OPERATIVO</span></h2>
            <p className="text-[10px] text-mod-blue font-bold uppercase tracking-[0.3em] mt-1">Archivo de Tiempos y Rendimiento por Personal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
        {filteredUsers.map((user) => {
          const isExpanded = expandedUserId === user.id;
          const summary = getUserSummary(user.id);
          const weeklyHistory = isExpanded ? getUserWeeklyStats(user.id) : [];

          return (
            <div 
              key={user.id} 
              className={`transition-all duration-500 ease-in-out bg-mod-card border ${isExpanded ? 'col-span-full border-mod-blue shadow-[0_0_50px_rgba(0,163,224,0.1)]' : 'border-mod-border hover:border-white/20 cursor-pointer hover:bg-white/[0.02]'}`}
              onClick={() => !isExpanded && setExpandedUserId(user.id)}
            >
              {/* Card Header / Summary */}
              <div className={`p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ${isExpanded ? 'bg-mod-dark border-b border-mod-border' : ''}`}>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed}`} 
                      className={`w-16 h-16 border border-mod-border bg-mod-dark p-1 transition-all ${isExpanded ? 'scale-110' : ''}`} 
                    />
                    {isExpanded && (
                       <div className="absolute -top-2 -right-2 w-5 h-5 bg-mod-blue flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-mod-dark font-black">check</span>
                       </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.username}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">{user.role} | ID: {user.id}</p>
                  </div>
                </div>

                <div className="flex gap-8 items-center">
                   <div className="text-right">
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Esta Semana</p>
                      <p className={`text-xl font-mono font-black ${isExpanded ? 'text-mod-blue' : 'text-white'}`}>{summary.weekTime}</p>
                   </div>
                   <div className="h-10 w-px bg-mod-border hidden sm:block"></div>
                   <div className="text-right">
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Unidades</p>
                      <p className="text-xl text-white font-black font-mono">{summary.projects}</p>
                   </div>
                   {isExpanded && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedUserId(null); }}
                        className="ml-4 w-10 h-10 flex items-center justify-center border border-mod-border hover:border-white transition-all text-slate-500 hover:text-white"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                   )}
                </div>
              </div>

              {/* Detail Area (Only shown when expanded) */}
              {isExpanded && (
                <div className="p-8 animate-in slide-in-from-top duration-500">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center justify-between border-b border-mod-border pb-4 mb-4">
                        <h4 className="text-[10px] text-white font-black uppercase tracking-[0.4em]">Historial Detallado por Ciclos Semanales</h4>
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Acumulado Total: {summary.totalTime}</span>
                      </div>
                      
                      <div className="space-y-6">
                        {weeklyHistory.map(([key, week]) => (
                          <div key={key} className="bg-mod-dark/50 border border-mod-border p-6 hover:border-mod-blue/30 transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                              <div>
                                <span className="text-mod-blue text-[9px] font-black uppercase tracking-[0.3em]">Ciclo {week.weekNum} · {week.year}</span>
                                <h5 className="text-white text-sm font-black uppercase tracking-widest mt-1">{getWeekRange(week.weekNum, week.year)}</h5>
                              </div>
                              <div className="text-right bg-mod-dark px-4 py-2 border border-mod-border">
                                <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Inversión Temporal</span>
                                <p className="text-xl text-white font-black font-mono">{formatTime(week.total)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {Object.entries(week.projects).map(([name, seconds]) => (
                                <div key={name} className="flex flex-col gap-1 p-3 border border-white/5 bg-white/[0.02]">
                                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate">{name}</span>
                                  <span className="text-mod-blue font-mono font-bold text-xs">{formatTime(seconds as number)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {weeklyHistory.length === 0 && (
                          <div className="py-10 text-center opacity-30 italic text-[10px] uppercase tracking-widest text-slate-500">
                             Sin datos históricos registrados para este operador.
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHistoryView;
