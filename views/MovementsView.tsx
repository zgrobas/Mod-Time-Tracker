import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../services/db';
import { DailyLog, User, Project, Role } from '../types';

interface MovementsViewProps {
  currentUser: User;
  onDeleteLog: (logId: string) => void;
}

interface GroupedLog {
  key: string; // date + projectId + userId
  date: string;
  projectId: string;
  projectName: string;
  userId: string;
  totalDuration: number;
  entries: (DailyLog & { created_at?: string })[];
}

const MovementsView: React.FC<MovementsViewProps> = ({ currentUser, onDeleteLog }) => {
  const [logs, setLogs] = useState<(DailyLog & { created_at?: string })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingLog, setEditingLog] = useState<(DailyLog & { created_at?: string }) | null>(null);
  
  const [filterUser, setFilterUser] = useState<string>(currentUser.role === Role.ADMIN ? 'ALL' : currentUser.id);
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  const isAdmin = currentUser.role === Role.ADMIN;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allLogs, allUsers, allProjects] = await Promise.all([
      db.getLogs(),
      db.getUsers(),
      db.getProjects(currentUser.id)
    ]);
    setLogs(allLogs);
    setUsers(allUsers);
    setProjects(allProjects);
  };

  const formatTimeFull = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const toggleGroup = (key: string) => {
    const next = new Set(expandedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedGroups(next);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-black tracking-widest rounded-full">NORMAL</span>;
      case 'PRESET':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-[8px] font-black tracking-widest rounded-full">PRESET</span>;
      case 'MANUAL':
        return <span className="bg-mod-blue/10 text-mod-blue border border-mod-blue/20 px-2 py-0.5 text-[8px] font-black tracking-widest rounded-full">MANUAL</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-500 border border-slate-500/20 px-2 py-0.5 text-[8px] font-black tracking-widest rounded-full">LEGACY</span>;
    }
  };

  const groupedLogs = useMemo(() => {
    const filtered = logs.filter(log => {
      const userMatch = filterUser === 'ALL' ? true : log.userId === filterUser;
      const projectMatch = filterProject === 'ALL' ? true : log.projectId === filterProject;
      const logDate = new Date(log.date);
      const fromMatch = filterDateFrom ? logDate >= new Date(filterDateFrom) : true;
      const toMatch = filterDateTo ? logDate <= new Date(filterDateTo) : true;
      return userMatch && projectMatch && fromMatch && toMatch;
    });

    const groups: Record<string, GroupedLog> = {};

    filtered.forEach(log => {
      const key = `${log.date}_${log.projectId}_${log.userId}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          date: log.date,
          projectId: log.projectId,
          projectName: log.projectName,
          userId: log.userId,
          totalDuration: 0,
          entries: []
        };
      }
      groups[key].totalDuration += log.durationSeconds;
      groups[key].entries.push(log);
    });

    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, filterUser, filterProject, filterDateFrom, filterDateTo]);

  const handleUpdateLog = async (id: string, secs: number, date: string) => {
    await db.updateLog({ id, durationSeconds: secs, date });
    setEditingLog(null);
    loadData();
  };

  return (
    <div className="p-10 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10 flex items-end justify-between border-b border-mod-border pb-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-mod-blue text-4xl">list_alt</span>
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">REGISTRO <span className="text-slate-500 font-light not-italic">MOVIMIENTOS</span></h2>
            <p className="text-[10px] text-mod-blue font-bold uppercase tracking-[0.3em] mt-1">Archivo Crítico de Sesiones y Cargas Temporales</p>
          </div>
        </div>
      </div>

      <div className="bg-mod-card border border-mod-border p-6 mb-8 flex flex-wrap gap-6 items-end">
        {isAdmin && (
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operador</label>
            <select 
              value={filterUser} 
              onChange={e => setFilterUser(e.target.value)}
              className="bg-mod-dark border border-mod-border text-white text-[10px] font-bold px-4 py-2 outline-none focus:border-mod-blue"
            >
              <option value="ALL">TODOS LOS OPERADORES</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Proyecto</label>
          <select 
            value={filterProject} 
            onChange={e => setFilterProject(e.target.value)}
            className="bg-mod-dark border border-mod-border text-white text-[10px] font-bold px-4 py-2 outline-none focus:border-mod-blue"
          >
            <option value="ALL">TODOS LOS PROYECTOS</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Desde</label>
          <input 
            type="date" 
            value={filterDateFrom} 
            onChange={e => setFilterDateFrom(e.target.value)}
            className="bg-mod-dark border border-mod-border text-white text-[10px] font-bold px-4 py-2 outline-none focus:border-mod-blue"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hasta</label>
          <input 
            type="date" 
            value={filterDateTo} 
            onChange={e => setFilterDateTo(e.target.value)}
            className="bg-mod-dark border border-mod-border text-white text-[10px] font-bold px-4 py-2 outline-none focus:border-mod-blue"
          />
        </div>

        <button 
          onClick={() => { setFilterUser(isAdmin ? 'ALL' : currentUser.id); setFilterProject('ALL'); setFilterDateFrom(''); setFilterDateTo(''); }}
          className="h-10 px-4 border border-mod-border text-slate-500 hover:text-white hover:border-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">filter_alt_off</span>
          Reiniciar
        </button>
      </div>

      <div className="bg-mod-card border border-mod-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-mod-dark text-slate-500 uppercase font-black tracking-widest border-b border-mod-border">
              <tr>
                <th className="px-8 py-5">Fecha</th>
                {isAdmin && <th className="px-8 py-5">Operador</th>}
                <th className="px-8 py-5">Proyecto</th>
                <th className="px-8 py-5">Carga Temporal</th>
                <th className="px-8 py-5 text-right">Sesiones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mod-border">
              {groupedLogs.map((group) => {
                const operator = users.find(u => u.id === group.userId);
                const isExpanded = expandedGroups.has(group.key);
                
                return (
                  <React.Fragment key={group.key}>
                    <tr className={`hover:bg-white/[0.02] transition-colors group ${isExpanded ? 'bg-mod-blue/5' : ''}`}>
                      <td className="px-8 py-5 font-mono text-slate-400 uppercase">{group.date}</td>
                      {isAdmin && (
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${operator?.avatarSeed}`} className="w-6 h-6 border border-mod-border bg-mod-dark p-1" />
                            <span className="text-white font-bold uppercase">{operator?.username || 'SISTEMA'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-8 py-5">
                        <span className="text-white font-black uppercase tracking-tight">{group.projectName}</span>
                      </td>
                      <td className="px-8 py-5 font-mono text-mod-blue text-sm font-bold">
                        {formatTimeFull(group.totalDuration)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => toggleGroup(group.key)}
                          className={`flex items-center gap-2 ml-auto h-8 px-3 border transition-all text-[9px] font-black uppercase tracking-widest ${isExpanded ? 'bg-mod-blue text-white border-mod-blue' : 'border-mod-border text-slate-500 hover:text-white'}`}
                        >
                          <span className="material-symbols-outlined text-sm">{isExpanded ? 'keyboard_arrow_up' : 'expand_more'}</span>
                          <span>{group.entries.length > 1 ? `DESGLOSE (${group.entries.length})` : 'DETALLES'}</span>
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="bg-mod-dark/40 p-0">
                          <div className="animate-in slide-in-from-top duration-300">
                             <table className="w-full text-[10px]">
                                <tbody className="divide-y divide-mod-border/50">
                                  {group.entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/[0.05]">
                                      <td className="px-8 py-3 text-slate-500 italic flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          {getStatusBadge(entry.status)}
                                        </div>
                                        <span className="font-mono text-slate-300 opacity-30">{entry.id}</span>
                                      </td>
                                      <td className="px-8 py-3 text-slate-500 text-right">
                                         Hora: <span className="text-white font-mono">{entry.created_at ? new Date(entry.created_at).toLocaleTimeString() : '---'}</span>
                                      </td>
                                      <td className="px-8 py-3 text-mod-blue font-mono font-bold w-40 text-right">
                                        {formatTimeFull(entry.durationSeconds)}
                                      </td>
                                      <td className="px-8 py-3 text-right w-32">
                                        <div className="flex justify-end gap-1">
                                          <button 
                                            onClick={() => setEditingLog(entry)}
                                            className="text-mod-blue hover:text-white hover:bg-mod-blue w-8 h-8 flex items-center justify-center transition-all"
                                            title="Editar Sesión"
                                          >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                          </button>
                                          <button 
                                            onClick={() => { if(confirm('¿Eliminar esta sesión individual?')) { onDeleteLog(entry.id); setTimeout(loadData, 300); } }}
                                            className="text-red-500 hover:text-white hover:bg-red-600 w-8 h-8 flex items-center justify-center transition-all"
                                            title="Borrar Sesión"
                                          >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                             </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {groupedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-600 uppercase text-[10px] tracking-[0.4em] italic">No se han encontrado registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLog && (
        <EditLogModal 
          log={editingLog} 
          onClose={() => setEditingLog(null)} 
          onSave={handleUpdateLog} 
        />
      )}
    </div>
  );
};

const EditLogModal: React.FC<{ log: DailyLog; onClose: () => void; onSave: (id: string, secs: number, date: string) => void }> = ({ log, onClose, onSave }) => {
  const [hours, setHours] = useState(Math.floor(log.durationSeconds / 3600).toString());
  const [minutes, setMinutes] = useState(Math.floor((log.durationSeconds % 3600) / 60).toString());
  const [date, setDate] = useState(new Date(log.date).toISOString().split('T')[0]);

  const handleSave = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalSeconds = (h * 3600) + (m * 60);
    const formattedDate = new Date(date + 'T12:00:00').toDateString();
    onSave(log.id, totalSeconds, formattedDate);
  };

  return (
    <div className="fixed inset-0 bg-mod-dark/95 backdrop-blur-md z-[250] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-mod-card border border-white/20 w-full max-w-md p-8 shadow-[0_0_50px_rgba(0,163,224,0.1)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-mod-blue">edit_note</span>
            Editar Sesión
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Proyecto</label>
            <p className="text-white font-mono text-sm border-b border-mod-border pb-2 uppercase">{log.projectName}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Horas</label>
              <input type="number" value={hours} onChange={e=>setHours(e.target.value)} className="w-full bg-mod-dark border border-mod-border text-white text-center p-4 text-2xl font-mono focus:border-mod-blue outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Minutos</label>
              <input type="number" value={minutes} onChange={e=>setMinutes(e.target.value)} className="w-full bg-mod-dark border border-mod-border text-white text-center p-4 text-2xl font-mono focus:border-mod-blue outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Fecha</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-mod-dark border border-mod-border text-white p-4 font-mono text-sm focus:border-mod-blue outline-none" />
          </div>

          <button onClick={handleSave} className="w-full bg-white text-mod-dark py-5 font-black uppercase text-[10px] tracking-[0.4em] hover:bg-mod-blue hover:text-white transition-all shadow-xl">Actualizar Registro</button>
        </div>
      </div>
    </div>
  );
};

export default MovementsView;