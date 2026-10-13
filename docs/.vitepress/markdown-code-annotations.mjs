/**
 * 代码块教学标注 —— 让「站点」和「PDF」两个出口的视觉表现一致。
 *
 * 为什么需要这个文件：
 *   站点走的是 VitePress 自己的 markdown 渲染器，它【原生支持】下面这套标注语法；
 *   PDF 走的是 tools/build-pdf.mjs 里独立的 markdown-it + shiki，不认这套语法。
 *   如果不处理，PDF 里会出现 `::: code-group` 原文、`// [!code focus]` 裸露成注释、
 *   行高亮退化成无高亮纯文本。
 *
 * 做法：让 PDF 侧产出和 VitePress 【完全相同的 class 结构】，
 *       于是 custom.css / PRINT_CSS 里同一套选择器两边都能用。
 *
 * 支持的语法（与 VitePress 1.6.4 对齐，已逐项实测）：
 *
 *   行高亮      ```cpp{1,3}           → <span class="line highlighted">
 *   行号        ```cpp:line-numbers   → .line-numbers-mode + .line-numbers-wrapper
 *   焦点        // [!code focus]      → pre.has-focused-lines + <span class="line has-focus">
 *   焦点多行    // [!code focus:3]    → 本行及后 2 行
 *   新增        // [!code ++]         → pre.has-diff + <span class="line diff add">
 *   删除        // [!code --]         → pre.has-diff + <span class="line diff remove">
 *   警示        // [!code warning]    → <span class="line highlighted warning">
 *   错误        // [!code error]      → <span class="line highlighted error">
 *   代码分组    ::: code-group        → .vp-code-group（PDF 里按标签堆叠，不做标签页）
 *   分组标签    ```cpp [解法一]        → .code-group-label
 *
 * 注意：标注注释本身会被【删掉】，不会出现在输出里（这点已实测确认）。
 */

import container from 'markdown-it-container'

/** 行尾的标注注释，例如 `// [!code focus]`、`// [!code ++]` */
const MARKER_RE = /\s*\/\/\s*\[!code\s+(focus(?::\d+)?|\+\+|--|warning|error)\]\s*$/

/**
 * 解析围栏信息串，支持：
 *   cpp | cpp{1,3} | cpp:line-numbers | cpp{1,3}:line-numbers | cpp [标签]
 *   （以及上面几种的组合）
 */
export function parseFenceInfo(raw) {
  let rest = (raw || '').trim()
  let label = null
  let lineNumbers = null
  let highlight = []

  // [标签] 在最末尾
  const labelMatch = rest.match(/\s*\[([^\]]*)\]\s*$/)
  if (labelMatch) {
    label = labelMatch[1].trim()
    rest = rest.slice(0, labelMatch.index).trim()
  }

  // :line-numbers / :no-line-numbers 在标签之前
  if (/:no-line-numbers$/.test(rest)) {
    lineNumbers = false
    rest = rest.replace(/:no-line-numbers$/, '')
  } else if (/:line-numbers$/.test(rest)) {
    lineNumbers = true
    rest = rest.replace(/:line-numbers$/, '')
  }

  // {1,3-5} 在语言名之后
  const rangeMatch = rest.match(/\{([^}]*)\}$/)
  if (rangeMatch) {
    highlight = parseRanges(rangeMatch[1])
    rest = rest.slice(0, rangeMatch.index)
  }

  return { lang: rest.trim() || 'text', highlight, lineNumbers, label }
}

/** "1,3-5" → [1,3,4,5] */
export function parseRanges(spec) {
  const out = []
  for (const part of String(spec).split(',')) {
    const p = part.trim()
    if (!p) continue
    const range = p.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const [from, to] = [Number(range[1]), Number(range[2])]
      for (let i = from; i <= to; i++) out.push(i)
    } else if (/^\d+$/.test(p)) {
      out.push(Number(p))
    }
  }
  return out
}

/**
 * 把标注注释从代码里摘出来，同时算出每一行该带哪些 class。
 * 返回值里的 code 是"干净的代码"（标记已删除），会交给 shiki 高亮。
 */
