# MOD Tracker - Sistema Operativo de Gestión de Tiempo

Un dashboard de alto rendimiento para la gestión de proyectos y seguimiento de tiempo con estética Tech-Noir. Sistema multi-usuario con roles de administrador y usuario, diseñado para equipos que requieren un seguimiento preciso y profesional del tiempo invertido en proyectos.

## 🚀 Instalación Rápida

### Requisitos Previos
- Servidor web con PHP 7.4+ y MySQL 5.7+
- Node.js 18+ y npm (para desarrollo)
- Acceso a Google Gemini API (opcional, para análisis con IA)

### Configuración

1. **Configurar la Base de Datos**:
   - Crea una base de datos MySQL en tu panel Plesk o servidor.
   - Edita `api.php` con los credenciales de conexión:
     ```php
     $host = 'localhost';
     $db = 'mod_tracker_db';
     $user = 'tu_usuario';
     $pass = 'tu_contraseña';
     ```
   - O configura variables de entorno: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

2. **Despliegue en Producción**:
   - Sube todos los archivos (incluyendo `api.php`) a tu carpeta `httpdocs` o directorio raíz del servidor.
   - El sistema creará automáticamente las tablas necesarias y el usuario **Admin** (clave: `123456789`) al primer acceso.

3. **Configurar la API Key de Google Gemini** (Opcional):
   - Configura la variable de entorno `API_KEY` en tu servidor o vía `process.env.API_KEY`.
   - Se utiliza para generar insights inteligentes de productividad en la vista de Reportes.

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo (frontend)
npm run dev

# Ejecutar servidor PHP local (backend)
npm run dev:api

# Ejecutar ambos simultáneamente
npm run dev:full

