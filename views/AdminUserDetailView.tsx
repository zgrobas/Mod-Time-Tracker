
import React, { useState, useEffect, useMemo } from 'react';
import { User, Project, DailyLog } from '../types';
import { db } from '../services/db';

interface AdminUserDetailViewProps {
  user: User;
  onBack: () => void;
}

const AdminUserDetailView: React.FC<AdminUserDetailViewProps> = ({ user, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const today = useMemo(() => new Date().toDateString(), []);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    const userProjects = await db.getProjects(user.id);
    const userLogs = await db.getLogs(user.id);
    setProjects(userProjects);
    setLogs(userLogs);
  };

  const totalTimeSeconds = logs.reduce((acc, l) => acc + l.durationSeconds, 0);

  const formatTimeFull = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getTodayTimeForProject = (projectId: string) => {
    return logs
      .filter(l => l.projectId === projectId && l.date === today)
      .reduce((acc, l) => acc + l.durationSeconds, 0);
  };

  return (
    <div className="p-10 max-w-[1400px] mx-auto animate-in slide-in-from-right duration-500">
      <div className="mb-10 flex items-center gap-6 border-b border-mod-border pb-8">
        <button 
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center border border-mod-border text-slate-500 hover:text-white hover:border-white transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center gap-4">
          <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed}`} className="w-16 h-16 border border-mod-border bg-mod-card p-1" />
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">INSPECCIÓN <span className="text-slate-500 font-light not-italic">{user.username}</span></h2>
            <p className="text-[10px] text-mod-blue font-bold uppercase tracking-[0.3em] mt-1">Status: Conexión Activa | ID: {user.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-mod-card border border-mod-border p-8">
           <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Uptime Total Acumulado</p>
           <p className="text-3xl text-white font-black font-mono">{formatTimeFull(totalTimeSeconds)}</p>
        </div>
        <div className="bg-mod-card border border-mod-border p-8">
           <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Unidades de Trabajo</p>
           <p className="text-3xl text-white font-black font-mono">{projects.length}</p>
        </div>
        <div className="bg-mod-card border border-mod-border p-8">
           <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Última Sincronización</p>
           <p className="text-lg text-white font-bold uppercase">{user.lastLogin === '-' ? 'NUNCA' : new Date(user.lastLogin).toLocaleDateString()}</p>
        </div>
        <div className="bg-mod-card border border-red-600/30 p-8">
           <p className="text-red-500/50 text-[9px] font-black uppercase tracking-widest mb-4">Protocolo de Seguridad</p>
           <p className="text-lg text-red-500 font-black uppercase tracking-tighter">{user.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-mod-card border border-mod-border">
          <div className="p-6 bg-mod-dark border-b border-mod-border flex items-center justify-between">
            <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Despliegue de Proyectos</h3>
            <span className="material-symbols-outlined text-slate-600 text-sm">layers</span>
          </div>
          <div className="divide-y divide-mod-border">
            {projects.map(p => {
              const todaySeconds = getTodayTimeForProject(p.id);
              return (
                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 ${p.color}`}></div>
                    <div>
                      <p className="text-white font-bold uppercase text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-mod-blue font-mono text-sm">{formatTimeFull(todaySeconds)} <span className="text-[9px] font-sans text-slate-600">HOY</span></p>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && <p className="p-10 text-center text-slate-600 uppercase text-[10px] tracking-widest italic">Sin proyectos creados por el usuario.</p>}
          </div>
        </div>

        <div className="bg-mod-card border border-mod-border">
           <div className="p-6 bg-mod-dark border-b border-mod-border flex items-center justify-between">
              <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Registros de Sincronización</h3>
              <span className="material-symbols-outlined text-slate-600 text-sm">history</span>
           </div>
           <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-mod-dark/30 text-slate-500 uppercase font-bold tracking-widest border-b border-mod-border">
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Proyecto</th>
                    <th className="px-6 py-4 text-right">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mod-border">
                  {logs.slice().reverse().map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-slate-500 font-mono uppercase">{log.date}</td>
                      <td className="px-6 py-4 text-white font-bold uppercase">{log.projectName}</td>
                      <td className="px-6 py-4 text-right text-mod-blue font-mono">{formatTimeFull(log.durationSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailView;