export function annotateCode(code, presetHighlight = []) {
  const lines = code.split('\n')
  const perLine = lines.map(() => [])
  let hasFocus = false
  let hasDiff = false

  for (const n of presetHighlight) {
    if (perLine[n - 1]) perLine[n - 1].push('highlighted')
  }

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(MARKER_RE)
    if (!m) continue
    const kind = m[1]
    lines[i] = lines[i].replace(MARKER_RE, '')

    if (kind.startsWith('focus')) {
      hasFocus = true
      const span = kind.includes(':') ? Number(kind.split(':')[1]) : 1
      for (let k = 0; k < span && i + k < lines.length; k++) {
        perLine[i + k].push('has-focus')
      }
    } else if (kind === '++') {
      hasDiff = true
      perLine[i].push('diff', 'add')
    } else if (kind === '--') {
      hasDiff = true
      perLine[i].push('diff', 'remove')
    } else if (kind === 'warning') {
      perLine[i].push('highlighted', 'warning')
    } else if (kind === 'error') {
      perLine[i].push('highlighted', 'error')
    }
  }

  return { code: lines.join('\n'), perLine, hasFocus, hasDiff }
}

/**
 * 把 class 注入 shiki 产出的 `<span class="line">`。
 * shiki 每行输出恰好一个 line span，所以按顺序替换即可。
 */
export function applyLineClasses(html, perLine) {
  let i = 0
  return html.replace(/<span class="line">/g, (whole) => {
    const cls = perLine[i++] || []
    return cls.length ? `<span class="line ${cls.join(' ')}">` : whole
  })
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** shiki 不可用时的兜底：手工生成同样结构的 line spans（不高亮但版式一致） */
function plainLines(code) {
  const lines = code.split('\n')
  return (
    '<pre class="shiki vp-code"><code>' +
    lines.map((l) => `<span class="line">${escapeHtml(l)}</span>`).join('\n') +
    '</code></pre>'
  )
}

/**
 * 在 markdown-it 实例上安装代码标注。
 *
 * 只应该在【PDF 管线】里启用：站点侧由 VitePress 原生处理，
 * 两边同时启用会重复处理同一段代码。
 *
 * @param {import('markdown-it')} md
 */
export function setupCodeAnnotations(md) {
  const defaultFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim()

    // 没有语言标识（例如裸 ``` ）交给默认渲染器
    if (!info) return defaultFence(tokens, idx, options, env, self)

    const { lang, highlight, lineNumbers, label } = parseFenceInfo(info)
    const { code, perLine, hasFocus, hasDiff } = annotateCode(token.content, highlight)

    const highlightFn = options.highlight
    let inner = ''
    if (typeof highlightFn === 'function') {
      try {
        inner = highlightFn(code, lang) || ''
      } catch {
        inner = ''
      }
    }
    if (!inner) inner = plainLines(code)
    else inner = applyLineClasses(inner, perLine)

    // pre 上的状态 class：用正则插到 class 属性里
    const extraPre = [hasFocus ? 'has-focused-lines' : '', hasDiff ? 'has-diff' : '']
      .filter(Boolean)
      .join(' ')
    if (extraPre) {
      inner = inner.replace(/<pre class="/, `<pre class="${extraPre} `)
    }

    // 打印版把每一行做成块级元素，这样整行底色才能铺满。
    // 代价是必须去掉行与行之间的换行符 —— 否则 display:block + 保留的 \n
    // 会多出一倍空行（VitePress 的 pre 不折行，不存在这个问题）。
    inner = inner.replace(/<\/span>\n(?=<span class="line)/g, '</span>')

    const wrapperClass = [`language-${lang}`]
    // 行号在打印时用 CSS 计数器生成（见 build-pdf.mjs 的 PRINT_CSS）：
    // VitePress 用的是绝对定位的行号列，一旦长行折行就会错位。
    if (lineNumbers) wrapperClass.push('line-numbers-mode')

    const block = `<div class="${wrapperClass.join(' ')}">${inner}</div>\n`

    // 代码分组里的标签（PDF 无标签页，改为标题堆叠）
    if (label) {
      return `<div class="code-group-item"><p class="code-group-label">${escapeHtml(label)}</p>${block}</div>\n`
    }
    return block
  }

  // ::: code-group —— 站点由 VitePress 处理；PDF 里只加一层容器，
  // 内部的每个块靠上面的 label 变成"带标题的堆叠"
  md.use(container, 'code-group', {
    render(tokens, idx) {
      return tokens[idx].nesting === 1 ? '<div class="vp-code-group">\n' : '</div>\n'
    }
  })

  return md
}
