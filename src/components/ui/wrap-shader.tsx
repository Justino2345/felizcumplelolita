import { Warp } from "@paper-design/shaders-react";

// Paleta anclada al color principal del sitio: el magenta/rosa #ffb7e3
// ("Aurora Dream, dominante #ffb7e3") con un magenta profundo y un rosa pálido.
const MAGENTA_COLORS = [
  "hsl(322, 72%, 42%)", // magenta profundo (sombra)
  "hsl(326, 100%, 87%)", // #ffb7e3 — dominante
  "hsl(324, 100%, 72%)", // magenta vivo
  "hsl(323, 100%, 94%)", // rosa casi blanco (luz)
];

/**
 * Fondo de pantalla completa con el shader Warp, teñido al magenta del sitio.
 * Pensado para ir detrás de todo el contenido (position: absolute/fixed).
 */
export function WarpBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <Warp
        style={{ height: "100%", width: "100%" }}
        proportion={0.45}
        softness={1}
        distortion={0.25}
        swirl={0.8}
        swirlIterations={10}
        shape="checks"
        shapeScale={0.1}
        scale={1}
        rotation={0}
        speed={0.6}
        colors={MAGENTA_COLORS}
      />
    </div>
  );
}

export default function WarpShaderHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.45}
          softness={1}
          distortion={0.25}
          swirl={0.8}
          swirlIterations={10}
          shape="checks"
          shapeScale={0.1}
          scale={1}
          rotation={0}
          speed={1}
          colors={MAGENTA_COLORS}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-white text-5xl md:text-7xl font-sans font-light text-balance">
            Elegant Shader Backgrounds
          </h1>

          <p className="text-white/90 text-xl md:text-2xl font-sans font-light leading-relaxed max-w-3xl mx-auto">
            Beautiful, performant shader effects that enhance your content without overwhelming it. Perfect for hero
            sections, landing pages, and modern web experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-4 bg-white rounded-full text-gray-800 font-medium hover:scale-105 transition-transform duration-300">
              View Examples
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
