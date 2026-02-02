// Configuración y utilidades
const API_BASE_URL = 'https://modtimetracker.dev6.bigbangfood.es/api.php';
const USER_SESSION_KEY = 'mod_tracker_session';

// Formatear tiempo
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatTimeShort(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Servicio de API
class APIService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(action, method = 'GET', body = null, params = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.set('action', action);
    
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parseando JSON. Respuesta raw:', text.substring(0, 500));
        throw new Error('Respuesta no válida del servidor: ' + e.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      // Loggear respuesta para get_projects para debuggear
      if (action === 'get_projects' && Array.isArray(data) && data.length > 0) {
        console.log('Respuesta get_projects - Primer elemento:', JSON.stringify(data[0], null, 2));
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async checkStatus() {
    try {
      const data = await this.request('status');
      return data.status === 'online';
    } catch (e) {
      return false;
    }
  }

  async getUsers() {
    return await this.request('get_users');
  }

  async getProjects(userId) {
    return await this.request('get_projects', 'GET', null, { userId });
  }

  async saveProject(project) {
    return await this.request('save_project', 'POST', project);
  }
}

// Estado de la aplicación
let apiService = null;
let currentUser = null;
let projects = [];
let updateInterval = null;

// Elementos DOM
const loginView = document.getElementById('loginView');
const mainView = document.getElementById('mainView');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const loginButton = document.getElementById('loginButton');
const serverStatus = document.getElementById('serverStatus');
const projectsContainer = document.getElementById('projectsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const emptyState = document.getElementById('emptyState');
const totalTimeEl = document.getElementById('totalTime');
const userNameEl = document.getElementById('userName');
const serverUrlEl = document.getElementById('serverUrl');
const syncButton = document.getElementById('syncButton');
const logoutButton = document.getElementById('logoutButton');

// Verificar estado del servidor
async function checkServerStatus() {
  try {
    const tempApi = new APIService(API_BASE_URL);
    const isOnline = await tempApi.checkStatus();
    serverStatus.classList.toggle('online', isOnline);
    serverStatus.querySelector('span:last-child').textContent = 
      isOnline ? 'Servidor: ONLINE' : 'Servidor: OFFLINE';
    return isOnline;
  } catch (e) {
    serverStatus.classList.remove('online');
    serverStatus.querySelector('span:last-child').textContent = 'Servidor: ERROR';
    return false;
  }
}

// Login
async function handleLogin(e) {
  e.preventDefault();
  loginError.classList.add('hidden');
  loginButton.disabled = true;
  loginButton.textContent = 'AUTENTICANDO...';

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showError('Usuario y contraseña requeridos');
    loginButton.disabled = false;
    loginButton.textContent = 'ENTRAR AL SISTEMA';
    return;
  }

  try {
    apiService = new APIService(API_BASE_URL);
    
    // Verificar servidor
    const isOnline = await apiService.checkStatus();
    if (!isOnline) {
      throw new Error('El servidor no está disponible');
    }

    // Obtener usuarios y validar credenciales
    const users = await apiService.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    // Guardar sesión
    currentUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      avatarSeed: user.avatar_seed || user.avatarSeed
    };

    await browser.storage.local.set({
      [USER_SESSION_KEY]: currentUser
    });

    // Cambiar a vista principal
    showMainView();
    loadProjects();

  } catch (error) {
    showError(error.message || 'Error al iniciar sesión');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'ENTRAR AL SISTEMA';
  }
}

// Mostrar error
function showError(message) {
  loginError.textContent = message;
  loginError.classList.remove('hidden');
}

// Mostrar vista principal
function showMainView() {
  loginView.classList.remove('active');
  loginView.classList.add('hidden');
  mainView.classList.remove('hidden');
  mainView.classList.add('active');
  
  userNameEl.textContent = currentUser.username.toUpperCase();
  serverUrlEl.textContent = 'modtimetracker.dev6.bigbangfood.es';
}

// Cargar proyectos
async function loadProjects() {
  loadingIndicator.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    const data = await apiService.getProjects(currentUser.id);
    
    if (!Array.isArray(data)) {
      console.error('La respuesta no es un array:', data);
      errorMessage.textContent = 'Error: Respuesta inválida del servidor';
      errorMessage.classList.remove('hidden');
      return;
    }
    
    if (data.length === 0) {
      console.log('No hay proyectos disponibles');
      projects = [];
      renderProjects();
      return;
    }
    
    // Loggear el primer proyecto para debuggear
    if (data.length > 0) {
      console.log('Primer proyecto recibido (ejemplo):', data[0]);
    }
    
    const nowMillis = Date.now();
    let foundRunning = false;

    projects = data.map((p, index) => {
      
      // Los campos pueden venir en diferentes formatos según la BD
      const baseSeconds = parseInt(p.current_day_seconds || p.currentDaySeconds || 0);
      let displaySeconds = baseSeconds;
      let runningSince = p.running_since || p.runningSince || null;

      if (runningSince && !foundRunning) {
        foundRunning = true;
        const startMillis = parseInt(runningSince);
        if (!isNaN(startMillis)) {
          const elapsed = Math.floor((nowMillis - startMillis) / 1000);
          displaySeconds = baseSeconds + elapsed;
          displaySeconds = Math.max(0, displaySeconds);
        }
      } else if (runningSince && foundRunning) {
        // Si hay más de uno corriendo, parar este
        runningSince = null;
      }
      
      // Manejar campos que pueden ser NULL o undefined
      const projectId = p.id;
      const projectName = (p.name !== null && p.name !== undefined && p.name !== 'null') 
        ? String(p.name) 
        : 'SIN NOMBRE';
      const projectCategory = (p.category !== null && p.category !== undefined && p.category !== 'null')
        ? String(p.category)
        : 'General';
      const projectColor = (p.color !== null && p.color !== undefined && p.color !== 'null')
        ? String(p.color)
        : 'vibrant-blue';
      
      const project = {
        id: projectId,
        name: projectName,
        category: projectCategory,
        color: projectColor,
        currentDaySeconds: displaySeconds,
        baseSeconds: baseSeconds,
        runningSince: runningSince,
        isRunning: !!runningSince,
        sessionComment: p.session_comment || p.sessionComment || ''
      };
      
      // Solo loggear si hay un problema
      if (!projectId || projectName === 'SIN NOMBRE' || projectName === 'null') {
        console.warn(`Proyecto ${index} con datos faltantes:`, {
          original: p,
          mapeado: project,
          campos: {
            id: p.id,
            name: p.name,
            category: p.category,
            color: p.color
          }
        });
      }
      
      return project;
    });

    renderProjects();
    updateTotalTime();
    updateBadge();

    // Iniciar actualización automática
    startAutoUpdate();

  } catch (error) {
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.classList.remove('hidden');
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

// Renderizar proyectos (usando DOM seguro en lugar de innerHTML)
function renderProjects() {
  if (projects.length === 0) {
    emptyState.classList.remove('hidden');
    projectsContainer.innerHTML = '';
    return;
  }

  emptyState.classList.add('hidden');
  
  // Limpiar contenedor
  projectsContainer.innerHTML = '';
  
  // Crear elementos de forma segura usando DOM
  projects.forEach(project => {
    const isRunning = !!project.runningSince;
    const timeDisplay = formatTime(project.currentDaySeconds);
    const comment = project.sessionComment || '';
    
    // Crear card
    const card = document.createElement('div');
    card.className = `project-card ${isRunning ? 'running' : ''}`;
    card.setAttribute('data-color', project.color);
    
    // Header
    const header = document.createElement('div');
    header.className = 'project-header';
    const headerContent = document.createElement('div');
    const nameDiv = document.createElement('div');
    nameDiv.className = 'project-name';
    nameDiv.textContent = project.name;
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'project-category';
    categoryDiv.textContent = project.category;
    headerContent.appendChild(nameDiv);
    headerContent.appendChild(categoryDiv);
    header.appendChild(headerContent);
    
    // Tiempo
    const timeDiv = document.createElement('div');
    timeDiv.className = 'project-time';
    timeDiv.textContent = timeDisplay;
    
    // Comentario
    const commentDiv = document.createElement('div');
    commentDiv.className = 'project-comment';
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.value = comment;
    commentInput.placeholder = 'Comentario...';
    commentInput.setAttribute('data-project-id', project.id);
    commentInput.className = 'project-comment-input';
    commentInput.addEventListener('blur', () => handleCommentChange(project.id, commentInput.value));
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commentInput.blur();
      }
    });
    commentDiv.appendChild(commentInput);
    
    // Acciones
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'project-actions';
    const button = document.createElement('button');
    button.className = `btn-project ${isRunning ? 'stop' : 'start'}`;
    button.setAttribute('data-project-id', project.id);
    button.type = 'button';
    button.textContent = isRunning ? 'DETENER' : 'INICIAR';
    button.addEventListener('click', () => handleTimerClick(project.id));
    actionsDiv.appendChild(button);
    
    // Ensamblar
    card.appendChild(header);
    card.appendChild(timeDiv);
    card.appendChild(commentDiv);
    card.appendChild(actionsDiv);
    
    projectsContainer.appendChild(card);
  });
}

