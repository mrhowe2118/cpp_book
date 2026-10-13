/**
 * PDF 导出：把全书章节合成一个可以打印的 HTML，再用无头浏览器打印成 PDF。
 *
 *   npm run pdf
 *
 * 设计要点：
 * 1. Markdown 渲染走 docs/.vitepress/markdown-setup.mjs，和网站完全同一套自定义容器，
 *    这里不再各写一份。
 * 2. 章节顺序来自 docs/.vitepress/book.mjs，改目录只需要改那一处。
 * 3. 代码高亮用 shiki（VitePress 自带依赖）；shiki 不可用时自动退回纯文本，不阻断导出。
 * 4. 拉起浏览器时用 stdio:'ignore' —— 受限环境下管道 stdio 会被拒绝，忽略输出即可。
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import MarkdownIt from 'markdown-it'
import { setupMarkdown } from '../docs/.vitepress/markdown-setup.mjs'
import { BOOK, fileOf } from '../docs/.vitepress/book.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const OUT_DIR = path.join(ROOT, 'dist-print')
const HTML_OUT = path.join(OUT_DIR, 'tom-cppbook.html')
const PDF_OUT = path.join(OUT_DIR, 'tom-cppbook.pdf')

const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
]

/* ------------------------------------------------------------------ *
 * 1. markdown-it + 自定义容器 + 标题锚点 + 代码高亮
 * ------------------------------------------------------------------ */

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function headingAnchorPlugin(md) {
  md.core.ruler.push('book_heading_anchor', (state) => {
    const used = new Map()
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type !== 'heading_open') continue
      const inline = state.tokens[i + 1]
      const text = inline && inline.type === 'inline' ? inline.content : ''
      let id = slugify(text) || `h-${i}`
      const seen = used.get(id) ?? 0
      used.set(id, seen + 1)
      if (seen > 0) id = `${id}-${seen}`
      token.attrSet('id', id)
    }
  })
}

async function makeHighlighter() {
  try {
    const { createHighlighter } = await import('shiki')
    const highlighter = await createHighlighter({
      themes: ['github-light'],
      langs: ['cpp', 'c', 'bash', 'sh', 'javascript', 'typescript', 'python', 'json', 'markdown', 'xml', 'text']
    })
    return (code, lang) => {
      const safeLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
      return highlighter.codeToHtml(code, { lang: safeLang, theme: 'github-light' })
    }
  } catch (err) {
    console.warn(`  ! shiki 不可用（${err.message}），代码块将不使用语法高亮`)
    return null
  }
}

/** 去掉文件开头的 YAML frontmatter */
function stripFrontmatter(raw) {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}

/* ------------------------------------------------------------------ *
 * 2. 打印样式
 * ------------------------------------------------------------------ */

