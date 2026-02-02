# 🚀 Guía de Instalación - MOD Time Tracker Extension

## Paso 1: Generar los Iconos

La extensión necesita iconos PNG. Tienes dos opciones:

### Opción A: Usar el SVG incluido (Recomendado)

1. Abre `icons/icon.svg` en tu navegador o editor de imágenes
2. Convierte el SVG a PNG en los siguientes tamaños:
   - 16x16 píxeles → guarda como `icons/icon-16.png`
   - 48x48 píxeles → guarda como `icons/icon-48.png`
   - 128x128 píxeles → guarda como `icons/icon-128.png`

**Herramientas online:**
- https://convertio.co/es/svg-png/
- https://cloudconvert.com/svg-to-png
- https://www.freeconvert.com/svg-to-png

### Opción B: Usar iconos temporales

Puedes usar cualquier imagen PNG cuadrada y copiarla 3 veces con los nombres:
- `icon-16.png`
- `icon-48.png`
- `icon-128.png`

La extensión funcionará con iconos temporales mientras generas los definitivos.

## Paso 2: Instalar la Extensión en Firefox

1. **Abre Firefox** y navega a: `about:debugging`
   - Escribe `about:debugging` en la barra de direcciones y presiona Enter

2. **Haz clic en "Este Firefox"** en el menú lateral izquierdo

3. **Haz clic en "Cargar extensión temporal..."**

4. **Navega y selecciona** la carpeta `firefox-extension` completa
   - Debe ser la carpeta que contiene `manifest.json`

5. **¡Listo!** La extensión aparecerá en la barra de herramientas de Firefox

## Paso 3: Configurar la Extensión

1. **Haz clic en el icono** de MOD Tracker en la barra de herramientas

2. **Ingresa la URL de tu servidor:**
   - Ejemplo: `https://tudominio.com`
   - O para desarrollo local: `http://localhost:8080`
   - La extensión agregará automáticamente `/api.php` al final

3. **Ingresa tus credenciales:**
   - Usuario (ej: `Admin`)
   - Contraseña (ej: `123456789`)

4. **Haz clic en "ENTRAR AL SISTEMA"**

5. ¡Ya puedes gestionar tus tiempos desde la extensión!

## 🔧 Solución de Problemas

### La extensión no aparece después de cargarla

- Verifica que hayas seleccionado la carpeta correcta (debe contener `manifest.json`)
- Revisa la consola de errores en `about:debugging` → "Inspeccionar"

### Error: "El servidor no está disponible"

- Verifica que la URL sea correcta y accesible
- Asegúrate de incluir `http://` o `https://`
- Comprueba que `api.php` esté en la raíz del servidor

### Los iconos no aparecen

- Asegúrate de haber generado los archivos PNG en la carpeta `icons/`
- Los archivos deben llamarse exactamente: `icon-16.png`, `icon-48.png`, `icon-128.png`

### Los tiempos no se actualizan

- Haz clic en el botón de sincronización (icono de refresh)
- Verifica tu conexión a Internet
- Abre la consola del navegador (F12) para ver errores

## 📝 Notas Importantes

- **Extensión temporal**: Se desinstalará al reiniciar Firefox. Para hacerla permanente, necesitas empaquetarla y firmarla.
- **Persistencia**: La sesión se guarda automáticamente, no necesitarás volver a iniciar sesión.
- **Sincronización**: Los tiempos se sincronizan automáticamente cada 15 segundos con el servidor.

## 🎯 Próximos Pasos

Una vez instalada, puedes:
- ✅ Ver todos tus proyectos activos
- ✅ Iniciar/detener cronómetros
- ✅ Ver el tiempo total del día
- ✅ Sincronizar manualmente cuando quieras

¡Disfruta gestionando tus tiempos desde Firefox!
