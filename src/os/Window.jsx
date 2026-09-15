import { motion } from "framer-motion";
import { useRef } from "react";

const TrafficLight = ({ color, onClick, symbol, big }) => (
  <button
    onClick={onClick}
    className={`group grid place-items-center rounded-full ${big ? "h-4 w-4" : "h-3 w-3"}`}
    style={{ background: color }}
  >
    <span className="text-[8px] leading-none text-black/50 opacity-0 group-hover:opacity-100">
      {symbol}
    </span>
  </button>
);

export default function Window({
  win,
  focused,
  mobile,
  onFocus,
  onClose,
  onMinimize,
  children,
}) {
  const constraints = useRef(null);

  if (mobile) {
    // En móvil: hoja casi a pantalla completa, sin arrastrar ni redimensionar.
    // Se frena antes del dock (como en una Mac real, el Dock siempre queda
    // visible y accesible por encima de las ventanas).
    return (
      <motion.div
        onPointerDown={onFocus}
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="hairline fixed inset-x-0 bottom-20 top-7 flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
        style={{ zIndex: win.z }}
      >
        <div className="hairline flex h-11 shrink-0 items-center gap-2.5 border-b border-black/[0.06] px-4">
          <TrafficLight big color="#ff5f57" symbol="×" onClick={onClose} />
          <TrafficLight big color="#febc2e" symbol="–" onClick={onMinimize} />
          <TrafficLight big color="#28c840" symbol="+" onClick={onFocus} />
          <span className="ml-1 truncate text-[13px] font-medium tracking-[-0.01em] text-black/45">
            {win.title}
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-black/50 active:bg-black/5"
          >
            Cerrar
          </button>
        </div>
        <div className="mac-scroll flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* área de arrastre = pantalla menos la barra de menú */}
      <div ref={constraints} className="pointer-events-none fixed inset-0 top-7" />
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraints}
        dragElastic={0}
        onMouseDown={onFocus}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="hairline absolute flex flex-col overflow-hidden rounded-[var(--win-radius)] border border-black/[0.08] bg-white"
        style={{
          width: win.w,
          height: win.h,
          left: win.x,
          top: win.y,
          zIndex: win.z,
          boxShadow: focused
            ? "0 24px 70px -24px rgba(0,0,0,0.32), 0 2px 8px -2px rgba(0,0,0,0.12)"
            : "0 16px 44px -22px rgba(0,0,0,0.22), 0 1px 4px -1px rgba(0,0,0,0.08)",
        }}
      >
        <div
          data-winbar
          className="hairline flex h-9 shrink-0 cursor-grab items-center gap-2 border-b border-black/[0.06] px-4 active:cursor-grabbing"
          onDoubleClick={onMinimize}
        >
          <TrafficLight color="#ff5f57" symbol="×" onClick={onClose} />
          <TrafficLight color="#febc2e" symbol="–" onClick={onMinimize} />
          <TrafficLight color="#28c840" symbol="+" onClick={onFocus} />
          <span className="ml-2 text-[11px] font-medium tracking-[-0.01em] text-black/35">{win.title}</span>
        </div>
        <div className="mac-scroll flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </>
  );
}
