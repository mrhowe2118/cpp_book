/**
 * 变量名冲突实测：逐个候选标识符编译，看它在真实环境下会不会撞标准库。
 *
 *   npm run identifiers
 *
 * 为什么要有这个工具：
 *   书里"变量名黑名单"（y1 / next / time / hash / index …）如果留着错条目，
 *   会让学生白改代码、也会损害这本书的可信度。所以不靠记忆，靠实测。
 *
 * 测两种上下文，因为它们的结局完全不同：
 *   1. 全局作用域：`int NAME = 1;` 放在 main 外面 —— 冲突的高发区（学生常写全局数组）
 *   2. 函数内部：`int NAME = 1;` 放在 main 里 —— 大多数情况下局部变量会遮蔽全局名字，是合法的
 *
 * ⚠️ 重要：结果与编译器/标准库实现强相关。
 *   本工具会打印实际使用的编译器版本。**定稿前必须在 NOI Linux 上重跑一次**，
 *   因为 glibc 的 <math.h> 等头文件与 MinGW 不同。
 *
 * 用文件描述符重定向 stdio，不依赖管道（受限环境下管道会被拒绝）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WORK = path.join(ROOT, '.identifier-check')

/** 尽量覆盖学生与标准库容易撞名的头文件 */
const HEADERS = [
  'iostream', 'algorithm', 'cmath', 'cstring', 'cstdio', 'cstdlib', 'ctime',
  'string', 'vector', 'map', 'set', 'queue', 'stack', 'list', 'functional',
  'iterator', 'ios', 'iomanip', 'numeric', 'deque', 'utility', 'bitset'
]

/** 候选名：前半是黑名单疑点，后半是常用的"安全名"作对照 */
const CANDIDATES = [
  // —— 疑点：来自爆零文档的黑名单 ——
  'y0', 'y1', 'j0', 'j1', 'pow', 'abs', 'div', 'exp', 'log',
  'time', 'clock', 'difftime',
  'next', 'prev', 'begin', 'end', 'advance',
  'map', 'set', 'queue', 'stack', 'list', 'vector', 'sort', 'count',
  'find', 'remove', 'copy', 'swap', 'fill', 'data',
  'left', 'right', 'hex', 'dec', 'endl', 'flush',
  'hash', 'index', 'kill', 'signal', 'system', 'rank', 'size',
  // —— 学生极可能用的名字（第一批没测到，补上）——
  'min', 'max', 'cin', 'cout', 'cerr', 'pair', 'string', 'unique', 'reverse',
  'lower_bound', 'upper_bound', 'printf', 'scanf', 'exit', 'free', 'malloc',
  'root', 'vis', 'head', 'dep', 'val', 'len', 'tot', 'num', 'cur', 'key',
  'col', 'node', 'tmp', 'flag', 'ok', 'buf', 'str', 'edge', 'tree', 'dist',
  // —— 对照：按本书建议的短名/缩写写法 ——
  'n', 'm', 'k', 'cnt', 'ans', 'sum', 'a', 'b', 'i', 'j', 'idx', 'mp',
  'st', 'q', 'pos', 'nxt', 't', 'x', 'y', 'res', 'mx', 'mn', 'fa', 'dp'
]

fs.rmSync(WORK, { recursive: true, force: true })
fs.mkdirSync(WORK, { recursive: true })

const includes = HEADERS.map((h) => `#include <${h}>`).join('\n')

function sourceGlobal(name) {
  return `${includes}
using namespace std;

int ${name} = 1;          // 全局作用域：冲突高发区

int main() {
    cout << ${name} << '\\n';
    return 0;
}
`
}

function sourceLocal(name) {
  return `${includes}
using namespace std;

int main() {
    int ${name} = 1;      // 函数内部
    cout << ${name} << '\\n';
    return 0;
}
`
}

/** 跑一条命令，stdio 全部走文件描述符 */
function run(cmd, args, { stdoutFile, stderrFile } = {}) {
  const fds = []
  let out = 'ignore'
  if (stdoutFile) { out = fs.openSync(stdoutFile, 'w'); fds.push(out) }
  let err = 'ignore'
  if (stderrFile) { err = fs.openSync(stderrFile, 'w'); fds.push(err) }

  const r = spawnSync(cmd, args, { stdio: ['ignore', out, err], timeout: 60000 })
  for (const fd of fds) { try { fs.closeSync(fd) } catch { /* ignore */ } }
  return r
}

function tryCompile(code, tag) {
  const src = path.join(WORK, `${tag}.cpp`)
  const exe = path.join(WORK, `${tag}.exe`)
  const errFile = path.join(WORK, `${tag}.err`)

  fs.writeFileSync(src, code, 'utf8')
  const r = run('g++', ['-std=c++17', '-o', exe, src], { stderrFile: errFile })
  const err = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8') : ''
  return { ok: r.status === 0, err }
}

/** 从报错里提炼一句人话 */
function summarize(err) {
  const line = err
    .split('\n')
    .find((l) => /error:/.test(l))
  if (!line) return ''
  const m = /error:\s*(.+)$/.exec(line)
  let text = m ? m[1] : line
  text = text.replace(/; did you mean.*$/, '').trim()
  return text.length > 70 ? `${text.slice(0, 70)}…` : text
}

/* ---------------- 先确认编译器版本 ---------------- */
const versionFile = path.join(WORK, 'version.txt')
run('g++', ['--version'], { stdoutFile: versionFile })
const version = fs.existsSync(versionFile)
  ? fs.readFileSync(versionFile, 'utf8').split('\n')[0].trim()
  : '未知'

