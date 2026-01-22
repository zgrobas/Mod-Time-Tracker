# MOD Tracker - Sistema Operativo de Gestión de Tiempo

Un dashboard de alto rendimiento para la gestión de proyectos y seguimiento de tiempo con estética Tech-Noir.

## 🚀 Instalación y Despliegue en Producción

Sigue estos pasos para desplegar la aplicación correctamente en tu servidor (Plesk o similar):

### 1. Preparación del Servidor
- Accede a la carpeta raíz de tu sitio (normalmente `httpdocs`).
- **Borra todo el contenido** actual de la carpeta, **excepto el archivo `.env`** (que contiene tu `API_KEY` para la Inteligencia Artificial).

### 2. Carga de Archivos
- Sube todos los ficheros del proyecto descargados desde AI Studio a la carpeta raíz.

### 3. Configuración de la Base de Datos
- Crea una base de datos MySQL en tu panel de control.
- Edita el archivo `api.php` y configura las credenciales de conexión:
  ```php
  $host = 'localhost'; 
  $db   = 'nombre_de_tu_db';
  $user = 'usuario_db';
  $pass = 'tu_password';
  ```

### 4. Compilación de la Aplicación
- Abre una terminal en la carpeta raíz del servidor y ejecuta los siguientes comandos:
  ```bash
  npm install
  npm run build
  ```

### 5. Finalización del Despliegue
- Una vez terminada la compilación, se habrá creado una carpeta llamada `/dist`.
- **Mueve el archivo `api.php`** (y cualquier otro script del backend) a dentro de la carpeta `/dist`.
- Asegúrate de que el dominio apunte a la carpeta `/dist` o que el servidor esté configurado para servir el contenido desde allí.

---

## 🛠️ Notas Adicionales
- **Usuario Admin por defecto**: Al acceder por primera vez, el sistema creará automáticamente al usuario `Admin` con la clave `123456789`. Se recomienda cambiarla inmediatamente en la sección de Perfil.
- **Privacidad**: Los proyectos marcados como "Privados" solo son visibles para administradores y el usuario creador.
- **IA**: El análisis de productividad utiliza Google Gemini y requiere que la clave en el `.env` sea válida.

## ⚡ Tecnologías
- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Backend**: PHP 8.x + MySQL.
- **IA**: Google Gemini API via `@google/genai`.