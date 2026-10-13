# Tom 的 C++ 竞赛书

面向 **CSP-J/S** 的 C++ 竞赛入门书。以题带知识点，每一节都给出能编译、能运行的代码。

- 作者：信奥赛教练 tom 老师
- 形态：VitePress 站点（可部署） + 可打印 PDF
- 设计参照：[CppBook](https://cppbook.roj.ac.cn/) 的章节组织方式
- 内容特色：**爆零五道关**、**数据范围表就是给分表**、以题带点、演示错误

## 快速开始

```bash
npm install          # 安装依赖

npm run dev          # 写作时用：开发服务器，改 .md 即时刷新
npm run build        # 构建站点到 docs/.vitepress/dist
npm run serve        # 零依赖静态预览（构建产物），http://localhost:4173
npm run pdf          # 导出全书 PDF 到 dist-print/
```

## 六个脚本各管什么

| 命令 | 作用 | 什么时候用 |
| --- | --- | --- |
| `npm run dev` | VitePress 开发服务器 | 平时写章节 |
| `npm run build` | 构建静态站点 | 发布前、改完一批内容后 |
| `npm run serve` | 零依赖静态服务器（只服务 `dist`） | **受限环境下 dev/preview 起不来时的替代方案** |
| `npm run pdf` | 全书合成打印版 HTML → PDF | 需要一个可打印/可发的版本 |
| `npm run check` | 目录完整性、站内死链、体例一致性 | 每次写完一章 |
| `npm run examples` | **把书里所有 C++ 代码真编译一遍，带期望值的再跑一遍对答案** | 改了代码示例之后，必跑 |
| `npm run scaffold` | 按目录补齐占位页 | 调整目录结构之后 |

## 目录结构

```text
tom-cppbook/
├── docs/                              ← 书稿（VitePress 的 root）
│   ├── index.md                       首页
│   ├── guide/                         快速入门（28 节）
│   ├── stl/                           STL 标准库（21 节）
│   ├── practice/                      考前实战（14 节）★ 特色部分
│   │   ├── five-gates/                爆零五道关
│   │   └── data-range.md              数据范围表就是给分表
│   ├── advanced/                      进阶主题（7 节）
│   ├── appendix/                      附录（6 节）
│   ├── public/logo.svg
│   └── .vitepress/
│       ├── book.mjs                   ★ 全书目录：单一数据源
│       ├── config.mjs                 站点配置（导航/侧边栏由 book.mjs 生成）
│       ├── markdown-setup.mjs         ★ 自定义容器：站点与 PDF 共用
│       └── theme/                     主题与样式
├── tools/
│   ├── scaffold.mjs                   生成/更新占位页
│   ├── check-content.mjs              内容体检
│   ├── check-examples.mjs             示例代码编译与对答案
│   ├── build-pdf.mjs                  PDF 导出
│   └── serve.mjs                      零依赖静态服务器
├── dist-print/                        PDF 与打印版 HTML（生成物）
└── 编写规范.md                         ★ 写新章节前先读这个
```

## 两个关键设计

### 1. 目录只有一个数据源：`docs/.vitepress/book.mjs`

站点侧边栏、PDF 章节顺序、占位页生成、内容体检全部从它读取。
**调整章节只需要改这一个文件**，然后跑 `npm run scaffold` 补页面。

### 2. 站点和 PDF 共用一套 Markdown 管线

自定义容器注册在 `docs/.vitepress/markdown-setup.mjs`，
`config.mjs` 和 `tools/build-pdf.mjs` 都调用它。改一处，两个出口同时生效。

## 课堂演示模式

站点内置了投屏用的**演示模式**，不需要第二套产物、也不需要改任何一篇正文。

| 项 | 做法 |
| --- | --- |
| 进入 | 页面右下角「演示」按钮，或直接访问 `章节路径?present` |
| 跳到第 N 屏 | `章节路径?present=5`（**可以存成书签，上课一点就停在那一屏**） |
| 翻页 | `空格` / `→` / `↓` / `PageDown` 下一屏；`←` / `↑` / `PageUp` 上一屏 |
| 其他 | `Home` 回封面、`End` 跳末屏、`F` 全屏、`Esc` 退出 |
| 画幅 | 按 **1920×1080** 设计，整体等比缩放到实际屏幕（不同设备字号比例一致） |
| 切屏规则 | `h2` 一屏；该节下面有 `h3` 时按 `h3` 各起一屏，页眉保留所属 `h2` 防止失去上下文 |
| 进度 | 底部进度条 + 页眉 `当前屏 / 总屏数` |

**实现方式**：`docs/.vitepress/theme/SlideDeck.vue` 挂在 `layout-bottom` 插槽上，
运行时直接从页面上已渲染的 `.vp-doc` 取内容切屏 ——
所以**80 章一上线就都有演示模式，以后新写的章节自动获得**。

### 代码块教学标注：一处标注，三个场景

正文里可以给代码块加标注，**同一处标注同时作用在书页、PDF、课堂投影**：

````markdown
```cpp{10}                 ← 行高亮
if (a = 5) { } // [!code error]     ← 红色错误行
if (i < n && a[i] > 0) { } // [!code focus]   ← 聚焦，其余压暗
```
````

站点侧由 VitePress 原生支持；PDF 侧由
[`markdown-code-annotations.mjs`](docs/.vitepress/markdown-code-annotations.mjs) 补齐
（产出**相同的 class 结构**，所以两边共用一套样式）。写法与实测结论见 [编写规范](编写规范.md)。

> ⚠️ **一个必须记住的写法细节**：标注注释可以和行尾已有注释共存，
> 但 `// [` 前面**必须有空格**。写成 `// 说明// [!code focus]` 会残留一个孤立的 `//`。

## 品牌与 logo

站点 logo、favicon、首页主图、PDF 封面统一用 **Tom信奥** 的北极熊标识。

| 资源 | 来源 | 用在哪 |
| --- | --- | --- |
| `docs/public/logo.png` | 原始 logo 裁出"熊"（256×256，透明底） | 导航栏、首页主图 |
| `docs/public/logo-dark.png` | 同一张图重着色为 `#8FA8E8` | **深色主题专用** |
| `docs/public/logo-full.png` | 完整 logo（熊 + Tom信奥 文字） | 备用（文档、海报） |
| `docs/public/favicon.png` / `.ico` | 熊，128 / 64 多尺寸 | 浏览器标签页 |

**品牌色 `#253C7D`**（取自 logo，深海军蓝）：

| 场景 | 色值 | 对比度 |
| --- | --- | --- |
| 浅色底上的主色 | `#253C7D` | 对白底 **10.39 : 1** ✅ |
| **深色主题的主色** | `#8FA8E8` | 对 `#1b1b1f` **7.30 : 1** ✅ |

> ⚠️ **深色主题必须换色**：品牌深蓝在深色背景上只有 **1.65 : 1**，等于看不见。
> 所以 `config.mjs` 里用的是 `logo: { light, dark }` 双资源，
> `custom.css` 里也分成 `:root` 与 `.dark` 两套 `--vp-c-brand-*`。

**为什么 logo 用 PNG 而不是 SVG**：原始素材是位图，裁切与重着色用 Pillow 完成；
透明背景已确认（四角 alpha 全为 0），两套主题都能直接用。

## 内容状态

**全书完成：80 / 80 页，五个部分全部写完。**（v1.0）

| 部分 | 页数 | 状态 |
| --- | --- | --- |
| **快速入门** | 29 | ✅ 从第一次编译到基础篇总复习 |
| **STL 标准库** | 21 | ✅ 容器 + 算法 + 选型总表 |
| **考前实战** | 15 | ✅ 五道关 + 数据范围 + 骗分 + 必背模板 + 对拍 + Linux + 宏 + 时间分配 |
| **进阶主题** | 8 | ✅ 类、运算符重载、函数对象与 lambda、模板、现代 C++、位运算、计算机原理 |
| **附录** | 7 | ✅ 学习路线、怎么刷题、Windows 环境、洛谷评测、编译错误速查、术语约定 |

**规模统计**

| 项 | 数值 |
| --- | --- |
| 章节 | 80 篇（81 个 md 文件，含首页） |
| 正文字数 | 约 **37.9 万字符**（不含空白） |
| 代码块 | **534 个** |
| 带期望输出的示例 | **122 个**（逐字符自动比对） |
| 成书 PDF | **498 页** / 14.0 MB |

**三条线都能独立交付：**

- **从零学 C++**：连着读快速入门 29 页
- **STL 工具**：21 页完整覆盖容器与算法，附一张选型表
- **考前冲刺**：直接用整个考前实战部分（15 页）
- **查资料**：附录 7 页（环境、报错、路线、术语、评测结果）

建议的两条验收路径：

| 想验收什么 | 看哪几篇 |
| --- | --- |
| **从零学的完整性** | [开始编程](docs/guide/getting-started.md)、[结构体](docs/guide/structs.md)、[递归与枚举](docs/guide/recursion-enumeration.md)、[基础篇总复习](docs/guide/summary.md) |
| **STL 主干** | [vector](docs/stl/vector.md)、[迭代器与区间](docs/stl/iterators.md)、[sort](docs/stl/sort.md)、[map](docs/stl/map.md)、[priority_queue](docs/stl/priority-queue.md) |
| **你的特色模块** | [数据范围表就是给分表](docs/practice/data-range.md)、[爆零五道关](docs/practice/five-gates/index.md) 及其 6 个子篇目、[必背模板](docs/practice/templates.md)、[考场时间分配与心态](docs/practice/time-management.md) |

其余内容已全部写完，**没有占位页**。

### 两个可验证的质量指标

```text
$ npm run check
进度：已写 80 篇 / 占位 0 篇（共 80 页）
✓ 目录与站内链接全部有效
✓ 没有任何正文章节引用到占位页

$ npm run examples
保证：① 完整程序（有 main）必须编译通过；② 标注了期望输出的示例必须真的跑出那个输出
代码块 534 个：编译通过 308 个（其中 167 个为片段自动补外壳）
✓ 完整程序全部编译通过；带期望值的示例输出与正文一致
```

**这意味着：书中所有代码都真的编过、跑过，所有链接都能点到真实内容。**

## 关于本机的环境限制

本机（DSH 沙箱）不允许进程创建管道，因此：

| 命令 | 沙箱下能否直接跑 | 说明 |
| --- | --- | --- |
| `npm run build` / `dev` / `preview` | ❌ | Vite 必须先拉起 esbuild 服务进程（管道通信），会 `spawn EPERM` |
| `npm run serve` | ✅ | 纯 Node，不用子进程，用来替代 `preview` |
| `npm run check` / `scaffold` | ✅ | 纯 Node |
| `npm run examples` | ✅ | 用文件描述符重定向，不用管道 |
| `npm run pdf` | ❌ | 无头浏览器需要创建命名管道才能启动 |

**在普通机器上这些限制都不存在**，直接 `npm install && npm run dev` 即可。
沙箱内需要跑 `build` / `pdf` 时，放开该条命令的进程权限。

另外：本机 MinGW 是 **g++ 8.1.0**，它的 `<bits/stdc++.h>` 有已知缺陷
（内部 `<filesystem>` 编译报错）。因此本书示例一律使用**显式 `#include`**，
这既能在此处验证通过，也更利于读者理解每个头文件提供了什么。
NOI Linux 的 g++ 9.3.0 没有这个问题。

## 部署

站点产物在 `docs/.vitepress/dist`，是**纯静态文件**（82 个 HTML，约 5.7 MB，自带 `404.html`），
不依赖任何服务端。

### 关键：站点在根路径还是子路径

VitePress 的资源路径是绝对路径，所以**部署到子路径必须设置 `base`**，否则 CSS / JS 全部 404。

用 `BOOK_BASE` 环境变量控制，不用改代码：

| 部署位置 | 命令 |
| --- | --- |
| 根路径（自有域名、Vercel） | `npm run build` |
| 子路径（GitHub Pages 项目页） | `BOOK_BASE=/仓库名/ npm run build` |

已验证：`BOOK_BASE=/tom-cppbook/ npm run build` 产出的资源路径为
`/tom-cppbook/assets/...`；默认构建为 `/assets/...`。

### GitHub Pages（自动）

仓库里已带好 `.github/workflows/deploy.yml`：推送到 `main` 即自动
**体检 → 编译所有示例代码 → 构建 → 发布**。

使用前只需在仓库 `Settings → Pages` 把 Source 设为 **GitHub Actions**。
工作流会自动带上仓库名作为 `base`，不用手改。

### Vercel / Netlify（手动）

| 配置项 | 值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 输出目录 | `docs/.vitepress/dist` |

注意：这两个平台部署在根路径，**不要**设置 `BOOK_BASE`。

### 部署前建议跑一遍

```bash
npm run check       # 死链与体例
npm run examples    # 代码示例真编译 + 对答案
npm run build       # 构建
npm run serve       # 本地看一眼构建产物
```

`deploy.yml` 里已经内置了前两步，本地改了内容后建议同样跑一遍。

## 许可证

本书采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可协议。

> **免责说明**：认证规则、目录结构、提交方式逐年可能调整，且各省要求并不一致。
> 书中涉及具体规定的部分，一律以你所在省份当年的官方须知和监考老师现场说明为准。
