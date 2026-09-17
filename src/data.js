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

// Fotos + videos de public/fotos/<carpeta>, mezclados entre sí al azar (los
// videos no van primero ni aparte: se comportan como una foto más). Si la
// carpeta está vacía, se usa el placeholder de Unsplash del capítulo.
function mediaDe(id, fallbackUrls) {
  const fotos = fotosManifest[id]?.images ?? [];
  const videos = fotosManifest[id]?.videos ?? [];
  const items = [
    ...fotos.map((f) => ({ ...f, type: "image" })),
    ...videos.map((v) => ({ src: v, type: "video" })),
  ];
  if (items.length > 0) return shuffle(items);
  return fallbackUrls.map((url) => ({ src: url, thumb: url, type: "image" }));
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
    headerImage: "/portada infancia.jpeg",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Dónde empezó todo.",
    body: [
      "Hace 19 años, nuestras vidas volvieron a empezar.",
      "Después de atravesar uno de esos momentos que cambian para siempre la historia de una familia, un día supimos que una nueva vida estaba creciendo. Y con ella volvieron las ilusiones, los sueños, los preparativos y esa emoción tan especial de volver a ser mamá y papá.",
      "Y entonces llegaste vos, Lo.",
      "Llegaste para escribir tu propia historia, llena de amor, de alegría y de momentos que para siempre van a quedar en nuestro corazón.",
      "Fuiste una niña muy mimada, ¡y también un poquito caprichosa! Pero sobre todo fuiste una niña feliz, querida y rodeada de amor. Con vos volvimos a disfrutar de cada pequeño detalle: tus primeros pasos, tus palabras, tus risas, tus ocurrencias y la creación de palabras únicas, ¡pero muy usadas en la familia!",
      "Nunca viniste a ocupar un lugar. Viniste a ocupar el tuyo. Y con el tiempo llegó Manuela, y nuestra familia siguió creciendo, llenándose de risas, aventuras y de muchas mascotas ¡una felicidad enorme!",
      "Hoy cumplís 19 años y mirar estas fotos es volver a recorrer un pedacito de ese camino y ver cuánto creciste, cuánto nos enseñaste y cuánto amor trajiste a nuestras vidas.",
      "Estamos orgullosos de vos y felices de acompañarte en todo lo que viene.",
      "Feliz cumpleaños, Lo. Que nunca dejes de soñar, de reír y de ser esa persona tan especial que amamos profundamente.",
      "Te amamos con todo nuestro corazón.",
      "Mamá y Papá",
    ],
    gallery: mediaDe("infancia", [
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
    headerImage: "/portada adol.jpeg",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "falta texto",
    body: [
      "falta texto",
      "falta texto",
    ],
    gallery: mediaDe("adolescencia", [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "facultad",
    name: "La facultad",
    subtitle: "Lo que hoy me toca.",
    year: "2026",
    color: "#FDE68A",
    headerImage: "/portada facu.jpg",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Mi día a día",
    body: [
      "Y si, este momento iba a llegar. Con intriga y una mezcla de emoción y miedo, llegó. Hoy mi día se basa en estudiar, gimnasio, estudiar, comer, dormir, y así en bucle. No me quejo para nada, al contrario, lo estoy disfrutando, conocí gente nueva y me estoy llenando de aprendizajes y valores. Cuando mire para atrás, siendo *me pongo de pie* Ing. Rovatti, la sonrisa nostálgica sabiendo que valió la pena no va a faltar.",
    ],
    gallery: mediaDe("facultad", [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "amor",
    name: "Justino",
    subtitle: "2 locos a su locura",
    year: "2023",
    color: "#FBCFE8",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Más de 3 años juntitos",
    body: ["Hay cosas que no cambian y una es el amor que nos tenemos. Pueden haber discusiones, encuentros y lo que sea pero seguimos juntos al pie del cañon siempre. Lo que sobran son recuerdos, y cuántos quedan por vivir. Feliz cumpleaños lolita, que seas feliz hoy y siempre, te amo mucho."],
    gallery: mediaDe("amor", [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "familia",
    name: "Mi familia",
    subtitle: "Mi sostén y cable a tierra",
    year: "2007-∞",
    color: "#BBF7D0",
    headerImage: "/portada familia.jpeg",
    headerImagePosition: "center 85%",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Los hijos, la casa, la rutina feliz.",
    body: ["El nacimiento de los hijos, las primeras palabras, las vacaciones."],
    gallery: mediaDe("familia", [
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop",
    ]),
  },
  {
    id: "hoy",
    name: "Hoy",
    subtitle: "Mi pumple",
    year: "2026",
    color: "#BAE6FD",
    headerImage: "/portada hoy.png",
    get cover() {
      return coverDe(this.id, this.gallery);
    },
    intro: "Feliz cumpleaños lolita, que seas feliz siempre",
    body: ["Personas que te quieren mucho te mandaron saluditos y mensajes de cariño, y acá los vas a poder leer todos."],
    gallery: mediaDe("hoy", [
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
export const XV_HEADER_IMAGE = "/portada xv.jpg";

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
