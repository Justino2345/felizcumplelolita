import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PERSON, CHAPTERS } from "./data.js";
import Window from "./os/Window.jsx";
import { Cat, BigDog, Pom, PoopLayer } from "./os/Critters.jsx";
import MacCursor from "./os/MacCursor.jsx";
import AppIcon, { ChapterIcon, APP_ICON, ICON_SRC } from "./os/AppIcons.jsx";
import {
  AboutApp,
  ChapterApp,
  ContactApp,
  GalleryApp,
  MusicApp,
  ReelApp,
  ResourcesApp,
} from "./os/apps.jsx";
import GameApp from "./os/GameApp.jsx";
import FinderApp from "./os/FinderApp.jsx";
import { GlassFilter, GlassDock } from "./components/ui/liquid-glass";
import { WarpBackground } from "./components/ui/wrap-shader";
import MacOSMenuBar from "./components/ui/mac-os-menu-bar";

// Fondo de escritorio — Aurora Dream, dominante #ffb7e3
const WALLPAPER = `
  radial-gradient(ellipse 90% 70% at 8% 8%, rgba(255, 183, 227, 0.85), transparent 60%),
  radial-gradient(ellipse 80% 60% at 78% 30%, rgba(255, 214, 238, 0.65), transparent 62%),
  radial-gradient(ellipse 75% 60% at 15% 82%, rgba(255, 120, 200, 0.45), transparent 62%),
  radial-gradient(ellipse 70% 60% at 92% 92%, rgba(255, 183, 227, 0.70), transparent 62%),
  radial-gradient(ellipse 60% 50% at 60% 55%, rgba(200, 150, 255, 0.20), transparent 65%),
  linear-gradient(180deg, #ffd0ec 0%, #ffb7e3 100%)
`;

// Grano fino (SVG feTurbulence) para dar textura/profundidad al fondo plano.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * Capa decorativa del escritorio: minimalista —grano y viñeta.
 * Sin interacción y detrás de los iconos.
 */
function DesktopBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {/* grano */}
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, opacity: 0.6 }}
      />
      {/* viñeta */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 240px 60px rgba(120,40,90,0.22)",
        }}
      />
    </div>
  );
}

// iconos del escritorio (posición de escritorio en x/y; en móvil se acomodan en grilla)
const DESKTOP_ICONS = [
  { id: "about", label: "Quien soy", emoji: "🧑", x: 40, y: 90 },
  { id: "gallery", label: "Galería", emoji: "🖼️", x: 40, y: 200 },
  { id: "reel", label: "Mis XV ", emoji: "🎬", x: 40, y: 310 },
  { id: "music", label: "Playlist", emoji: "🎵", x: 150, y: 200 },
  { id: "game", label: "Mis pupis", emoji: "🐾", x: 40, y: 420 },
  { id: "resources", label: "Todo", emoji: "🗂️", x: "RIGHT", y: 90 },
  ...CHAPTERS.map((c, i) => ({
    id: `chapter:${c.id}`,
    label: c.name,
    emoji: ["👶", "🎒", "🎓", "💞", "🏡", "🎂"][i] ?? "📄",
    tint: c.color || "#6b7280",
    x: 150 + (i % 2) * 110,
    y: 320 + Math.floor(i / 2) * 110,
  })),
];

