
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await db.getUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error("Error cargando operadores", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername.toUpperCase().replace(/\s/g, '_'),
      avatarSeed: Math.random().toString(36).substr(2, 5),
      lastLogin: new Date().toISOString()
    };

    await db.saveUser(newUser);
    setNewUsername('');
    loadUsers();
  };

  if (loading) return (
    <div className="h-screen bg-mod-dark flex items-center justify-center font-mono">
      <p className="text-mod-blue animate-pulse">INICIALIZANDO TERMINAL...</p>
    </div>
  );

  return (
    <div className="h-screen bg-mod-dark flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-12 text-center">
          <div className="inline-block p-4 border-2 border-mod-blue mb-4">
            <span className="material-symbols-outlined text-mod-blue text-5xl">lock_open</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">MOD <span className="text-slate-500 font-light not-italic">TRACKER</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Acceso a Estación de Trabajo</p>
        </div>

        <div className="bg-mod-card border border-mod-border p-10 shadow-2xl">
          <div className="mb-10">
            <h3 className="text-white text-xs font-black uppercase tracking-widest mb-6 border-b border-mod-border pb-2">Seleccionar Operador</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => onLogin(user)}
                  className="w-full flex items-center justify-between p-4 bg-mod-dark border border-mod-border hover:border-mod-blue transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/seed/${user.avatarSeed}/40`} className="w-8 h-8 grayscale group-hover:grayscale-0 transition-all border border-mod-border" alt="avatar" />
                    <span className="text-white font-mono text-sm tracking-tighter">{user.username}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-700 group-hover:text-mod-blue transition-colors">login</span>
                </button>
              ))}
              {users.length === 0 && (
                <p className="text-slate-600 text-center italic text-xs py-4">No hay operadores registrados en este terminal.</p>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="pt-8 border-t border-mod-border">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Registrar Nuevo Operador</label>
            <div className="flex gap-2">
              <input
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="ID_OPERADOR"
                className="flex-1 bg-mod-dark border border-mod-border text-white px-4 py-3 text-sm font-mono focus:border-mod-blue outline-none"
              />
              <button className="bg-white text-mod-dark px-6 font-bold text-[10px] uppercase tracking-widest hover:bg-mod-blue hover:text-white transition-all">
                Registrar
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Base de Datos: IndexedDB (Local)</p>
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Estado: Operativo</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
