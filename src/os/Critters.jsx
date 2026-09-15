import { useEffect, useRef, useState } from "react";
import { dropPoop, cleanPoop, subscribePoops } from "./poop.js";

/**
 * Mascotas de escritorio (gato, dogo, pomerania) con la MISMA interacción que
 * el "oneko" original: persiguen el cursor; al alcanzarlo descansan / duermen.
 * Con "¿Te gustan los animales?" apagado, si el mouse se acerca bastante, huyen.
 *
 * Movimiento: bucle requestAnimationFrame (~60fps) con velocidad por segundo
 * => 0 teletransportes. La animación de patas va en su propio reloj.
 *
 * Sheets: public/{gato,dogo,pom}.png — 9 frames de 80x64 (recortados de
 * public/animales-raw.png, 1376x768):
 *   0 idle · 1-2 dormido · 3-4 caminar→(lado) · 5-6 caminar→(espalda/N) · 7-8 caminar→(frente/S)
 * El lado izquierdo se hace volteando los frames de "lado" con scaleX(-1).
 */

// Alto/ancho de viewport con respaldo: en algún frame temprano (o con la
// barra de direcciones de mobile animándose) innerWidth/Height pueden leer 0
// o desactualizado; el respaldo evita que los bichos arranquen en (0,0).
function vw() {
  return window.innerWidth || document.documentElement.clientWidth || 1024;
}
function vh() {
  return window.innerHeight || document.documentElement.clientHeight || 768;
}

const CW = 80;
const CH = 64;
const COLS = 9;
const SETS = {
  idle: [0],
  sleeping: [1, 2],
  side: [3, 4],
  back: [5, 6], // N
  front: [7, 8], // S
};

const FLEE_RADIUS = 105; // "bastante cerca"
const STEP_S = 0.16; // seg. por frame de patas
const SLEEP_AFTER_MS = 4000; // sin interacción -> a dormir

let seq = 0;

// registro de cuerpos: sólo para que NO se superpongan (sin fuerzas raras:
// la corrección actúa únicamente cuando ya se están tocando).
const BODIES = new Map();

function separate(id, x, y, r, dt) {
  for (const [oid, b] of BODIES) {
    if (oid === id) continue;
    let dx = x - b.x;
    let dy = y - b.y;
    let d = Math.hypot(dx, dy);
    const minD = r + b.r + 8;
    if (d < minD) {
      if (d < 0.01) {
        const a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
        d = 1;
      }
      const push = Math.min(minD - d, 220 * dt); // acotado => sin salto
      x += (dx / d) * push;
      y += (dy / d) * push;
    }
  }
  return [x, y];
}

