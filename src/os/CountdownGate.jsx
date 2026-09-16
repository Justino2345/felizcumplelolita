import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WarpBackground } from "../components/ui/wrap-shader";

// Pantalla de espera a pantalla completa (estilo "estreno" de YouTube):
// tapa TODO el sitio, sin forma de entrar, hasta que llegue `target`.
// Reutiliza el mismo shader magenta y grano del escritorio para que no se
// sienta una pantalla aparte, sólo un capítulo previo.
function useCountdown(target) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (now >= target) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [now, target]);
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    reached: diff <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function TimeBox({ value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-lg backdrop-blur-md sm:h-20 sm:w-20">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.25)] sm:text-4xl"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/70">{label}</span>
    </motion.div>
  );
}

// Mascotas dormidas de adorno: mismos sprites del escritorio (frames 1-2 =
// "dormido"), pero sin el motor de persecución/huida — sólo respiran despacio.
function SleepingPet({ sheet, scale, flip, className = "", delay = 0 }) {
  const CW = 80;
  const CH = 64;
  const COLS = 9;
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f === 1 ? 2 : 1)), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -2, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`pointer-events-none ${className}`}
      style={{ width: CW * scale, height: CH * scale, imageRendering: "pixelated" }}
    >
      {/* El flip va en un wrapper aparte, del tamaño YA escalado, para que
          scaleX(-1) espeje sobre su propio centro en vez de "correrse" hacia
          afuera de la caja (que es lo que pasa si se combina con scale() en
          el mismo transform con origen top-left). */}
      <div style={{ width: "100%", height: "100%", transform: flip ? "scaleX(-1)" : undefined }}>
        <div
          style={{
            width: CW,
            height: CH,
            backgroundImage: `url(${sheet})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${CW * COLS}px ${CH}px`,
            backgroundPosition: `-${frame * CW}px 0`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </motion.div>
  );
}

/**
 * `target`: Date a la que se desbloquea el sitio.
 * `onReached`: se llama (una vez) apenas se llega a esa fecha/hora, para que
 * el que lo monta pueda dejar de renderizar el gate sin necesitar refrescar.
 */
export default function CountdownGate({ target, onReached }) {
  const { reached, days, hours, minutes, seconds } = useCountdown(target);

  useEffect(() => {
    if (reached) onReached?.();
  }, [reached, onReached]);

  return (
    <div className="fixed inset-0 z-[2147483647] overflow-hidden bg-[#ffb7e3]">
      <WarpBackground />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, opacity: 0.6 }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 240px 60px rgba(120,40,90,0.22)" }}
      />

      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.35em] text-white/70 [text-shadow:0_1px_3px_rgba(0,0,0,0.25)]"
        >
          Estreno
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-4 text-3xl font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.25)] sm:text-4xl"
        >
          Ch ch ch, no seas ansiosa
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-2 max-w-xs text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]"
        >
          Nos vemos en...
        </motion.p>

        {/* Fila del reloj. En desktop las mascotas se anclan a ESTA caja
            (flanqueando el reloj); en mobile no entran al costado, así que
            van todas juntas debajo (ver más abajo) — dos organizaciones
            distintas según el ancho de pantalla. */}
        <div className="relative mt-10 flex items-center gap-4 sm:gap-8">
          <SleepingPet
            sheet="/gato.png"
            scale={1.15}
            delay={0.2}
            className="absolute right-full top-1/2 mr-14 hidden -translate-y-1/2 sm:block"
          />
          <TimeBox value={days} label="días" delay={0.25} />
          <TimeBox value={hours} label="hs" delay={0.32} />
          <TimeBox value={minutes} label="min" delay={0.39} />
          <TimeBox value={seconds} label="seg" delay={0.46} />
          <SleepingPet
            sheet="/dogo.png"
            scale={1.35}
            flip
            delay={0.5}
            className="absolute left-full top-1/2 ml-14 hidden -translate-y-1/2 sm:block"
          />
        </div>

        {/* Desktop: pom debajo, centrado. */}
        <div className="mt-6 hidden justify-center sm:flex">
          <SleepingPet sheet="/pom.png" scale={1} delay={0.8} />
        </div>

        {/* Mobile: no hay lugar a los costados del reloj, así que las tres
            mascotas van juntas en una fila debajo. */}
        <div className="mt-6 flex items-end justify-center gap-5 sm:hidden">
          <SleepingPet sheet="/gato.png" scale={0.85} delay={0.2} />
          <SleepingPet sheet="/pom.png" scale={0.75} delay={0.5} />
          <SleepingPet sheet="/dogo.png" scale={1} flip delay={0.8} />
        </div>
      </div>
    </div>
  );
}