# Compilar para producción
npm run build
```

## ✨ Funcionalidades Principales

### 🎯 Seguimiento de Tiempo en Tiempo Real

- **Cronómetros Múltiples**: Gestiona múltiples proyectos simultáneamente con cronómetros independientes
- **Un Solo Cronómetro Activo**: Solo un proyecto puede estar en ejecución a la vez (automáticamente pausa otros al iniciar uno nuevo)
- **Inicio con Tiempo Preestablecido**: Inicia un cronómetro con tiempo acumulado desde el inicio
- **Ajuste Manual**: Ajusta el tiempo con botones +/- para correcciones rápidas
- **Reset de Contador**: Reinicia el contador diario de cualquier proyecto
- **Comentarios de Sesión**: Añade comentarios a cada sesión de trabajo que se guardan con el registro diario
- **Guardado Automático Diario**: Los tiempos se guardan automáticamente al cambiar de día
- **Wake Lock**: Mantiene la pantalla activa cuando hay cronómetros en ejecución (compatible con navegadores modernos)
- **Sincronización Automática**: Los datos se sincronizan con el servidor cada 15 segundos

### 📊 Gestión de Proyectos

- **Crear y Editar Proyectos**: Crea proyectos con nombre, categoría y color personalizado
- **Proyectos Globales y Privados**: 
  - Los administradores pueden crear proyectos globales visibles para todos
  - Los usuarios pueden crear proyectos privados solo para ellos
- **Ocultar Proyectos**: Oculta proyectos que no necesitas ver sin eliminarlos
- **Reordenar por Drag & Drop**: Organiza tus proyectos arrastrándolos a la posición deseada
- **Categorización**: Organiza proyectos por categorías personalizadas
- **15 Colores Vibrantes**: Paleta de colores Tech-Noir para identificar proyectos visualmente
- **Activar/Desactivar Proyectos**: Los administradores pueden desactivar proyectos sin eliminarlos

### 👥 Sistema de Usuarios y Roles

- **Roles de Usuario**: 
  - **ADMIN**: Acceso completo al panel de administración y gestión global
  - **USER**: Acceso a sus propios proyectos y estadísticas
- **Gestión de Usuarios**: Los administradores pueden ver, crear y gestionar usuarios
- **Vista Detallada de Usuarios**: Análisis completo de actividad por usuario
- **Vista Detallada de Proyectos**: Estadísticas y usuarios que trabajan en cada proyecto
- **Perfiles de Usuario**: Visualización y edición del perfil personal

### 📝 Registros y Movimientos

- **Historial Completo**: Visualiza todos tus registros de tiempo históricos
- **Inyección Manual de Tiempo**: Añade tiempo manualmente a proyectos con fecha personalizable
- **Edición de Movimientos**: Edita duración, fecha y comentarios de registros existentes
- **Eliminación de Movimientos**: Elimina registros incorrectos con confirmación
- **Historial de Modificaciones**: Los administradores pueden ver el historial completo de cambios en los logs
- **Estados de Registro**: 
  - `NORMAL`: Tiempo registrado automáticamente por cronómetro
  - `MANUAL`: Tiempo añadido manualmente
  - `PRESET`: Tiempo iniciado con valor preestablecido

### 📈 Reportes y Analítica

- **Análisis con Inteligencia Artificial**: Insights de productividad generados por Google Gemini API
- **Estadísticas de Productividad**: Métricas detalladas de tiempo trabajado
- **Historial Semanal**: Vista de actividad de los últimos 7 días
- **Vista de Movimientos**: Lista completa y filtrable de todos los registros
- **Exportación a CSV**: Exporta todos tus registros en formato CSV para análisis externo
- **Sincronización Manual**: Fuerza el guardado de tiempos acumulados antes del cambio de día

### 🎨 Panel de Administración

- **Dashboard Global**: Vista general de todos los usuarios, proyectos y estadísticas
- **Estadísticas Agregadas**: 
  - Total de horas registradas en el sistema
  - Número de usuarios activos
  - Distribución de proyectos globales vs privados
  - Actividad de los últimos 7 días
  - Distribución de tiempo por proyecto (gráfico de dona)
- **Gestión de Usuarios**: Lista completa con estadísticas de cada usuario
- **Gestión de Proyectos**: Vista global de todos los proyectos del sistema
- **Búsqueda Global**: Busca usuarios y proyectos rápidamente desde el header

### 🔧 Características Técnicas

- **Modo Offline**: Funciona con datos mock cuando no hay conexión a la base de datos (útil para desarrollo)
- **Persistencia Local**: Guarda la sesión del usuario en localStorage
- **Responsive Design**: Interfaz optimizada para desktop y móvil
- **Actualización en Tiempo Real**: Los cronómetros se actualizan cada segundo
- **Validación de Datos**: Validación completa en frontend y backend
- **Manejo de Errores**: Mensajes de error claros y manejo robusto de fallos de conexión

## 🛠️ Tecnologías

- **React 19** & **TypeScript**: Framework moderno con tipado estático
- **Vite 6**: Build tool de alta velocidad para desarrollo y producción
- **MySQL / PHP API**: Persistencia de datos centralizada y segura con PDO
- **Tailwind CSS 3.4**: Estilo visual avanzado de alta densidad con tema Tech-Noir personalizado
- **Google Gemini API**: Inteligencia artificial para análisis de productividad y generación de insights
- **Material Symbols**: Iconografía moderna y consistente

## 📁 Estructura del Proyecto

```
Mod-Time-Tracker/
├── api.php                 # Backend PHP/MySQL API
├── App.tsx                 # Componente principal de la aplicación
├── index.tsx              # Punto de entrada
├── types.ts               # Definiciones de tipos TypeScript
├── constants.tsx          # Constantes y datos mock
├── components/            # Componentes reutilizables
│   ├── Header.tsx        # Barra superior con búsqueda y acciones
│   └── Sidebar.tsx       # Menú lateral de navegación
├── views/                 # Vistas principales
│   ├── DashboardGrid.tsx         # Vista principal de cronómetros
│   ├── MovementsView.tsx         # Vista de movimientos/registros
│   ├── Reports.tsx              # Vista de reportes y analítica
│   ├── WeeklyHistoryView.tsx    # Historial semanal
│   ├── ProfileView.tsx          # Perfil de usuario
│   ├── AdminDashboardView.tsx  # Panel de administración
│   ├── AdminView.tsx           # Lista de usuarios/proyectos
│   ├── AdminUserDetailView.tsx # Detalle de usuario
│   └── AdminProjectDetailView.tsx # Detalle de proyecto
├── services/              # Servicios de backend
│   ├── db.ts            # Servicio de base de datos
│   └── geminiService.ts # Servicio de IA (Gemini)
└── mockData/            # Datos de prueba para desarrollo
```

## 🗄️ Estructura de Base de Datos

El sistema crea automáticamente las siguientes tablas:

- **users**: Información de usuarios (id, username, password, role, avatar_seed, last_login, project_order)
- **projects**: Metadatos de proyectos (id, creator_id, name, category, color, is_global, is_active)
- **user_projects**: Estado individual de proyectos por usuario (user_id, project_id, running_since, current_day_seconds, session_comment, hidden_by_user)
- **logs**: Registros históricos de tiempo (id, user_id, project_id, project_name, date_str, duration_seconds, status, comment, created_at)
- **log_modification_history**: Historial de modificaciones de logs para auditoría

## 🔐 Seguridad

- Las contraseñas se almacenan en texto plano (considera implementar hash para producción)
- La API valida todos los inputs antes de procesarlos
- CORS configurado para permitir solicitudes desde el frontend
- Validación de roles en el frontend y backend

## 📝 Notas de Desarrollo

- El sistema funciona en modo mock cuando no hay conexión a la base de datos (útil para desarrollo)
- Los usuarios mock disponibles son: `Admin` y `Grobas` (ambos con clave `123456789`)
- La sincronización automática ocurre cada 15 segundos
- Los cronómetros se actualizan cada segundo en el frontend
- El guardado automático diario ocurre al detectar cambio de fecha

## 🚧 Próximas Mejoras Sugeridas

- [ ] Hash de contraseñas (bcrypt)
- [ ] Autenticación con tokens JWT
- [ ] Notificaciones push para recordatorios
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Exportación a más formatos (PDF, Excel)
- [ ] Gráficos avanzados de productividad
- [ ] Modo oscuro/claro configurable
- [ ] Multi-idioma (i18n)

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**MOD Tracker** - Sistema Operativo de Gestión de Tiempo v1.0.0
