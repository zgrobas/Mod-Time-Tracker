
# MOD Tracker - Sistema Operativo de Gestión de Tiempo

Un dashboard de alto rendimiento para la gestión de proyectos y seguimiento de tiempo con estética Tech-Noir.

## 🚀 Instalación Rápida

1. **Configurar la Base de Datos**:
   - Crea una base de datos MySQL en tu panel Plesk.
   - Edita `api.php` con los credenciales: `$host`, `$db`, `$user`, `$pass`.

2. **Despliegue**:
   - Sube todos los archivos (incluyendo `api.php`) a tu carpeta `httpdocs`.
   - El sistema creará automáticamente el usuario **Admin** (clave: `123456789`) al primer acceso.

3. **Configurar la API Key**:
   Configura la variable de entorno `API_KEY` en tu servidor o vía `process.env`.

## 🛠️ Tecnologías
- **React 19** & **TypeScript**
- **MySQL / PHP API**: Persistencia de datos centralizada y segura.
- **Tailwind CSS**: Estilo visual avanzado de alta densidad.
- **Google Gemini API**: Inteligencia artificial para análisis de productividad.