const PRINT_CSS = `
@page { size: A4; margin: 17mm 15mm 18mm; }

:root {
  --ink: #1a1a1a;
  --muted: #5b6470;
  --line: #d8dee6;
  --code-bg: #f6f8fa;
  --orange: #b45309;
  --green: #15803d;
  --red: #b91c1c;
  --slate: #475569;
  --brand: #253c7d;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif;
  font-size: 10.5pt;
  line-height: 1.75;
  color: var(--ink);
}

/* ---------- 封面 ---------- */
.cover { height: 245mm; display: flex; flex-direction: column; justify-content: center; text-align: center; break-after: page; }
.cover .mark { display: block; width: 92px; height: auto; margin: 0 auto 26px; }
.cover h1 { font-size: 30pt; margin: 0 0 10px; color: var(--brand); border: none; }
.cover .sub { font-size: 13pt; color: var(--muted); margin-bottom: 6px; }
.cover .author { font-size: 11pt; color: var(--muted); margin-top: 26px; }
.cover .rule { width: 90px; height: 3px; background: var(--brand); margin: 24px auto; }
.cover .note { font-size: 9pt; color: var(--muted); margin: 40px auto 0; max-width: 120mm; text-align: left;
  border: 1px solid var(--line); border-radius: 6px; padding: 10px 14px; background: #fafbfc; }

/* ---------- 目录 ---------- */
.toc { break-after: page; }
.toc h1 { border: none; }
.toc ol { padding-left: 0; list-style: none; counter-reset: sec; }
.toc li.sec { margin: 14px 0 4px; font-weight: 700; font-size: 12pt; color: var(--brand); }
.toc li.ch { margin: 2px 0 2px 14px; font-size: 10pt; color: var(--ink); }
.toc a { color: inherit; text-decoration: none; }

/* ---------- 正文 ---------- */
.chapter { break-before: page; }
h1 { font-size: 19pt; margin: 0 0 14px; padding-bottom: 8px; border-bottom: 2px solid var(--brand); }
h2 { font-size: 13.5pt; margin: 22px 0 10px; padding-left: 8px; border-left: 4px solid var(--brand); break-after: avoid; }
h3 { font-size: 11.5pt; margin: 16px 0 8px; color: #24304a; break-after: avoid; }
p { margin: 8px 0; }
ul, ol { padding-left: 20px; margin: 8px 0; }
li { margin: 3px 0; }
strong { color: #101828; }
a { color: var(--brand); text-decoration: none; }
hr { border: none; border-top: 1px solid var(--line); margin: 18px 0; }

blockquote {
  margin: 12px 0; padding: 8px 14px; border-left: 4px solid var(--line);
  background: #fafbfc; color: #344054;
}
blockquote p { margin: 4px 0; }

/* 代码 */
pre {
  background: var(--code-bg); border: 1px solid var(--line); border-radius: 6px;
  padding: 10px 12px; margin: 10px 0; overflow: visible;
  white-space: pre-wrap; word-break: break-all;
  font-family: 'Cascadia Mono', 'Consolas', 'Courier New', monospace;
  font-size: 9pt; line-height: 1.55; break-inside: avoid;
}
pre code { background: none; padding: 0; border: none; font-size: inherit; }
code {
  font-family: 'Cascadia Mono', 'Consolas', 'Courier New', monospace;
  font-size: 9.2pt; background: #f1f4f8; padding: 1px 4px; border-radius: 3px;
}
.shiki { background: var(--code-bg) !important; }

/* ---- 代码块教学标注 ----------------------------------------------
 * class 名与站点保持一致（行高亮 / 焦点 / 增删 / 警示 / 行号），
 * 所以正文里同一处标注，书上和投影上是同一个意思。
 * 打印时把每行做成块级元素，整行底色才铺得满。
 * ----------------------------------------------------------------- */
pre .line { display: block; }

pre .line.highlighted { background: #fff3bf; }
pre .line.highlighted.warning { background: #fff8c5; }
pre .line.highlighted.error { background: #ffd7d5; }

pre.has-focused-lines .line:not(.has-focus) { opacity: 0.45; }

pre .line.diff.add { background: #dafbe1; }
pre .line.diff.add::before { content: '+ '; color: #1a7f37; font-weight: 700; }
pre .line.diff.remove { background: #ffebe9; opacity: 0.85; }
pre .line.diff.remove::before { content: '- '; color: #cf222e; font-weight: 700; }

/* 行号：用计数器而不是绝对定位的列 —— 打印时 pre 会折行，列会错位 */
.line-numbers-mode code { counter-reset: book-line; }
.line-numbers-mode code .line::before {
  counter-increment: book-line;
  content: counter(book-line);
  display: inline-block;
  width: 20px;
  margin-right: 7px;
  text-align: right;
  color: #8b949e;
}

/* 代码分组：PDF 里没有标签页，改成"带标题的堆叠" */
.vp-code-group { margin: 10px 0; break-inside: avoid; }
.code-group-item { margin: 8px 0; }
.code-group-label {
  margin: 0 0 3px; font-size: 9pt; font-weight: 700; color: var(--muted);
}

/* 表格 */
table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.2pt; break-inside: avoid; }
th, td { border: 1px solid var(--line); padding: 5px 8px; text-align: left; vertical-align: top; }
th { background: #f1f4f8; font-weight: 700; }

/* 自定义容器 */
.custom-block { border: 1px solid var(--line); border-left-width: 4px; border-radius: 6px; padding: 10px 14px; margin: 14px 0; break-inside: avoid; }
.custom-block-title { font-weight: 700; margin: 0 0 6px; display: flex; align-items: center; gap: 8px; font-size: 10.5pt; }
.custom-block-title::before { font-size: 8pt; font-weight: 700; letter-spacing: .06em; padding: 1px 6px; border-radius: 3px; color: #fff; }
.custom-block p:last-child { margin-bottom: 0; }

.custom-block.gate   { border-left-color: var(--slate);  background: #f8fafc; }
.custom-block.gate   > .custom-block-title { color: var(--slate); }
.custom-block.gate   > .custom-block-title::before { content: '关卡'; background: var(--slate); }

.custom-block.range  { border-left-color: var(--green);  background: #f2fbf5; }
.custom-block.range  > .custom-block-title { color: var(--green); }
.custom-block.range  > .custom-block-title::before { content: '数据范围'; background: var(--green); }

.custom-block.pitfall { border-left-color: var(--orange); background: #fffaf0; }
.custom-block.pitfall > .custom-block-title { color: var(--orange); }
.custom-block.pitfall > .custom-block-title::before { content: '易错'; background: var(--orange); }

.custom-block.exam   { border-left-color: var(--red);    background: #fef4f4; }
.custom-block.exam   > .custom-block-title { color: var(--red); }
.custom-block.exam   > .custom-block-title::before { content: '考场'; background: var(--red); }
`

