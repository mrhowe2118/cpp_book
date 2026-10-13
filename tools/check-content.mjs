/**
 * 内容体检：目录、死链、体例一致性。
 *
 *   npm run check
 *
 * 检查项：
 * 1. book.mjs 里每个 link 都能对应到一个 .md 文件
 * 2. 所有 .md 里的站内链接都能落到真实文件（避免线上 404）
 * 3. 已写好的章节符合本书体例（含"本节学会什么"与"立即练习"）
 * 4. 统计进度：已写 / 占位
 *
 * 退出码非 0 表示有硬错误（缺文件、死链）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOK, fileOf } from '../docs/.vitepress/book.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const PLACEHOLDER_MARK = '<!-- placeholder -->'

const errors = []
const warnings = []

/** 体例要求：每一节都该有的小标题 */
const REQUIRED_SECTIONS = ['本节学会什么', '立即练习']

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.vitepress' || entry.name === 'public' || entry.name === 'node_modules') continue
      walk(abs, out)
    } else if (entry.name.endsWith('.md')) {
      out.push(abs)
    }
  }
  return out
}

/* 1. book.mjs 的每一项 → 文件存在 */
const allFiles = new Set(walk(DOCS).map((p) => path.relative(DOCS, p).replace(/\\/g, '/')))

for (const section of BOOK.sections) {
  const check = (link, label) => {
    const rel = fileOf(link)
    if (!allFiles.has(rel)) errors.push(`目录项"${label}"指向不存在的文件：${rel}`)
  }
  check(section.link, section.text)
  for (const item of section.items) check(item.link, item.title)
}

/* 2. 所有 md 里的站内链接 */
const linkPattern = /\]\((\/[^)\s#]*)/g
for (const abs of walk(DOCS)) {
  const rel = path.relative(DOCS, abs).replace(/\\/g, '/')
  const body = fs.readFileSync(abs, 'utf8')
  let m
  while ((m = linkPattern.exec(body)) !== null) {
    const target = m[1]
    const candidates = target.endsWith('/')
      ? [`${target.slice(1)}index.md`]
      : [`${target.slice(1)}.md`, `${target.slice(1)}/index.md`]
    const hit = candidates.find((c) => allFiles.has(c))
    if (!hit && !target.startsWith('/assets') && !target.startsWith('/logo')) {
      errors.push(`${rel} 里的链接指向不存在的页面：${target}`)
    }
  }
}

/* 3. 体例一致性 + 进度统计 */
let written = 0
let placeholder = 0
const missingStyle = []

for (const abs of walk(DOCS)) {
  const rel = path.relative(DOCS, abs).replace(/\\/g, '/')
  if (rel === 'index.md') continue
  const body = fs.readFileSync(abs, 'utf8')
  if (body.includes(PLACEHOLDER_MARK)) {
    placeholder++
    continue
  }
  written++
  // 章节导读页只需要目录，不强制正文体例
  const isSectionIndex = BOOK.sections.some((s) => fileOf(s.link) === rel)
  if (isSectionIndex) continue
  const missing = REQUIRED_SECTIONS.filter((h) => !body.includes(h))
  if (missing.length) missingStyle.push(`${rel}（缺：${missing.join('、')}）`)
}

/* 4. 占位页不应带有正文体例的空壳 */
for (const rel of missingStyle) warnings.push(`体例不完整：${rel}`)

/* 报告 */
console.log('===== 内容体检 =====')
console.log(`进度：已写 ${written} 篇 / 占位 ${placeholder} 篇（共 ${written + placeholder} 篇）`)

if (warnings.length) {
  console.log(`\n提示（${warnings.length}）：`)
  for (const w of warnings) console.log(`  - ${w}`)
}

if (errors.length) {
  console.log(`\n错误（${errors.length}）：`)
  for (const e of errors) console.log(`  ✗ ${e}`)
  process.exit(1)
}

console.log('\n✓ 目录与站内链接全部有效')
