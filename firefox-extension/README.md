# MOD Time Tracker - Extensión de Firefox

Extensión de Firefox para gestionar tiempos de proyectos desde el navegador, conectándose directamente a tu servidor MOD Tracker.

## 🚀 Instalación

### Opción 1: Cargar extensión temporalmente (desarrollo)

1. Abre Firefox y navega a `about:debugging`
2. Haz clic en "Este Firefox" en el menú lateral
3. Haz clic en "Cargar extensión temporal..."
4. Selecciona la carpeta `firefox-extension` de este proyecto
5. La extensión aparecerá en la barra de herramientas

### Opción 2: Empaquetar para distribución

1. Abre Firefox y navega a `about:debugging`
2. Haz clic en "Este Firefox" → "Cargar extensión temporal..."
3. Selecciona la carpeta `firefox-extension`
4. Haz clic en el icono de la extensión → "Inspeccionar"
5. En la consola, ejecuta: `browser.management.getSelf().then(ext => browser.management.setEnabled(ext.id, true))`
6. Para empaquetar: Ve a `about:addons` → encuentra la extensión → "Gestionar" → "Empaquetar extensión"

## 📋 Configuración

### Primera vez

1. Haz clic en el icono de la extensión en la barra de herramientas
2. Ingresa la **URL de tu servidor** (ejemplo: `https://tudominio.com` o `http://localhost:8080`)
3. Ingresa tu **usuario** y **contraseña**
4. Haz clic en "ENTRAR AL SISTEMA"

La URL y la sesión se guardarán automáticamente para futuros accesos.

## ✨ Funcionalidades

- ✅ **Login seguro**: Autenticación con tu servidor MOD Tracker
- ✅ **Lista de proyectos**: Visualiza todos tus proyectos activos
- ✅ **Iniciar/Detener tiempos**: Controla los cronómetros directamente desde la extensión
- ✅ **Tiempo en tiempo real**: Los cronómetros se actualizan cada segundo
- ✅ **Sincronización automática**: Se sincroniza con el servidor cada 15 segundos
- ✅ **Tiempo total diario**: Muestra el tiempo acumulado del día
- ✅ **Persistencia**: Mantiene tu sesión entre reinicios del navegador

## 🎨 Características

- Interfaz minimalista similar al estilo MOD Tracker
- Colores vibrantes para identificar proyectos
- Indicador de estado del servidor
- Sincronización manual con botón dedicado
- Diseño responsive optimizado para popup

## 🔧 Requisitos

- Firefox 109+ (compatible con Manifest V3)
- Servidor MOD Tracker con `api.php` accesible
- Conexión a Internet para sincronización

## 🛠️ Desarrollo

### Estructura de archivos

```
firefox-extension/
├── manifest.json      # Configuración de la extensión
├── popup.html         # Interfaz principal
├── popup.js           # Lógica de la aplicación
├── popup.css          # Estilos
├── background.js      # Service worker para sincronización
├── icons/             # Iconos de la extensión
└── README.md          # Este archivo
```

### API utilizada

La extensión utiliza los siguientes endpoints de `api.php`:

- `GET ?action=status` - Verificar estado del servidor
- `GET ?action=get_users` - Obtener usuarios (para login)
- `GET ?action=get_projects&userId=X` - Obtener proyectos del usuario
- `POST ?action=save_project` - Guardar/actualizar proyecto (iniciar/parar cronómetro)

### Personalización

Para cambiar el estilo, edita `popup.css`. Las variables CSS en `:root` controlan los colores principales.

## 📝 Notas

- La extensión guarda la sesión en `browser.storage.local`
- Los tiempos se sincronizan automáticamente cada 15 segundos
- Solo puede haber un cronómetro activo a la vez (como en la web)
- La extensión funciona offline parcialmente (muestra tiempos locales) pero requiere conexión para sincronizar

## 🐛 Solución de problemas

**Error: "El servidor no está disponible"**
- Verifica que la URL sea correcta y accesible
- Asegúrate de que `api.php` esté en la raíz del servidor
- Comprueba que CORS esté habilitado en el servidor

**Los tiempos no se actualizan**
- Haz clic en el botón de sincronización (icono de refresh)
- Verifica la conexión a Internet
- Revisa la consola del navegador (F12) para errores

**No puedo iniciar sesión**
- Verifica que las credenciales sean correctas
- Asegúrate de que el servidor esté online (ver indicador en el formulario)
- Comprueba que la URL incluya el protocolo (http:// o https://)

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**MOD Time Tracker Extension** v1.0.0