// Handler para cambio de comentario
async function handleCommentChange(projectId, comment) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  
  // Actualizar estado local
  project.sessionComment = comment;
  
  // Guardar en servidor
  try {
    const secondsToSave = project.isRunning ? project.baseSeconds : project.currentDaySeconds;
    
    const projectData = {
      id: project.id,
      name: project.name,
      category: project.category,
      color: project.color,
      userId: currentUser.id,
      runningSince: project.runningSince,
      currentDaySeconds: secondsToSave,
      sessionComment: comment || null,
      isGlobal: false,
      isActive: true
    };
    
    await apiService.saveProject(projectData);
    console.log('Comentario guardado para proyecto:', projectId);
  } catch (error) {
    console.error('Error al guardar comentario:', error);
    // No mostrar error al usuario para no interrumpir el flujo
  }
}

// Handlers para eventos de comentarios
function handleCommentBlur(e) {
  const projectId = e.target.getAttribute('data-project-id');
  handleCommentChange(projectId, e.target.value);
}

function handleCommentKeydown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
}

// Handler para el click del botón de temporizador
function handleTimerClick(projectId) {
  console.log('Click en proyecto:', projectId);
  toggleTimer(projectId).catch(error => {
    console.error('Error en toggleTimer:', error);
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.classList.remove('hidden');
  });
}

