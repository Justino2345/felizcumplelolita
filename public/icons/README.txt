ICONOS DE LAS APPS
==================

Guardá acá los archivos con EXACTAMENTE estos nombres (respetá mayúsculas/guiones).
Formato recomendado: PNG cuadrado 512x512 con fondo transparente.
También sirven .webp o .svg, pero entonces cambiá la extensión en
src/os/AppIcons.jsx -> objeto ICON_SRC.

Si un archivo no existe, la app usa el icono dibujado (SVG) que ya trae por defecto.
Después de agregar/cambiar un archivo: recargá la página (Ctrl+R). En build hay
que volver a correr `npm run build`.

Apps
----
finder.png       -> Finder (primer icono del dock)
about.png        -> Su historia
gallery.png      -> Galeria
reel.png         -> El video
music.png        -> Playlist
contact.png      -> Saludos
resources.png    -> Todo
game.png         -> Las mascotas (juego)

Capitulos (opcional)
--------------------
chapter-infancia.png
chapter-adolescencia.png
chapter-juventud.png
chapter-amor.png
chapter-familia.png
chapter-hoy.png
