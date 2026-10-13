/**
 * 零依赖静态预览服务器：直接服务 dist 产物，不经过 Vite / esbuild。
 *
 *   npm run build
 *   npm run serve          # http://localhost:4173
 *
 * 用途：
 * - 只想看构建结果时的最快路径（不需要启动 Vite 开发服务器）
 * - 在某些受限环境下，`vitepress preview` 会因为需要拉起 esbuild 而无法启动
 */

import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'docs', '.vitepress', 'dist')
const PORT = Number(process.env.PORT || 4173)

if (!fs.existsSync(DIST)) {
  console.error(`找不到构建产物：${path.relative(ROOT, DIST)}\n请先运行 npm run build`)
  process.exit(1)
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
}

/** 把 URL 路径解析到 dist 里的实际文件 */
function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0])
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const candidates = []

  if (safe.endsWith('/')) {
    candidates.push(path.join(DIST, safe, 'index.html'))
  } else {
    candidates.push(path.join(DIST, `${safe}.html`))
    candidates.push(path.join(DIST, safe, 'index.html'))
    candidates.push(path.join(DIST, safe))
  }

  for (const candidate of candidates) {
    // 不允许越出 dist 目录
    if (!candidate.startsWith(DIST)) continue
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  return null
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/')
  if (!file) {
    const notFound = path.join(DIST, '404.html')
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': MIME['.html'] })
      res.end(fs.readFileSync(notFound))
    } else {
      res.writeHead(404, { 'Content-Type': MIME['.html'] })
      res.end('<h1>404</h1>')
    }
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})

server.listen(PORT, () => {
  console.log(`静态预览已启动：http://localhost:${PORT}/`)
  console.log(`服务目录：${path.relative(ROOT, DIST)}`)
})
