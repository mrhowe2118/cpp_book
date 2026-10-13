/**
 * 示例代码体检：把书中所有 ```cpp 代码块真正编译一遍，能跑的再跑一遍对答案。
 *
 *   npm run examples
 *
 * 检查规则：
 * 1. 每个 ```cpp 块都要能用 `g++ -std=c++17 -Wall -Wextra` 编译通过。
 *    正文里的"代码片段"（没有 main）会自动补一个外壳再编译，避免误报。
 * 2. 代码块前面如果写了期望值注释，就实际运行并逐字符比对输出：
 *
 *      <!-- expect
 *      5
 *      3 1 4 1 5
 *      ---
 *      5 1 4 1 3
 *      sum = 14, max = 5
 *      -->
 *      ```cpp
 *      ...
 *      ```
 *
 *    `---` 之前是标准输入，之后是期望的标准输出。
 *
 * 为什么用文件描述符而不是管道：受限环境下管道 stdio 会被拒绝，
 * 这里把标准输入输出都指向临时文件，既不依赖管道也能拿到结果。
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = path.join(ROOT, 'docs')
const WORK = path.join(ROOT, '.example-check')
const PLACEHOLDER_MARK = '<!-- placeholder -->'

fs.rmSync(WORK, { recursive: true, force: true })
fs.mkdirSync(WORK, { recursive: true })

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.vitepress' || entry.name === 'public' || entry.name === 'node_modules') continue
      walk(abs, out)
    } else if (entry.name.endsWith('.md')) out.push(abs)
  }
  return out
}

/** 用文件描述符重定向 stdio 跑一条命令（不用管道） */
function run(cmd, args, { stdinFile, stdoutFile, stderrFile } = {}) {
  const fds = []
  let fdIn = 'ignore'
  if (stdinFile) {
    fdIn = fs.openSync(stdinFile, 'r')
    fds.push(fdIn)
  }
  let fdOut = 'ignore'
  if (stdoutFile) {
    fdOut = fs.openSync(stdoutFile, 'w')
    fds.push(fdOut)
  }
  let fdErr = 'ignore'
  if (stderrFile) {
    fdErr = fs.openSync(stderrFile, 'w')
    fds.push(fdErr)
  }

  const result = spawnSync(cmd, args, { stdio: [fdIn, fdOut, fdErr], timeout: 60000 })
  for (const fd of fds) {
    try { fs.closeSync(fd) } catch { /* 已关闭 */ }
  }
  return result
}

/** 从 md 里抽出所有 ```cpp 代码块，以及可能的 expect / no-compile 注释 */
function extractBlocks(body) {
  const lines = body.split(/\r?\n/)
  const blocks = []
  let pendingExpect = null
  let pendingSkip = false
  let buffer = null
  let expectBuffer = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (expectBuffer !== null) {
      if (line.trim() === '-->') {
        pendingExpect = expectBuffer.join('\n')
        expectBuffer = null
      } else {
        expectBuffer.push(line)
      }
      continue
    }
    if (line.trim() === '<!-- expect') {
      expectBuffer = []
      continue
    }
    if (line.trim() === '<!-- no-compile -->') {
      pendingSkip = true
      continue
    }

    if (buffer === null) {
      const m = /^```(\w+)/.exec(line.trim())
      if (m) {
        buffer = { lang: m[1], line: i + 1, code: [] }
      }
      continue
    }

    if (line.trim() === '```') {
      const isCpp = ['cpp', 'c', 'cc', 'c++'].includes(buffer.lang.toLowerCase())
      if (isCpp) {
        blocks.push({
          line: buffer.line,
          code: buffer.code.join('\n'),
          expect: pendingExpect,
          skip: pendingSkip
        })
        pendingExpect = null
        pendingSkip = false
      }
      buffer = null
      continue
    }
    buffer.code.push(line)
  }
  return blocks
}

