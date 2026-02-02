# Iconos de la Extensión

Esta carpeta debe contener los siguientes archivos PNG:

- `icon-16.png` - 16x16 píxeles
- `icon-48.png` - 48x48 píxeles  
- `icon-128.png` - 128x128 píxeles

## Generar iconos desde SVG

Puedes usar herramientas online como:
- https://convertio.co/es/svg-png/
- https://cloudconvert.com/svg-to-png

O usar ImageMagick desde la línea de comandos:

```bash
# Si tienes ImageMagick instalado
convert icon.svg -resize 16x16 icon-16.png
convert icon.svg -resize 48x48 icon-48.png
convert icon.svg -resize 128x128 icon-128.png
```

## Icono temporal

Mientras tanto, puedes usar cualquier imagen PNG de 128x128 píxeles y copiarla como `icon-16.png`, `icon-48.png` e `icon-128.png`. Firefox funcionará con iconos temporales.

## Diseño del icono

El icono SVG incluido muestra:
- Fondo oscuro (#0a0e1a) estilo MOD Tracker
- Borde azul (#00a3e0) 
- Reloj estilizado en el centro
- Texto "MOD" en la parte inferior
