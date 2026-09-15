/**
 * Store mínimo para la caca de las mascotas de escritorio.
 * Los bichos (Critters.jsx) llaman a dropPoop() desde su loop imperativo;
 * PoopLayer se suscribe y la dibuja como elementos clickeables para juntar.
 */

let poops = [];
let cleaned = 0;
let nextId = 1;
const MAX_POOPS = 12; // techo para que el escritorio no sea un desastre total

const subs = new Set();
const emit = () => {
  for (const fn of subs) fn(poops, cleaned);
};

// Las cacas se pueden tocar entre sí (pila apretada), pero con 20px mínimos
// entre centros ninguna queda tapada del todo: el centro de cada una siempre
// asoma (el emoji mide ~20px y el hitbox 24px), así que siempre es clickeable.
const MIN_GAP = 20;
const MARGIN_TOP = 56; // debajo de la barra de menú
const MARGIN_DOCK = 112; // encima del dock (si no, queda tapada)
const MARGIN_SIDE = 24;

function viewport() {
  if (typeof window === "undefined") return [1200, 800];
  const w =
    window.innerWidth ||
    document.documentElement?.clientWidth ||
    1200;
  const h =
    window.innerHeight ||
    document.documentElement?.clientHeight ||
    800;
  return [w, h];
}

function clampToDesktop(x, y) {
  const [w, h] = viewport();
  return [
    Math.min(Math.max(x, MARGIN_SIDE), w - MARGIN_SIDE),
    Math.min(Math.max(y, MARGIN_TOP), h - MARGIN_DOCK),
  ];
}

// Si la caca nueva cae encima de otra, la empujamos lo justo para que salga del
// grupo (relajación local: se mueve poco y se queda cerca de donde la dejaron).
function spread(x, y) {
  for (let iter = 0; iter < 16; iter++) {
    let moved = false;
    for (const p of poops) {
      let dx = x - p.x;
      let dy = y - p.y;
      let d = Math.hypot(dx, dy);
      if (d >= MIN_GAP) continue;
      moved = true;
      if (d < 0.01) {
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
        d = 1;
      }
      const push = MIN_GAP - d;
      x += (dx / d) * push;
      y += (dy / d) * push;
    }
    if (!moved) break;
  }
  return clampToDesktop(x, y);
}

export function dropPoop(x, y) {
  if (poops.length >= MAX_POOPS) return;
  const [cx, cy] = clampToDesktop(x, y);
  const [nx, ny] = spread(cx, cy);
  poops = [...poops, { id: nextId++, x: nx, y: ny }];
  emit();
}

export function cleanPoop(id) {
  const before = poops.length;
  poops = poops.filter((p) => p.id !== id);
  if (poops.length < before) cleaned += 1;
  emit();
}

export function subscribePoops(fn) {
  subs.add(fn);
  fn(poops, cleaned);
  return () => subs.delete(fn);
}

// Ayuda de desarrollo: permite disparar/juntar cacas desde la consola.
if (typeof window !== "undefined" && import.meta.env?.DEV) {
  window.__poop = {
    drop: dropPoop,
    clean: cleanPoop,
    reset: () => {
      poops = [];
      cleaned = 0;
      emit();
    },
    get state() {
      return { poops, cleaned };
    },
  };
}
