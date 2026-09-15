// ---------------------------------------------------------------------------
// CONTENIDO — reemplazá estos placeholders por la historia real de la persona.
// La estructura imita 1:1 la plantilla Macxfolio, pero orientada a contar
// la historia cronológica de alguien (regalo de cumpleaños).
// ---------------------------------------------------------------------------

import fotosManifest from "virtual:fotos";
import iconsManifest from "virtual:icons";
import { ICON_SRC } from "./os/AppIcons.jsx";

// Portada de un capítulo: el logo que subiste a public/icons (si ya está
// subido) o, si no, la primera foto de su galería.
function coverDe(chapterId, gallery) {
  const src = ICON_SRC[`chapter:${chapterId}`];
  const file = src?.split("/").pop();
  if (file && iconsManifest.includes(file)) return src;
  return gallery[0].thumb;
}

// Mezcla el array (Fisher-Yates) sin tocar el original.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fotos reales subidas a public/fotos/<carpeta>, ya con su miniatura liviana
// generada ({ src: original, thumb: WebP optimizado }). Se muestran en orden
// aleatorio (no en el orden en que se subieron). Si una carpeta está vacía
// todavía, se usa el placeholder de Unsplash que ya tenía el capítulo.
function fotosDe(id, fallbackUrls) {
  const fotos = fotosManifest[id]?.images;
  if (fotos && fotos.length > 0) return shuffle(fotos);
  return fallbackUrls.map((url) => ({ src: url, thumb: url }));
}

// Videos reales subidos a public/fotos/<carpeta> (ej: public/fotos/facultad/*.mp4).
function videosDe(id) {
  return fotosManifest[id]?.videos ?? [];
}

export const PERSON = {
  name: "Lola Rovatti",
  menuName: "Lola Rovatti",
  tagline:
    "Una combinación irresistible de belleza, risas, cariño y caprichos",
  photo: ICON_SRC.about,
  status: "Cumple años hoy",
  email: "Los Rovatt",
  phone: "+54 9 3471 67 1869",
};

// "Services" en la original -> tres facetas de la persona
export const FACETS = [
  {
    icon: "❤️",
    title: "Familia",
    text: "Su sostén.",
  },
  {
    icon: "✈️",
    title: "Viajes",
    text: "Llevala a cualquier lugar que le va a gustar",
  },
  {
    icon: "🎯",
    title: "Estudios",
    text: "Futura Ingeniera Industrial.",
  },
];

