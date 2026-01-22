
// Intentamos determinar la base del sitio para que api.php se encuentre siempre en la raíz
const getApiUrl = () => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) return 'api.php'; // En dev, Vite suele manejarlo relativo
  
  // En producción (Plesk), forzamos la raíz del dominio
  return '/api.php';
};

const API_URL = getApiUrl();

export class DBService {
  private async request(action: string, method: string = 'GET', body?: any) {
    const baseUrl = API_URL.startsWith('/') ? API_URL : `/${API_URL}`;
    const fullUrl = `${baseUrl}?action=${action}${method === 'DELETE' ? `&id=${body}` : ''}`;
    
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body && method !== 'GET' && method !== 'DELETE') options.body = JSON.stringify(body);

      const response = await fetch(fullUrl, options);
      
      if (response.status === 404) {
        throw new Error(`ERROR 404: El archivo no existe en: ${window.location.origin}${fullUrl}`);
      }

      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (parseError) {
        console.error("Respuesta no válida del servidor:", textData);
        throw new Error("El servidor no devolvió JSON.");
      }

      if (data.error) throw new Error(`${data.error}: ${data.details || ''}`);
      return data;
    } catch (e: any) {
      console.error(`[DB ERROR] URL: ${fullUrl} | Mensaje: ${e.message}`);
      throw e;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const res = await this.request('status');
      return res.status === 'online';
    } catch (e) {
      return false;
    }
  }

  async init(): Promise<void> {
    await this.checkConnection();
  }

  async getUsers(): Promise<any[]> {
    const data = await this.request('get_users');
    return data.map((u: any) => ({
      id: u.id,
      username: u.username,
      password: u.password,
      role: u.role,
      avatarSeed: u.avatar_seed,
      lastLogin: u.last_login,
      projectOrder: JSON.parse(u.project_order || '[]')
    }));
  }

  async saveUser(user: any): Promise<void> {
    return this.request('save_user', 'POST', user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.request('delete_log', 'DELETE', id);
  }

  async getProjects(userId?: string): Promise<any[]> {
    // Es vital pasar el userId para que el servidor nos de el estado individualizado
    const action = userId ? `get_projects&userId=${userId}` : 'get_projects';
    const all = await this.request(action);
    // Fixed: Added userId mapping to satisfy Project interface requirements and support ownership-based logic in views
    return all.map((p: any) => ({
      id: p.id,
      userId: p.user_id || p.creator_id || null,
      name: p.name,
      category: p.category,
      color: p.color,
      isGlobal: parseInt(p.is_global) === 1,
      // hiddenBy ahora se maneja de forma individual en up.hidden_by_user
      isHiddenForUser: parseInt(p.hidden_by_user || 0) === 1,
      creatorId: p.creator_id,
      status: p.running_since ? 'Running' : 'Active',
      runningSince: p.running_since,
      currentDaySeconds: parseInt(p.current_day_seconds || 0),
      department: parseInt(p.is_global) === 1 ? 'GLOBAL' : 'PRIVATE',
      isActive: p.is_active === undefined ? true : parseInt(p.is_active) === 1
    }));
  }

  async saveProject(project: any): Promise<void> {
    // Aseguramos que el objeto enviado tenga userId para que se guarde en user_projects
    return this.request('save_project', 'POST', project);
  }

  async deleteProject(id: string): Promise<void> {
    return this.request('delete_project', 'DELETE', id);
  }

  async getLogs(userId?: string): Promise<any[]> {
    const action = userId ? `get_logs&userId=${userId}` : 'get_logs';
    const data = await this.request(action);
    return data.map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      projectId: l.project_id,
      projectName: l.project_name,
      durationSeconds: parseInt(l.duration_seconds),
      date: l.date_str,
      status: l.status,
      created_at: l.created_at
    }));
  }

  async saveLog(log: any): Promise<void> {
    return this.request('save_log', 'POST', log);
  }

  async deleteLog(id: string): Promise<void> {
    return this.request('delete_log', 'DELETE', id);
  }
}

export const db = new DBService();