function PixelPet({
  on,
  active,
  sheet,
  scale,
  bodyR,
  speedPxS,
  startX,
  startY,
  fleeBias = 0,
}) {
  const posRef = useRef(null);
  const sprRef = useRef(null);
  const onRef = useRef(on);
  onRef.current = on;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const posEl = posRef.current;
    const sprEl = sprRef.current;
    if (!posEl || !sprEl) return;

    const id = `pet-${seq++}`;
    const HW = (CW * scale) / 2;
    const HH = (CH * scale) / 2;

    let x = startX();
    let y = startY();
    BODIES.set(id, { x, y, r: bodyR });
    let vx = 0;
    let vy = 0;
    // lejos del bicho a propósito: si arrancara igual a (x,y), el primer
    // frame mediría distancia 0 al "mouse" y el modo huir saldría corriendo
    // solo, sin que nadie haya movido el cursor todavía.
    let mouseX = -100000;
    let mouseY = -100000;
    let facing = 1;
    let moving = false;
    let animClock = 0;
    // arranca dormido en el centro; recién se despierta con la primera
    // interacción real (mouse/touch).
    let sleeping = true;
    let last = performance.now();
    // próxima caca de ESTE bicho (sólo si está despierto y en el escritorio)
    // entre caca y caca: 40 s a 1:10
    let nextPoopT = performance.now() + 40000 + Math.random() * 30000;
    // dos relojes de interacción, independientes por bicho: arrancan "vencidos"
    // para que el primer frame ya calcule sleeping=true.
    let lastMouseMoveT = performance.now() - SLEEP_AFTER_MS - 1;
    let lastProximityT = performance.now() - SLEEP_AFTER_MS - 1;

    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (!p) return;
      if (p.clientX !== mouseX || p.clientY !== mouseY) lastMouseMoveT = performance.now();
      mouseX = p.clientX;
      mouseY = p.clientY;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("touchmove", onMove, { passive: true });

    const setFrame = (setName, i) => {
      const arr = SETS[setName];
      const idx = arr[i % arr.length];
      sprEl.style.backgroundPositionX = `${-idx * CW}px`;
    };

    const drawSprite = () => {
      // dirección visual según la velocidad real
      const sp = Math.hypot(vx, vy);
      if (sleeping) {
        setFrame("sleeping", Math.floor(animClock / 0.5));
      } else if (sp < 4 || !moving) {
        setFrame("idle", 0);
      } else {
        const legs = Math.floor(animClock / STEP_S);
        // sector: horizontal salvo que sea claramente vertical
        if (Math.abs(vx) >= Math.abs(vy) * 0.78) {
          facing = vx >= 0 ? 1 : -1;
          setFrame("side", legs);
        } else {
          // sube (vy<0) => se aleja => de espaldas ; baja => de frente
          setFrame(vy < 0 ? "back" : "front", legs);
        }
      }
      // al voltear (scaleX -1) con origen top-left el contenido saltaría CW*scale
      // a la izquierda -> lo compensamos con un translate: se voltea EN EL LUGAR.
      const flipShift = facing < 0 ? CW * scale : 0;
      sprEl.style.transform = `translateX(${flipShift}px) scale(${scale}) scaleX(${facing})`;
    };

    const frame = () => {
      const now = performance.now();
      if (now - last < 6) return; // evita doble-paso (rAF + timer en el mismo ms)
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // pestaña en segundo plano / hipo

      const chase = onRef.current;
      let seek = activeRef.current; // sólo interactúan en el escritorio

      // objetivo: el cursor (como el oneko original)
      let tx = mouseX;
      let ty = mouseY;

      if (seek && !chase) {
        const ax0 = x - mouseX;
        const ay0 = y - mouseY;
        const ad = Math.hypot(ax0, ay0);
        if (ad < FLEE_RADIUS) {
          lastProximityT = now; // el mouse se acercó a ESTE bicho
          const nx = ax0 / (ad || 1);
          const ny = ay0 / (ad || 1);
          const c = Math.cos(fleeBias);
          const s = Math.sin(fleeBias);
          tx = x + (nx * c - ny * s) * 600;
          ty = y + (nx * s + ny * c) * 600;
        } else {
          seek = false;
        }
      }

      // 7 s sin interacción => a dormir. En modo perseguir cuenta el
      // movimiento del mouse (todos juntos); en modo huir cuenta la
      // cercanía a ESTE bicho (cada uno por su lado).
      const interactT = chase ? lastMouseMoveT : lastProximityT;
      sleeping = now - interactT > SLEEP_AFTER_MS;
      if (sleeping) seek = false;

      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;
      const stopDist = chase ? 6 + bodyR : 6;

      let ax = 0;
      let ay = 0;
      if (seek && dist > stopDist) {
        const want = speedPxS * Math.min(1, (dist - stopDist) / 70);
        ax = (dx / dist) * want;
        ay = (dy / dist) * want;
        moving = true;
      } else {
        moving = false;
      }

      // integración: la velocidad persigue a la deseada (suavizado)
      const k = 1 - Math.pow(0.0016, dt);
      vx += (ax - vx) * k;
      vy += (ay - vy) * k;

      x += vx * dt;
      y += vy * dt;

      // no superponerse: corrección sólo si ya se están tocando (acotada)
      [x, y] = separate(id, x, y, bodyR, dt);

      // límites de pantalla (el de arriba respeta la barra de menú)
      x = Math.min(Math.max(HW, x), vw() - HW);
      y = Math.min(Math.max(Math.max(HH, 44), y), vh() - HH);

      const b = BODIES.get(id);
      if (b) {
        b.x = x;
        b.y = y;
      }

      animClock += dt;

      // caca: cada tanto, si está despierto y en el escritorio, deja una
      // a la altura de las patas. Hay que juntarla (PoopLayer).
      if (
        activeRef.current &&
        !sleeping &&
        now > nextPoopT &&
        vw() > 200
      ) {
        const py = Math.min(
          Math.max(y + HH * 0.55, 44), // nunca debajo de la barra de menú
          vh() - 16
        );
        dropPoop(x, py);
        nextPoopT = now + 40000 + Math.random() * 30000;
      }

      posEl.style.transform = `translate(${x - HW}px, ${y - HH}px)`;
      drawSprite();
    };

    posEl.style.transform = `translate(${x - HW}px, ${y - HH}px)`;
    setFrame("sleeping", 0);
    sprEl.style.transform = `translateX(0px) scale(${scale}) scaleX(1)`;

    // rAF = fluidez a 60fps cuando la pestaña está activa;
    // setInterval = respaldo para que no se congele si rAF se limita.
    let raf = 0;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const timer = setInterval(frame, 1000 / 60);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("touchmove", onMove);
      BODIES.delete(id);
    };
  }, []);

  return (
    <div
      ref={posRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: `${CW}px`,
        height: `${CH}px`,
        pointerEvents: "none",
        zIndex: 190,
        willChange: "transform",
      }}
    >
      <div
        ref={sprRef}
        style={{
          width: `${CW}px`,
          height: `${CH}px`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
          backgroundImage: `url(${sheet})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${CW * COLS}px ${CH}px`,
        }}
      />
    </div>
  );
}

