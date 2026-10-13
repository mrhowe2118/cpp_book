import { defineConfig } from 'vitepress'
import { BOOK } from './book.mjs'
import { setupMarkdown } from './markdown-setup.mjs'

/** 由 book.mjs 生成侧边栏：全书目录常驻可见，不折叠 */
function buildSidebar() {
  return BOOK.sections.map((section) => {
    // 章节导读页若已被列为第 1 项（如 STL），就不再重复一条"导读"
    const numbered = section.items.map((item, i) => ({
      text: `${i + 1}. ${item.title}`,
      link: item.link
    }))
    const needsOverview = !section.items.some((item) => item.link === section.link)
    return {
      text: section.text,
      collapsed: false,
      items: needsOverview ? [{ text: '导读', link: section.link }, ...numbered] : numbered
    }
  })
}

export default defineConfig({
  lang: 'zh-CN',
  title: BOOK.title,
  description: BOOK.description,
  lastUpdated: true,
  cleanUrls: true,

  // 部署到子路径时（例如 GitHub Pages 的项目页 username.github.io/tom-cppbook/）
  // 用 BOOK_BASE 指定前缀，否则资源路径会 404：
  //   BOOK_BASE=/tom-cppbook/ npm run build
  base: process.env.BOOK_BASE || '/',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'alternate icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo-128.png' }],
    ['meta', { name: 'author', content: BOOK.author }],
    // 与 logo 同色（浏览器地址栏/移动端状态栏）
    ['meta', { name: 'theme-color', content: '#253C7D' }]
  ],

  markdown: {
    lineNumbers: false,
    config: setupMarkdown
  },

  themeConfig: {
    // 深色主题下深蓝 logo 会"消失"（对比度仅 1.65:1），所以给一套浅蓝变体
    logo: {
      light: '/logo.png',
      dark: '/logo-dark.png',
      alt: 'Tom信奥'
    },
    siteTitle: 'Tom 的 C++ 竞赛书',

    nav: [
      { text: '快速入门', link: '/guide/' },
      { text: 'STL 标准库', link: '/stl/' },
      { text: '考前实战', link: '/practice/' },
      { text: '进阶主题', link: '/advanced/' },
      { text: '附录', link: '/appendix/' }
    ],

    sidebar: buildSidebar(),

    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    lastUpdatedText: '最后更新于',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索书中内容', buttonAriaLabel: '搜索书中内容' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc'
            }
          }
        }
      }
    },

    footer: {
      message: '以本省最新须知与考场说明为准；本书内容会随规则更新。',
      copyright: `© 2026 ${BOOK.author}`
    }
  }
})