// "Projects" en la original -> capítulos cronológicos de la vida
export const CHAPTERS = [
  {
    id: "infancia",
    name: "Infancia",
    subtitle: "Los primeros años",
    year: "2007",
    color: "#F0562E",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Dónde empezó todo.",
    body: [
      "Acá va el relato de la infancia: dónde nació, la casa, los abuelos, la primera mascota, el barrio.",
      "Anécdota favorita de esta época.",
    ],
    gallery: fotosDe("infancia", [
      "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "adolescencia",
    name: "Adolescencia",
    subtitle: "La escuela y los amigos",
    year: "2021",
    color: "#E7E2D9",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "falta texto",
    body: [
      "falta texto",
      "falta texto",
    ],
    gallery: fotosDe("adolescencia", [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "facultad",
    name: "La facultad",
    subtitle: "Lo que hoy me toca.",
    year: "2026",
    color: "#FDE68A",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Mi día a día",
    body: [
      "Y si, este momento iba a llegar. Con intriga y una mezcla de emoción y miedo, llegó. Hoy mi día se basa en estudiar, gimnasio, estudiar, comer, dormir, y así en bucle. No me quejo para nada, al contrario, lo estoy disfrutando, conocí gente nueva y me estoy llenando de aprendizajes y valores. Cuando mire para atrás, siendo *me pongo de pie* Ing. Rovatti, la sonrisa nostálgica sabiendo que valió la pena no va a faltar.",
    ],
    gallery: fotosDe("facultad", [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    ]),
    videos: videosDe("facultad"),
  },
  {
    id: "amor",
    name: "Justino",
    subtitle: "falta texto",
    year: "2023",
    color: "#FBCFE8",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "La historia de amor.",
    body: ["Cómo se conocieron, la primera cita, la propuesta, el casamiento."],
    gallery: fotosDe("amor", [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "familia",
    name: "Mi familia",
    subtitle: "Mi sostén y cable a tierra",
    year: "2007-∞",
    color: "#BBF7D0",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Los hijos, la casa, la rutina feliz.",
    body: ["El nacimiento de los hijos, las primeras palabras, las vacaciones."],
    gallery: fotosDe("familia", [
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "hoy",
    name: "Hoy",
    subtitle: "Mi pumple",
    year: "2026",
    color: "#BAE6FD",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Feliz cumpleaños.",
    body: ["terminar texto"],
    gallery: fotosDe("hoy", [
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=800&auto=format&fit=crop",
    ]),
  },
];

// "My Favorites" (pelis/series) en la original -> cosas favoritas de la persona
export const FAVORITES = [
  {
    title: "Mi serie favorita",
    genre: "Margarita • Que tu cuento valga la pena",
    year: "2024",
    badge: "Adictiva",
    quote: "",
    poster: "/margarita.jpg",
  },
  {
    title: "Mi canción",
    genre: "Si tu te vas • TINI",
    year: "2016",
    badge: "Para gritarla en el auto",
    quote: "",
    poster: "/si%20tu%20te%20vas.jpg",
  },
  {
    title: "Un lugar",
    genre: "Viajes • Miami",
    year: "todo el tiempo",
    badge: "Viviría acá",
    quote: "",
    poster: "/miami.png",
  },
  {
    title: "Mi comida",
    genre: "Sushi • Domingo",
    year: "∞",
    badge: "La fija de los domingos",
    quote: "",
    poster: "/sushi.jpg",
  },
];

// La Galería junta TODAS las fotos subidas a public/fotos/<cualquier carpeta>,
// mezcladas al azar. Si todavía no se subió ninguna, usa los placeholders.
const TODAS_LAS_FOTOS = Object.values(fotosManifest).flatMap((f) => f.images ?? []);
export const GALLERY =
  TODAS_LAS_FOTOS.length > 0
    ? shuffle(TODAS_LAS_FOTOS)
    : [
        "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=800&auto=format&fit=crop",
      ].map((url) => ({ src: url, thumb: url }));

// Fotos de los 15 (app "Mis XV"). Subilas a public/fotos/xv y aparecen solas.
export const XV_GALLERY = fotosDe("xv", []);

// Poné el link de Spotify de cada tema en `spotify` (botón "Compartir → Copiar
// enlace" en la app de Spotify). Si lo dejás vacío, la fila no es un link.
export const PLAYLIST = [
  {
    title: "Si Tu Te Vas",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/1N1IdKUArn1vim8cntw4DT",
  },
  {
    title: "ni de ti",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/5irZOI6fACizSRid2rgHqC",
  },
  {
    title: "Cupido (LIVE)",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/1GeYfWVUeyF00F5s5qiLKJ",
  },
  {
    title: "buenos aires",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/3eNenN5eoBwMRNPkmoyk81",
  },
  {
    title: "me voy",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/5AmSJDXYdxaU1B8eCrxaqb",
  },
  {
    title: "Quiero Volver",
    artist: "TINI, Sebastián Yatra",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/4SbgqYgp77oQ2y7rJSjEMp",
  },
  {
    title: "Carne y Hueso",
    artist: "TINI",
    len: "",
    spotify: "https://open.spotify.com/intl-es/track/21dCU6wWhGDjrrvgg7g4NM",
  },
];

// Saludos: la gente los deja en un Google Form aparte; acá se muestra el
// resumen leyendo la hoja de respuestas publicada como CSV.
export const GREETINGS_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1KqUn7n4RxEUbQeIeYjUf4PQ3LgVodfXUCblsH4Vetu8/export?format=csv";