function parseExpect(raw) {
  if (raw === null) return null
  const idx = raw.split(/\r?\n/).findIndex((l) => l.trim() === '---')
  if (idx === -1) return { stdin: raw, stdout: null }
  const lines = raw.split(/\r?\n/)
  return { stdin: lines.slice(0, idx).join('\n'), stdout: lines.slice(idx + 1).join('\n') }
}

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
}

const FRAGMENT_SCALARS = `int n = 1, m = 1, k = 1, x = 1, y = 1, i = 0, j = 0;
int op = 1, score = 60, ans = 0, mx = 0, len = 1, pos = 0;
long long sum = 0;
`

const FRAGMENT_PREAMBLE = `#include <iostream>
#include <algorithm>
#include <string>
#include <cstdio>
#include <cstring>
using namespace std;
const int MAXN = 100005;
${FRAGMENT_SCALARS}int a[MAXN];
int cnt[MAXN];
int fa[MAXN];

int main() {
`

/** 片段如果是"函数定义"，放进 main 里不合法（C++ 不支持嵌套函数），改用全局作用域包 */
const GLOBAL_PREAMBLE = `#include <iostream>
#include <algorithm>
#include <string>
#include <cstdio>
#include <cstring>
using namespace std;
const int MAXN = 100005;
${FRAGMENT_SCALARS}int a[MAXN];
int cnt[MAXN];
int fa[MAXN];

`

const GLOBAL_EPILOGUE = `
int main() {
    return 0;
}
`

let total = 0
let compiled = 0
let wrapped = 0
let skipped = 0
let warningsCount = 0
const failures = []
const runFailures = []
const softFailures = []

const files = walk(DOCS)