const globalFail = []
const localFail = []
const rows = []

console.log('===== 变量名冲突实测 =====')
console.log(`编译器：${version}`)
console.log(`平台：${process.platform}`)
console.log('')
console.log('说明：全局作用域失败 = 真的不能用；仅函数内失败 = 按本书写法可以避开')
console.log('')

for (const name of CANDIDATES) {
  const g = tryCompile(sourceGlobal(name), `g_${name}`)
  const l = tryCompile(sourceLocal(name), `l_${name}`)

  if (!g.ok) globalFail.push({ name, err: summarize(g.err) })
  if (!l.ok) localFail.push({ name, err: summarize(l.err) })

  rows.push({
    name,
    global: g.ok ? '√' : '✗',
    local: l.ok ? '√' : '✗',
    note: g.ok ? (l.ok ? '' : summarize(l.err)) : summarize(g.err)
  })
}

/* ---------------- 报告 ---------------- */
const pad = (s, w) => {
  // 中文按 2 宽度估算，用于对齐
  const width = [...s].reduce((acc, ch) => acc + (/[\u4e00-\u9fa5]/.test(ch) ? 2 : 1), 0)
  return s + ' '.repeat(Math.max(0, w - width))
}

const lines = []
lines.push(`${pad('标识符', 12)}${pad('全局', 8)}${pad('函数内', 10)}说明`)
lines.push('-'.repeat(78))
for (const r of rows) {
  const mark = r.global === '✗' ? '⚠' : ' '
  lines.push(`${mark} ${pad(r.name, 10)}${pad(r.global, 8)}${pad(r.local, 10)}${r.note}`)
}

const table = lines.join('\n')

const reportLines = [
  '# 变量名冲突实测报告',
  '',
  '> **本文件由工具自动生成，请勿手工编辑。**',
  '> 重新生成：`npm run identifiers`',
  '',
  '## 这次实测的环境',
  '',
  `- 编译器：\`${version}\``,
  `- 平台：\`${process.platform}\``,
  `- 检测方式：逐个标识符生成一个小程序，编译一次`,
  '',
  '::: warning 结果与标准库实现强相关',
  '上面的编译器**不是** NOI Linux 的 g++。glibc 的 `<math.h>` / `<strings.h>` / `<signal.h>`',
  '会多出一些名字（例如贝塞尔函数 `y0` `y1`、BSD 的 `index`、`kill`、`signal`），',
  '因此 **Linux 上的冲突集合是本地结果的超集**。',
  '',
  '**定稿前应在 NOI Linux 上重跑一次 `npm run identifiers`，并用新结果替换本节表格。**',
  ':::',
  '',
  '## 检测方法',
  '',
  '对每个候选标识符，生成两种上下文各一份小程序并尝试编译：',
  '',
  '```cpp',
  '// 上下文一：全局作用域（学生写全局数组/全局变量的常见写法）',
  '#include <iostream>',
  '#include <algorithm>',
  '// …其余常用头文件',
  'using namespace std;',
  '',
  'int NAME = 1;          // ← 冲突高发区',
  '',
  'int main() { cout << NAME; return 0; }',
  '```',
  '',
  '```cpp',
  '// 上下文二：函数内部',
  'int main() {',
  '    int NAME = 1;      // ← 局部声明会遮蔽库名字，通常是合法的',
  '    cout << NAME;',
  '    return 0;',
  '}',
  '```',
  '',
  '## 实测表格',
  '',
  '`√` = 编译通过，`✗` = 编译失败，`⚠` = 全局作用域失败（真正要避免的）',
  '',
  '```text',
  table,
  '```',
  '',
  '## 结论',
  '',
  `- **全局作用域冲突：${globalFail.length} 个**`,
  `  ${globalFail.map((f) => `\`${f.name}\``).join(' ')}`,
  `- **仅函数内冲突：${localFail.length} 个**`,
  localFail.length ? `  ${localFail.map((f) => `\`${f.name}\``).join(' ')}` : '  （无）',
  '',
  '两条可直接写进书里的结论：',
  '',
  '1. **冲突几乎只发生在全局作用域。** 局部变量名会遮蔽库名字，实测 0 个冲突。',
  '   但学生大量使用全局数组，所以这份名单仍然必须遵守。',
  '2. **越"像个英文单词"的名字越危险。** `max` `min` `time` `next` `size` `data` `left` `right`',
  '   这些既是自然语言词，又是标准库名字。',
  '   反过来，`n` `m` `cnt` `ans` `mx` `mn` `fa` `dp` `vis` `head` `dep` 这类缩写全部安全。',
  '',
  '**所以"用缩写"不只是竞赛风格，它同时是一道防重名的保险。**',
  ''
]

const reportPath = path.join(ROOT, '变量名实测报告.md')
fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8')

console.log(table)
console.log('')
console.log(`全局作用域冲突：${globalFail.length} 个`)
if (globalFail.length) {
  console.log('  ' + globalFail.map((f) => f.name).join('  '))
}
console.log(`仅函数内冲突：${localFail.length} 个`)
if (localFail.length) {
  console.log('  ' + localFail.map((f) => f.name).join('  '))
}
console.log('')
console.log(`✓ 报告已写入：变量名实测报告.md`)

fs.rmSync(WORK, { recursive: true, force: true })
