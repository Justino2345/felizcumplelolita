import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Distancia mínima (px) de un swipe horizontal para que cuente como
// "cambiar de foto" en vez de un tap o un scroll accidental.
const SWIPE_THRESHOLD = 40;

/**
 * Drop-in para <img>: al hacer click, la foto se agranda en un overlay a
 * pantalla completa. Se cierra con click afuera o con Escape.
 * `thumbSrc` (opcional) es una versión liviana para la miniatura chica;
 * el overlay agrandado siempre usa `src` (la foto completa).
 *
 * Si se pasan `images` (lista de {src, thumbSrc?, alt?}) e `index` (su
 * posición en esa lista), el overlay permite navegar entre todas con las
 * flechas del teclado, los botones ‹ › o, en mobile, deslizando el dedo
 * sobre la foto (swipe), sin necesidad de cerrar y volver a abrir cada una.
 */
export function LightboxImg({ className = "", onClick, alt = "", thumbSrc, images, index = 0, ...props }) {
  const [open, setOpen] = useState(false);
  const list = images?.length ? images : [{ src: props.src, thumbSrc, alt }];
  const startIndex = images?.length ? index : 0;
  const [current, setCurrent] = useState(startIndex);
  const canNav = list.length > 1;
  const touchStartX = useRef(null);

  useEffect(() => {
    if (open) setCurrent(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      else if (canNav && e.key === "ArrowRight") setCurrent((i) => (i + 1) % list.length);
      else if (canNav && e.key === "ArrowLeft") setCurrent((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canNav, list.length]);

  const shown = list[current] || list[0];

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (!canNav || touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx <= -SWIPE_THRESHOLD) setCurrent((i) => (i + 1) % list.length);
    else if (dx >= SWIPE_THRESHOLD) setCurrent((i) => (i - 1 + list.length) % list.length);
  };

  return (
    <>
      <img
        {...props}
        src={thumbSrc || props.src}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-cursor="pointer"
        onClick={(e) => {
          onClick?.(e);
          setOpen(true);
        }}
        className={`cursor-zoom-in ${className}`}
      />
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
            {canNav && (
              <button
                type="button"
                aria-label="Foto anterior"
                data-cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((i) => (i - 1 + list.length) % list.length);
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 px-3 py-2 text-2xl leading-none text-white transition hover:bg-black/60 sm:left-6"
              >
                ‹
              </button>
            )}
            <img
              src={shown.src}
              alt={shown.alt || alt}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              style={{ animation: "lightboxZoom 0.18s ease-out", touchAction: "pan-y" }}
              className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />
            {canNav && (
              <button
                type="button"
                aria-label="Foto siguiente"
                data-cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((i) => (i + 1) % list.length);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/40 px-3 py-2 text-2xl leading-none text-white transition hover:bg-black/60 sm:right-6"
              >
                ›
              </button>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
