/**
 * 《Tom 的 C++ 竞赛书》全书目录 —— 单一数据源。
 *
 * 这里定义的顺序同时驱动三件事，改一处即可：
 *   1. VitePress 侧边栏 / 导航（docs/.vitepress/config.mts）
 *   2. PDF 导出的章节顺序（tools/build-pdf.mjs）
 *   3. 骨架页生成（tools/scaffold.mjs）
 *
 * link 规则：以 "/" 结尾表示该目录的 index.md，否则为同名 .md。
 * 由 link 推导源文件路径见 fileOf()。
 */

export const BOOK = {
  title: 'Tom 的 C++ 竞赛书',
  author: '信奥赛教练 tom 老师',
  description: '面向 CSP-J/S 的 C++ 竞赛入门书：从第一次编译，到考场上不丢分。',
  sections: [
    {
      text: '快速入门',
      link: '/guide/',
      items: [
        { title: '开始编程', link: '/guide/getting-started' },
        { title: '第一个程序', link: '/guide/first-program' },
        { title: '注释与代码风格', link: '/guide/comments' },
        { title: '数据类型与溢出', link: '/guide/data-types' },
        { title: '输入输出', link: '/guide/input-output' },
        { title: '变量与作用域', link: '/guide/variables' },
        { title: '运算符与优先级', link: '/guide/operators' },
        { title: '基础语法单元练习', link: '/guide/syntax-exercises' },
        { title: '分支结构', link: '/guide/control-flow' },
        { title: '循环结构', link: '/guide/loops' },
        { title: '数组', link: '/guide/arrays' },
        { title: '数组进阶：二维与前缀和', link: '/guide/arrays-advanced' },
        { title: '测试与调试', link: '/guide/testing-and-debugging' },
        { title: '复杂度直觉与数据范围', link: '/guide/complexity-intuition' },
        { title: '结构体', link: '/guide/structs' },
        { title: '控制与数据单元练习', link: '/guide/control-and-data-exercises' },
        { title: '字符与字符串', link: '/guide/strings' },
        { title: 'C 风格字符串', link: '/guide/c-strings' },
        { title: 'C++ string', link: '/guide/cpp-string' },
        { title: '字符串练习', link: '/guide/string-exercises' },
        { title: '函数入门', link: '/guide/functions' },
        { title: '函数参数与引用', link: '/guide/function-parameters' },
        { title: '递归', link: '/guide/recursion' },
        { title: '递归与枚举', link: '/guide/recursion-enumeration' },
        { title: '递归练习', link: '/guide/recursion-exercises' },
        { title: '指针（选读）', link: '/guide/pointers' },
        { title: '文件操作（选读）', link: '/guide/file-io' },
        { title: '基础篇总复习', link: '/guide/summary' }
      ]
    },
    {
      text: 'STL 标准库',
      link: '/stl/',
      items: [
        { title: 'STL 是什么', link: '/stl/' },
        { title: 'vector 动态数组', link: '/stl/vector' },
        { title: '迭代器与区间', link: '/stl/iterators' },
        { title: 'string 字符串', link: '/stl/string' },
        { title: 'pair 二元组', link: '/stl/pair' },
        { title: 'stack 栈', link: '/stl/stack' },
        { title: 'queue 队列', link: '/stl/queue' },
        { title: 'deque 双端队列', link: '/stl/deque' },
        { title: 'list 链表（选读）', link: '/stl/list' },
        { title: 'priority_queue 优先队列', link: '/stl/priority-queue' },
        { title: 'set 有序集合', link: '/stl/set' },
        { title: 'map 键值映射', link: '/stl/map' },
        { title: 'multimap 一键多值', link: '/stl/multimap' },
        { title: '比较规则与函数对象', link: '/stl/function-objects' },
        { title: 'sort 排序', link: '/stl/sort' },
        { title: 'find 查找', link: '/stl/find' },
        { title: '二分查找', link: '/stl/binary-search' },
        { title: 'unique 去重', link: '/stl/unique' },
        { title: 'nth_element 第 k 小', link: '/stl/nth-element' },
        { title: 'bitset 位集', link: '/stl/bitset' },
        { title: 'STL 总复习', link: '/stl/summary' }
      ]
    },
    {
      text: '考前实战',
      link: '/practice/',
      items: [
        { title: '爆零五道关（总纲）', link: '/practice/five-gates/' },
        { title: '收录关：代码压根没交上去', link: '/practice/five-gates/collection' },
        { title: '编译关：评测机不认识你的代码', link: '/practice/five-gates/compile' },
        { title: '文件关：freopen 第一大现场', link: '/practice/five-gates/file' },
        { title: '结果关：答案对了，分数没来', link: '/practice/five-gates/result' },
        { title: '资源关：MLE / RE / TLE', link: '/practice/five-gates/resource' },
        { title: '申诉不是安全网', link: '/practice/five-gates/appeal' },
        { title: '数据范围表就是给分表', link: '/practice/data-range' },
        { title: '骗分与部分分', link: '/practice/partial-score' },
        { title: '必背模板', link: '/practice/templates' },
        { title: '对拍与随机数据', link: '/practice/stress-testing' },
        { title: '评测环境与 Linux 命令', link: '/practice/linux' },
        { title: '竞赛宏与实用技巧', link: '/practice/macros' },
        { title: '考场时间分配与心态', link: '/practice/time-management' }
      ]
    },
    {
      text: '进阶主题',
      link: '/advanced/',
      items: [
        { title: '类与对象入门', link: '/advanced/classes' },
        { title: '运算符重载', link: '/advanced/operator-overloading' },
        { title: '函数对象与 lambda', link: '/advanced/function-objects' },
        { title: '模板入门', link: '/advanced/templates' },
        { title: '现代 C++ 实用特性', link: '/advanced/modern-cpp' },
        { title: '位运算', link: '/advanced/bit-operations' },
        { title: '计算机原理（选读）', link: '/advanced/computer-fundamentals' }
      ]
    },
    {
      text: '附录',
      link: '/appendix/',
      items: [
        { title: '学习路线与节奏', link: '/appendix/roadmap' },
        { title: '学习建议：怎么刷题', link: '/appendix/learning-advice' },
        { title: 'Windows 环境搭建', link: '/appendix/windows-setup' },
        { title: '洛谷提交与评测结果', link: '/appendix/luogu-judge' },
        { title: '常见编译错误速查', link: '/appendix/compile-errors' },
        { title: '本书约定与符号', link: '/appendix/conventions' }
      ]
    }
  ]
}

/** link -> docs 目录下的相对 md 路径 */
export function fileOf(link) {
  const clean = link.replace(/^\//, '')
  return clean.endsWith('/') ? `${clean}index.md` : `${clean}.md`
}

/** 全书按阅读顺序拍平的章节列表 */
export function flatChapters() {
  const out = []
  for (const section of BOOK.sections) {
    out.push({ section: section.text, link: section.link, file: fileOf(section.link), title: section.text, isSectionIndex: true })
    for (const item of section.items) {
      out.push({ section: section.text, link: item.link, file: fileOf(item.link), title: item.title, isSectionIndex: false })
    }
  }
  return out
}
