import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Atrapá a las mascotas" — mini juego tipo whac-a-mole con los 3 animales
 * (gato, dogo, pomerania). Aparecen y desaparecen de los pozos del jardín;
 * hacé click antes de que se escondan. 30 segundos. El récord queda guardado.
 *
 * Usa las mismas sprite sheets que las mascotas de escritorio
 * (public/{gato,dogo,pom}.png — 9 frames de 80x64).
 */

const SPRITE_W = 80;
const SPRITE_H = 64;
const FRAMES = 9;

const ANIMALS = [
  { id: "gato", sheet: "/gato.png", name: "Kitty", pts: 3, tint: "#f4a259" },
  { id: "pom", sheet: "/pom.png", name: "Terri", pts: 2, tint: "#e8b04b" },
  { id: "dogo", sheet: "/dogo.png", name: "Julio", pts: 1, tint: "#9c7a5b" },
];

const SLOTS = 9;
const GAME_MS = 30000;
const BEST_KEY = "lola-mascotas-record";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function writeBest(v) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* ignore */
  }
}

function Sprite({ sheet, frame }) {
  return (
    <div
      style={{
        width: SPRITE_W,
        height: SPRITE_H,
        backgroundImage: `url(${sheet})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${SPRITE_W * FRAMES}px ${SPRITE_H}px`,
        backgroundPositionX: `${-frame * SPRITE_W}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

export default function GameApp() {
  const [phase, setPhase] = useState("intro"); // intro | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [timeLeft, setTimeLeft] = useState(Math.round(GAME_MS / 1000));
  const [holes, setHoles] = useState(() => Array(SLOTS).fill(null));
  const [pops, setPops] = useState([]);

  // estado mutable del juego (no provoca renders)
  const game = useRef({
    running: false,
    endsAt: 0,
    nextSpawnAt: 0,
    hideAt: Array(SLOTS).fill(0),
    slots: Array(SLOTS).fill(null),
  });
  const scoreRef = useRef(0);

  const start = useCallback(() => {
    const now = performance.now();
    const g = game.current;
    g.running = true;
    g.endsAt = now + GAME_MS;
    g.nextSpawnAt = now + 400;
    g.hideAt = Array(SLOTS).fill(0);
    g.slots = Array(SLOTS).fill(null);
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(Math.round(GAME_MS / 1000));
    setHoles(Array(SLOTS).fill(null));
    setPops([]);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const g = game.current;

    const loop = setInterval(() => {
      if (!g.running) return;
      const now = performance.now();

      // fin del juego
      if (now >= g.endsAt) {
        g.running = false;
        g.slots = Array(SLOTS).fill(null);
        setHoles(g.slots.slice());
        setTimeLeft(0);
        setPhase("over");
        return;
      }

      let changed = false;

      // esconder los que ya cumplieron su tiempo
      for (let i = 0; i < SLOTS; i++) {
        if (g.slots[i] && now >= g.hideAt[i]) {
          g.slots[i] = null;
          changed = true;
        }
      }

      // aparecer uno nuevo
      if (now >= g.nextSpawnAt) {
        const empty = [];
        for (let i = 0; i < SLOTS; i++) if (!g.slots[i]) empty.push(i);
        if (empty.length) {
          const slot = empty[(Math.random() * empty.length) | 0];
          const animal = ANIMALS[(Math.random() * ANIMALS.length) | 0];
          g.slots[slot] = { animal, key: now + slot };
          g.hideAt[slot] = now + 750 + Math.random() * 750;
          changed = true;
        }
        g.nextSpawnAt = now + 420 + Math.random() * 620;
      }

      if (changed) setHoles(g.slots.slice());
      setTimeLeft(Math.max(0, Math.ceil((g.endsAt - now) / 1000)));
    }, 90);

    return () => clearInterval(loop);
  }, [phase]);

  // récord al terminar
  useEffect(() => {
    if (phase === "over") {
      setBest((b) => {
        const nb = Math.max(b, scoreRef.current);
        if (nb !== b) writeBest(nb);
        return nb;
      });
    }
  }, [phase]);

  const [wiggle, setWiggle] = useState(0);
  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setWiggle((w) => (w + 1) % 2), 160);
    return () => clearInterval(t);
  }, [phase]);

  const whack = (slot) => {
    const g = game.current;
    const hit = g.slots[slot];
    if (!hit || !g.running) return;
    g.slots[slot] = null;
    setHoles(g.slots.slice());
    scoreRef.current += hit.animal.pts;
    setScore(scoreRef.current);
    const popId = Math.random();
    setPops((p) => [
      ...p,
      { id: popId, slot, text: `+${hit.animal.pts}`, tint: hit.animal.tint },
    ]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== popId)), 650);
  };

  const walkFrame = wiggle === 0 ? 7 : 8;
  const isRecord = phase === "over" && score > 0 && score >= best;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#bfe3a6] to-[#7fbf6a] text-[#1e3a1a]">
      {/* barra superior */}
      <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-white/40 px-5 py-3 backdrop-blur">
        <div>
          <div className="text-sm font-semibold">Atrapá a las mascotas</div>
          <div className="text-[11px] text-black/50">
            Kitty vale 3 · Terri 2 · Julio 1
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-black/45">
              Puntos
            </div>
            <div className="text-lg font-bold tabular-nums">{score}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-black/45">
              Tiempo
            </div>
            <div className="text-lg font-bold tabular-nums">{timeLeft}s</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-black/45">
              Récord
            </div>
            <div className="text-lg font-bold tabular-nums">{best}</div>
          </div>
        </div>
      </div>

      {/* jardín */}
      <div className="relative flex-1 p-5">
        <div className="mx-auto grid h-full max-w-[420px] grid-cols-3 grid-rows-3 gap-3">
          {holes.map((h, i) => {
            const pop = pops.find((p) => p.slot === i);
            return (
              <button
                key={i}
                onClick={() => whack(i)}
                data-cursor="pointer"
                className="group relative flex items-end justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#6aa84f]/70 shadow-inner"
              >
                <span className="absolute bottom-2 h-6 w-4/5 rounded-[50%] bg-black/25" />
                <span
                  className="relative z-10 mb-1 transition-transform duration-150"
                  style={{
                    transform: h
                      ? "translateY(0) scale(0.8)"
                      : "translateY(95%) scale(0.8)",
                    opacity: h ? 1 : 0,
                  }}
                >
                  {h && <Sprite sheet={h.animal.sheet} frame={walkFrame} />}
                </span>
                {pop && (
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 text-lg font-extrabold"
                    style={{
                      color: pop.tint,
                      animation: "lola-pop 0.65s ease-out forwards",
                      textShadow: "0 1px 0 rgba(255,255,255,.7)",
                    }}
                  >
                    {pop.text}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-black/35 p-6 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-[#1e3a1a] shadow-xl">
              {phase === "intro" ? (
                <>
                  <div className="text-3xl">🐱 🐶 🦴</div>
                  <h2 className="mt-3 text-xl font-bold">Atrapá a las mascotas</h2>
                  <p className="mt-2 text-sm text-black/60">
                    Kitty, Terri y Julio se asoman por el jardín. Hacé click antes
                    de que se escondan. Tenés 30 segundos.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl">{isRecord ? "🏆" : "🎉"}</div>
                  <h2 className="mt-3 text-xl font-bold">
                    {isRecord ? "¡Nuevo récord!" : "¡Se acabó el tiempo!"}
                  </h2>
                  <p className="mt-2 text-sm text-black/60">
                    Atrapaste {score} puntos. Récord: {best}.
                  </p>
                </>
              )}
              <button
                onClick={start}
                data-cursor="pointer"
                className="mt-5 rounded-xl bg-[#3f7d2e] px-6 py-3 font-semibold text-white transition hover:bg-[#356b28] active:scale-95"
              >
                {phase === "intro" ? "Empezar" : "Jugar de nuevo"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lola-pop {
          0%   { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translate(-50%, -160%) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
