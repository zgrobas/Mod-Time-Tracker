// Service Worker para sincronización en segundo plano
// Esto permite mantener los tiempos actualizados incluso cuando el popup está cerrado

let badgeBlinkState = false;

// Escuchar alarmas para sincronización periódica
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncProjects') {
    syncInBackground();
  } else if (alarm.name === 'blinkBadge') {
    updateBadgeBlink();
  }
});

// Crear alarma para sincronización cada 15 segundos
browser.alarms.create('syncProjects', { periodInMinutes: 0.25 }); // 15 segundos

// Crear alarma para parpadeo del badge cada segundo
browser.alarms.create('blinkBadge', { periodInMinutes: 1/60 }); // 1 segundo

// Función de sincronización en segundo plano
async function syncInBackground() {
  try {
    const stored = await browser.storage.local.get(['mod_tracker_session']);
    
    if (!stored.mod_tracker_session) {
      // No hay sesión activa, quitar badge
      browser.browserAction.setBadgeText({ text: '' });
      return;
    }

    const apiUrl = 'https://modtimetracker.dev6.bigbangfood.es/api.php';
    const userId = stored.mod_tracker_session.id;

    // Hacer request a la API
    const url = new URL(apiUrl);
    url.searchParams.set('action', 'get_projects');
    url.searchParams.set('userId', userId);

    const response = await fetch(url.toString());
    if (!response.ok) return;

    const data = await response.json();
    
    // Verificar si hay algún temporizador corriendo
    const hasRunning = data.some(p => p.running_since);
    updateBadge(hasRunning);
    
    // Guardar proyectos actualizados en storage para que el popup los use
    await browser.storage.local.set({
      'mod_tracker_projects_cache': data,
      'mod_tracker_last_sync': Date.now()
    });

  } catch (error) {
    console.error('Error en sincronización en segundo plano:', error);
  }
}

// Actualizar badge con efecto de parpadeo
function updateBadge(hasRunning) {
  if (hasRunning) {
    updateBadgeBlink();
  } else {
    browser.browserAction.setBadgeText({ text: '' });
    badgeBlinkState = false;
  }
}

// Efecto de parpadeo del badge
async function updateBadgeBlink() {
  try {
    const result = await browser.storage.local.get(['mod_tracker_projects_cache']);
    if (!result.mod_tracker_projects_cache) return;
    
    const hasRunning = result.mod_tracker_projects_cache.some(p => p.running_since);
    if (hasRunning) {
      badgeBlinkState = !badgeBlinkState;
      // Alternar entre mostrar y ocultar el punto para efecto parpadeante
      browser.browserAction.setBadgeText({ 
        text: badgeBlinkState ? '●' : '' 
      });
      browser.browserAction.setBadgeBackgroundColor({ color: '#10b981' }); // Verde
    } else {
      browser.browserAction.setBadgeText({ text: '' });
      badgeBlinkState = false;
    }
  } catch (error) {
    console.error('Error actualizando badge:', error);
  }
}

// Sincronizar inmediatamente al iniciar
syncInBackground();
