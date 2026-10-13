# STL 是什么

**STL（Standard Template Library，标准模板库）是 C++ 自带的一套现成工具。**

它把你以后要反复写的东西——动态数组、排序、查找、栈、队列、集合、映射——
全部实现好了，而且是**经过高度优化**的。学会用它，你的代码会短一半，跑得更快，写错的概率更低。

## 本节学会什么

- 知道 STL 由哪几样东西组成，为什么竞赛必须学
- 建立"先查 STL，再手写"的条件反射
- 知道这一部分的学习顺序

## 为什么需要它

先看一段对比。**统计 n 个数里有多少个不同的数**：

手写版本：

<!-- expect
5
3 1 4 1 3
---
3
-->
```cpp
#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];

    sort(a + 1, a + n + 1);            // 排序
    int cnt = 1;                        // 手写去重
    for (int i = 2; i <= n; i++)
        if (a[i] != a[i - 1]) cnt++;
    cout << cnt << '\n';
}
```

STL 版本：

<!-- expect
5
3 1 4 1 3
---
3
-->
```cpp
#include <iostream>
#include <set>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<int> s;                         // 集合：自动去重 + 自动排序
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        s.insert(x);
    }
    cout << s.size() << '\n';
}
```

**同样的功能，更短的代码，更少的出错机会。**

::: exam STL 是复赛的"性价比之王"
- **省时间**：考场上 4 小时，手写平衡树不可能，`set` 一句就行
- **不易错**：手写排序、去重、二分是最容易写错边界的地方
- **够快**：STL 的实现经过优化，通常比你的手写版本快
- **是考点**：STL 本身就是 CSP-J/S 大纲里的内容

**判断标准：能用 STL 解决，就不要手写。**
:::

## STL 的四大件

| 部件 | 是什么 | 代表 |
| --- | --- | --- |
| **容器** | 存数据的结构 | `vector` `string` `set` `map` `stack` `queue` |
| **迭代器** | 遍历容器的"指针" | `begin()` `end()` |
| **算法** | 现成的操作 | `sort` `find` `unique` `lower_bound` |
| **函数对象** | 自定义比较规则 | `greater<int>()`、lambda |

这一部分按 **容器 → 算法 → 组合使用** 的顺序展开。

::: pitfall 两个最常见的 STL 事故
1. **`sort` 的比较函数写成 `<=`。** 比较函数必须满足"严格弱序"，用 `<=` 会在有重复元素时**段错误**。
   要写 `<`。
2. **一边遍历一边删除元素。** `erase` 会让当前迭代器失效，`it++` 就飞了。
   `map` / `set` 里要写 `it = s.erase(it)`。
:::

## 章节目录

| 节 | 内容 | 什么时候会用到 |
| --- | --- | --- |
| 1 | [STL 是什么](/stl/) | 本节 |
| 2 | [vector 动态数组](/stl/vector) | 长度不确定的数组 |
| 3 | [迭代器与区间](/stl/iterators) | 所有 STL 操作的通用语言 |
| 4 | [string 字符串](/stl/string) | 字符串拼接、查找、截取 |
| 5 | [pair 二元组](/stl/pair) | 打包两个值，排序时常用 |
| 6 | [stack 栈](/stl/stack) | 括号匹配、表达式求值 |
| 7 | [queue 队列](/stl/queue) | BFS |
| 8 | [deque 双端队列](/stl/deque) | 两端都要插入删除 |
| 9 | [list 链表（选读）](/stl/list) | 频繁中间插入删除 |
| 10 | [priority_queue 优先队列](/stl/priority-queue) | 每次取最大/最小 |
| 11 | [set 有序集合](/stl/set) | 去重 + 有序 + 快速查找 |
| 12 | [map 键值映射](/stl/map) | 计数、映射（如 `map<string,int>`） |
| 13 | [multimap 一键多值](/stl/multimap) | 一个键对应多个值 |
| 14 | [比较规则与函数对象](/stl/function-objects) | 自定义排序、`greater<int>()` |
| 15 | [sort 排序](/stl/sort) | 几乎所有题都要用 |
| 16 | [find 查找](/stl/find) | 在区间里找元素 |
| 17 | [二分查找](/stl/binary-search) | `lower_bound` / `upper_bound` |
| 18 | [unique 去重](/stl/unique) | 配合 `sort` 去重 |
| 19 | [nth_element 第 k 小](/stl/nth-element) | 只要第 k 小，不需要全排序 |
| 20 | [bitset 位集](/stl/bitset) | 二进制状态、集合运算 |
| 21 | [STL 总复习](/stl/summary) | 选型对照与自测 |

## 前置条件

需要先学完 [快速入门](/guide/) 的**数组、函数、结构体**三部分。
尤其是数组——不理解数组，`vector` 和迭代器都很难理解。

## 建议节奏

::: range 不要背 API，要背"什么时候用哪个"
1. 每学一个容器，**问自己一个问题**：这道题为什么需要它？（每节都会给具体题目）
2. **手打一遍**每个容器的基本操作，不要复制粘贴。
3. 学完后做 [STL 总复习](/stl/summary) 的选型自测：给一道题，说出用哪个容器。
:::
