# priority_queue 优先队列

普通队列按**到达顺序**出队。优先队列按**优先级**出队——不管谁先来，**最大的先走**。

它是最小/最大值的"自动取用机"，每次操作 O(log n)。

## 本节学会什么

- 用 `priority_queue` 每次取出最大值
- 会用 `greater<int>` 做小根堆
- 会用自定义比较规则（结构体）
- 知道它和 `set` 的区别，以及什么时候用哪个
- 认识堆的复杂度：插入和弹出都是 O(log n)

## 为什么需要它

看一个需求：**反复取出一堆数里最大的那个**。

| 做法 | 每次取最大 | n 次总共 |
| --- | --- | --- |
| 每次扫一遍数组 | O(n) | **O(n²)** ❌ |
| 每次排一次序 | O(n log n) | O(n² log n) ❌ |
| 用 `set` | O(log n) | O(n log n) ✅ |
| **用 `priority_queue`** | **O(log n)** | **O(n log n)** ✅ |

**用 `set` 也行，但优先队列的常数更小、语义更贴切。**

::: exam 优先队列就是"自动排序的待办清单"
```text
你不断往里放任务（push），
每次取出"最重要"的那个（top + pop）。
```

| | 队列 `queue` | 优先队列 `priority_queue` |
| --- | --- | --- |
| 谁先出 | **先来的** | **优先级最高的** |
| 类比 | 排队买票 | 急诊分诊（重的先看） |

**默认是"大根堆"——每次取出最大值。**
:::

## 最小可运行示例

<!-- expect

---
top = 4
top = 1
1 3 4
-->
```cpp
#include <cstdio>
#include <queue>
#include <vector>
#include <functional>
using namespace std;

int main() {
    // ① 默认：大根堆（最大的在堆顶）
    priority_queue<int> big;
    big.push(3);
    big.push(1);
    big.push(4);
    printf("top = %d\n", big.top());          // 4

    // ② 小根堆：把比较规则换成 greater
    priority_queue<int, vector<int>, greater<int>> small;
    small.push(3);
    small.push(1);
    small.push(4);
    printf("top = %d\n", small.top());        // 1

    // ③ 逐个弹出，验证顺序
    while (!small.empty()) {
        printf("%d ", small.top());
        small.pop();
    }
    printf("\n");

    return 0;
}
```

输出：

```text
top = 4
top = 1
1 3 4
```

::: range 小根堆那个长长的定义怎么记
```cpp
priority_queue<int, vector<int>, greater<int>> small;
//                ↑            ↑              ↑
//              元素类型   底层容器      比较规则
```

**三段式，缺一不可**：

| 位置 | 写什么 | 说明 |
| --- | --- | --- |
| 1 | `int` | 存什么类型 |
| 2 | `vector<int>` | 底层用 `vector` 实现（固定写法） |
| 3 | `greater<int>` | 比较规则：`greater` = 小的优先 |

**记忆：`greater` 让"更大的"排在后面 → 堆顶是小的 → 小根堆。**

（名字有点反直觉，多写几遍就记住了。）
:::

## 关键过程与易错点

### 一、常用操作

| 操作 | 写法 | 复杂度 |
| --- | --- | --- |
| 插入 | `pq.push(x);` | O(log n) |
| 弹出堆顶 | `pq.pop();` | O(log n) |
| 看堆顶 | `pq.top();` | O(1) |
| 判空 | `pq.empty();` | O(1) |
| 元素个数 | `pq.size();` | O(1) |

::: pitfall 和栈一样：`pop()` 不返回值，空堆上操作是未定义行为
```cpp
int x = pq.pop();                  // ✗ 编译错误
pq.top();                          // ✗ 空堆时未定义行为
```

正确写法：

```cpp
if (!pq.empty()) {
    int x = pq.top();              // ✓ 先看
    pq.pop();                      //    再删
}
```
:::

### 二、堆里没有"查找"和"删除任意元素"

| 操作 | 普通队列 | `priority_queue` | `set` |
| --- | --- | --- | --- |
| 插入 | O(1) | O(log n) | O(log n) |
| 取最值 | ❌ | **O(1)**（堆顶） | O(1)（`begin`） |
| 弹最值 | O(1) | O(log n) | O(log n) |
| **查找某个值** | ❌ | **❌ 不支持** | ✅ O(log n) |
| **删除某个值** | ❌ | **❌ 不支持** | ✅ O(log n) |
| 遍历 | ❌ | ❌ | ✅（有序） |

::: exam 这条差别决定选型
**"只想反复取最值"→ `priority_queue`。**
**"还要查找 / 删除任意元素"→ `set`。**

```text
需求：每次都取出最大的
  → priority_queue ✓（更快更简单）

需求：可能要把某个中间的元素删掉
  → set ✓（priority_queue 做不到）
```
:::

