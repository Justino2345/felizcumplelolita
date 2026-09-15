import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sharp from 'sharp'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const fotosDir = path.join(rootDir, 'public', 'fotos')
const iconsDir = path.join(rootDir, 'public', 'icons')
// Miniaturas optimizadas (WebP, livianas) para que la página cargue rápido.
// Se generan una vez y quedan cacheadas acá; sólo se regeneran si la foto
// original cambia.
const thumbsCacheDir = path.join(rootDir, 'node_modules', '.fotos-thumbs-cache')
const THUMB_PREFIX = '/fotos-thumb/'
const THUMB_WIDTH = 640
const THUMB_QUALITY = 68

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const VIDEO_EXT = new Set(['.mp4', '.webm', '.mov'])

function thumbRelPath(folder, file) {
  return path.join(folder, file.replace(/\.[^.]+$/, '.webp'))
}

// Genera (o reusa si ya está al día) la miniatura WebP de una foto.
async function ensureThumb(folder, file) {
  const srcPath = path.join(fotosDir, folder, file)
  const destRel = thumbRelPath(folder, file)
  const destPath = path.join(thumbsCacheDir, destRel)

  const srcStat = fs.statSync(srcPath)
  const destStat = fs.existsSync(destPath) ? fs.statSync(destPath) : null
  if (!destStat || destStat.mtimeMs < srcStat.mtimeMs) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    await sharp(srcPath)
      .rotate() // respeta la orientación EXIF de fotos de celular
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(destPath)
  }
  return THUMB_PREFIX + destRel.split(path.sep).map(encodeURIComponent).join('/')
}

// Escanea public/fotos/<carpeta>, genera las miniaturas y arma
// { carpeta: { images: [{ src, thumb }, ...], videos: ["/fotos/carpeta/archivo.mp4", ...] } }
// para que las fotos/videos que se van agregando aparezcan solos, sin tocar código.
async function buildFotosManifest() {
  const manifest = {}
  if (!fs.existsSync(fotosDir)) return manifest
  for (const entry of fs.readdirSync(fotosDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = path.join(fotosDir, entry.name)
    const files = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, 'es'))
    const imageFiles = files.filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    const videoFiles = files.filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))

    manifest[entry.name] = {
      images: await Promise.all(
        imageFiles.map(async (f) => ({
          src: `/fotos/${entry.name}/${encodeURIComponent(f)}`,
          thumb: await ensureThumb(entry.name, f),
        }))
      ),
      videos: videoFiles.map((f) => `/fotos/${entry.name}/${encodeURIComponent(f)}`),
    }
  }
  return manifest
}

// Lista qué archivos existen de verdad en public/icons (ej: "chapter-facultad.jpg")
// para que el código pueda usar un logo subido sólo si realmente está, sin
// depender de que el <img> falle en tiempo de ejecución.
function buildIconsManifest() {
  if (!fs.existsSync(iconsDir)) return []
  return fs.readdirSync(iconsDir).filter((f) => f !== 'README.txt')
}

function fotosManifestPlugin() {
  const virtualModuleId = 'virtual:fotos'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const iconsVirtualModuleId = 'virtual:icons'
  const resolvedIconsVirtualModuleId = '\0' + iconsVirtualModuleId
  let outDir = path.join(rootDir, 'dist')

  return {
    name: 'fotos-manifest',
    configResolved(config) {
      outDir = path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.join(config.root, config.build.outDir)
    },
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
      if (id === iconsVirtualModuleId) return resolvedIconsVirtualModuleId
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(await buildFotosManifest())}`
      }
      if (id === resolvedIconsVirtualModuleId) {
        return `export default ${JSON.stringify(buildIconsManifest())}`
      }
    },
    configureServer(server) {
      server.watcher.add(iconsDir)
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(iconsDir)) return
        const mod = server.moduleGraph.getModuleById(resolvedIconsVirtualModuleId)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      })
      // Sirve las miniaturas cacheadas en desarrollo.
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith(THUMB_PREFIX)) return next()
        const rel = decodeURIComponent(req.url.slice(THUMB_PREFIX.length).split('?')[0])
        const filePath = path.join(thumbsCacheDir, rel)
        if (!filePath.startsWith(thumbsCacheDir)) return next()
        fs.readFile(filePath, (err, data) => {
          if (err) return next()
          res.setHeader('Content-Type', 'image/webp')
          res.setHeader('Cache-Control', 'max-age=31536000, immutable')
          res.end(data)
        })
      })
      server.watcher.add(fotosDir)
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(fotosDir)) return
        const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      })
    },
    // En el build de producción, copia las miniaturas ya cacheadas a dist/.
    async closeBundle() {
      await buildFotosManifest()
      if (!fs.existsSync(thumbsCacheDir)) return
      fs.cpSync(thumbsCacheDir, path.join(outDir, 'fotos-thumb'), { recursive: true })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), fotosManifestPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5180, strictPort: true },
})
