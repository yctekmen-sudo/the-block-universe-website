/**
 * Rebuild the downloadable PDF directly from authoritative content/chapters/*.html.
 * No Word file, Next.js build, or third-party npm dependency is required.
 *
 * Usage: node scripts/build-pdf.mjs [--preview] [--check] [--chrome PATH]
 *        node scripts/build-pdf.mjs --output "public/The Block Universe.pdf"
 */
import { createServer } from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const args = process.argv.slice(2)
const argValue = key => { const at = args.indexOf(key); return at >= 0 ? args[at + 1] : undefined }
const outputPath = path.resolve(root, argValue('--output') || 'public/The Block Universe.pdf')
const preview = args.includes('--preview')
const checkOnly = args.includes('--check')
const escapeHtml = str => String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const cleanTitle = str => str.replace(/\s+/g, ' ').trim()
const titleFor = entry => {
  const title = cleanTitle(entry.title)
  const section = title.match(/^(\d+)\s+(.+)$/)
  return section ? section[1] + '. ' + section[2] : title
}

function findChromium() {
  const candidates = [
    argValue('--chrome'),
    process.env.CHROME_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    process.platform === 'win32' ? path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe') : null,
    process.platform === 'win32' ? path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google/Chrome/Application/chrome.exe') : null,
    process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe') : null,
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    'chromium', 'chromium-browser', 'google-chrome', 'chrome',
  ].filter(Boolean)
  for (const name of candidates) {
    if (existsSync(name)) return name
    const cmd = process.platform === 'win32' ? 'where' : 'which'
    const found = spawnSync(cmd, [name], { encoding: 'utf8', windowsHide: true })
    if (found.status === 0) return found.stdout.trim().split(/\r?\n/)[0]
  }
  throw new Error('Chromium/Chrome not found. Install Google Chrome, or pass --chrome /path/to/chrome.')
}

async function collect() {
  const manifest = JSON.parse(await readFile(path.join(root, 'content/chapters.json'), 'utf8'))
  if (!manifest.length || manifest.some(entry => !entry.file || !entry.slug)) throw new Error('Invalid chapter manifest')
  const seen = new Set()
  const chapters = []
  let imageCount = 0
  for (const entry of manifest) {
    if (seen.has(entry.slug)) throw new Error('Duplicate chapter slug: ' + entry.slug)
    seen.add(entry.slug)
    const source = await readFile(path.join(root, 'content', entry.file), 'utf8')
    const article = source.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
    if (!article) throw new Error('Expected an <article> in ' + entry.file)
    let html = article[1]
    const number = entry.slug.match(/^section-(\d+)$/)?.[1]
    if (number) {
      const heading = number + '. ' + cleanTitle(entry.title).replace(/^\d+\s+/, '')
      html = html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/i, (_, attrs) => '<h1' + attrs + '><strong>' + escapeHtml(heading) + '</strong></h1>')
    }
    if (!/<h1\b/i.test(html)) throw new Error('Missing chapter h1 in ' + entry.file)
    for (const m of html.matchAll(/<img\b[^>]*?src=["']([^"']+)["']/gi)) {
      const url = m[1]
      if (!url.startsWith('/images/')) throw new Error('Unexpected image path in ' + entry.file + ': ' + url)
      const disk = path.resolve(publicDir, '.' + decodeURIComponent(url))
      if (!disk.startsWith(publicDir + path.sep) || !existsSync(disk)) throw new Error('Missing illustration: ' + disk)
      imageCount++
    }
    chapters.push({ slug: entry.slug, title: titleFor(entry), html })
  }
  return { chapters, imageCount }
}

async function makeHtml() {
  const { chapters, imageCount } = await collect()
  const toc = chapters.map(c => '<li><a href="#book-' + escapeHtml(c.slug) + '">' + escapeHtml(c.title) + '</a></li>').join('\n')
  const content = chapters.map(c => '<section class="chapter" id="book-' + escapeHtml(c.slug) + '">' + c.html + '</section>').join('\n')
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Block Universe</title>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="/book-print.css"></head><body>' +
    '<section class="title-page"><h1>The Block Universe</h1><p>A Scientific and Philosophical Exploration of Spacetime and Physical Reality</p></section>' +
    '<nav class="toc" aria-label="Table of contents"><h1>Contents</h1><ol>' + toc + '</ol></nav>' +
    '<main>' + content + '</main></body></html>'
  return { html, chapters, imageCount }
}

