
# MOD Tracker - Sistema Operativo de Gestión de Tiempo

Un dashboard de alto rendimiento para la gestión de proyectos y seguimiento de tiempo con estética Tech-Noir.

## 🚀 Instalación Rápida

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-url-de-github>
   cd mod-tracker-pro
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar la API Key:**
   Crea un archivo `.env` en la raíz y añade tu clave de Google AI:
   ```env
   VITE_GEMINI_API_KEY=tu_clave_aqui
   ```
   *(Nota: El código actual usa process.env.API_KEY, asegúrate de configurar esto en tu entorno de despliegue).*

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en Servidor

### Opción A: Vercel (Recomendado)
1. Ve a [vercel.com](https://vercel.com).
2. Conecta tu cuenta de GitHub e importa este proyecto.
3. En la sección **Environment Variables**, añade `API_KEY` con tu clave de Gemini.
4. Haz clic en **Deploy**.

### Opción B: Netlify
1. Ve a [netlify.com](https://netlify.com).
2. Selecciona "Import from GitHub".
3. En "Build settings", usa:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Añade la variable `API_KEY` en la configuración de la App.

## 🛠️ Tecnologías
- **React 19** & **TypeScript**
- **IndexedDB**: Persistencia de datos local multi-usuario.
- **Tailwind CSS**: Estilo visual avanzado.
- **Google Gemini API**: Inteligencia artificial para análisis de productividad.
