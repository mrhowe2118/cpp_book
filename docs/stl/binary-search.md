# 二分查找

在一个**有序**序列里找一个数，从头扫到尾要 O(n)，二分只要 O(log n)。

`lower_bound` / `upper_bound` 把二分封装好了——**不用自己写边界判断**。

## 本节学会什么

- 会用 `lower_bound` / `upper_bound`，并说清它们的差别
- 掌握"第一个 ≥ x"和"第一个 > x"这两种语义
- 会用 `upper_bound - lower_bound` **统计某个数出现的次数**
- 知道库函数和手写二分各自的场合

## 为什么需要它

先算一笔账。在 10⁶ 个有序数里找某个值：

| 做法 | 比较次数 |
| --- | --- |
| 从头扫 | 最多 10⁶ |
| **二分** | **最多 20** |

::: exam 二分为什么这么快
**每次把查找范围减半。**

```text
1000000 → 500000 → 250000 → ... → 1
一共只要约 20 次
```

| n | log₂n |
| --- | --- |
| 1000 | 10 |
| 10⁶ | 20 |
| 10⁹ | 30 |

**n 涨 1000 倍，次数只涨 10。** 这就是对数的威力（见[复杂度直觉](/guide/complexity-intuition)）。
:::

## 最小可运行示例

<!-- expect

---
4 7
3
-->
```cpp
#include <cstdio>
#include <algorithm>
using namespace std;

int main() {
    int a[8] = {1, 3, 3, 5, 7, 7, 7, 9};
    int n = 8;

    // lower_bound：第一个 >= 7 的位置
    int p1 = lower_bound(a, a + n, 7) - a;

    // upper_bound：第一个 > 7 的位置
    int p2 = upper_bound(a, a + n, 7) - a;

    printf("%d %d\n", p1, p2);

    // 两者一减 = 7 出现了几次
    printf("%d\n", p2 - p1);

    return 0;
}
```

输出：

```text
4 7
3
```

### 两个函数的语义

```text
a = [1, 3, 3, 5, 7, 7, 7, 9]
下标  0  1  2  3  4  5  6  7
                  ↑        ↑
          lower_bound(7)   upper_bound(7)
          第一个 >= 7      第一个 > 7
          → 下标 4         → 下标 7
```

| 函数 | 含义 | 用于 |
| --- | --- | --- |
| `lower_bound(begin, end, x)` | 第一个 **≥ x** 的位置 | 找"不小于 x 的最小数" |
| `upper_bound(begin, end, x)` | 第一个 **> x** 的位置 | 找"大于 x 的最小数" |

::: exam 记住一句话就够
**`lower` 是"可以等于"，`upper` 是"必须更大"。**

```cpp
lower_bound(7) → 指到第一个 7        （7 ≥ 7 成立）
upper_bound(7) → 指到 7 后面的那个   （必须是 > 7）
```

**推论**：`upper_bound - lower_bound` = **x 出现的次数**。
这个技巧在统计题里非常好用。
:::

## 关键过程与易错点

### 一、返回的是迭代器，要减 `begin()` 才是下标

```cpp
int pos = lower_bound(a, a + n, x) - a;        // 数组：减数组名
int pos = lower_bound(v.begin(), v.end(), x) - v.begin();   // vector
```

::: pitfall 找不到时返回 `end()`，不是 -1
<!-- expect

---
第一个 >= 6 的是 a[3] = 7
第一个 >= 100 的位置 = 5（等于 n 表示不存在）
-->
```cpp
#include <cstdio>
#include <algorithm>
using namespace std;

int main() {
    int a[5] = {1, 3, 5, 7, 9};
    int n = 5;

    int p = lower_bound(a, a + n, 6) - a;
    printf("第一个 >= 6 的是 a[%d] = %d\n", p, a[p]);

    int q = lower_bound(a, a + n, 100) - a;
    printf("第一个 >= 100 的位置 = %d（等于 n 表示不存在）\n", q);

    return 0;
}
```

**所以判断"存不存在"要这样写**：

```cpp
int pos = lower_bound(a, a + n, x) - a;
if (pos < n && a[pos] == x) {            // ✓ 先确认位置合法，再比值
    cout << "找到了";
}
```

**⚠️ 注意顺序**：`pos < n` 必须在前面——否则 `a[pos]` 就越界了
（这就是[分支结构](/guide/control-flow)里讲的短路求值）。
:::

### 二、用 `lower_bound` 判断"存在"

```cpp
// ✗ 错误：找不到时返回 n，直接取 a[n] 越界
if (a[lower_bound(a, a + n, x) - a] == x) { }

// ✓ 正确：先判断位置
int pos = lower_bound(a, a + n, x) - a;
if (pos < n && a[pos] == x) { }
```

**或者直接用 `binary_search`**（只回答"在不在"）：