async function verifyPdf() {
  const bytes = await readFile(outputPath)
  if (bytes.length < 50_000 || bytes.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('PDF is missing or unexpectedly small: ' + outputPath)
  }
  const end = bytes.subarray(-2048).toString('latin1')
  if (!end.includes('%%EOF')) throw new Error('PDF trailer is missing')
  const { chapters, imageCount } = await collect()
  console.log('PDF file OK:', outputPath, '(' + bytes.length + ' bytes)')
  console.log('Source coverage:', chapters.length, 'chapters; ', imageCount, 'embedded illustration references.')
  const tools = ['pdfinfo', 'pdftotext']
  const available = tools.map(tool => spawnSync(tool, ['-v'], { encoding: 'utf8' }).error === undefined)
  if (available[0]) {
    const p = spawnSync('pdfinfo', [outputPath], { encoding: 'utf8' })
    const pages = p.stdout.match(/^Pages:\s*(\d+)/m)?.[1]
    console.log('PDF pages:', pages || 'unknown')
  }
  if (available[1]) {
    const p = spawnSync('pdftotext', ['-layout', outputPath, '-'], { encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 })
    if (p.status !== 0) throw new Error('pdftotext validation failed: ' + p.stderr)
    const flattened = p.stdout.replace(/\s+/g, ' ').toLowerCase()
    for (const item of chapters) {
      if (!flattened.includes(item.title.replace(/\s+/g, ' ').toLowerCase())) {
        // Long and hyphenated titles may wrap differently in PDF text extraction.
        const words = item.title.toLowerCase().split(/\s+/).slice(0, 3).join(' ')
        if (!flattened.includes(words)) throw new Error('Missing chapter in PDF text: ' + item.title)
      }
    }
    console.log('Extracted text includes all chapter titles.')
  } else {
    console.log('Optional pdftotext not installed; skipped text-extraction check.')
  }
}

if (checkOnly) {
  await verifyPdf()
  process.exit(0)
}

const { html, chapters, imageCount } = await makeHtml()
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname === '/print.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (pathname !== '/book-print.css' && !/^\/images\/[a-zA-Z0-9_.-]+\.svg$/.test(pathname)) {
      res.writeHead(404); res.end('Not found'); return
    }
    const file = path.resolve(publicDir, '.' + pathname)
    if (!file.startsWith(publicDir + path.sep)) throw new Error('Unsafe path')
    const content = await readFile(file)
    res.writeHead(200, { 'Content-Type': pathname.endsWith('.css') ? 'text/css' : 'image/svg+xml' })
    res.end(content)
  } catch (error) {
    res.writeHead(500); res.end(String(error))
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
const url = 'http://127.0.0.1:' + address.port + '/print.html'
if (preview) {
  console.log('Print preview:', url)
  console.log('Press Ctrl+C to stop the preview server.')
} else {
  try {
    await mkdir(path.dirname(outputPath), { recursive: true })
    const chrome = findChromium()
    const chromeArgs = [
      '--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run',
      '--no-pdf-header-footer', '--print-to-pdf=' + outputPath,
      '--virtual-time-budget=5000', '--window-size=1280,900'
    ]
    if (process.platform !== 'win32' && process.getuid?.() === 0) chromeArgs.push('--no-sandbox')
    chromeArgs.push(url)
    console.log('Generating PDF from', chapters.length, 'chapters and', imageCount, 'illustrations...')
    const exitCode = await new Promise((resolve, reject) => {
      const p = spawn(chrome, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
      let errors = ''
      p.stderr.on('data', b => { errors += b.toString().slice(0, 1000) })
      p.on('error', reject)
      p.on('close', code => { if (code === 0) resolve(code); else reject(new Error('Chromium exited ' + code + ': ' + errors.slice(-3000))) })
    })
    await verifyPdf()
  } finally {
    server.close()
  }
}
