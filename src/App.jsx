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
import CountdownGate from "./os/CountdownGate.jsx";
import GameApp from "./os/GameApp.jsx";
import FinderApp from "./os/FinderApp.jsx";
import { GlassFilter, GlassDock } from "./components/ui/liquid-glass";
import { WarpBackground } from "./components/ui/wrap-shader";
import MacOSMenuBar from "./components/ui/mac-os-menu-bar";

// Pantalla de "estreno" a pantalla completa que tapa todo el sitio hasta
// esta fecha/hora (local del dispositivo de quien entra). Para probar sin
// esperar, cambiá la fecha; para sacarla del medio (ej. mientras se sigue
// trabajando en el sitio antes del cumple), poné COUNTDOWN_GATE_ENABLED en
// false — así queda desactivada sin borrar el código.
const COUNTDOWN_GATE_ENABLED = true;
const BIRTHDAY_AT = new Date(2026, 8, 18, 0, 0, 0);

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
  { id: "contact", label: "Saludos", emoji: "💌", x: 150, y: 90 },
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
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-[550]"
    >
      <MacOSMenuBar
        appName={PERSON.menuName}
        menus={MENU_BAR}
        className="!rounded-none !border-x-0 !border-t-0"
        onMenuAction={(action) => {
          if (MENU_ACTIONS.has(action)) openApp(action);
        }}
      />
    </motion.div>
  );
}

export default function App() {
  const [wins, setWins] = useState([]);
  const [zTop, setZTop] = useState(200);
  const [animals, setAnimals] = useState(false);
  const [iconPos, setIconPos] = useState({}); // overrides por drag (sólo en la sesión)
  const view = useViewport();
  const { isMobile } = view;
  const dragRef = useRef({ id: null, moved: false });
  const [gateOpen, setGateOpen] = useState(
    () => COUNTDOWN_GATE_ENABLED && new Date() < BIRTHDAY_AT
  );

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

  if (gateOpen) {
    return <CountdownGate target={BIRTHDAY_AT} onReached={() => setGateOpen(false)} />;
  }

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


      {/* Menu bar (MacOSMenuBar) */}
      <TopMenuBar openApp={openApp} />

      {/* Desktop icons (arrastrables) — aparecen escalonados en vez de mostrarse de golpe */}
      {iconLayout.map((ic, i) => {
        const p = iconPos[ic.id];
        return (
          <motion.button
            key={ic.id}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 + i * 0.035, ease: "easeOut" }}
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
          </motion.button>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-2 z-[450] flex justify-center px-2 sm:bottom-3"
      >
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
      </motion.div>

      <GlassFilter />
      <MacCursor />
    </div>
  );
}

function renderApp(win, openApp) {
  if (win.base === "chapter")
    return <ChapterApp chapterId={win.arg} openApp={openApp} />;
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