// Ícono squircle estilo macOS (degradé + brillo + emoji) como data-URI,
// para alimentar el <img> que espera MacOSDock. Si algún día hay PNGs reales
// en public/icons, se puede reemplazar `icon` por esa ruta.
function squircleIcon(emoji, from, to) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>` +
    `<defs>` +
    `<linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient>` +
    `<linearGradient id='s' x1='0' y1='0' x2='0.55' y2='1'>` +
    `<stop offset='0' stop-color='#fff' stop-opacity='0.4'/>` +
    `<stop offset='0.4' stop-color='#fff' stop-opacity='0.05'/>` +
    `<stop offset='1' stop-color='#000' stop-opacity='0.14'/>` +
    `</linearGradient>` +
    `</defs>` +
    `<path d='M32 1.5C50 1.5 55.9 1.5 58.9 4.5C62 7.6 62 13.5 62 32C62 50.5 62 56.4 58.9 59.5C55.9 62.5 50 62.5 32 62.5C14 62.5 8.1 62.5 5.1 59.5C2 56.4 2 50.5 2 32C2 13.5 2 7.6 5.1 4.5C8.1 1.5 14 1.5 32 1.5Z' fill='url(#g)'/>` +
    `<path d='M32 1.5C50 1.5 55.9 1.5 58.9 4.5C62 7.6 62 13.5 62 32C62 50.5 62 56.4 58.9 59.5C55.9 62.5 50 62.5 32 62.5C14 62.5 8.1 62.5 5.1 59.5C2 56.4 2 50.5 2 32C2 13.5 2 7.6 5.1 4.5C8.1 1.5 14 1.5 32 1.5Z' fill='url(#s)'/>` +
    `<text x='32' y='34' text-anchor='middle' dominant-baseline='central' font-size='30'>${emoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// `name` es lo que MacOSDock muestra en el tooltip / usa como aria-label.
// El dock intenta usar el ícono propio de public/icons (ICON_SRC); si ese
// archivo no existe todavía, GlassDock cae solo al squircle con emoji.
const DOCK = [
  { id: "finder", name: "Finder", label: "Finder", emoji: "🗂️", icon: ICON_SRC.finder, fallback: squircleIcon("🗂️", "#8ED2FF", "#3E9BF0") },
  { id: "about", name: "Quien soy", label: "Quien soy", emoji: "🧑", icon: ICON_SRC.about, fallback: squircleIcon("🧑", "#9AA6B6", "#5A6472") },
  { id: "gallery", name: "Galería", label: "Galería", emoji: "🖼️", icon: ICON_SRC.gallery, fallback: squircleIcon("🖼️", "#FFE29A", "#F5B942") },
  { id: "reel", name: "Mis XV", label: "Mis XV", emoji: "🎬", icon: ICON_SRC.reel, fallback: squircleIcon("🎬", "#4A4A4D", "#161618") },
  { id: "music", name: "Playlist", label: "Playlist", emoji: "🎵", icon: ICON_SRC.music, fallback: squircleIcon("🎵", "#FF7A83", "#F0245F") },
  { id: "contact", name: "Saludos", label: "Saludos", emoji: "💌", icon: ICON_SRC.contact, fallback: squircleIcon("💌", "#5AACFF", "#1E6BE0") },
];

const APP_META = {
  about: { title: "Quien soy", w: 720, h: 560 },
  gallery: { title: "Galería", w: 640, h: 520 },
  reel: { title: "Mis XV", w: 680, h: 520 },
  music: { title: "Playlist", w: 380, h: 520 },
  contact: { title: "Saludos", w: 560, h: 560 },
  resources: { title: "Todo en un lugar", w: 520, h: 420 },
  game: { title: "Mis pupis", w: 520, h: 600 },
  finder: { title: "Finder", w: 760, h: 560 },
};

function useViewport() {
  const [v, setV] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1200,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  return { ...v, isMobile: v.w < 640 };
}

// --- Barra de menú superior (componente MacOSMenuBar) ---
const MENU_BAR = [
  {
    label: "Historia",
    items: [
      { label: "Quien soy", action: "about", shortcut: "⌘1" },
      { label: "Galería", action: "gallery", shortcut: "⌘2" },
      { label: "Mis XV", action: "reel", shortcut: "⌘3" },
      { label: "Playlist", action: "music", shortcut: "⌘4" },
      { type: "separator" },
      { label: "Todo en un lugar", action: "resources" },
    ],
  },
  {
    label: "Capítulos",
    items: CHAPTERS.map((c) => ({
      label: `${c.year} · ${c.name}`,
      action: `chapter:${c.id}`,
    })),
  },
  {
    label: "Ayuda",
    items: [
      { label: "Saludos", action: "contact" },
      { label: "Mis pupis", action: "game" },
    ],
  },
];

// acciones válidas -> abrir app/ventana. El menú Apple y otras acciones se ignoran.
const MENU_ACTIONS = new Set([
  "about",
  "gallery",
  "reel",
  "music",
  "resources",
  "contact",
  "game",
  "finder",
  ...CHAPTERS.map((c) => `chapter:${c.id}`),
]);

function TopMenuBar({ openApp }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[550]">
      <MacOSMenuBar
        appName={PERSON.menuName}
        menus={MENU_BAR}
        className="!rounded-none !border-x-0 !border-t-0"
        onMenuAction={(action) => {
          if (MENU_ACTIONS.has(action)) openApp(action);
        }}
      />
    </div>
  );
}