```cpp
if (binary_search(a, a + n, x)) { }     // 返回 bool，但不能给你位置
```

| 想要什么 | 用什么 |
| --- | --- |
| 在不在 | `binary_search` |
| **第一个 ≥ x 的位置** | `lower_bound` |
| **第一个 > x 的位置** | `upper_bound` |
| x 出现几次 | `upper_bound - lower_bound` |

### 三、前提：**必须有序**

::: pitfall 在无序数据上用二分 = 结果完全不可预测
```cpp
int a[5] = {5, 1, 4, 2, 3};              // ✗ 没排序
int p = lower_bound(a, a + 5, 3) - a;    // 结果没有意义
```

**它不会报错，只会给你一个错的答案。**

**纪律：用 `lower_bound` 之前，先确认数据是有序的。**
（`set` / `map` 天然有序，可以直接用它们的成员函数 `s.lower_bound(x)`。）
:::

### 四、库函数 vs 手写二分

| | `lower_bound` | 手写二分 |
| --- | --- | --- |
| 代码量 | 1 行 | 6～10 行 |
| 边界正确性 | 标准库保证 | **容易写错** |
| 灵活度 | 只能按 `<` 比较 | 可以任意判断条件 |
| 速度 | 很快 | 差不多 |

::: exam 什么时候必须手写
**`lower_bound` 只能用于"有序数组上按值比较"。**

这两种情况必须手写：

1. **二分答案**——判断的不是"值的大小"，而是 `check(mid)` 是否成立
   （模板见[必背模板](/practice/templates)）
2. **特殊的比较规则**（比如按结构体的某个字段）

**其余情况一律用库函数。** 手写二分是竞赛里最容易出错的代码之一。
:::

::: pitfall 手写二分的三种经典错法
```cpp
// ✗ ① 循环条件写成 <
while (l < r) { ... }

// ✗ ② 边界没推进，死循环
if (check(mid)) l = mid;

// ✗ ③ 用 (l + r + 1) / 2 却配了 l = mid + 1
```

**正确写法（闭区间版本）**：

```cpp
int l = 0, r = n - 1, ans = -1;
while (l <= r) {
    int mid = (l + r) / 2;
    if (a[mid] == x) { ans = mid; break; }
    else if (a[mid] < x) l = mid + 1;      // ±1 不能少
    else r = mid - 1;
}
```
:::

### 五、在 `set` / `map` 上用二分

有序容器自带 `lower_bound`（**比通用的快**，因为它知道内部结构）：

```cpp
set<int> s = {1, 3, 5, 7, 9};

auto it = s.lower_bound(6);        // 指向 7
if (it != s.end()) cout << *it;
```

**注意**：不要写成 `lower_bound(s.begin(), s.end(), 6)`——
那会退化成 O(n)（因为 `set` 的迭代器不能随机跳转）。

```cpp
auto it = s.lower_bound(6);                      // ✓ O(log n)
auto it2 = lower_bound(s.begin(), s.end(), 6);   // ✗ O(n)，别这么写
```

::: pitfall "能编译"不等于"是对的"
上面两种写法**都能编译通过**，但复杂度差了 n/log n 倍。

**这是"性能静默劣化"的典型**——代码没错，只是慢。
数据量一大就 TLE，而你盯着代码看不出问题。

**记法：有序容器（`set`/`map`）用它们自己的 `lower_bound`。**
:::

## 动手检查

1. 把示例的 `lower_bound` 改成 `upper_bound`，看输出变成几。
2. 用 `upper_bound - lower_bound` 统计数组里某个数出现的次数，和暴力数一遍对比。
3. 在一个**未排序**的数组上用 `lower_bound`，看它给出什么结果（理解"结果无意义"）。
4. 把 `lower_bound` 换成自己手写的二分，用同一组数据验证结果一致。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | [洛谷 P2249 查找](https://www.luogu.com.cn/problem/P2249) | **二分查找模板题** |
| 基础 | 在一个有序数组里统计某数出现次数 | `upper - lower` |
| 巩固 | [洛谷 P1102 A-B 数对](https://www.luogu.com.cn/problem/P1102) | 排序 + 二分（O(n log n)） |
| 巩固 | 找第一个大于 x 的数和最后一个小于 x 的数 | `upper_bound` + `lower_bound` |
| 挑战 | [洛谷 P2440 木材加工](https://www.luogu.com.cn/problem/P2440) | **二分答案**（需要手写二分） |

::: pitfall P1102 是"二分加速查找"的经典
暴力是 O(n²)（必超时），用 `lower_bound` / `upper_bound` 变成 O(n log n)。

**做完这道题，你会明白"有序 + 二分"是一种通用的加速手段**——
不一定是"找某个值"，也可能是"找有多少个值落在这个范围里"。
:::

## 下一节

排序之后经常要**去重**。[unique](/stl/unique) 就是干这个的——
不过它有个前提，猜猜是什么。