// mismos sprites y motor -> estética idéntica. fleeBias distinto -> huyen por lados distintos.
export function Cat({ on, active }) {
  return (
    <PixelPet
      on={on}
      active={active}
      slot={0}
      sheet="/gato.png"
      scale={0.5}
      bodyR={13}
      speedPxS={132}
      fleeBias={-0.55}
      startX={() => vw() / 2}
      startY={() => vh() / 2}
    />
  );
}

export function BigDog({ on, active }) {
  return (
    <PixelPet
      on={on}
      active={active}
      slot={1}
      sheet="/dogo.png"
      scale={0.84}
      bodyR={30}
      speedPxS={150}
      fleeBias={0.5}
      startX={() => vw() / 2}
      startY={() => vh() / 2}
    />
  );
}

export function Pom({ on, active }) {
  return (
    <PixelPet
      on={on}
      active={active}
      slot={2}
      sheet="/pom.png"
      scale={0.64}
      bodyR={22}
      speedPxS={120}
      fleeBias={0}
      startX={() => vw() / 2}
      startY={() => vh() / 2}
    />
  );
}

/**
 * Caca pixel-art (a partir de public/caca-raw.jpg): misma vibra que los bichos
 * —contorno negro grueso, relleno plano, ojitos de pixel— y se menea sola con
 * un squash-and-stretch sutil (keyframes poopJiggle en index.css).
 */
const POOP_PIXELS = [
  "      KKKK      ",
  "     KMMLK      ",
  "     KMMMK      ",
  "    KMMMMMK     ",
  "   KMMLLMMMK    ",
  "   KMMMMMMMMK   ",
  "  KMWEMMMWEMMK  ",
  "  KMMMMMMMMMMK  ",
  "  KMMEMMMEMMMK  ",
  "  KMMMEEEMMMMK  ",
  " KMMMMMMMMMMMMK ",
  " KMMMMMMMMMMMMK ",
  "KMDDDDDDDDDDDDMK",
  "KDDDDDDDDDDDDDDK",
  " KKDDDDDDDDDDKK ",
  "   KKKKKKKKKK   ",
];
const POOP_COLORS = {
  K: "#241009",
  D: "#5f3719",
  M: "#86502a",
  L: "#b07a45",
  W: "#ffffff",
  E: "#241009",
};

function PoopSprite({ size = 20, animate = true, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={className}
      style={{
        transformOrigin: "50% 100%",
        animation: animate ? "poopJiggle 1.6s ease-in-out infinite" : undefined,
      }}
      aria-hidden="true"
    >
      {POOP_PIXELS.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === " " ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={POOP_COLORS[ch]} />
          )
        )
      )}
    </svg>
  );
}

/**
 * Caca de las mascotas: se dibuja donde la dejaron y hay que hacer click para
 * juntarla. Lleva la cuenta de cuántas juntaste.
 */
export function PoopLayer({ hideCounter = false }) {
  const [poops, setPoops] = useState([]);
  const [cleaned, setCleaned] = useState(0);
  const [plusOnes, setPlusOnes] = useState([]); // signifiers "+1" flotantes
  const flashSeq = useRef(0);

  useEffect(() => subscribePoops((p, c) => {
    setPoops(p);
    setCleaned(c);
  }), []);

  const pickUp = (p) => {
    cleanPoop(p.id);
    const key = flashSeq.current++;
    setPlusOnes((list) => [...list, { key, x: p.x, y: p.y }]);
    setTimeout(
      () => setPlusOnes((list) => list.filter((f) => f.key !== key)),
      800
    );
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[185]">
        {poops.map((p) => (
          <button
            key={p.id}
            type="button"
            data-cursor="pointer"
            onClick={() => pickUp(p)}
            aria-label="Juntar la caca"
            className="group pointer-events-auto absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center select-none rounded-full"
            style={{ left: p.x, top: p.y, zIndex: p.id }}
          >
            <span className="leading-none drop-shadow transition-transform duration-100 group-hover:scale-150 group-active:scale-90">
              <PoopSprite size={20} />
            </span>
          </button>
        ))}

        {plusOnes.map((f) => (
          <span
            key={f.key}
            className="absolute select-none text-sm font-bold text-emerald-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
            style={{ left: f.x, top: f.y, animation: "poopPlusOne 0.8s ease-out forwards" }}
          >
            +1
          </span>
        ))}
      </div>

      {!hideCounter && (poops.length > 0 || cleaned > 0) && (
        <div className="hairline fixed bottom-40 left-4 z-[460] flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] text-black/60 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:bottom-16 sm:left-5">
          <span className="inline-flex items-center gap-1">
            <PoopSprite size={13} animate={false} />
            {poops.length} sin juntar
          </span>
          <span className="opacity-40">·</span>
          <span>{cleaned} juntadas</span>
        </div>
      )}
    </>
  );
}
