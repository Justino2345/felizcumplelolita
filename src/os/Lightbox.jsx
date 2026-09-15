import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Drop-in para <img>: al hacer click, la foto se agranda en un overlay a
 * pantalla completa. Se cierra con click afuera o con Escape.
 * `thumbSrc` (opcional) es una versión liviana para la miniatura chica;
 * el overlay agrandado siempre usa `src` (la foto completa).
 */
export function LightboxImg({ className = "", onClick, alt = "", thumbSrc, ...props }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
            <img
              src={props.src}
              alt={alt}
              style={{ animation: "lightboxZoom 0.18s ease-out" }}
              className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </>
  );
}
