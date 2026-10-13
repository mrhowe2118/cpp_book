<script setup>
/**
 * 课堂演示模式 —— 把当前章节的正文按标题切屏，全屏放映。
 *
 * 设计要点：
 *  1. 【零内容改动】直接从页面上已渲染的 .vp-doc 取内容，
 *     所以 80 章一上线就都有演示模式，以后新写的章节自动获得。
 *  2. 【16:9 固定画幅】按 1920×1080 设计，整体等比缩放到实际屏幕 ——
 *     这样在 1366×768 的老投影仪和 2K 屏上，字号比例一致。
 *  3. 【内容自适应】某一屏内容过高时自动再缩一档（有下限），
 *     宁可字小一点，也不要内容被裁掉。
 *  4. 【切屏规则】h2 一屏；若该节下面还有 h3，则 h3 各自起一屏，
 *     并在页眉保留 h2 标题，避免讲着讲着失去上下文。
 *
 * 键盘：空格 / → / ↓ / PageDown 下一屏，← / ↑ / PageUp 上一屏，
 *       Home 回封面，End 跳末屏，F 全屏切换，Esc 退出。
 */
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()

const DESIGN_W = 1920
const DESIGN_H = 1080
const MIN_CONTENT_SCALE = 0.55

const available = ref(false)
const active = ref(false)
const slides = ref([])
const index = ref(0)
const stageScale = ref(1)
const contentScale = ref(1)

const bodyEl = ref(null)
const stageEl = ref(null)

const current = computed(() => slides.value[index.value] || { title: '', html: '' })
const total = computed(() => slides.value.length)

/** 去掉幻灯片里没有意义的交互元素（复制按钮、锚点链接） */
function cleanClone(el) {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('button.copy, .header-anchor, a.header-anchor').forEach((n) => n.remove())
  return clone
}

function textOf(el) {
  return (el?.textContent || '').replace(/^#+/, '').trim()
}

/** 从页面 DOM 构建幻灯片数组 */
function buildSlides() {
  if (typeof document === 'undefined') return []
  const doc = document.querySelector('.vp-doc')
  const root = findContentRoot()
  if (!doc || !root) return []

  const nodes = Array.from(root.children)
  if (!nodes.length) return []

  const chapterTitle = textOf(doc.querySelector('h1')) || document.title
  const out = [{ title: chapterTitle, parent: '', cover: true, html: '' }]
  const clone = (el) => cleanClone(el).outerHTML

  // ---- 第一步：按 h2 分组；h2 之前的内容（章前引语）并入封面，不单独占一屏
  const groups = []
  let group = null
  for (const el of nodes) {
    const tag = el.tagName
    if (tag === 'H1') continue
    if (tag === 'H2') {
      group = { title: textOf(el), nodes: [el] }
      groups.push(group)
      continue
    }
    if (!group) {
      out[0].html += clone(el)
      continue
    }
    group.nodes.push(el)
  }

  // ---- 第二步：每组决定怎么切屏
  for (const g of groups) {
    const firstH3 = g.nodes.findIndex((n) => n.tagName === 'H3')

    // 没有小标题：整组就是一屏
    if (firstH3 === -1) {
      out.push({ title: g.title, parent: '', cover: false, html: g.nodes.map(clone).join('') })
      continue
    }

    // 有小标题：h2 到第一个 h3 之间若【还有正文】，先出一屏；
    // 若没有正文（h2 下面紧跟 h3），就不要出一屏只有标题的空壳 ——
    // 那种情况下 h2 标题由页眉的 parent 承担
    const head = g.nodes.slice(0, firstH3)
    if (head.some((n) => n.tagName !== 'H2')) {
      out.push({ title: g.title, parent: '', cover: false, html: head.map(clone).join('') })
    }

    // 其余按 h3 逐节切屏，页眉保留所属 h2，避免讲着讲着失去上下文
    let sub = null
    for (const n of g.nodes.slice(firstH3)) {
      if (n.tagName === 'H3') {
        sub = { title: textOf(n), parent: g.title, cover: false, html: clone(n) }
        out.push(sub)
      } else if (sub) {
        sub.html += clone(n)
      }
    }
  }

  return out.filter((s) => s.cover || s.html.trim())
}

/** 把 1920×1080 的舞台等比缩放进屏幕 */
function fitStage() {
  if (typeof window === 'undefined') return
  stageScale.value = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
}

/** 内容高于一屏时再缩一档，保证不裁切 */
async function fitContent() {
  // 先复位再测量：transform 不影响布局，如果带着上一屏的缩放测，
  // scrollHeight 是"已缩小后"的高度，会越缩越小
  contentScale.value = 1
  await nextTick()
  const el = bodyEl.value
  if (!el) return
  const availH = el.clientHeight
  const needH = el.scrollHeight
  contentScale.value = needH > availH ? Math.max(MIN_CONTENT_SCALE, availH / needH) : 1
}

/**
 * 找到正文的真正容器。
 *
 * VitePress 的产物是 `<div class="vp-doc"><div>…正文…</div></div>`，
 * 中间多包了一层【无 class 的 div】。直接取 .vp-doc.children 只会拿到
 * 这一个包装 div，整章会被当成一屏 —— 必须把它剥掉。
 */
function findContentRoot() {
  const doc = document.querySelector('.vp-doc')
  if (!doc) return null
  let root = doc
  // 只在"唯一子元素、是无 class 的 div、且里面确实有标题"时才继续往里走，
  // 避免误剥正文里合法的容器
  while (
    root.children.length === 1 &&
    root.children[0].tagName === 'DIV' &&
    root.children[0].className === '' &&
    root.children[0].querySelector('h1, h2, h3')
  ) {
    root = root.children[0]
  }
  return root
}

function open() {
  const built = buildSlides()
  if (!built.length) return
  slides.value = built
  index.value = 0
  active.value = true
  document.documentElement.style.overflow = 'hidden'
  fitStage()
  fitContent()
  if (stageEl.value?.requestFullscreen) {
    stageEl.value.requestFullscreen().catch(() => {})
  }
}

/** ?present 与 ?present=3 —— 后者直接跳到第 4 屏，方便把某一屏存成书签 */
function requestedSlide() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  if (!params.has('present')) return null
  const raw = params.get('present')
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n - 1 : 0
}