/* ------------------------------------------------------------------ *
 * 3. 组装 HTML
 * ------------------------------------------------------------------ */

/**
 * 封面用的 logo。
 *
 * 打印 HTML 是【自包含单文件】（不引用任何外部资源），所以 logo 必须内嵌成
 * data URI —— 用相对路径的话，Chrome 打印时取不到图。
 * 这份资源由 docs/public/logo.png 生成（裁自 Tom信奥 原始 logo 的熊）。
 */
function coverLogo() {
  const file = path.join(DOCS, 'public', 'logo.png')
  if (!fs.existsSync(file)) return ''
  const b64 = fs.readFileSync(file).toString('base64')
  return `<img class="mark" alt="Tom信奥" src="data:image/png;base64,${b64}">`
}

const COVER_LOGO = coverLogo()

function collectChapterFiles() {
  const list = []
  for (const section of BOOK.sections) {
    list.push({ section: section.text, title: section.text, link: section.link, file: fileOf(section.link), isIndex: true })
    for (const item of section.items) {
      if (item.link === section.link) continue
      list.push({
        section: section.text,
        title: item.title,
        link: item.link,
        file: fileOf(item.link),
        isIndex: false
      })
    }
  }
  return list
}

const md = new MarkdownIt({ html: true, linkify: false, typographer: false })
setupMarkdown(md, { codeAnnotations: true })
headingAnchorPlugin(md)

const highlight = await makeHighlighter()
if (highlight) {
  md.options.highlight = (code, lang) => {
    try {
      return highlight(code, (lang || 'text').trim())
    } catch {
      return ''
    }
  }
}

const chapters = collectChapterFiles()
const rendered = []

for (const chapter of chapters) {
  const abs = path.join(DOCS, chapter.file)
  if (!fs.existsSync(abs)) {
    console.warn(`  ! 跳过缺失章节：${chapter.file}`)
    continue
  }
  const raw = stripFrontmatter(fs.readFileSync(abs, 'utf8'))
  if (raw.includes('<!-- placeholder -->')) {
    continue // 占位页不进 PDF
  }
  rendered.push({ ...chapter, html: md.render(raw) })
}

