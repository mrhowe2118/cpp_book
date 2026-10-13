# sort 排序

**几乎所有题都要排序。** 手写排序既慢又容易错，`sort` 一行搞定——而且比你手写的快得多。

## 本节学会什么

- 用 `sort` 给数组和 `vector` 排序
- 会用 `greater<int>()` 降序
- 会写自定义 `cmp`，完成多关键字排序
- 知道 `sort` 和 `stable_sort` 的区别
- 避开 `cmp` 那个会让程序段错误的写法

## 为什么需要它

先算一笔账：

| | 手写冒泡 | `sort` |
| --- | --- | --- |
| 复杂度 | O(n²) | **O(n log n)** |
| `n = 10⁵` 时 | 10¹⁰ 次 ❌ 超时 | 约 1.7×10⁶ 次 ✅ |
| 代码长度 | 6 行（还容易写错边界） | **1 行** |
| 正确性 | 靠自己保证 | 标准库保证 |

::: exam sort 是"零成本"的升级
**没有任何理由手写排序**（除非题目专门考排序算法本身）。

```cpp
sort(a, a + n);        // 一行，O(n log n)，经过高度优化
```

对比[数据范围表就是给分表](/practice/data-range)的标尺，
`sort` 让 `n ≤ 10⁵` 从"不可能"变成"随便跑"。
:::

## 最小可运行示例

<!-- expect

---
1 1 3 4 5
5 4 3 1 1
-->
```cpp
#include <cstdio>
#include <algorithm>
#include <functional>
using namespace std;

int main() {
    int a[5] = {3, 1, 4, 1, 5};

    sort(a, a + 5);                          // 默认：升序
    for (int i = 0; i < 5; i++) printf("%d ", a[i]);
    printf("\n");

    sort(a, a + 5, greater<int>());          // 降序
    for (int i = 0; i < 5; i++) printf("%d ", a[i]);
    printf("\n");

    return 0;
}
```

输出：

```text
1 1 3 4 5
5 4 3 1 1
```

### `sort` 的参数就是"一个区间"

```cpp
sort(起点, 终点);        // 左闭右开，终点不参与排序
```

| 容器 | 写法 |
| --- | --- |
| 普通数组 | `sort(a, a + n);` |
| `vector` | `sort(v.begin(), v.end());` |
| 数组的一段 | `sort(a + 1, a + n + 1);`（下标 1～n） |

**规律：起点是第一个要排的元素，终点是"最后一个要排的元素的下一位"。**
（这就是[迭代器与区间](/stl/iterators)里讲的左闭右开。）

::: pitfall `sort(a, a + n)` 别写成 `sort(a, a + n - 1)`
```cpp
sort(a, a + n - 1);      // ✗ 最后一个元素没排
sort(a, a + n);          // ✓
```

**症状很隐蔽**：大部分数据看起来有序，只有末尾一个位置不对。

**记法**：如果要排 `n` 个元素（下标 `0 ~ n-1`），终点写 `a + n`。
:::

## 关键过程与易错点

### 一、降序的三种写法

| 写法 | 说明 |
| --- | --- |
| `sort(a, a + n, greater<int>());` | **最简洁**，需要 `#include <functional>` |
| `sort(a, a + n, cmp);` 其中 `cmp` 用 `>` | 自定义函数 |
| 升序后 `reverse(a, a + n);` | 多一步，不如前两种 |

```cpp
bool cmpDown(int a, int b) {
    return a > b;                 // 返回 true 表示 a 排在 b 前面
}
sort(a, a + n, cmpDown);
```

### 二、自定义 `cmp`：想怎么排就怎么排

<!-- expect

---
hi cat apple banana
-->
```cpp
#include <iostream>
#include <algorithm>
#include <string>
using namespace std;

// 按字符串长度从小到大排
bool cmpByLen(const string &a, const string &b) {
    return a.size() < b.size();          // 短的在前面
}

int main() {
    string s[4] = {"apple", "hi", "banana", "cat"};

    sort(s, s + 4, cmpByLen);

    for (int i = 0; i < 4; i++) cout << s[i] << ' ';
    cout << '\n';
    return 0;
}
```

输出 `hi cat apple banana`（长度 2、3、5、6）。

::: range `cmp` 的写法只需要记住一句话
**`cmp(a, b)` 返回 `true`，表示"a 应该排在 b 前面"。**

| 想要的顺序 | `cmp` 里写什么 |
| --- | --- |
| 升序 | `return a < b;` |
| 降序 | `return a > b;` |
| 按长度升序 | `return a.size() < b.size();` |
| 多关键字 | 一个比完再比下一个（见下） |

**多关键字排序**：

```cpp
bool cmp(const Student &a, const Student &b) {
    if (a.total != b.total) return a.total > b.total;      // ① 总分降序
    if (a.chinese != b.chinese) return a.chinese > b.chinese;  // ② 语文降序
    return a.id < b.id;                                     // ③ 编号升序
}
```

**写法规律**：一级一级往下比，某一级不相同时就返回结果；
最后一级直接返回比较结果。
:::

::: pitfall `cmp` 里绝对不能用 `<=` 或 `>=`
```cpp
bool cmp(int a, int b) { return a >= b; }      // ✗ 危险！
```