async function close() {
  active.value = false
  document.documentElement.style.overflow = ''
  if (typeof document !== 'undefined' && document.fullscreenElement) {
    await document.exitFullscreen().catch(() => {})
  }
}

function goto(i) {
  const n = slides.value.length
  if (!n) return
  index.value = Math.min(n - 1, Math.max(0, i))
  fitContent()
}
const next = () => goto(index.value + 1)
const prev = () => goto(index.value - 1)

function toggleFullscreen() {
  if (typeof document === 'undefined') return
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  else stageEl.value?.requestFullscreen?.().catch(() => {})
}

function onKey(e) {
  if (!active.value) return
  switch (e.key) {
    case ' ':
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case 'Enter':
      e.preventDefault()
      next()
      break
    case 'Backspace':
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault()
      prev()
      break
    case 'Home':
      e.preventDefault()
      goto(0)
      break
    case 'End':
      e.preventDefault()
      goto(slides.value.length - 1)
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'Escape':
      // 全屏时浏览器会先吞掉 Esc 退出全屏，这里只在非全屏时退演示
      if (!document.fullscreenElement) close()
      break
  }
}

function onResize() {
  if (active.value) fitStage()
}

/** 当前页有没有可演示的正文 */
function detect() {
  available.value = !!document.querySelector('.vp-doc') && !!frontmatter.value
}

onMounted(() => {
  detect()
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  // 支持带参数直接进演示模式：?present 或 ?present=3
  // 上课前可以把 chapter?present=5 存成书签，一点就进放映并停在指定那一屏
  const wanted = requestedSlide()
  if (wanted !== null) {
    setTimeout(() => {
      open()
      if (wanted > 0) goto(wanted)
    }, 120)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  if (typeof document !== 'undefined') document.documentElement.style.overflow = ''
})

// SPA 切页时收起演示，并重新判断当前页能否演示
watch(
  () => page.value.relativePath,
  async () => {
    if (active.value) await close()
    await nextTick()
    setTimeout(detect, 50)
  }
)
</script>

<template>
  <ClientOnly>
    <button
      v-if="available && !active"
      class="slide-launch"
      title="进入演示模式（课堂投屏用）"
      @click="open"
    >
      演示
    </button>
  </ClientOnly>

  <ClientOnly>
    <div v-if="active" ref="stageEl" class="slide-stage" @click.self="next">
      <div
        class="slide-canvas"
        :style="{ transform: `scale(${stageScale})`, width: DESIGN_W + 'px', height: DESIGN_H + 'px' }"
      >
        <!-- 页眉：章节 / 小节 / 进度 -->
        <header class="slide-head">
          <span class="slide-head-chapter">{{ slides[0]?.title || '' }}</span>
          <span v-if="current.parent" class="slide-head-section">{{ current.parent }}</span>
          <span class="slide-head-count">{{ index + 1 }} / {{ total }}</span>
        </header>

        <!-- 封面：章标题 + 章前引语（引语并入封面，不单独占一屏） -->
        <div v-if="current.cover" class="slide-cover">
          <h2>{{ current.title }}</h2>
          <div
            v-if="current.html"
            class="slide-cover-lead slide-content vp-doc"
            v-html="current.html"
          />
          <p class="slide-cover-hint">空格 / → 翻页　← 回退　F 全屏　Esc 退出</p>
        </div>

        <!-- 正文 -->
        <div v-else ref="bodyEl" class="slide-body">
          <div class="slide-content vp-doc" :style="{ transform: `scale(${contentScale})` }" v-html="current.html" />
        </div>

        <div class="slide-progress"><i :style="{ width: ((index + 1) / total) * 100 + '%' }" /></div>
      </div>

      <!-- 控制条（鼠标／翻页笔也能用） -->
      <div class="slide-controls" @click.stop>
        <button :disabled="index === 0" @click="prev">← 上一屏</button>
        <span class="slide-controls-count">{{ index + 1 }} / {{ total }}</span>
        <button :disabled="index >= total - 1" @click="next">下一屏 →</button>
        <button @click="toggleFullscreen">全屏</button>
        <button class="slide-controls-exit" @click="close">退出 (Esc)</button>
      </div>
    </div>
  </ClientOnly>
</template>
