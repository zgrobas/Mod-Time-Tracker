
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardGrid from './views/DashboardGrid';
import ProjectList from './views/ProjectList';
import Reports from './views/Reports';
import LoginView from './views/LoginView';
import { View, Project, DailyLog, User } from './types';
import { db } from './services/db';

const VIBRANT_COLORS = [
  'vibrant-red', 'vibrant-blue', 'vibrant-green', 'vibrant-orange', 
  'vibrant-purple', 'vibrant-pink', 'vibrant-cyan', 'vibrant-yellow', 
  'vibrant-indigo', 'vibrant-emerald', 'vibrant-crimson', 'vibrant-teal', 
  'vibrant-amber', 'vibrant-violet', 'vibrant-lime'
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [historicalLogs, setHistoricalLogs] = useState<DailyLog[]>([]);
  const [lastSaveDate, setLastSaveDate] = useState(new Date().toDateString());

  // Inicializar DB y sesión
  useEffect(() => {
    const savedUser = localStorage.getItem('mod_tracker_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id);
    }
  }, [currentUser]);

  const loadUserData = async (userId: string) => {
    const userProjects = await db.getProjects(userId);
    const userLogs = await db.getLogs(userId);
    setProjects(userProjects);
    setHistoricalLogs(userLogs);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('mod_tracker_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mod_tracker_session');
    setProjects([]);
    setHistoricalLogs([]);
  };

  // Guardar cambios automáticamente en la DB cuando cambian los proyectos
  useEffect(() => {
    if (currentUser && projects.length > 0) {
      projects.forEach(p => db.saveProject(p));
    }
  }, [projects, currentUser]);

  const commitDailyLogs = useCallback(async () => {
    if (!currentUser) return;

    const projectsToCommit = projects.filter(p => p.currentDaySeconds > 0);
    if (projectsToCommit.length === 0) return;

    const updatedLogs = [...historicalLogs];
    
    for (const project of projectsToCommit) {
      const existingLogIndex = updatedLogs.findIndex(
        log => log.projectId === project.id && log.date === lastSaveDate
      );
      
      let finalLog;
      if (existingLogIndex !== -1) {
        finalLog = {
          ...updatedLogs[existingLogIndex],
          durationSeconds: updatedLogs[existingLogIndex].durationSeconds + project.currentDaySeconds
        };
        updatedLogs[existingLogIndex] = finalLog;
      } else {
        finalLog = {
          id: Math.random().toString(36).substr(2, 9),
          userId: currentUser.id,
          date: lastSaveDate,
          projectId: project.id,
          projectName: project.name,
          durationSeconds: project.currentDaySeconds,
          status: 'Billable' as const
        };
        updatedLogs.push(finalLog);
      }
      // Guardar en base de datos real
      await db.saveLog(finalLog);
    }
    
    setHistoricalLogs(updatedLogs);
    setProjects(prev => prev.map(p => ({ ...p, currentDaySeconds: 0 })));
  }, [lastSaveDate, projects, historicalLogs, currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      if (today !== lastSaveDate) {
        commitDailyLogs();
        setLastSaveDate(today);
      }
      setProjects(prevProjects => 
        prevProjects.map(p => {
          if (p.status === 'Running') {
            return { ...p, currentDaySeconds: p.currentDaySeconds + 1 };
          }
          return p;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSaveDate, commitDailyLogs]);

  const handleToggleTimer = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newStatus = p.status === 'Running' ? 'Active' : 'Running';
        return { ...p, status: newStatus as any };
      }
      if (p.status === 'Running') {
        return { ...p, status: 'Active' as any };
      }
      return p;
    }));
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    await db.saveProject(updatedProject);
    setEditingProject(null);
  };

  const handleCreateProject = async (data: { name: string, category: string, color: string }) => {
    if (!currentUser) return;
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      name: data.name || 'PROYECTO_SIN_TITULO',
      category: data.category || 'General',
      description: data.category,
      color: data.color || VIBRANT_COLORS[0],
      lastTracked: 'Recién',
      usageLevel: 0,
      totalHours: '0h',
      status: 'Active',
      department: 'GENERAL',
      currentDaySeconds: 0
    };
    setProjects(prev => [...prev, newProject]);
    await db.saveProject(newProject);
    setIsModalOpen(false);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const getHeaderProps = () => {
    const totalDailySeconds = projects.reduce((acc, p) => acc + p.currentDaySeconds, 0);
    switch (currentView) {
      case View.DASHBOARD:
        return { title: 'Panel Control', activeTime: formatTimer(totalDailySeconds), actionLabel: 'Crear Nuevo' };
      case View.PROJECT_LIST:
        return { title: 'Proyectos', actionLabel: 'Nuevo Proyecto' };
      case View.REPORTS:
        return { title: 'Analítica', actionLabel: 'Sincronizar Logs' };
      default:
        return { title: 'MOD Tracker', actionLabel: 'Añadir' };
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardGrid projects={projects} onToggleTimer={handleToggleTimer} onNewProject={() => setIsModalOpen(true)} />;
      case View.PROJECT_LIST:
        return <ProjectList projects={projects} onEditProject={setEditingProject} />;
      case View.REPORTS:
        return <Reports projects={projects} historicalLogs={historicalLogs} onManualCommit={commitDailyLogs} />;
      default:
        return <DashboardGrid projects={projects} onToggleTimer={handleToggleTimer} onNewProject={() => setIsModalOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-mod-dark">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onNewProject={() => setIsModalOpen(true)} 
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header {...getHeaderProps()} onSearch={setSearchQuery} onActionButton={() => {
          if (currentView === View.REPORTS) commitDailyLogs();
          else setIsModalOpen(true);
        }} />
        <div className="flex-1 overflow-y-auto bg-background-dark">
          {renderView()}
        </div>
      </main>

      {(isModalOpen || editingProject) && (
        <ProjectModal 
          project={editingProject} 
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
          onSave={(updated) => {
            if (editingProject) handleUpdateProject(updated as Project);
            else handleCreateProject(updated as any);
          }}
        />
      )}
    </div>
  );
};

const ProjectModal: React.FC<{ 
  project: Project | null; 
  onClose: () => void; 
  onSave: (data: Partial<Project>) => void;
}> = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    category: project?.category || '',
    color: project?.color || VIBRANT_COLORS[0]
  });

  const isEdit = !!project;

  return (
    <div className="fixed inset-0 bg-mod-dark/95 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-mod-card w-full max-w-md shadow-2xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-mod-border flex justify-between items-center bg-mod-dark">
          <h3 className="text-lg font-bold uppercase tracking-widest">{isEdit ? 'Modificar Proyecto' : 'Inicializar Proyecto'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Identificador de Proyecto</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                className="w-full bg-mod-dark border border-mod-border text-white px-4 py-3 focus:border-white outline-none transition-all text-sm font-mono" 
                placeholder="ej. REBRANDING_CORE" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vertical / Categoría</label>
              <input 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-mod-dark border border-mod-border text-white px-4 py-3 focus:border-white outline-none transition-all text-sm" 
                placeholder="ej. Desarrollo UI" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Mapeo Vibrante (Color)</label>
              <div className="grid grid-cols-5 gap-2">
                {VIBRANT_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setFormData({...formData, color: c})}
                    className={`size-8 ${c} border ${formData.color === c ? 'border-white scale-110' : 'border-transparent opacity-50'} hover:opacity-100 transition-all`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <button onClick={onClose} className="flex-1 border border-mod-border hover:bg-white/5 font-bold py-4 text-[10px] uppercase tracking-widest transition-colors">Cancelar</button>
            <button 
              onClick={() => onSave(isEdit ? { ...project, ...formData } : formData)}
              className="flex-1 bg-white text-mod-dark font-bold py-4 text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              {isEdit ? 'Actualizar' : 'Inicializar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