// Actualizar tiempo total
function updateTotalTime() {
  const total = projects.reduce((sum, p) => sum + p.currentDaySeconds, 0);
  totalTimeEl.textContent = formatTimeShort(total);
}

// Actualizar badge del icono (indicador visual)
function updateBadge() {
  const hasRunning = projects.some(p => p.isRunning);
  
  if (hasRunning) {
    // Mostrar punto verde parpadeante
    browser.browserAction.setBadgeText({ text: '●' });
    browser.browserAction.setBadgeBackgroundColor({ color: '#10b981' }); // Verde
  } else {
    // Quitar badge
    browser.browserAction.setBadgeText({ text: '' });
  }
}

// Toggle timer
async function toggleTimer(projectId) {
  console.log('toggleTimer llamado con projectId:', projectId);
  console.log('Proyectos disponibles:', projects.map(p => p.id));
  
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    console.error('Proyecto no encontrado:', projectId);
    errorMessage.textContent = `Error: Proyecto ${projectId} no encontrado`;
    errorMessage.classList.remove('hidden');
    return;
  }

  console.log('Proyecto encontrado:', project);
  const isRunning = !!project.runningSince;
  console.log('Estado actual - isRunning:', isRunning);
  const nowMillis = Date.now();
  const startTimeStamp = nowMillis.toString();

  // Actualizar estado local
  projects = projects.map(p => {
    if (p.id === projectId) {
      if (isRunning) {
        // Detener: guardar el tiempo acumulado como base
        const elapsed = project.runningSince ? Math.floor((nowMillis - parseInt(project.runningSince)) / 1000) : 0;
        const newBaseSeconds = (project.baseSeconds || 0) + elapsed;
        return {
          ...p,
          runningSince: null,
          baseSeconds: newBaseSeconds,
          currentDaySeconds: newBaseSeconds,
          isRunning: false,
          sessionComment: p.sessionComment || ''
        };
      } else {
        // Iniciar: mantener el tiempo base actual
        return {
          ...p,
          runningSince: startTimeStamp,
          baseSeconds: p.currentDaySeconds || 0,
          isRunning: true,
          sessionComment: p.sessionComment || ''
        };
      }
    }
    // Parar otros si se inicia uno nuevo
    if (!isRunning && p.isRunning) {
      const elapsed = p.runningSince ? Math.floor((nowMillis - parseInt(p.runningSince)) / 1000) : 0;
      const newBaseSeconds = (p.baseSeconds || 0) + elapsed;
      return {
        ...p,
        runningSince: null,
        baseSeconds: newBaseSeconds,
        currentDaySeconds: newBaseSeconds,
        isRunning: false,
        sessionComment: p.sessionComment || ''
      };
    }
    return p;
  });

  console.log('Estado después de actualizar:', projects.find(p => p.id === projectId));
  
  renderProjects();
  updateTotalTime();
  updateBadge();

  // Guardar en servidor - SOLO los proyectos que cambiaron
  try {
    console.log('Guardando en servidor...');
    
    // Solo guardar los proyectos que cambiaron (el que se inició/detuvo y los que se detuvieron)
    const projectsToSave = projects.filter(p => {
      // El proyecto que se modificó
      if (p.id === projectId) return true;
      // Los proyectos que se detuvieron porque se inició uno nuevo
      if (!isRunning && p.isRunning && p.runningSince) return true;
      return false;
    });
    
    for (const p of projectsToSave) {
      // Si está corriendo, guardar el baseSeconds (tiempo antes de empezar)
      // Si está detenido, guardar el currentDaySeconds (tiempo total acumulado)
      const secondsToSave = p.isRunning ? p.baseSeconds : p.currentDaySeconds;
      
      // IMPORTANTE: Enviar TODOS los campos del proyecto para no sobrescribir con NULL
      const projectData = {
        id: p.id,
        name: p.name,
        category: p.category,
        color: p.color,
        userId: currentUser.id,
        runningSince: p.runningSince,
        currentDaySeconds: secondsToSave,
        sessionComment: p.sessionComment || null,
        isGlobal: false, // Por defecto, la extensión no crea proyectos globales
        isActive: true   // Mantener activo
      };
      
      console.log('Guardando proyecto:', projectData);
      await apiService.saveProject(projectData);
    }
    console.log('Guardado exitoso');
  } catch (error) {
    console.error('Error al guardar:', error);
    errorMessage.textContent = `Error al guardar: ${error.message}`;
    errorMessage.classList.remove('hidden');
    // Recargar proyectos para sincronizar
    setTimeout(() => loadProjects(), 1000);
  }
}