**后果**：数据里有**重复元素**时，`sort` 可能访问到数组外的内存——
表现为**段错误（RE）**，或者结果完全错乱。

**原因**：`sort` 要求比较函数满足"严格弱序"，
其中一个要求是 `cmp(x, x)` 必须为 `false`（自己不该排在自己前面）。
`>=` 会返回 `true`，破坏了这个前提。

**纪律：`cmp` 里一律用 `<` 或 `>`。**
:::

### 三、`sort` 不稳定，`stable_sort` 稳定

| | `sort` | `stable_sort` |
| --- | --- | --- |
| 相等元素的相对顺序 | **不保证** | **保持原顺序** |
| 速度 | 更快 | 稍慢 |

**什么叫"稳定"？** 看例子：

<!-- expect

---
A:90 C:90 B:80 D:70
-->
```cpp
#include <cstdio>
#include <algorithm>
using namespace std;

struct Item {
    int score;
    char name;
};

// 只按分数降序比较，不比较 name
bool cmpScore(const Item &a, const Item &b) {
    return a.score > b.score;
}

int main() {
    Item it[4] = {{90, 'A'}, {80, 'B'}, {90, 'C'}, {70, 'D'}};

    stable_sort(it, it + 4, cmpScore);

    for (int i = 0; i < 4; i++) printf("%c:%d ", it[i].name, it[i].score);
    printf("\n");
    return 0;
}
```

输出 `A:90 C:90 B:80 D:70`——**A 和 C 都是 90 分，稳定排序保持了它们原来的先后顺序。**

::: pitfall 用 `sort` 时，同分元素的顺序是"不确定"的
如果用 `sort` 排上面那组数据，`A` 和 `C` 谁在前**没有保证**。

**所以当题目要求"同分时按……排列"时，你有两种做法**：

1. **在 `cmp` 里显式写出第二关键字**（推荐）
   ```cpp
   if (a.score != b.score) return a.score > b.score;
   return a.name < b.name;        // 同分按 name 排
   ```
2. 用 `stable_sort` 并**保证输入顺序就是你要的顺序**

**做法 1 更明确、更可靠。** 竞赛里尽量把规则写全，不要依赖排序的稳定性。
:::

### 四、用在结构体上

`sort` 对结构体完全适用，只要给一个 `cmp`：

```cpp
struct Node { int x, y; };

bool cmp(const Node &a, const Node &b) {
    if (a.x != b.x) return a.x < b.x;
    return a.y < b.y;
}

Node a[1005];
sort(a, a + n, cmp);
```

::: pitfall 结构体参数要写 `const &`
```cpp
bool cmp(Node a, Node b) { }              // ✗ 每次比较都复制两个结构体
bool cmp(const Node &a, const Node &b) { } // ✓ 不复制
```

`sort` 会调用 `cmp` 约 `n log n` 次。结构体一大，复制开销就很可观。
**一律写 `const &`。** 见[函数参数与引用](/guide/function-parameters)。
:::

### 五、什么时候需要"稳定"

| 场景 | 建议 |
| --- | --- |
| 题目给了明确的多关键字规则 | 在 `cmp` 里全写出来 |
| 题目说"相同则保持输入顺序" | 用 `stable_sort` |
| 不确定 | **把规则写全**，最保险 |

## 动手检查

1. 把示例里的 `sort(a, a + 5)` 改成 `sort(a, a + 4)`，观察最后一个元素有没有被排。
2. 写一个 `cmp` 按**绝对值**从小到大排序（提示：用 `abs`）。
3. 用有重复元素的数据（比如 `{2,2,2,1,2}`）测试 `cmp` 写成 `>=` 的版本，
   看会发生什么（可能崩溃，也可能结果错乱）。
4. 把 `stable_sort` 换成 `sort`，用同一组数据多运行几次，看 `A` 和 `C` 的顺序是否总一样。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入 n 个数，升序输出，再降序输出 | `sort` + `greater` |
| 基础 | 读入 n 个数，从小到大排序后去重输出 | `sort` + [unique](/stl/unique) |
| 巩固 | [洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093) | **多关键字排序**的经典题 |
| 巩固 | [洛谷 P1104 生日](https://www.luogu.com.cn/problem/P1104) | 多关键字 + 稳定性 |
| 巩固 | [洛谷 P1012 拼数](https://www.luogu.com.cn/problem/P1012) | 自定义比较规则 |
| 挑战 | [洛谷 P1158 导弹拦截](https://www.luogu.com.cn/problem/P1158) | 排序 + 预处理 + 贪心 |

::: pitfall P1012 是"自定义 cmp"最漂亮的例子
题目要求把一组数拼成一个最大的数。

**比较规则是**：如果 `a + b > b + a`，那 `a` 应该排在 `b` 前面。

```cpp
bool cmp(const string &a, const string &b) {
    return a + b > b + a;
}
```

**注意**：这道题**不能**用字符串字典序直接排（比如 `"9"` 和 `"91"`）。
逼着你思考"排序的本质是比较规则"。
:::

## 下一节

排序完通常要去重或查找。先看一个"自动去重 + 自动有序"的容器：

[set 有序集合](/stl/set)。
