import { FileSystem } from "../components/ui/file-system";
import { CHAPTERS, GALLERY, FAVORITES, PLAYLIST } from "../data.js";

// Cada archivo del Finder es en realidad un ACCESO DIRECTO a la sección del
// sitio de donde viene. El signifier es la flecha "↗" en el nombre; al abrirlo
// (doble-click) se lanza esa app en vez de un visor de imágenes suelto.
// La ruta -> destino se resuelve en ROUTES y se dispara desde onFileOpen.
const LINK = " ↗";

// Tile de color con emoji (data-URI) para las secciones que no tienen imagen.
function iconTile(emoji, from, to) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs>` +
    `<rect width='64' height='64' rx='14' fill='url(#g)'/>` +
    `<text x='32' y='35' text-anchor='middle' dominant-baseline='central' font-size='32'>${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// [path del Finder, destino para openApp(), item para <FileSystem>]
const ENTRIES = [
  // Secciones sueltas (sin carpeta) — accesos directos en la raíz.
  {
    path: `Quien soy${LINK}`,
    target: "about",
    item: {
      kind: "file",
      contentType: "image/svg+xml",
      previewAspectRatio: 1,
      url: iconTile("🧑", "#9AA6B6", "#5A6472"),
      previewImageUrl: iconTile("🧑", "#9AA6B6", "#5A6472"),
    },
  },
  {
    path: `Mis XV${LINK}`,
    target: "reel",
    item: {
      kind: "file",
      contentType: "image/svg+xml",
      previewAspectRatio: 1,
      url: iconTile("🎬", "#4A4A4D", "#161618"),
      previewImageUrl: iconTile("🎬", "#4A4A4D", "#161618"),
    },
  },
  {
    path: `Saludos${LINK}`,
    target: "contact",
    item: {
      kind: "file",
      contentType: "image/svg+xml",
      previewAspectRatio: 1,
      url: iconTile("💌", "#5AACFF", "#1E6BE0"),
      previewImageUrl: iconTile("💌", "#5AACFF", "#1E6BE0"),
    },
  },
  {
    path: `Mis pupis${LINK}`,
    target: "game",
    item: {
      kind: "file",
      contentType: "image/svg+xml",
      previewAspectRatio: 1,
      url: iconTile("🐾", "#7ED9A6", "#37B87A"),
      previewImageUrl: iconTile("🐾", "#7ED9A6", "#37B87A"),
    },
  },

  // Capítulos -> cada uno abre su propia ventana de capítulo.
  ...CHAPTERS.map((c) => ({
    path: `Capítulos/${c.year} · ${c.name}${LINK}.jpg`,
    target: `chapter:${c.id}`,
    item: {
      kind: "file",
      contentType: "image/jpeg",
      size: (c.intro + c.body.join(" ")).length * 900,
      updatedAt: `${c.year}-06-15T12:00:00.000Z`,
      createdAt: `${c.year}-01-01T12:00:00.000Z`,
      url: c.cover,
      previewImageUrl: c.cover,
      previewAspectRatio: 1.5,
    },
  })),

  // Galería -> abre la app Galería.
  ...GALLERY.map((g, i) => ({
    path: `Galería/recuerdo-${String(i + 1).padStart(2, "0")}${LINK}.jpg`,
    target: "gallery",
    item: {
      kind: "file",
      contentType: "image/jpeg",
      updatedAt: "2026-08-20T18:00:00.000Z",
      url: g.src,
      previewImageUrl: g.thumb,
      previewAspectRatio: 1.5,
    },
  })),

  // Favoritos -> viven dentro de "Quien soy".
  ...FAVORITES.map((f) => ({
    path: `Favoritos/${f.title}${LINK}.jpg`,
    target: "about",
    item: {
      kind: "file",
      contentType: "image/jpeg",
      size: (f.quote.length + 40) * 800,
      url: f.poster,
      previewImageUrl: f.poster,
      previewAspectRatio: 0.7,
    },
  })),

  // Música -> abre la Playlist.
  ...PLAYLIST.map((t, i) => ({
    path: `Música/${String(i + 1).padStart(2, "0")} - ${t.title}${LINK}.txt`,
    target: "music",
    item: { kind: "file", contentType: "text/plain", size: 1200 },
  })),
];

const items = [
  { kind: "folder", path: "Capítulos/" },
  { kind: "folder", path: "Galería/" },
  { kind: "folder", path: "Favoritos/" },
  { kind: "folder", path: "Música/" },
  ...ENTRIES.map((e) => ({ ...e.item, path: e.path })),
];

// path (o nombre suelto) -> id de app para openApp()
const ROUTES = new Map(
  ENTRIES.flatMap((e) => {
    const name = e.path.includes("/") ? e.path.slice(e.path.indexOf("/") + 1) : e.path;
    return [
      [e.path, e.target],
      [name, e.target],
    ];
  })
);

export default function FinderApp({ openApp }) {
  return (
    <FileSystem
      items={items}
      title="Lola"
      defaultView="icons"
      className="h-full !rounded-none !border-0"
      onFileOpen={(file) => {
        const target = ROUTES.get(file.path) ?? ROUTES.get(file.name ?? "");
        if (target) openApp?.(target);
      }}
    />
  );
}