// Sincronizar manualmente
async function syncProjects() {
  syncButton.querySelector('.material-symbols-outlined').classList.add('spin');
  try {
    await loadProjects();
  } finally {
    syncButton.querySelector('.material-symbols-outlined').classList.remove('spin');
  }
}

// Actualización automática
function startAutoUpdate() {
  if (updateInterval) clearInterval(updateInterval);
  
  updateInterval = setInterval(() => {
    const nowMillis = Date.now();
    let needsRender = false;

    projects = projects.map(p => {
      if (p.runningSince) {
        const startMillis = parseInt(p.runningSince);
        if (!isNaN(startMillis)) {
          const elapsed = Math.floor((nowMillis - startMillis) / 1000);
          const baseSeconds = p.baseSeconds || 0;
          const newSeconds = Math.max(0, baseSeconds + elapsed);
          if (newSeconds !== p.currentDaySeconds) {
            needsRender = true;
            return { ...p, currentDaySeconds: newSeconds };
          }
        }
      }
      return p;
    });

    if (needsRender) {
      renderProjects();
      updateTotalTime();
      updateBadge();
    }
  }, 1000);

  // Sincronizar con servidor cada 15 segundos
  setInterval(() => {
    loadProjects();
  }, 15000);
}

// Logout
function handleLogout() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  browser.storage.local.remove([USER_SESSION_KEY]);
  browser.browserAction.setBadgeText({ text: '' }); // Limpiar badge
  currentUser = null;
  apiService = null;
  projects = [];

  mainView.classList.remove('active');
  mainView.classList.add('hidden');
  loginView.classList.remove('hidden');
  loginView.classList.add('active');

  // Limpiar formulario
  passwordInput.value = '';
}

// Inicialización
async function init() {
  // Verificar si hay sesión guardada
  const stored = await browser.storage.local.get([USER_SESSION_KEY]);
  
  if (stored[USER_SESSION_KEY]) {
    currentUser = stored[USER_SESSION_KEY];
    apiService = new APIService(API_BASE_URL);
    showMainView();
    loadProjects();
    // El badge se actualizará después de cargar proyectos
  } else {
    // Verificar estado del servidor al cargar
    checkServerStatus();
  }

  // Event listeners
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (syncButton) syncButton.addEventListener('click', syncProjects);
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  
  // Event delegation para los botones de proyectos (por si se renderizan después)
  if (projectsContainer) {
    projectsContainer.addEventListener('click', (e) => {
      // Ignorar clicks en inputs de comentario
      if (e.target.classList.contains('project-comment-input')) {
        return;
      }
      
      // Buscar el botón más cercano o si el click fue directamente en el botón
      let button = e.target.closest('.btn-project');
      if (!button && e.target.classList.contains('btn-project')) {
        button = e.target;
      }
      
      if (button) {
        const projectId = button.getAttribute('data-project-id');
        if (projectId) {
          console.log('Click detectado en botón, projectId:', projectId);
          e.preventDefault();
          e.stopPropagation();
          handleTimerClick(projectId);
        } else {
          console.warn('Botón sin data-project-id:', button);
        }
      }
    });
    console.log('Event listener agregado a projectsContainer');
  } else {
    console.error('projectsContainer no encontrado');
  }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
