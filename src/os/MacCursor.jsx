import { useEffect, useRef, useState } from "react";

/**
 * Puntero personalizado estilo macOS (flecha negra con borde blanco) que:
 *  - sigue el mouse con un pelín de suavizado ("más animado")
 *  - cambia de forma según lo que haya debajo:
 *      default  -> flecha
 *      pointer  -> manito (botones, links, dock, toggle)
 *      grab/grabbing -> mano abierta / cerrada (iconos y barra de ventana)
 *      text     -> cursor de texto (inputs)
 *  - hace un "pulso" al hacer click
 * En pantallas táctiles no se muestra.
 */

const ARROW = (
  <path
    d="M4 2 L4 22 L9.5 17 L13 25 L16.5 23.5 L13 15.5 L20 15.5 Z"
    fill="#000"
    stroke="#fff"
    strokeWidth="1.4"
    strokeLinejoin="round"
  />
);

const HAND_POINTER = (
  <path
    d="M10 3c-.9 0-1.6.7-1.6 1.6v7.2l-1.2-1.3c-.6-.7-1.7-.7-2.3 0-.5.6-.5 1.5 0 2.1l3.5 4.3c.9 1.1 2.2 1.8 3.7 1.8h2.3c2.4 0 4.3-1.9 4.3-4.3V8.4c0-.9-.7-1.6-1.6-1.6-.3 0-.6.1-.8.2 0-.9-.7-1.6-1.6-1.6-.4 0-.7.1-1 .3-.2-.7-.9-1.3-1.7-1.3-.4 0-.8.2-1.1.4C11.3 3.4 10.7 3 10 3Z"
    fill="#000"
    stroke="#fff"
    strokeWidth="1.3"
    strokeLinejoin="round"
  />
);

const HAND_OPEN = (
  <path
    d="M7 12V7.5a1.4 1.4 0 0 1 2.8 0V11m0 0V5.5a1.4 1.4 0 0 1 2.8 0V11m0 0V6a1.4 1.4 0 0 1 2.8 0v5m0 0V8a1.4 1.4 0 0 1 2.8 0v6.2c0 3-2.2 5.3-5.3 5.3-1.7 0-3.1-.6-4.2-2L5 16c-.5-.7-.4-1.6.3-2.1.6-.5 1.5-.4 2 .2L7 12Z"
    fill="#000"
    stroke="#fff"
    strokeWidth="1.3"
    strokeLinejoin="round"
  />
);

const HAND_GRAB = (
  <path
    d="M7.5 13.5v-3a1.3 1.3 0 0 1 2.6 0m0 0V9a1.3 1.3 0 0 1 2.6 0v1.5m0 0V9.2a1.3 1.3 0 0 1 2.6 0v1.6m0 0a1.3 1.3 0 0 1 2.6 0v3.4c0 3-2.2 5.3-5.3 5.3-1.7 0-3.1-.6-4.2-2l-2.6-3.3c-.5-.7-.4-1.6.3-2.1.6-.5 1.5-.4 2 .2l.8 1Z"
    fill="#000"
    stroke="#fff"
    strokeWidth="1.3"
    strokeLinejoin="round"
  />
);

const IBEAM = (
  <path
    d="M11 3h3M11 21h3M12.5 3v18M9 4c1.5 1 4.5 1 6 0M9 20c1.5-1 4.5-1 6 0"
    fill="none"
    stroke="#000"
    strokeWidth="2"
    strokeLinecap="round"
    style={{ paintOrder: "stroke" }}
  />
);

const SHAPES = {
  default: { svg: ARROW, hotspot: [4, 2] },
  pointer: { svg: HAND_POINTER, hotspot: [12, 4] },
  grab: { svg: HAND_OPEN, hotspot: [12, 11] },
  grabbing: { svg: HAND_GRAB, hotspot: [12, 12] },
  text: { svg: IBEAM, hotspot: [12, 12] },
};

function modeFor(el) {
  if (!el) return "default";
  const n = el.closest?.(
    "button,a,[role='switch'],[data-cursor='pointer'],summary,label"
  );
  if (el.closest?.("[data-cursor='grab']")) return "grab";
  if (el.closest?.("[data-winbar]")) return "grab";
  if (el.closest?.("input,textarea,[contenteditable='true']")) return "text";
  if (n) return "pointer";
  return "default";
}

export default function MacCursor() {
  const ref = useRef(null);
  const [mode, setMode] = useState("default");
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("mac-cursor-on");
    setHidden(false);

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      const m = modeFor(e.target);
      setMode((prev) => (prev === m ? prev : m));
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    const tick = () => {
      // suavizado sutil (más "animado" sin sentirse laggy)
      cx += (tx - cx) * 0.35;
      cy += (ty - cy) * 0.35;
      const el = ref.current;
      if (el) el.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("mac-cursor-on");
    };
  }, []);

  if (hidden) return null;

  // En modo "grab" (iconos / barra de ventana): por defecto se muestra el dedo
  // índice apuntando (pointer). Solo al mantener apretado se cierra la mano.
  let renderMode = mode;
  if (mode === "grab") renderMode = down ? "grabbing" : "pointer";

  const shape = SHAPES[renderMode] ?? SHAPES.default;
  const [hx, hy] = shape.hotspot;
  // Cursor fino, estilo 4K.
  const BASE = 0.62;
  // Las manos (dedo apuntando / puño) se ven mejor un poco más grandes que la flecha.
  const shapeBoost =
    renderMode === "pointer" ? 1.22 : renderMode === "grabbing" ? 1.22 : 1;
  const scale = BASE * shapeBoost * (down ? 0.9 : 1);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2147483647,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <svg
        width="26"
        height="28"
        viewBox="0 0 26 28"
        style={{
          display: "block",
          transform: `translate(${-hx}px, ${-hy}px) scale(${scale})`,
          transformOrigin: `${hx}px ${hy}px`,
          transition: "transform 90ms cubic-bezier(.2,.8,.2,1)",
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,.28))",
        }}
      >
        {shape.svg}
      </svg>
    </div>
  );
}
