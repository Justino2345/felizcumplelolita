import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PERSON,
  FACETS,
  CHAPTERS,
  FAVORITES,
  GALLERY,
  PLAYLIST,
  GREETINGS_SHEET_CSV_URL,
  XV_GALLERY,
  XV_HEADER_IMAGE,
} from "../data.js";
import { LightboxImg } from "./Lightbox.jsx";

// Videos de los 15 en YouTube (son 2 separados: el despertar y la fiesta).
// Poné el link de YouTube de "El despertar" acá cuando lo tengas.
const REEL_VIDEOS = [
  { title: "El despertar", youtubeUrl: "https://www.youtube.com/watch?v=n9qbd0yZNw0" },
  { title: "La fiesta", youtubeUrl: "https://www.youtube.com/watch?v=jRPGP3eLIA4" },
];

// "Descarga tu cartita" (capítulo Justino): pedí la contraseña y, si es
// correcta, descarga este PDF. Poné acá la ruta cuando subas el archivo
// (ej: "/cartita.pdf" con el PDF en public/cartita.pdf).
const CARTITA_PDF_URL = "";
const CARTITA_PASSWORD = "chesushi";

function youtubeEmbedUrl(url) {
  const id = url?.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1];
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

const Section = ({ title, children }) => (
  <div className="mt-10">
    <h2 className="text-xl font-semibold text-[#08060d]">{title}</h2>
    <div className="mt-4">{children}</div>
  </div>
);

