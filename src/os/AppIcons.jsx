/**
 * Íconos con estética macOS (Big Sur / Sonoma): squircle con degradé vertical,
 * brillo diagonal, luz radial arriba y bisel interno. Glifos propios y genéricos
 * — NO son el arte de ningún ícono concreto de Apple.
 */

import { useState } from "react";

// squircle 64u (esquinas continuas, tipo superelipse)
const SQ =
  "M32 0C51.2 0 57.6 0 60.8 3.2C64 6.4 64 12.8 64 32C64 51.2 64 57.6 60.8 60.8" +
  "C57.6 64 51.2 64 32 64C12.8 64 6.4 64 3.2 60.8C0 57.6 0 51.2 0 32" +
  "C0 12.8 0 6.4 3.2 3.2C6.4 0 12.8 0 32 0Z";

let uid = 0;

function Tile({ from, to, children, glyphShadow = true }) {
  const id = `ic${uid++}`;
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.05" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={SQ} />
        </clipPath>
        {glyphShadow && (
          <filter id={`${id}-sh`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.28" />
          </filter>
        )}
      </defs>

      <path d={SQ} fill={`url(#${id}-bg)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill={`url(#${id}-sheen)`} />
        <rect width="64" height="64" fill={`url(#${id}-glow)`} />
        <g filter={glyphShadow ? `url(#${id}-sh)` : undefined}>{children}</g>
      </g>
      <path
        d={SQ}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
    </svg>
  );
}

const GLYPHS = {
  // "Su historia" — tarjeta de persona
  story: (
    <Tile from="#9AA6B6" to="#5A6472">
      <circle cx="32" cy="25" r="8.5" fill="#fff" />
      <path d="M16 48c0-9 7-14.5 16-14.5S48 39 48 48v2H16z" fill="#fff" />
    </Tile>
  ),

  // "Galería" — pétalos de color (marca abstracta propia)
  photos: (
    <Tile from="#FFFFFF" to="#ECECEF" glyphShadow={false}>
      <g opacity="0.92">
        {[
          ["#FF9F1C", -90],
          ["#FFC93C", -45],
          ["#3FC46B", 0],
          ["#2E8FEA", 45],
          ["#3B4FE0", 90],
          ["#8B49E8", 135],
          ["#F0439E", 180],
          ["#FF5A5F", -135],
        ].map(([c, deg], i) => (
          <g key={i} transform={`rotate(${deg} 32 32)`}>
            <ellipse cx="32" cy="20" rx="7.4" ry="12" fill={c} />
          </g>
        ))}
        <circle cx="32" cy="32" r="6" fill="#fff" />
      </g>
    </Tile>
  ),

  // "El video" — claqueta de cine
  video: (
    <Tile from="#4A4A4D" to="#161618">
      <g>
        <rect x="12" y="27" width="40" height="24" rx="3.5" fill="#fdfdfd" />
        <path d="M12 21.5h40l-2.6 6.5H14.6z" fill="#e7e7ec" />
        <g fill="#101012">
          <path d="M16 21l4-4.5h5.5L21 21z" />
          <path d="M27 21l4-4.5h5.5L32 21z" />
          <path d="M38 21l4-4.5h5.5L43 21z" />
        </g>
        <path d="M27.5 33l10.5 6-10.5 6z" fill="#101012" />
      </g>
    </Tile>
  ),

  // "Playlist" — música
  music: (
    <Tile from="#FF7A83" to="#F0245F">
      <path
        d="M41 15v22a6.5 6.5 0 1 1-3.2-5.6V22l-13.6 3.4v14.9A6.5 6.5 0 1 1 21 34.7V21.5L41 15z"
        fill="#fff"
      />
    </Tile>
  ),

  // "Saludos" — correo
  mail: (
    <Tile from="#5AACFF" to="#1E6BE0">
      <rect x="11" y="18" width="42" height="28" rx="5.5" fill="#fff" />
      <path
        d="M13.5 21L32 34.5 50.5 21"
        fill="none"
        stroke="#2C7BE5"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Tile>
  ),

  // Finder — carita macOS
  finder: (
    <Tile from="#3AA0FF" to="#0A6CF0">
      <path d="M32 6C20 6 12 16 12 32s8 26 20 26V6Z" fill="#dbeeff" />
      <path d="M32 6c12 0 20 10 20 26S44 58 32 58V6Z" fill="#fff" />
      <path d="M32 6v52" stroke="#0A6CF0" strokeOpacity="0.35" strokeWidth="1.5" />
      <g fill="#0b2a4a">
        <path d="M23 24c1.6 0 3 1.9 3 4.2S24.6 33 23 33s-3-1.9-3-4.8S21.4 24 23 24Z" />
        <path d="M41 24c1.6 0 3 1.9 3 4.2S42.6 33 41 33s-3-1.9-3-4.8S39.4 24 41 24Z" />
      </g>
      <path
        d="M24 41c3 3.4 6 5 8 5s5-1.6 8-5"
        fill="none"
        stroke="#0b2a4a"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Tile>
  ),

  // "Las mascotas" — huella (juego)
  paw: (
    <Tile from="#8FD694" to="#3F9C46">
      <g fill="#fff">
        <ellipse cx="32" cy="40" rx="12" ry="9" />
        <circle cx="18" cy="27" r="5.2" />
        <circle cx="27" cy="20" r="5.2" />
        <circle cx="37" cy="20" r="5.2" />
        <circle cx="46" cy="27" r="5.2" />
      </g>
    </Tile>
  ),

  // "Todo" — carpeta (elemento de UI genérico)
  folder: (
    <Tile from="#8ED2FF" to="#3E9BF0" glyphShadow={false}>
      <path
        d="M9 20.5c0-3 2.4-5.5 5.5-5.5h10.6a5 5 0 0 1 3.9 1.9l2.4 3.1H50c3 0 5.5 2.4 5.5 5.5v2H9z"
        fill="#eaf6ff"
        fillOpacity="0.7"
      />
      <rect x="9" y="22.5" width="46.5" height="25" rx="5" fill="#f4fbff" />
      <rect x="9" y="22.5" width="46.5" height="25" rx="5" fill="#2E86D8" fillOpacity="0.18" />
    </Tile>
  ),
};

/**
 * Imágenes propias para los iconos, servidas desde /public.
 * Clave = id de la app (o "chapter:<id>"). Valor = ruta ABSOLUTA desde /public.
 *
 * Para reemplazar un icono: guardá el archivo en  public/icons/  con el nombre
 * de abajo (respetando mayúsculas y extensión) y recargá. Formatos aceptados:
 * .png / .webp / .svg  (cuadrados, idealmente 512×512, fondo transparente).
 * Si el archivo no existe, se usa el glifo SVG de siempre como respaldo.
 */
export const ICON_SRC = {
  finder: "/icons/finder.png",
  about: "/icons/about.jpeg",
  gallery: "/icons/galeria.jpg",
  reel: "/icons/reel.png",
  music: "/icons/music.jpg",
  contact: "/icons/contact.svg",
  resources: "/icons/todo.png",
  game: "/icons/game.jpg",

  "chapter:infancia": "/icons/chapter-infancia.jpeg",
  "chapter:adolescencia": "/icons/chapter-adolescencia.jpg",
  "chapter:facultad": "/icons/chapter-facultad.jpg",
  "chapter:amor": "/icons/portada%20amor.JPG",
  "chapter:familia": "/icons/chapter-familia.jpeg",
  "chapter:hoy": "/icons/hoy.jpg",
};

// Recorta cualquier imagen propia con el mismo squircle que usan los demás
// iconos, para que el borde quede redondeado sin importar la imagen.
// En mobile el recorte por SVG <image> ya se ve perfecto (no tocar); en
// desktop usamos <img> nativo, que el navegador escala con mejor calidad.
function ImageIcon({ src, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return fallback;
  const id = `img${uid++}`;
  return (
    <>
      <svg
        className="block sm:hidden"
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <path d={SQ} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <image
            href={src}
            x="0"
            y="0"
            width="64"
            height="64"
            preserveAspectRatio="xMidYMid slice"
            onError={() => setFailed(true)}
          />
        </g>
        <path d={SQ} fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1" />
      </svg>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        onError={() => setFailed(true)}
        className="hidden h-full w-full rounded-[22%] border border-white/25 object-cover sm:block"
      />
    </>
  );
}

export function ChapterIcon({ emoji, tint, appId }) {
  const custom = appId && ICON_SRC[appId];
  const id = `ch${uid++}`;
  const tile = (
    <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint} stopOpacity="0.95" />
          <stop offset="1" stopColor={tint} stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path d={SQ} fill={`url(#${id}-g)`} />
      <path d={SQ} fill={`url(#${id}-s)`} />
      <text x="32" y="34" textAnchor="middle" dominantBaseline="central" fontSize="30">
        {emoji}
      </text>
      <path d={SQ} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );

  return <ImageIcon src={custom} fallback={tile} />;
}

export default function AppIcon({ name, appId, className = "" }) {
  const glyph = GLYPHS[name] ?? GLYPHS.folder;
  const src = appId ? ICON_SRC[appId] : null;
  return (
    <span className={`block h-full w-full ${className}`} style={{ lineHeight: 0 }}>
      <ImageIcon src={src} fallback={glyph} />
    </span>
  );
}

export const APP_ICON = {
  about: "story",
  gallery: "photos",
  reel: "video",
  music: "music",
  contact: "mail",
  resources: "folder",
  game: "paw",
  finder: "finder",
};
