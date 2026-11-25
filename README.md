# Invitación digital · Padrinos del Niño Dios (versión premium)

Sitio estático (HTML + CSS + JS). Abre `index.html` con doble clic.

## Qué incluye
- Puertas con corona navideña y sello para abrir, nieve dorada, guirnalda con luces, marcos con esquinas de oro.
- **Burrito sabanero con el Niño Dios**: camina conforme bajas el scroll (y se voltea si subes). Tócalo: salta, rebuzna y dice sus frases. También habla solo en puntos del recorrido.
- **Mensaje del anfitrión** (opcional): botón de play con las 3 frases resaltadas. La música baja de volumen mientras suena.
- Mapa con **gorro de Navidad** en tus coordenadas, en vista Satélite o Mapa.
- Confirmar asistencia por WhatsApp (56 5517 5932).

## Estructura
```
index.html
grabador.html                      ← graba tu voz y descarga el audio
assets/
  css/styles.css
  img/                             ← Niño Dios, Reyes Magos, adornos (SVG)
  audio/                           ← aquí va anfitrion.mp3 / .m4a / .ogg / .webm
  js/
    config/config.js               ← TODOS los datos y frases
    models/InvitationModel.js      ← modelo
    views/InvitationView.js        ← vista (DOM, mapa)
    controllers/InvitationController.js
    effects/  snow, music, sfx, burrito, hostaudio
    app.js
```

## Audio del anfitrión
1. Abre `grabador.html`, lee las frases y descarga el audio (o grábalo con la app de voz del celular).
2. Llámalo `anfitrion` (con su extensión) y ponlo en `assets/audio/`.
3. Listo. Si no pones archivo, el dispositivo lee el mensaje con una voz en español (suena robótica).
Para ocultar la sección: `anfitrion.activo: false` en `config.js`.
Las frases se cambian en `mensajes` de `config.js`; las usan el burrito y el audio.

## Mapa
Ya no usa openstreetmap.org (bloquea cuando la página se abre desde un archivo). Ahora usa Esri (satélite) y CARTO (calles). Necesita internet. Si falla, los botones "Cómo llegar" y "Abrir en Waze" llevan al punto.

## Publicar
Sube la carpeta a Netlify Drop o GitHub Pages y comparte el enlace.