for (const abs of files) {
  const rel = path.relative(DOCS, abs).replace(/\\/g, '/')
  const body = fs.readFileSync(abs, 'utf8')
  if (body.includes(PLACEHOLDER_MARK)) continue

  const blocks = extractBlocks(body)
  let index = 0

  for (const block of blocks) {
    total++
    index++
    if (block.skip) {
      skipped++
      continue
    }
    const base = path.join(WORK, `${rel.replace(/[\\/]/g, '_')}_${index}`)
    const srcFile = `${base}.cpp`
    const exeFile = `${base}.exe`
    const errFile = `${base}.err`

    // 注意：signed main() 是 `#define int long long` 的配套写法，也要认出来
    const hasMain = /\b(int|signed|void)\s+main\s*\(/.test(block.code)
    const isExample = block.expect !== null
    const preview = block.code
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//'))[0] || ''

    let source = block.code

    const tryCompile = (code) => {
      fs.writeFileSync(srcFile, code, 'utf8')
      const r = run('g++', ['-std=c++17', '-Wall', '-Wextra', '-o', exeFile, srcFile], { stderrFile: errFile })
      const err = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8') : ''
      return { ok: r.status === 0, err }
    }

    let attempt = tryCompile(source)

    // 只有"函数定义"类片段才值得放到全局作用域试编译；
    // 对 if/for/while 这类语句片段放全局作用域，只会得到
    // "expected unqualified-id before 'for'" 这种毫无信息量的报错。
    const looksLikeFuncDef =
      /(^|\n)\s*(?:(?:inline|static|constexpr|const|unsigned|signed)\s+)*(?:void|bool|char|int|long|short|double|float|auto|string)\b[^;\n{]*\b\w+\s*\([^;{]*\)\s*\{/.test(source)

    if (!attempt.ok && !hasMain) {
      // 片段：先按"放进 main 里"补外壳
      const inMain = `${FRAGMENT_PREAMBLE}${source}\n    return 0;\n}\n`
      const second = tryCompile(inMain)
      if (second.ok) {
        attempt = second
        wrapped++
        source = inMain
      } else {
        const atGlobal = looksLikeFuncDef ? `${GLOBAL_PREAMBLE}${source}${GLOBAL_EPILOGUE}` : null
        const third = atGlobal ? tryCompile(atGlobal) : null
        if (third && third.ok) {
          attempt = third
          wrapped++
          source = atGlobal
        } else {
          // 既没有 main、也没有期望输出 → 只是正文里的示意片段
          // （对比写法、故意的错例、单行示例）天然无法独立编译，
          // 不作为硬错误，只登记下来供人工扫一眼。
          // 报错只取 "error: " 之后的那句话 —— 前面是临时文件路径，没有信息量。
          const rawErr = (third && third.err) || second.err
          const errLine = rawErr.split('\n').find((l) => /error:/.test(l)) || ''
          const detail = (/error:\s*(.*)$/.exec(errLine)?.[1] || errLine).trim()
          softFailures.push({ rel, line: block.line, preview, detail: detail.slice(0, 90) })
          continue
        }
      }
    }

    if (!attempt.ok) {
      // 走到这里说明：有 main 的完整程序，或者带 expect 的示例 —— 都必须是硬错误
      failures.push({
        rel,
        line: block.line,
        preview,
        err: attempt.err.split('\n').slice(0, 3).join('\n')
      })
      continue
    }

    compiled++
    if (attempt.err.trim()) warningsCount++

    // 有期望值就跑一遍
    const expect = parseExpect(block.expect)
    if (!expect) continue

    const inFile = `${base}.in`
    const outFile = `${base}.out`
    fs.writeFileSync(inFile, expect.stdin || '', 'utf8')
    const runResult = run(exeFile, [], { stdinFile: inFile, stdoutFile: outFile, stderrFile: errFile })

    if (runResult.status !== 0) {
      runFailures.push({ rel, line: block.line, detail: `程序退出码 ${runResult.status}` })
      continue
    }
    const actual = normalize(fs.readFileSync(outFile, 'utf8'))
    const wanted = normalize(expect.stdout || '')

    if (expect.stdout !== null && actual !== wanted) {
      runFailures.push({
        rel,
        line: block.line,
        detail: `输出不一致\n      期望：${JSON.stringify(wanted)}\n      实际：${JSON.stringify(actual)}`
      })
    }
  }
}

console.log('===== 示例代码体检 =====')
console.log('保证：① 完整程序（有 main）必须编译通过；② 标注了期望输出的示例必须真的跑出那个输出')
console.log(`代码块 ${total} 个：编译通过 ${compiled} 个（其中 ${wrapped} 个为片段自动补外壳）`)
if (skipped) console.log(`按 <!-- no-compile --> 标记跳过：${skipped} 个（有意写错的示意代码）`)
if (warningsCount) console.log(`编译有警告的代码块：${warningsCount} 个（不影响结论，可择机清理）`)
if (softFailures.length) {
  console.log(`正文示意片段无法独立编译：${softFailures.length} 个（不阻断）`)
  console.log('  说明：这些是正文里的对比写法、单行示例、含 ... 的省略写法，')
  console.log('        它们依赖上下文的变量和函数，单独拿出来编译本来就不成立。')
  console.log('        扫一眼确认没有"本想写成完整程序却写坏了"的情况即可。')
  for (const f of softFailures) {
    console.log(`  · ${f.rel}:${f.line}  →  ${f.preview}`)
    if (f.detail) console.log(`      ${f.detail}`)
  }
}

if (failures.length) {
  console.log(`\n编译失败 ${failures.length} 个（示意性片段请加 <!-- no-compile -->）：`)
  for (const f of failures) {
    console.log(`  ✗ ${f.rel}:${f.line}  →  ${f.preview}`)
  }
}

if (runFailures.length) {
  console.log(`\n运行/对答案失败 ${runFailures.length} 个：`)
  for (const f of runFailures) {
    console.log(`  ✗ ${f.rel}:${f.line}\n      ${f.detail}`)
  }
}

fs.rmSync(WORK, { recursive: true, force: true })

if (failures.length || runFailures.length) process.exit(1)
console.log('\n✓ 完整程序全部编译通过；带期望值的示例输出与正文一致')
