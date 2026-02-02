// Intentamos determinar la base del sitio para que api.php se encuentre siempre en la raíz
const getApiUrl = () => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) return 'api.php'; // En dev, Vite suele manejarlo relativo

  // En producción (Plesk), forzamos la raíz del dominio
  return '/api.php';
};

const API_URL = getApiUrl();

const isLocal = () =>
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Usuarios locales para poder entrar sin BD (Admin y Grobas)
const LOCAL_MOCK_USERS = [
  { id: 'admin-001', username: 'Admin', password: '123456789', role: 'ADMIN', avatarSeed: 'admin-default', lastLogin: '', projectOrder: [] },
  { id: 'grobas-001', username: 'Grobas', password: '123456789', role: 'USER', avatarSeed: 'grobas-default', lastLogin: '', projectOrder: [] },
];

// Proyectos de prueba cuando no hay conexión a la BD (8 proyectos)
const LOCAL_MOCK_PROJECTS = [
  { id: 'PJ-DEMO-1', name: 'Phoenix Rebrand', category: 'Design Systems', color: 'vibrant-red' },
  { id: 'PJ-DEMO-2', name: 'Internal Audit', category: 'Finance & Legal', color: 'vibrant-blue' },
  { id: 'PJ-DEMO-3', name: 'Market Strategy', category: 'Q4 Social Strategy', color: 'vibrant-green' },
  { id: 'PJ-DEMO-4', name: 'API Layer', category: 'Stripe & PayPal Connect', color: 'vibrant-orange' },
  { id: 'PJ-DEMO-5', name: 'Mobile UI Kit', category: 'Product Design', color: 'vibrant-purple' },
  { id: 'PJ-DEMO-6', name: 'Style Guide', category: 'Business Strategy', color: 'vibrant-pink' },
  { id: 'PJ-DEMO-7', name: 'Client Portal', category: 'Support', color: 'vibrant-cyan' },
  { id: 'PJ-DEMO-8', name: 'Admin Core', category: 'Operations', color: 'vibrant-yellow' },
];

export class DBService {
  private _dbConnected = false;

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
      this._dbConnected = res.status === 'online';
      return this._dbConnected;
    } catch (e) {
      this._dbConnected = false;
      return false;
    }
  }

  async init(): Promise<void> {
    await this.checkConnection();
  }

  async getUsers(): Promise<any[]> {
    if (isLocal() && !this._dbConnected) {
      return LOCAL_MOCK_USERS.map(u => ({
        id: u.id,
        username: u.username,
        password: u.password,
        role: u.role,
        avatarSeed: u.avatarSeed,
        lastLogin: u.lastLogin,
        projectOrder: u.projectOrder ?? []
      }));
    }
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
    if (isLocal() && !this._dbConnected) return;
    return this.request('save_user', 'POST', user);
  }

  async deleteUser(id: string): Promise<void> {
    if (isLocal() && !this._dbConnected) return;
    return this.request('delete_log', 'DELETE', id);
  }

  async getProjects(userId?: string): Promise<any[]> {
    if (isLocal() && !this._dbConnected) {
      return LOCAL_MOCK_PROJECTS.map(p => ({
        id: p.id,
        userId: userId ?? null,
        name: p.name,
        category: p.category,
        color: p.color,
        isGlobal: false,
        isHiddenForUser: false,
        creatorId: userId ?? null,
        status: 'Active' as const,
        runningSince: null,
        currentDaySeconds: 0,
        department: 'PRIVATE',
        isActive: true,
      }));
    }
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
    if (isLocal() && !this._dbConnected) return;
    return this.request('save_project', 'POST', project);
  }

  async deleteProject(id: string): Promise<void> {
    if (isLocal() && !this._dbConnected) return;
    return this.request('delete_project', 'DELETE', id);
  }

  async getLogs(userId?: string): Promise<any[]> {
    if (isLocal() && !this._dbConnected) {
      const { buildGrobasMockLogs, GROBAS_USER_ID } = await import('../mockData/grobasTestData');
      // Sin userId (historial) o para Grobas: devolver logs de prueba
      if (userId === undefined || userId === GROBAS_USER_ID) return buildGrobasMockLogs();
      return [];
    }
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
    if (isLocal() && !this._dbConnected) return;
    return this.request('save_log', 'POST', log);
  }

  async deleteLog(id: string): Promise<void> {
    if (isLocal() && !this._dbConnected) return;
    return this.request('delete_log', 'DELETE', id);
  }
}

export const db = new DBService();
