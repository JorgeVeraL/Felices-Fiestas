/* ============================================================
   CONFIGURACIÓN — edita aquí los datos de la invitación
   ============================================================ */
window.App = window.App || {};

App.Config = {
  titulo: "Padrinos del Niño Dios",
  familia: "Fam. Vera Lazaro",
  saludo: "les deseamos felices fiestas",
  agradecimiento: "Gracias por acompañarnos a celebrar la llegada del Niño Jesús",

  fecha: {
    iso: "2026-12-24",      // fecha real (para la cuenta regresiva)
    dia: "24",
    mes: "Diciembre",
    ciclo: "2026-2027"
  },

  lugar: {
    pueblo: "San Andrés Zautla",
    calle: "Calle Flor de Mayo, número 5 (Cañada de San Miguel, Referencia Casa del adulto mayor 'Pozo Blanco')",
    lat: 17.193862,
    lng: -96.865984,
    zoom: 17
  },

  contacto: {
  whatsapp: "525655175932",
  telefono: "9511901499",
  telefonoVisible: "951 190 14 99",
  mensaje: "¡Hola! Somos los invitados y confirmamos nuestra asistencia a la celebración del Niño Dios, nos vemos el 24 de diciembre Fam. Vera Lazaro. ¡Gracias por la invitación!"
},

  /* Frases del mensaje de bienvenida: las dice el burrito y el audio del anfitrión */
  mensajes: [
    "¡Tuki, tuki, tuki! Ya casi llegamos a San Andrés Zautla",
    "El Niño Jesús les manda bendiciones y felices fiestas",
    "¡Qué alegría celebrar juntos estas fechas!"
  ],

  anfitrion: {
    activo: true,                 // false = oculta toda la sección
    titulo: "Un mensaje para ustedes",
    archivos: [
      "assets/audio/anfitrion.mp3",
      "assets/audio/anfitrion.m4a",
      "assets/audio/anfitrion.ogg",
      "assets/audio/anfitrion.webm"
    ],
    idioma: "es-MX",
    velocidad: 0.95
  },

  burrito: {
    activo: true,
    sonido: true                  // rebuzno al tocarlo
  },

  musica: {
    archivo: "assets/audio/villancico.mp3",   // opcional: "assets/audio/villancico.mp3". Vacío = melodía generada
    volumen: 0.5
  }
};
