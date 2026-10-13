import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import SlideDeck from './SlideDeck.vue'
import './custom.css'
import './slides.css'

export default {
  extends: DefaultTheme,

  /**
   * 把演示模式挂到 layout-bottom —— 这是 VitePress 默认主题提供的全局插槽，
   * 所有页面都会渲染它，所以 80 章一上线就都有演示模式，不用改任何一篇正文。
   * 组件内部会自己判断当前页有没有可演示的正文（没有就不显示入口）。
   */
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(SlideDeck)
    })
  }
}
