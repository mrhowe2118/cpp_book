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

## 内容状态

当前：**已写 47 篇 / 占位 33 篇**（共 80 页）。

**已经整段完成的部分：**

| 部分 | 状态 |
| --- | --- |
| **快速入门（28 篇）** | ✅ **全段完成**——从第一次编译到基础篇总复习，一条完整可读的入门线：<br>环境与程序结构 → 注释风格 → 数据类型 → 输入输出 → 变量作用域 → 运算符 → 单元练习① → 分支 → 循环 → 数组 → 二维与前缀和 → 测试调试 → 复杂度 → 结构体 → 单元练习② → 字符与字符串 → C 风格字符串 → C++ string → 字符串练习 → 函数 → 参数与引用 → 递归 → 递归与枚举 → 递归练习 → 指针（选读）→ 文件操作（选读）→ 总复习 |
| **考前实战（14 篇）** | ✅ **全段完成**——五道关 7 篇 + 数据范围 + 骗分 + 必背模板 + 对拍 + Linux + 宏 + 时间分配 |
| 五道关系列（7 篇） | ✅ 总纲 + 收录关 + 编译关 + 文件关 + 结果关 + 资源关 + 申诉不是安全网 |
| 招牌模块 | ✅ 数据范围表就是给分表 |
| 各部分导读 | ✅ 快速入门 / STL / 考前实战 / 进阶 / 附录 |

**两条主线现在都完整了：**

- **从零学 C++**：连着读快速入门 28 节，从装环境读到"能用递归枚举所有情况"
- **考前冲刺**：直接用整个考前实战部分（14 节）

二者在《数据范围表就是给分表》与《文件操作》处自然衔接。

**接下来缺的是 STL（21 篇）、进阶主题（7 篇）、附录（6 篇）。**

建议的两条验收路径：

| 想验收什么 | 看哪几篇 |
| --- | --- |
| **从零学的完整性** | [开始编程](docs/guide/getting-started.md)、[结构体](docs/guide/structs.md)、[递归与枚举](docs/guide/recursion-enumeration.md)、[基础篇总复习](docs/guide/summary.md) |
| **你的特色模块** | [数据范围表就是给分表](docs/practice/data-range.md)、[爆零五道关](docs/practice/five-gates/index.md) 及其 6 个子篇目、[必背模板](docs/practice/templates.md)、[考场时间分配与心态](docs/practice/time-management.md) |

其余 33 页（STL、进阶、附录）是按统一体例生成的占位页，都带有写作清单，不会被算进 PDF。

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