export function AboutApp({ openChapter }) {
  return (
    <div className="px-8 py-7 text-[#6b6375]">
      <h1 className="text-2xl font-semibold text-[#08060d]">Su historia</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-[240px_1fr]">
        <LightboxImg
          src={PERSON.photo}
          alt={PERSON.name}
          className="h-56 w-full rounded-2xl object-cover"
        />
        <div>
          <h3 className="text-lg font-semibold text-[#08060d]">{PERSON.name}</h3>
          <p className="mt-2 leading-relaxed">{PERSON.tagline}</p>
          <p className="mt-4 flex items-center gap-2 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {PERSON.status}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span>{PERSON.email}</span>
            <span>{PERSON.phone}</span>
          </div>
        </div>
      </div>

      <Section title="Sus tres caras">
        <div className="grid gap-6 sm:grid-cols-3">
          {FACETS.map((f) => (
            <div key={f.title}>
              <div className="text-2xl">{f.icon}</div>
              <h4 className="mt-2 font-semibold text-[#08060d]">{f.title}</h4>
              <p className="mt-1 text-sm">{f.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Capítulos">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => openChapter(c.id)}
              className="group text-left"
            >
              <div
                className="aspect-[4/3] w-full overflow-hidden rounded-xl"
                style={{ background: c.color }}
              >
                <img
                  src={c.cover}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-medium text-[#08060d]">{c.name}</span>
                <span className="text-xs">{c.year}</span>
              </div>
              <span className="text-sm">{c.subtitle}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Sus favoritos">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FAVORITES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <LightboxImg
                src={f.poster}
                alt={f.title}
                className="h-24 w-16 shrink-0 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs uppercase tracking-wide text-[#08060d]/50">
                  {f.badge}
                </div>
                <div className="font-medium text-[#08060d]">{f.title}</div>
                <div className="text-xs">{f.genre} · {f.year}</div>
                <p className="mt-1 text-sm italic">{f.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// Link "Descarga tu cartita ↗" (solo en el capítulo de Justino/amor): abre un
// cuadro con un campo de contraseña; si coincide, descarga el PDF.
function CartitaLink({ className = "ml-2 align-middle text-sm font-medium text-black/50 underline decoration-black/25 underline-offset-4 transition hover:text-black/70" }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const close = () => {
    setOpen(false);
    setValue("");
    setWrong(false);
    setUnlocked(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === CARTITA_PASSWORD) {
      setWrong(false);
      setUnlocked(true);
      if (CARTITA_PDF_URL) {
        const a = document.createElement("a");
        a.href = CARTITA_PDF_URL;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } else {
      setWrong(true);
    }
  };

  return (
    <>
      <button
        type="button"
        data-cursor="pointer"
        onClick={() => setOpen(true)}
        className={className}
      >
        Descarga tu cartita ↗
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={close}
            data-cursor="pointer"
            style={{ animation: "lightboxIn 0.15s ease-out" }}
            className="fixed inset-0 z-[2147483600] grid place-items-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "lightboxZoom 0.18s ease-out" }}
              className="w-full max-w-sm cursor-auto rounded-2xl bg-white p-6 text-center shadow-2xl"
            >
              {unlocked ? (
                <>
                  <div className="text-3xl">💌</div>
                  <h2 className="mt-3 text-lg font-bold text-[#08060d]">
                    ¡Acertaste!
                  </h2>
                  <p className="mt-2 text-sm text-[#6b6375]">
                    {CARTITA_PDF_URL
                      ? "Tu cartita se está descargando."
                      : "Todavía no se subió el PDF de la cartita."}
                  </p>
                </>
              ) : (
                <form onSubmit={submit}>
                  <h2 className="text-lg font-bold text-[#08060d]">Tu cartita</h2>
                  <p className="mt-2 text-sm text-[#6b6375]">
                    Contraseña= lugar que siempre pedimos sushi
                  </p>
                  <input
                    type="password"
                    autoFocus
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setWrong(false);
                    }}
                    placeholder="Contraseña"
                    className={`mt-4 w-full rounded-xl border px-4 py-3 text-center outline-none focus:border-black/30 ${
                      wrong ? "border-red-300" : "border-[#e5e4e7]"
                    }`}
                  />
                  {wrong && (
                    <p className="mt-2 text-sm text-red-500">
                      No es esa. Probá de nuevo.
                    </p>
                  )}
                  <button
                    type="submit"
                    data-cursor="pointer"
                    className="mt-4 w-full rounded-xl bg-[#08060d] px-5 py-3 font-semibold text-white transition hover:brightness-110"
                  >
                    Entrar
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export function ChapterApp({ chapterId, openApp }) {
  const c = CHAPTERS.find((x) => x.id === chapterId) ?? CHAPTERS[0];
  const textOnImage = c.headerImage ? "text-white" : "text-black/80";
  const subtleOnImage = c.headerImage ? "text-white/80" : "text-black/60";
  return (
    <div className="text-[#6b6375]">
      <div
        className="relative flex h-52 items-end overflow-hidden p-8"
        style={{ background: c.headerImage ? undefined : c.color }}
      >
        {c.headerImage && (
          <>
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05)), url("${c.headerImage}")`,
                backgroundSize: "cover",
                backgroundPosition: c.headerImagePosition ?? "center 20%",
              }}
            />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05)), url("${c.headerImageDesktop || c.headerImage}")`,
                backgroundSize: "cover",
                backgroundPosition: c.headerImagePositionDesktop ?? c.headerImagePosition ?? "center 20%",
              }}
            />
          </>
        )}
        <div className="relative">
          <div className={`text-sm font-medium ${subtleOnImage}`}>{c.year}</div>
          <h1 className={`inline text-3xl font-semibold ${textOnImage}`}>{c.name}</h1>
          <p className={subtleOnImage}>{c.subtitle}</p>
        </div>
      </div>
      <div className="px-8 py-7">
        <p className="text-lg font-medium text-[#08060d]">{c.intro}</p>
        {c.body.map((p, i) => (
          <p key={i} className="mt-4 leading-relaxed">{p}</p>
        ))}
        {c.id === "hoy" && (
          <button
            type="button"
            data-cursor="pointer"
            onClick={() => openApp?.("contact")}
            className="mt-4 text-sm font-medium text-[#6b6375] underline decoration-black/25 underline-offset-4 transition hover:text-[#08060d]"
          >
            Ver los saludos ↗
          </button>
        )}
        {c.id === "amor" && (
          <CartitaLink className="mt-4 inline-block text-sm font-medium text-[#6b6375] underline decoration-black/25 underline-offset-4 transition hover:text-[#08060d]" />
        )}
        <div className="mt-6 columns-2 gap-4 sm:columns-3 [&_img]:mb-4">
          {(() => {
            const images = c.gallery.filter((g) => g.type !== "video");
            let imgIndex = 0;
            return c.gallery.map((g, i) => {
              if (g.type === "video") {
                return (
                  <video
                    key={i}
                    className="mb-4 w-full rounded-xl bg-black object-cover"
                    controls
                    src={g.src}
                  />
                );
              }
              const index = imgIndex++;
              return (
                <LightboxImg
                  key={i}
                  src={g.src}
                  thumbSrc={g.thumb}
                  alt=""
                  images={images}
                  index={index}
                  className="w-full rounded-xl object-cover"
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

export function GalleryApp() {
  return (
    <div className="px-8 py-7">
      <h1 className="text-2xl font-semibold text-[#08060d]">Galería</h1>
      <div className="mt-6 columns-2 gap-4 sm:columns-3 [&_img]:mb-4">
        {GALLERY.map((g, i) => (
          <LightboxImg
            key={i}
            src={g.src}
            thumbSrc={g.thumb}
            alt=""
            images={GALLERY}
            index={i}
            className="w-full rounded-xl object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export function ReelApp() {
  return (
    <div className="text-[#6b6375]">
      <div
        className="flex h-52 items-end p-8"
        style={{
          background: `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05)), url("${XV_HEADER_IMAGE}")`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
        }}
      >
        <div>
          <h1 className="text-3xl font-semibold text-white">Mis XV</h1>
          <p className="text-white/80">Mi noche soñada</p>
        </div>
      </div>
      <div className="px-8 py-7">
      <p className="mt-2">Recuerdos inolvidables de una noche inolvidable.</p>
      {REEL_VIDEOS.map((v) => {
        const embedUrl = youtubeEmbedUrl(v.youtubeUrl);
        return (
          <div key={v.title} className="mt-6">
            <h2 className="text-lg font-semibold text-[#08060d]">{v.title}</h2>
            <div className="mt-2 aspect-video w-full overflow-hidden rounded-2xl bg-black">
              {embedUrl ? (
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video className="h-full w-full object-cover" controls poster={GALLERY[0]?.thumb} />
              )}
            </div>
          </div>
        );
      })}
      {XV_GALLERY.length > 0 && (
        <div className="mt-6 columns-2 gap-4 sm:columns-3 [&_img]:mb-4">
          {XV_GALLERY.map((g, i) => (
            <LightboxImg
              key={i}
              src={g.src}
              thumbSrc={g.thumb}
              alt=""
              images={XV_GALLERY}
              index={i}
              className="w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// Parser de CSV chico (soporta comillas y comas adentro de un campo), para
// leer la hoja de respuestas del Google Form publicada como CSV.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Las fotos se suben al Form como archivo y Google guarda un link de Drive
// (ej: https://drive.google.com/open?id=XXXX) en la celda. Lo convertimos a
// una URL de imagen directa (requiere que el archivo sea visible "para
// cualquiera con el link", que es lo que arma el Form por default).
function driveImageUrl(raw) {
  const id = raw?.match(/[-\w]{25,}/)?.[0];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : "";
}

// Espera columnas [Timestamp, Nombre, Mensaje, Foto] (el orden que arma
// Google Forms; la columna Foto es opcional).
function useGreetings() {
  const [state, setState] = useState({ loading: true, error: false, greetings: [] });

  useEffect(() => {
    if (!GREETINGS_SHEET_CSV_URL) {
      setState({ loading: false, error: false, greetings: [] });
      return;
    }
    let cancelled = false;
    fetch(GREETINGS_SHEET_CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const rows = parseCSV(text).filter((r) => r.some((cell) => cell.trim() !== ""));
        const [, ...data] = rows; // saltea el encabezado
        const greetings = data
          .map(([timestamp, name, message, photo]) => ({
            timestamp,
            name,
            message,
            photo: driveImageUrl(photo),
          }))
          .filter((g) => g.message?.trim())
          .reverse(); // los más nuevos primero
        setState({ loading: false, error: false, greetings });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, greetings: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Tarjeta de saludo: al clickear, se agranda en un overlay (mismo estilo que
// las fotos con LightboxImg). Si el saludo trae foto, se ve chica en la
// tarjeta y grande en el overlay.
function GreetingCard({ message, name, photo }) {
  const [open, setOpen] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);
  const showPhoto = photo && photoOk;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div
        data-cursor="pointer"
        onClick={() => setOpen(true)}
        className="flex cursor-zoom-in items-start gap-3 rounded-xl border border-[#e5e4e7] px-4 py-3 transition hover:border-black/20"
      >
        {showPhoto && (
          <img
            src={photo}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setPhotoOk(false)}
            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
          />
        )}
        <div>
          <p className="leading-relaxed text-[#08060d]">{message}</p>
          {name?.trim() && <p className="mt-1 text-sm">— {name}</p>}
        </div>
      </div>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setOpen(false)}
            data-cursor="pointer"
            style={{ animation: "lightboxIn 0.15s ease-out" }}
            className="fixed inset-0 z-[2147483600] grid cursor-zoom-out place-items-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ animation: "lightboxZoom 0.18s ease-out" }}
              className="max-h-[92vh] w-full max-w-lg cursor-auto overflow-auto rounded-2xl bg-white p-8 shadow-2xl"
            >
              {showPhoto && (
                <img
                  src={photo}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="mb-4 max-h-[60vh] w-full rounded-xl object-cover"
                />
              )}
              <p className="text-xl leading-relaxed text-[#08060d]">{message}</p>
              {name?.trim() && <p className="mt-4 text-right text-[#6b6375]">— {name}</p>}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export function ContactApp() {
  const { loading, error, greetings } = useGreetings();
  const configured = Boolean(GREETINGS_SHEET_CSV_URL);

  return (
    <div className="px-8 py-7 text-[#6b6375]">
      <h1 className="text-2xl font-semibold text-[#08060d]">Saludos</h1>
      <p className="mt-2">Todos los saludos que le dejaron, en un solo lugar.</p>

      <div className="mt-6 space-y-3">
        {!configured && (
          <p className="rounded-xl border border-dashed border-[#e5e4e7] px-4 py-3 text-sm">
            Falta conectar la planilla: completá <code>GREETINGS_SHEET_CSV_URL</code> en{" "}
            <code>src/data.js</code>.
          </p>
        )}
        {loading && configured && <p className="text-sm">Cargando saludos…</p>}
        {error && <p className="text-sm">No se pudieron cargar los saludos ahora.</p>}
        {!loading && !error && configured && greetings.length === 0 && (
          <p className="text-sm">Todavía no hay saludos.</p>
        )}
        {greetings.map((g, i) => (
          <GreetingCard key={i} message={g.message} name={g.name} photo={g.photo} />
        ))}
      </div>
    </div>
  );
}

export function MusicApp() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#2b2440] to-[#141019] text-white">
      <div className="flex items-center gap-4 p-6">
        <img
          src="/album-cover.jpg"
          alt="Portada de la playlist"
          className="h-24 w-24 rounded-xl object-cover"
          onError={(e) => {
            e.currentTarget.src = GALLERY[4]?.thumb;
          }}
        />
        <div>
          <div className="text-xl font-semibold">Lolitas' playlist</div>
        </div>
      </div>
      <div className="mac-scroll flex-1 overflow-y-auto px-4 pb-4">
        {PLAYLIST.map((t, i) => {
          const Row = t.spotify ? "a" : "div";
          return (
            <Row
              key={i}
              {...(t.spotify
                ? {
                    href: t.spotify,
                    target: "_blank",
                    rel: "noreferrer",
                    "data-cursor": "pointer",
                  }
                : {})}
              className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="w-4 text-white/40">{i + 1}</span>
                <div>
                  <div className="text-sm">{t.title}</div>
                  <div className="text-xs text-white/50">{t.artist}</div>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs text-white/50">
                {t.spotify && <span className="text-[#1DB954]">▶ Spotify</span>}
                {t.len}
              </span>
            </Row>
          );
        })}
      </div>
    </div>
  );
}

export function ResourcesApp({ openApp }) {
  const items = [
    ["about", "🧑 Quien soy"],
    ["gallery", "🖼️ Galería"],
    ["reel", "🎬 Mis XV"],
    ["music", "🎵 Playlist"],
    ["game", "🐾 Mis pupis"],
    ["contact", "💌 Saludos"],
  ];
  return (
    <div className="px-8 py-7">
      <h1 className="text-2xl font-semibold text-[#08060d]">Todo en un lugar</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map(([id, label]) => (
          <button
            key={id}
            onClick={() => openApp(id)}
            className="rounded-xl border border-[#e5e4e7] px-4 py-6 text-left hover:bg-black/[0.03]"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