// contorno de "feliz cumple" en cursiva (Dancing Script, tamaño 150, baseline y=0)
// generado con opentype.js -> es un <path> real para poder animar el trazo.
const FC_PATH =
  "M-1.95 42L-1.95 42Q-3.45 42-5.40 41.02Q-7.35 40.05-8.78 37.20Q-10.20 34.35-10.20 28.80L-10.20 28.80Q-10.20 22.20-7.95 11.63Q-5.70 1.05-1.80-11.70Q2.10-24.45 7.20-37.88Q12.30-51.30 18.22-63.82Q24.15-76.35 30.38-86.33Q36.60-96.30 42.60-102.15Q48.60-108 54-108L54-108Q57.15-108 58.13-106.05Q59.10-104.10 59.10-101.40L59.10-101.40Q59.10-94.95 55.57-87.30Q52.05-79.65 46.20-71.92Q40.35-64.20 33.30-57.23Q26.25-50.25 19.05-45.30L19.05-45.30Q18.30-43.50 17.63-41.63Q16.95-39.75 16.20-37.80L16.20-37.80Q17.85-37.50 18.82-36.07Q19.80-34.65 19.95-33L19.95-33Q21-26.25 22.20-20.93Q23.40-15.60 25.88-12.60Q28.35-9.60 33-9.60L33-9.60Q38.25-9.60 41.85-13.42Q45.45-17.25 49.65-24.30L49.65-24.30L51.90-22.80Q48.15-13.80 42.38-9.75Q36.60-5.70 32.25-5.70L32.25-5.70Q29.55-5.70 26.63-7.05Q23.70-8.40 21.15-10.65L21.15-10.65Q21.15-1.20 19.13 8.10Q17.10 17.40 13.80 25.05Q10.50 32.70 6.45 37.35Q2.40 42-1.95 42ZM1.95 34.80L1.95 34.80Q3.60 34.80 5.70 31.80Q7.80 28.80 9.82 23.93Q11.85 19.05 13.50 13.20Q15.15 7.35 16.20 1.50Q17.25-4.35 17.25-9L17.25-9Q17.25-13.65 16.05-17.47Q14.85-21.30 12.15-26.55L12.15-26.55Q8.40-15.30 5.40-4.80Q2.40 5.70 0.75 14.10Q-0.90 22.50-0.90 27.60L-0.90 27.60Q-0.90 34.80 1.95 34.80ZM21.45-51.45L21.45-51.45Q31.20-60.45 38.32-69.52Q45.45-78.60 49.35-85.72Q53.25-92.85 53.25-95.85L53.25-95.85Q53.25-97.95 51.15-97.95L51.15-97.95Q47.25-97.95 42.30-91.58Q37.35-85.20 31.95-74.70Q26.55-64.20 21.45-51.45ZM63 6.60L63 6.60Q53.85 6.60 49.27 1.57Q44.70-3.45 44.70-10.80L44.70-10.80Q44.70-17.55 48.07-25.05Q51.45-32.55 57.07-39.15Q62.70-45.75 69.45-49.88Q76.20-54 82.80-54L82.80-54Q86.25-54 89.17-52.20Q92.10-50.40 92.10-44.85L92.10-44.85Q92.10-39.15 88.72-34.13Q85.35-29.10 79.88-25.20Q74.40-21.30 67.88-18.82Q61.35-16.35 54.90-15.75L54.90-15.75Q54.60-14.25 54.45-12.90Q54.30-11.55 54.30-10.35L54.30-10.35Q54.30-8.10 54.82-5.85Q55.35-3.60 56.70-1.72Q58.05 0.15 60.38 1.20Q62.70 2.25 66.15 2.25L66.15 2.25Q72.60 2.25 78.90-1.43Q85.20-5.10 90.60-11.10Q96-17.10 99.75-24.30L99.75-24.30L101.55-22.95Q97.50-13.95 91.28-7.35Q85.05-0.75 77.77 2.92Q70.50 6.60 63 6.60ZM55.65-18.60L55.65-18.60Q59.70-19.95 64.80-22.57Q69.90-25.20 74.63-28.80Q79.35-32.40 82.42-36.75Q85.50-41.10 85.50-45.90L85.50-45.90Q85.50-47.55 84.90-48.45Q84.30-49.35 82.35-49.35L82.35-49.35Q78.75-49.35 74.70-46.57Q70.65-43.80 66.90-39.30Q63.15-34.80 60.15-29.40Q57.15-24 55.65-18.60ZM109.20 4.50L109.20 4.50Q102.75 4.50 99.97 0.07Q97.20-4.35 97.20-10.95L97.20-10.95Q97.20-18.15 99.90-28.05Q102.60-37.95 107.03-48.90Q111.45-59.85 116.70-70.27Q121.95-80.70 127.20-89.25Q132.45-97.80 136.88-102.90Q141.30-108 143.85-108L143.85-108Q145.50-108 146.55-106.13Q147.60-104.25 148.20-101.63Q148.80-99 148.80-96.90L148.80-96.90Q148.80-92.85 146.78-86.33Q144.75-79.80 141.07-71.77Q137.40-63.75 132.38-55.57Q127.35-47.40 121.42-39.90Q115.50-32.40 108.90-27L108.90-27Q108-22.95 107.47-19.13Q106.95-15.30 106.95-11.85L106.95-11.85Q106.95-6 108.60-3.15Q110.25-0.30 113.55-0.30L113.55-0.30Q117.60-0.30 121.58-3.90Q125.55-7.50 129.07-12.97Q132.60-18.45 135.15-24.30L135.15-24.30L137.40-23.10Q131.40-10.35 124.35-2.92Q117.30 4.50 109.20 4.50ZM110.25-32.10L110.25-32.10Q115.50-37.35 120.45-44.17Q125.40-51 129.68-58.35Q133.95-65.70 137.25-72.60Q140.55-79.50 142.35-84.97Q144.15-90.45 144.15-93.45L144.15-93.45Q144.15-94.95 143.78-95.40Q143.40-95.85 143.10-95.85L143.10-95.85Q141.90-95.85 138.97-92.02Q136.05-88.20 132.15-81.75Q128.25-75.30 124.20-67.05Q120.15-58.80 116.47-49.80Q112.80-40.80 110.25-32.10ZM142.95 3.90L142.95 3.90Q137.10 3.90 134.25 0.22Q131.40-3.45 131.40-8.70L131.40-8.70Q131.40-12.15 132.68-17.40Q133.95-22.65 136.05-28.43Q138.15-34.20 140.93-39.30Q143.70-44.40 146.85-47.63Q150-50.85 153-50.85L153-50.85Q154.35-50.85 155.33-50.02Q156.30-49.20 156.30-47.55L156.30-47.55Q156.30-45.75 153.97-41.70Q151.65-37.65 148.50-32.40Q145.35-27.15 143.03-21.38Q140.70-15.60 140.70-10.35L140.70-10.35Q140.70-4.95 142.50-3.15Q144.30-1.35 148.05-1.35L148.05-1.35Q153.15-1.35 158.93-6.45Q164.70-11.55 171.15-24.30L171.15-24.30L172.50-22.80Q168.15-9.90 159.97-3Q151.80 3.90 142.95 3.90ZM160.95-64.80L160.95-64.80Q158.55-64.80 156.68-66Q154.80-67.20 154.80-69.75L154.80-69.75Q154.80-72.90 158.47-75.22Q162.15-77.55 165.75-77.55L165.75-77.55Q168-77.55 169.35-76.50Q170.70-75.45 170.70-72.90L170.70-72.90Q170.70-70.05 167.63-67.42Q164.55-64.80 160.95-64.80ZM167.55 42L167.55 42Q162.90 42 160.28 40.27Q157.65 38.55 157.65 34.35L157.65 34.35Q157.65 29.55 160.88 25.43Q164.10 21.30 169.50 17.55Q174.90 13.80 181.43 9.97Q187.95 6.15 194.40 1.80L194.40 1.80Q194.40-3.60 192.15-8.10Q189.90-12.60 184.05-17.25L184.05-17.25Q189.30-18.75 192.98-22.50Q196.65-26.25 198.53-30.82Q200.40-35.40 200.40-39.30L200.40-39.30Q200.40-42.75 198.98-45Q197.55-47.25 194.55-47.25L194.55-47.25Q189.60-47.25 185.70-43.50Q181.80-39.75 178.50-33.60Q175.20-27.45 171.75-20.10L171.75-20.10L169.95-21.60Q173.25-30.60 176.78-37.65Q180.30-44.70 185.10-48.82Q189.90-52.95 196.65-52.95L196.65-52.95Q201.75-52.95 205.43-49.65Q209.10-46.35 209.10-40.65L209.10-40.65Q209.10-35.25 206.55-30.60Q204-25.95 199.95-22.43Q195.90-18.90 191.40-16.65L191.40-16.65Q195.30-13.65 197.93-10.28Q200.55-6.90 201.90-3.15L201.90-3.15Q207.60-7.50 212.03-12.67Q216.45-17.85 218.55-24.30L218.55-24.30L220.20-22.50Q218.10-15.75 213.45-10.28Q208.80-4.80 202.80-0.30L202.80-0.30Q203.10 0.75 203.25 2.10Q203.40 3.45 203.40 4.65L203.40 4.65Q203.40 11.40 200.40 18.07Q197.40 24.75 192.30 30.15Q187.20 35.55 180.83 38.77Q174.45 42 167.55 42ZM166.50 37.65L166.50 37.65Q169.20 37.65 173.55 35.48Q177.90 33.30 182.40 29.17Q186.90 25.05 190.20 19.05Q193.50 13.05 194.25 5.25L194.25 5.25Q188.25 9 182.48 12.38Q176.70 15.75 172.05 18.97Q167.40 22.20 164.63 25.57Q161.85 28.95 161.85 32.70L161.85 32.70Q161.85 35.25 163.20 36.45Q164.55 37.65 166.50 37.65ZM270.90 8.40L270.90 8.40Q263.70 8.40 258.90 3.60Q254.10-1.20 254.10-10.80L254.10-10.80Q254.10-18.30 257.03-25.43Q259.95-32.55 264.75-38.25Q269.55-43.95 275.40-47.32Q281.25-50.70 286.95-50.70L286.95-50.70Q293.10-50.70 295.35-47.10Q297.60-43.50 297.60-39.60L297.60-39.60Q297.60-35.25 295.58-31.95Q293.55-28.65 290.10-28.65L290.10-28.65Q287.55-28.65 285.75-30.90L285.75-30.90Q288-32.10 289.65-35.77Q291.30-39.45 291.30-42.75L291.30-42.75Q291.30-44.55 290.63-45.52Q289.95-46.50 288-46.50L288-46.50Q283.95-46.50 279.68-42.90Q275.40-39.30 271.73-33.60Q268.05-27.90 265.73-21.60Q263.40-15.30 263.40-9.75L263.40-9.75Q263.40-5.10 265.65-1.20Q267.90 2.70 274.35 2.70L274.35 2.70Q280.35 2.70 286.43-0.60Q292.50-3.90 297.75-10.05Q303-16.20 306.15-24.45L306.15-24.45L308.10-22.95Q304.65-13.95 298.65-6.83Q292.65 0.30 285.45 4.35Q278.25 8.40 270.90 8.40ZM314.55 4.50L314.55 4.50Q309.45 4.50 306.38-0.07Q303.30-4.65 303.30-10.65L303.30-10.65Q303.30-15 304.73-20.70Q306.15-26.40 308.25-31.95Q310.35-37.50 312.60-41.10Q314.85-44.70 316.50-44.70L316.50-44.70Q317.25-44.70 319.05-43.88Q320.85-43.05 322.05-41.70L322.05-41.70Q320.40-39.15 318-33.90Q315.60-28.65 313.80-22.65Q312-16.65 312-11.55L312-11.55Q312-10.35 312.30-7.88Q312.60-5.40 313.80-3.45Q315-1.50 317.40-1.50L317.40-1.50Q320.25-1.50 323.25-4.42Q326.25-7.35 329.32-12Q332.40-16.65 335.25-22.05Q338.10-27.45 340.57-32.40Q343.05-37.35 344.70-40.65L344.70-40.65Q345.60-40.50 347.32-40.05Q349.05-39.60 350.48-38.85Q351.90-38.10 351.90-36.75L351.90-36.75Q351.90-36.15 350.40-32.77Q348.90-29.40 346.88-24.52Q344.85-19.65 343.35-14.70Q341.85-9.75 341.85-6L341.85-6Q341.85-3.30 342.98-1.65Q344.10 0 346.80 0L346.80 0Q349.95 0 354.45-2.85Q358.95-5.70 363.60-11.17Q368.25-16.65 371.85-24.30L371.85-24.30L373.80-22.95Q370.65-14.85 365.55-8.63Q360.45-2.40 354.75 1.05Q349.05 4.50 343.65 4.50L343.65 4.50Q339.75 4.50 337.43 3Q335.10 1.50 334.13-1.05Q333.15-3.60 333.15-6.60L333.15-6.60Q333.15-8.40 333.45-10.28Q333.75-12.15 334.20-14.10L334.20-14.10Q331.50-9.15 328.35-4.88Q325.20-0.60 321.75 1.95Q318.30 4.50 314.55 4.50ZM444.60 4.65L444.60 4.65Q439.35 4.65 436.95 1.43Q434.55-1.80 434.55-6.30L434.55-6.30Q434.55-10.05 435.68-13.80Q436.80-17.55 437.93-21.15Q439.05-24.75 439.05-27.60L439.05-27.60Q439.05-30.60 437.70-31.80Q436.35-33 434.70-33L434.70-33Q430.95-33 426.52-27.15Q422.10-21.30 415.05-10.65L415.05-10.65Q412.65-7.05 411-3.38Q409.35 0.30 407.85 3.30L407.85 3.30Q406.65 3.30 404.85 3Q403.05 2.70 401.63 2.02Q400.20 1.35 400.20 0.30L400.20 0.30Q400.20-0.75 401.63-4.72Q403.05-8.70 404.93-14.03Q406.80-19.35 408.23-24.82Q409.65-30.30 409.65-34.20L409.65-34.20Q409.65-36.75 408.82-38.32Q408-39.90 405.90-39.90L405.90-39.90Q402.60-39.90 397.95-35.92Q393.30-31.95 388.35-25.50Q383.40-19.05 378.98-11.32Q374.55-3.60 371.85 4.05L371.85 4.05Q370.50 4.05 368.55 3.60Q366.60 3.15 365.18 2.40Q363.75 1.65 363.75 0.90L363.75 0.90Q363.75 0 365.32-4.42Q366.90-8.85 368.93-15.07Q370.95-21.30 372.52-27.75Q374.10-34.20 374.10-39.15L374.10-39.15Q375-40.20 376.95-41.25Q378.90-42.30 381-42.30L381-42.30Q383.10-42.30 384.07-41.25Q385.05-40.20 385.05-38.40L385.05-38.40Q385.05-36.45 383.93-31.72Q382.80-27 381.15-21.30L381.15-21.30Q384.15-26.10 387.98-31.13Q391.80-36.15 396-40.35Q400.20-44.55 404.48-47.17Q408.75-49.80 412.80-49.80L412.80-49.80Q417.45-49.80 419.18-46.42Q420.90-43.05 420.90-38.40L420.90-38.40Q420.90-34.65 420.07-30.52Q419.25-26.40 418.20-22.88Q417.15-19.35 416.25-17.25L416.25-17.25Q419.40-22.95 423.23-28.27Q427.05-33.60 431.55-36.98Q436.05-40.35 441.15-40.35L441.15-40.35Q445.95-40.35 447.82-37.50Q449.70-34.65 449.70-30.75L449.70-30.75Q449.70-26.85 448.35-22.20Q447-17.55 445.57-13.20Q444.15-8.85 444.15-5.70L444.15-5.70Q444.15-3.75 445.13-2.17Q446.10-0.60 448.65-0.60L448.65-0.60Q452.85-0.60 456.52-4.42Q460.20-8.25 463.35-13.72Q466.50-19.20 468.75-24.30L468.75-24.30L470.55-22.20Q468.15-15.90 464.40-9.67Q460.65-3.45 455.63 0.60Q450.60 4.65 444.60 4.65ZM456.45 42L456.45 42Q455.25 42 454.13 40.73Q453 39.45 452.40 38.02Q451.80 36.60 451.80 36.30L451.80 36.30Q453.90 28.95 455.92 23.18Q457.95 17.40 459.97 11.32Q462 5.25 463.95-2.92Q465.90-11.10 468-23.25Q470.10-35.40 472.20-53.40L472.20-53.40Q472.35-54.75 472.80-55.35Q473.25-55.95 475.05-55.95L475.05-55.95Q478.95-55.95 480.60-53.77Q482.25-51.60 482.25-49.05L482.25-49.05Q482.25-46.95 481.35-41.55Q480.45-36.15 478.80-28.80L478.80-28.80Q481.35-33.75 485.17-38.85Q489-43.95 493.95-47.40Q498.90-50.85 504.75-50.85L504.75-50.85Q511.35-50.85 515.63-46.13Q519.90-41.40 519.90-33.75L519.90-33.75Q519.90-27.90 517.27-21.38Q514.65-14.85 509.92-9.07Q505.20-3.30 498.75 0.30Q492.30 3.90 484.50 3.90L484.50 3.90Q480.60 3.90 478.20 3Q475.80 2.10 475.80 1.20L475.80 1.20Q475.80 0.60 476.92 0.53Q478.05 0.45 479.55 0.45L479.55 0.45Q485.55 0.45 491.02-2.48Q496.50-5.40 500.85-10.20Q505.20-15 507.67-20.85Q510.15-26.70 510.15-32.40L510.15-32.40Q510.15-37.20 508.13-40.57Q506.10-43.95 501.60-43.95L501.60-43.95Q497.70-43.95 493.88-41.48Q490.05-39 486.67-35.17Q483.30-31.35 480.67-27.22Q478.05-23.10 476.70-19.80L476.70-19.80Q474-8.55 471.30 1.88Q468.60 12.30 466.13 20.77Q463.65 29.25 461.63 34.65Q459.60 40.05 458.25 41.25L458.25 41.25Q457.50 42 456.45 42ZM537 4.50L537 4.50Q530.55 4.50 527.77 0.07Q525-4.35 525-10.95L525-10.95Q525-18.15 527.70-28.05Q530.40-37.95 534.82-48.90Q539.25-59.85 544.50-70.27Q549.75-80.70 555-89.25Q560.25-97.80 564.67-102.90Q569.10-108 571.65-108L571.65-108Q573.30-108 574.35-106.13Q575.40-104.25 576-101.63Q576.60-99 576.60-96.90L576.60-96.90Q576.60-92.85 574.57-86.33Q572.55-79.80 568.88-71.77Q565.20-63.75 560.17-55.57Q555.15-47.40 549.22-39.90Q543.30-32.40 536.70-27L536.70-27Q535.80-22.95 535.27-19.13Q534.75-15.30 534.75-11.85L534.75-11.85Q534.75-6 536.40-3.15Q538.05-0.30 541.35-0.30L541.35-0.30Q545.40-0.30 549.38-3.90Q553.35-7.50 556.88-12.97Q560.40-18.45 562.95-24.30L562.95-24.30L565.20-23.10Q559.20-10.35 552.15-2.92Q545.10 4.50 537 4.50ZM538.05-32.10L538.05-32.10Q543.30-37.35 548.25-44.17Q553.20-51 557.47-58.35Q561.75-65.70 565.05-72.60Q568.35-79.50 570.15-84.97Q571.95-90.45 571.95-93.45L571.95-93.45Q571.95-94.95 571.57-95.40Q571.20-95.85 570.90-95.85L570.90-95.85Q569.70-95.85 566.77-92.02Q563.85-88.20 559.95-81.75Q556.05-75.30 552-67.05Q547.95-58.80 544.27-49.80Q540.60-40.80 538.05-32.10ZM576.15 6.60L576.15 6.60Q567.00 6.60 562.42 1.57Q557.85-3.45 557.85-10.80L557.85-10.80Q557.85-17.55 561.22-25.05Q564.60-32.55 570.22-39.15Q575.85-45.75 582.60-49.88Q589.35-54 595.95-54L595.95-54Q599.40-54 602.32-52.20Q605.25-50.40 605.25-44.85L605.25-44.85Q605.25-39.15 601.87-34.13Q598.50-29.10 593.02-25.20Q587.55-21.30 581.02-18.82Q574.50-16.35 568.05-15.75L568.05-15.75Q567.75-14.25 567.60-12.90Q567.45-11.55 567.45-10.35L567.45-10.35Q567.45-8.10 567.97-5.85Q568.50-3.60 569.85-1.72Q571.20 0.15 573.52 1.20Q575.85 2.25 579.30 2.25L579.30 2.25Q585.75 2.25 592.05-1.43Q598.35-5.10 603.75-11.10Q609.15-17.10 612.90-24.30L612.90-24.30L614.70-22.95Q610.65-13.95 604.42-7.35Q598.20-0.75 590.92 2.92Q583.65 6.60 576.15 6.60ZM568.80-18.60L568.80-18.60Q572.85-19.95 577.95-22.57Q583.05-25.20 587.77-28.80Q592.50-32.40 595.57-36.75Q598.65-41.10 598.65-45.90L598.65-45.90Q598.65-47.55 598.05-48.45Q597.45-49.35 595.50-49.35L595.50-49.35Q591.90-49.35 587.85-46.57Q583.80-43.80 580.05-39.30Q576.30-34.80 573.30-29.40Q570.30-24 568.80-18.60Z";