const tocHtml = BOOK.sections
  .map((section) => {
    const items = section.items
      .filter((item) => item.link !== section.link)
      .map((item) => {
        const done = rendered.some((c) => c.link === item.link)
        return `<li class="ch">${done ? `<a href="#${slugify(item.title)}">${item.title}</a>` : `${item.title}（待写）`}</li>`
      })
      .join('\n')
    return `<li class="sec"><a href="#${slugify(section.text)}">${section.text}</a></li>\n${items}`
  })
  .join('\n')

const bodyHtml = rendered
  .map((chapter) => `<section class="chapter" id="${slugify(chapter.title)}">\n${chapter.html}\n</section>`)
  .join('\n')

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${BOOK.title}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<div class="cover">
  ${COVER_LOGO}
  <h1>${BOOK.title}</h1>
  <div class="sub">${BOOK.description}</div>
  <div class="rule"></div>
  <div class="author">${BOOK.author}</div>
  <div class="note">
    <strong>免责说明：</strong>认证规则、目录结构、提交方式逐年可能调整，且各省要求并不一致。
    书中涉及具体规定的部分，一律以你所在省份当年的官方须知和监考老师现场说明为准。
  </div>
</div>

<div class="toc">
  <h1>目录</h1>
  <ol>${tocHtml}</ol>
  <p style="font-size:9pt;color:#5b6470;margin-top:20px;">
    正在写作中的章节以「待写」标出，未收录进本 PDF。全书目录见站点侧边栏。
  </p>
</div>

${bodyHtml}
</body>
</html>`

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(HTML_OUT, html, 'utf8')
console.log(`✓ 已生成打印版 HTML：${path.relative(ROOT, HTML_OUT)}`)
console.log(`  收录章节 ${rendered.length} 篇，未收录（占位） ${chapters.length - rendered.length} 篇`)

/* ------------------------------------------------------------------ *
 * 4. 调用无头浏览器打印 PDF
 * ------------------------------------------------------------------ */

const candidates = BROWSERS.filter((p) => fs.existsSync(p))
if (candidates.length === 0) {
  console.warn('! 未找到 Chrome / Edge，跳过 PDF 生成。可用浏览器打开上面的 HTML 自行打印。')
  process.exit(0)
}

const profileDir = path.join(OUT_DIR, '.browser-profile')
fs.mkdirSync(profileDir, { recursive: true })

const url = pathToFileURL(HTML_OUT).href
let produced = null

for (const browser of candidates) {
  // 每个浏览器用独立 profile，避免上一次的残留状态影响这一次
  const profile = path.join(profileDir, path.basename(browser, '.exe'))
  fs.mkdirSync(profile, { recursive: true })

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--no-pdf-header-footer',
    '--virtual-time-budget=30000',
    `--print-to-pdf=${PDF_OUT}`,
    url
  ]

  if (fs.existsSync(PDF_OUT)) fs.rmSync(PDF_OUT)

  // stdio:'ignore' —— 受限环境下管道 stdio 会被拒绝；这里也不需要浏览器的输出
  const result = spawnSync(browser, args, { stdio: 'ignore', timeout: 300000 })

  if (result.error) {
    console.warn(`  ! ${path.basename(browser)} 启动失败：${result.error.message}`)
    continue
  }
  if (fs.existsSync(PDF_OUT) && fs.statSync(PDF_OUT).size > 1024) {
    produced = browser
    break
  }
  console.warn(`  ! ${path.basename(browser)} 没有产出 PDF，换下一个浏览器`)
}

if (!produced) {
  console.warn('! 所有浏览器都没能产出 PDF。请用浏览器打开下面的 HTML，用「打印 → 另存为 PDF」：')
  console.warn(`  ${path.relative(ROOT, HTML_OUT)}`)
  process.exit(0)
}

const size = fs.statSync(PDF_OUT).size
console.log(`✓ 已生成 PDF：${path.relative(ROOT, PDF_OUT)}（${(size / 1024 / 1024).toFixed(2)} MB，使用 ${path.basename(produced)}）`)

// 清理临时 profile，避免留一堆浏览器缓存
fs.rmSync(profileDir, { recursive: true, force: true })