### 三、存结构体：自定义优先级

<!-- expect

---
Bob 95
Tom 88
Amy 76
-->
```cpp
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct Student {
    string name;
    int score;
};

// 自定义比较：分数高的优先（注意方向！）
struct Cmp {
    bool operator()(const Student &a, const Student &b) {
        return a.score < b.score;        // 返回 true 表示 a 的优先级"更低"
    }
};

int main() {
    priority_queue<Student, vector<Student>, Cmp> pq;

    pq.push({"Tom", 88});
    pq.push({"Amy", 76});
    pq.push({"Bob", 95});

    while (!pq.empty()) {
        cout << pq.top().name << ' ' << pq.top().score << '\n';
        pq.pop();
    }
    return 0;
}
```

输出按分数从高到低：`Bob 95` / `Tom 88` / `Amy 76`。

::: pitfall 自定义比较的方向和 `sort` 的 `cmp` 是**反的**！
这一点极易搞错，单独强调：

| | `sort` 的 `cmp` | `priority_queue` 的比较 |
| --- | --- | --- |
| 返回 `true` 表示 | a 排在 b **前面** | a 的优先级**比 b 低** |
| 想"大的在前" | `return a > b;` | `return a < b;` |
| 记法 | "a 该在前面吗" | **"a 比 b 差吗"** |

**记忆办法**：把 `priority_queue` 的比较理解成"**谁应该排在后面**"。

```cpp
struct Cmp {
    bool operator()(const Student &a, const Student &b) {
        return a.score < b.score;    // "a 分数更低" → a 排在后面 → 分数高的先出
    }
};
```

**写反了的症状**：输出的顺序完全颠倒。遇到就检查这里。
:::

::: range 另一种更简单的写法：存 `pair` 或取负
如果只需要按一个整数排序，可以省掉自定义结构体：

**写法一：用 `pair`**（默认先比 `first`，再比 `second`）

```cpp
priority_queue<pair<int, int>> pq;      // 按 first 从大到小
pq.push({score, id});
```

**写法二：小根堆存负数**

```cpp
priority_queue<int> pq;                 // 大根堆
pq.push(-x);                             // 存负数
int minVal = -pq.top();                  // 取出来再取负
```

**什么时候用哪种？**

| 方式 | 适用 |
| --- | --- |
| `greater<int>` | 纯数字的小根堆（**推荐**） |
| 存负数 | 不想记 `greater` 那串长长的定义 |
| `pair` | 要按两个关键字排序 |
| 自定义结构体 | 复杂对象、复杂规则 |
:::

### 四、堆的典型应用

| 问题 | 为什么用堆 |
| --- | --- |
| **反复取最大/最小** | 堆顶就是最值，O(log n) |
| **合并多个有序序列** | 每次从各序列头部取最小的 |
| **动态中位数** | 两个堆（大根堆 + 小根堆）配合 |
| **Dijkstra 最短路** | 每次取当前距离最小的点 |
| **贪心**（每次选最优） | 贪心常常就是"反复取最值" |

::: exam 什么时候该想到"堆"
**当你发现"我要反复从一堆东西里取最值，而且这堆东西还在变"时——就是堆。**

反例："这堆东西是固定的，我只要取一次最值" → 直接 `sort` 或扫一遍就够了，
不需要堆。

**堆的价值在于"动态"**——边插入边取最值。
:::

## 动手检查

1. 把示例里的 `greater<int>` 去掉，重新运行，看输出顺序怎么变。
2. 复现"空堆上 `top()`"。
3. 用 `priority_queue` 依次插入 10 个随机数，然后逐个弹出，验证是降序。
4. 把自定义比较里的 `a.score < b.score` 改成 `>`，运行看输出顺序是否颠倒。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入 n 个数，用优先队列从大到小输出 | 基本用法 |
| 基础 | 读入 n 个数，用优先队列从小到大输出 | 小根堆 |
| 巩固 | [洛谷 P1090 合并果子](https://www.luogu.com.cn/problem/P1090) | **小根堆的经典贪心题** |
| 巩固 | [洛谷 P3378 堆](https://www.luogu.com.cn/problem/P3378) | 堆模板题 |
| 挑战 | 用两个堆维护"动态中位数" | 堆的高级用法 |

::: pitfall P1090 是"优先队列 + 贪心"的入门题
规则：每次合并两堆果子，消耗的体力等于两堆之和，求最小总消耗。

**贪心策略**：每次合并**最小的两堆**。

用优先队列（小根堆）正好：

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
// 每次取出最小的两个，合并，再放回去
```

**做完这道题，你会明白"堆就是为反复取最小而生的"。**
:::

## 下一节

容器部分还差几个：`deque`（双端队列）、`list`（链表）、`multimap`。

先看最实用的那个：[deque 双端队列](/stl/deque)。