// Pantalla de carga estilo "hello" de macOS: "feliz cumple" se dibuja de un
// trazo (revelado izq→der con una "pluma") y la letra es de vidrio líquido.
const FC_VIEW = { x: -30, y: -142, w: 690, h: 224 };
const FC_DRAW_MS = 2400;
const FC_EASE = "cubic-bezier(0.62, 0.02, 0.34, 1)";
const FC_VBOX = `${FC_VIEW.x} ${FC_VIEW.y} ${FC_VIEW.w} ${FC_VIEW.h}`;
const FC_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${FC_VBOX}'><path d='${FC_PATH}' fill='black'/></svg>`
)}")`;

function HelloBoot() {
  return (
    <div
      className="relative w-[min(82vw,880px)]"
      style={{
        animation: `fcReveal ${FC_DRAW_MS}ms ${FC_EASE} forwards`,
        willChange: "clip-path",
      }}
    >
      {/* vidrio líquido real: frosteo del fondo con la forma de la letra */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backdropFilter: "blur(5px) brightness(1.12) saturate(1.5)",
          WebkitBackdropFilter: "blur(5px) brightness(1.12) saturate(1.5)",
          background: "rgba(255, 255, 255, 0.10)",
          maskImage: FC_MASK,
          WebkitMaskImage: FC_MASK,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />

      <svg
        viewBox={FC_VBOX}
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label="feliz cumple"
      >
        <defs>
          <filter id="hello-glass" x="-25%" y="-60%" width="150%" height="220%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="7"
              floodColor="rgba(74, 21, 51, 0.30)"
            />
            <feSpecularLighting
              in="SourceAlpha"
              surfaceScale="8"
              specularConstant="1.5"
              specularExponent="18"
              lightingColor="#ffffff"
              result="spec"
            >
              <fePointLight x="-280" y="-340" z="440" />
            </feSpecularLighting>
            <feComposite
              in="spec"
              in2="SourceAlpha"
              operator="in"
              result="specClip"
            />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="specClip" />
            </feMerge>
          </filter>
        </defs>

        {/* cuerpo translúcido + reborde brillante */}
        <path
          d={FC_PATH}
          fill="rgba(255, 255, 255, 0.22)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.4"
          filter="url(#hello-glass)"
        />
        {/* fino contorno de tinta que le da definición al trazo */}
        <path
          d={FC_PATH}
          fill="none"
          stroke="rgba(74, 21, 51, 0.45)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      {/* la "pluma" que va dejando el trazo */}
      <svg
        viewBox={FC_VBOX}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <circle
          cx={-6}
          cy={-18}
          r="6"
          fill="#4a1533"
          style={{ animation: `fcNib ${FC_DRAW_MS}ms ${FC_EASE} forwards` }}
        />
      </svg>
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [wins, setWins] = useState([]);
  const [zTop, setZTop] = useState(200);
  const [animals, setAnimals] = useState(false);
  const [iconPos, setIconPos] = useState({}); // overrides por drag (sólo en la sesión)
  const view = useViewport();
  const { isMobile } = view;
  const dragRef = useRef({ id: null, moved: false });

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 3600);
    return () => clearTimeout(t);
  }, []);

  const focus = useCallback((key) => {
    setZTop((z) => {
      const nz = z + 1;
      setWins((w) => w.map((x) => (x.key === key ? { ...x, z: nz, min: false } : x)));
      return nz;
    });
  }, []);

  const openApp = useCallback(
    (rawId) => {
      const [base, arg] = rawId.split(":");
      const key = rawId;
      setWins((w) => {
        const found = w.find((x) => x.key === key);
        if (found) {
          setZTop((z) => z + 1);
          return w.map((x) =>
            x.key === key ? { ...x, min: false, z: zTop + 1 } : x
          );
        }
        const meta =
          base === "chapter"
            ? {
                title: CHAPTERS.find((c) => c.id === arg)?.name ?? "Capítulo",
                w: 640,
                h: 560,
              }
            : APP_META[base] ?? { title: base, w: 640, h: 520 };
        const offset = w.length * 26;
        const nz = zTop + 1;
        setZTop(nz);
        return [
          ...w,
          {
            key,
            base,
            arg,
            title: meta.title,
            w: meta.w,
            h: meta.h,
            x: 120 + offset,
            y: 80 + offset,
            z: nz,
            min: false,
          },
        ];
      });
    },
    [zTop]
  );

  const closeWin = (key) => setWins((w) => w.filter((x) => x.key !== key));
  const minWin = (key) =>
    setWins((w) => w.map((x) => (x.key === key ? { ...x, min: true } : x)));
  const minimizeAll = () =>
    setWins((w) => w.map((x) => (x.min ? x : { ...x, min: true })));

  const openWins = wins.filter((w) => !w.min);
  const topKey = useMemo(
    () => [...openWins].sort((a, b) => b.z - a.z)[0]?.key ?? null,
    [wins]
  );
  const onDesktop = openWins.length === 0; // los animales sólo interactúan acá

  // Posiciones por defecto de los iconos según viewport
  const iconLayout = useMemo(() => {
    if (isMobile) {
      const cols = 3;
      const cw = view.w / cols;
      return DESKTOP_ICONS.map((ic, i) => ({
        ...ic,
        dx: Math.round((i % cols) * cw + (cw - 76) / 2),
        dy: 44 + Math.floor(i / cols) * 100,
      }));
    }
    return DESKTOP_ICONS.map((ic) => ({
      ...ic,
      dx: ic.x === "RIGHT" ? view.w - 110 : ic.x,
      dy: ic.y,
    }));
  }, [isMobile, view.w]);

  // --- arrastre de iconos (mantener apretado y mover) ---
  const startIconDrag = (e, id) => {
    if (e.button === 2) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left;
    const originY = rect.top;
    dragRef.current = { id, moved: false };

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!dragRef.current.moved && Math.hypot(dx, dy) < 5) return;
      dragRef.current.moved = true;
      const nx = Math.max(2, Math.min(window.innerWidth - 82, originX + dx));
      const ny = Math.max(30, Math.min(window.innerHeight - 96, originY + dy));
      setIconPos((p) => ({ ...p, [id]: { x: nx, y: ny } }));
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const activateIcon = (id) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    openApp(id);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-cover bg-center"
      style={{ background: "#ffb7e3" }}
      onPointerDown={(e) => {
        // click en el escritorio vacío -> minimizar todo lo abierto
        if (e.target === e.currentTarget) minimizeAll();
      }}
    >
      {/* Fondo: shader Warp teñido al magenta del sitio */}
      <WarpBackground />
      <DesktopBackdrop />

      {/* Boot screen */}
      <AnimatePresence>
        {!booted && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 z-[999] grid place-items-center overflow-hidden"
            style={{ background: WALLPAPER }}
          >
            <HelloBoot />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu bar (MacOSMenuBar) */}
      <TopMenuBar openApp={openApp} />

      {/* Desktop icons (arrastrables) */}
      {iconLayout.map((ic) => {
        const p = iconPos[ic.id];
        return (
          <button
            key={ic.id}
            data-cursor="grab"
            onPointerDown={(e) => startIconDrag(e, ic.id)}
            onClick={() => isMobile && activateIcon(ic.id)}
            onDoubleClick={() => !isMobile && activateIcon(ic.id)}
            className="absolute z-[10] flex w-[76px] touch-none select-none flex-col items-center gap-1 rounded-lg p-2 text-center text-[11px] font-normal tracking-[-0.005em] text-white/95 [text-shadow:0_1px_3px_rgba(0,0,0,0.28)] hover:bg-white/10 active:bg-white/15 sm:w-20"
            style={{ left: p ? p.x : ic.dx, top: p ? p.y : ic.dy }}
          >
            <span className="h-12 w-12 drop-shadow-[0_1px_3px_rgba(0,0,0,0.22)]">
              {ic.id.startsWith("chapter:") ? (
                <ChapterIcon emoji={ic.emoji} tint={ic.tint} appId={ic.id} />
              ) : (
                <AppIcon name={APP_ICON[ic.id] ?? "folder"} appId={ic.id} />
              )}
            </span>
            <span className="line-clamp-2 leading-tight">{ic.label}</span>
          </button>
        );
      })}

      {/* Windows */}
      <AnimatePresence>
        {wins
          .filter((w) => !w.min)
          .map((win) => (
            <Window
              key={win.key}
              win={win}
              mobile={isMobile}
              focused={win.key === topKey}
              onFocus={() => focus(win.key)}
              onClose={() => closeWin(win.key)}
              onMinimize={() => minWin(win.key)}
            >
              {renderApp(win, openApp)}
            </Window>
          ))}
      </AnimatePresence>

      {/* Widgets de escritorio (toggle de mascotas): igual que los íconos del
          escritorio en una Mac real, quedan tapados cuando hay una app
          abierta en móvil (pantalla completa). */}
      {(!isMobile || onDesktop) && (
        <button
          type="button"
          role="switch"
          aria-checked={animals}
          aria-label="¿Te gustan los animales?"
          onClick={() => setAnimals((a) => !a)}
          className="hairline group absolute bottom-24 left-4 z-[460] flex cursor-pointer items-center gap-2.5 rounded-full border border-white/50 bg-white/60 px-3.5 py-2 text-[11px] font-medium tracking-[-0.01em] text-black/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition hover:bg-white/80 active:scale-[0.98] sm:bottom-5 sm:left-5"
        >
          ¿Te gustan los animales?
          <span
            className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ${
              animals ? "bg-emerald-500" : "bg-black/25 group-hover:bg-black/35"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all duration-200 ${
                animals ? "left-3.5" : "left-0.5"
              }`}
            />
          </span>
        </button>
      )}
      <Cat on={animals} active={onDesktop} />
      <BigDog on={animals} active={onDesktop} />
      <Pom on={animals} active={onDesktop} />
      <PoopLayer hideCounter={isMobile && !onDesktop} />

      {/* Barra de navegación — GlassDock (efecto liquid glass). Como en una
          Mac real, el Dock siempre queda visible y clickeable por encima de
          las ventanas abiertas. */}
      <div className="absolute inset-x-0 bottom-2 z-[450] flex justify-center px-2 sm:bottom-3">
        <GlassDock
          icons={DOCK.map((d) => ({
            src: d.icon,
            fallbackSrc: d.fallback,
            alt: d.name,
            onClick: () => {
              const w = wins.find((x) => x.key === d.id);
              // si ya está abierta y visible -> se minimiza (toggle);
              // si está minimizada o cerrada -> se abre / restaura y enfoca
              if (w && !w.min) minWin(d.id);
              else openApp(d.id);
            },
          }))}
        />
      </div>

      <GlassFilter />
      <MacCursor />
    </div>
  );
}

function renderApp(win, openApp) {
  if (win.base === "chapter") return <ChapterApp chapterId={win.arg} />;
  switch (win.base) {
    case "about":
      return <AboutApp openChapter={(id) => openApp(`chapter:${id}`)} />;
    case "gallery":
      return <GalleryApp />;
    case "reel":
      return <ReelApp />;
    case "music":
      return <MusicApp />;
    case "contact":
      return <ContactApp />;
    case "resources":
      return <ResourcesApp openApp={openApp} />;
    case "game":
      return <GameApp />;
    case "finder":
      return <FinderApp openApp={openApp} />;
    default:
      return null;
  }
}
