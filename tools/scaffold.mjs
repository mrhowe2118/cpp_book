/**
 * 骨架生成器：按 book.mjs 的目录，为尚不存在的章节生成占位页。
 *
 *   node tools/scaffold.mjs            # 只创建缺失的页面，不碰已写好的正文
 *   node tools/scaffold.mjs --force    # 重新生成占位页（已写好的正文仍不会被动）
 *
 * 占位页带上本书统一体例的清单，既是给读者的说明，也是写作时的 TODO。
 * 判定"已写好"的标准：文件里不含占位标记 PLACEHOLDER_MARK。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOK, fileOf } from '../docs/.vitepress/book.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const PLACEHOLDER_MARK = '<!-- placeholder -->'
const force = process.argv.includes('--force')

/** 每一节的统一骨架（写作时按这个次序展开） */
const SKELETON = [
  '本节学会什么',
  '为什么需要它',
  '最小可运行示例',
  '关键过程与易错点',
  '动手检查',
  '立即练习'
]

function placeholder(title, sectionTitle, sectionLink) {
  const outline = SKELETON.map((h) => `## ${h}\n\n（待写）`).join('\n\n')
  return `${PLACEHOLDER_MARK}
# ${title}

> **本节仍在写作中。** 完整目录见[《${sectionTitle}》](${sectionLink})。

本书每一节都按同一套体例展开，本节将包含：

${outline}

---

想先看已经写好的章节，可以从这几篇开始：

- [开始编程](/guide/getting-started)
- [数据类型与溢出](/guide/data-types)
- [数组](/guide/arrays)
- [数据范围表就是给分表](/practice/data-range)
- [爆零五道关（总纲）](/practice/five-gates/)
- [收录关：代码压根没交上去](/practice/five-gates/collection)
- [编译关：评测机不认识你的代码](/practice/five-gates/compile)
- [文件关：freopen 第一大现场](/practice/five-gates/file)
- [结果关：答案对了，分数没来](/practice/five-gates/result)
- [资源关：MLE / RE / TLE](/practice/five-gates/resource)
- [申诉不是安全网](/practice/five-gates/appeal)
`
}

let created = 0
let existingPlaceholder = 0
let kept = 0

function handle(abs, title, sectionTitle, sectionLink) {
  if (fs.existsSync(abs)) {
    const body = fs.readFileSync(abs, 'utf8')
    if (body.includes(PLACEHOLDER_MARK)) {
      if (force) {
        fs.writeFileSync(abs, placeholder(title, sectionTitle, sectionLink), 'utf8')
        created++
      } else {
        existingPlaceholder++
      }
      return
    }
    kept++
    return
  }
  fs.writeFileSync(abs, placeholder(title, sectionTitle, sectionLink), 'utf8')
  created++
}

for (const section of BOOK.sections) {
  handle(path.join(DOCS, fileOf(section.link)), section.text, section.text, section.link)
  for (const item of section.items) {
    if (item.link === section.link) continue
    handle(path.join(DOCS, fileOf(item.link)), item.title, section.text, section.link)
  }
}

console.log(`新建 ${created} 个 / 已有占位 ${existingPlaceholder} 个 / 已有正文 ${kept} 篇`)
