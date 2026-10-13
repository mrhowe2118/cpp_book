/**
 * Markdown 渲染管线 —— 站点与 PDF 导出共用。
 *
 * 只要在这里注册，网站和 PDF 两个出口的表现就完全一致；
 * 不要在 config.mts 或 build-pdf.mjs 里各写一份。
 *
 * 自定义容器（正文里这样用）：
 *   ::: gate 收录关        —— 五道关的单个关卡
 *   ::: range n ≤ 10^5     —— 数据范围 / 给分档位
 *   ::: pitfall            —— 易错点
 *   ::: exam 交卷前 30 分钟 —— 考场动作
 */

import container from 'markdown-it-container'

/** 容器名 -> 默认标题 */
export const CUSTOM_CONTAINERS = {
  gate: '关卡',
  range: '数据范围速查',
  pitfall: '易错点',
  exam: '考场动作'
}

function registerContainer(md, name, defaultTitle) {
  md.use(container, name, {
    render(tokens, idx) {
      const token = tokens[idx]
      const info = token.info.trim().slice(name.length).trim()
      if (token.nesting === 1) {
        const title = md.renderInline(info || defaultTitle)
        return `<div class="custom-block ${name}"><p class="custom-block-title">${title}</p>\n`
      }
      return '</div>\n'
    }
  })
}

/** 在 markdown-it 实例上安装本书的全部扩展 */
export function setupMarkdown(md) {
  for (const [name, title] of Object.entries(CUSTOM_CONTAINERS)) {
    registerContainer(md, name, title)
  }
  return md
}
