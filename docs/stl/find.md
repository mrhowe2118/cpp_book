# find 查找

`find` 是"**从头扫到尾找一个值**"——最简单的查找方式，O(n)。

它简单到容易被忽略，但配合 `find_if` / `count_if`，能省掉很多手写循环。

## 本节学会什么

- 用 `find` 在区间里找一个值，并判断"找到没有"
- 用 `find_if` 按**条件**查找
- 用 `count` / `count_if` 统计
- 知道什么时候该用 `find`、什么时候该用**二分**或 `set`

## 为什么需要它

先看不用 STL 的写法：

```cpp
int pos = -1;
for (int i = 0; i < n; i++) {
    if (a[i] == x) { pos = i; break; }
}
```

用 `find`：

```cpp
auto it = find(a, a + n, x);
if (it != a + n) pos = it - a;
```

::: exam 代码差不多，但有两个好处
1. **不用自己写循环和 `break`**——少一处出错的地方
2. **意图更清楚**——读代码的人一眼看到"这是在找东西"

**而且 `find` 的写法对所有容器都一样**（数组、`vector`、`string`……），
不用为每种容器记一套。
:::

## 最小可运行示例

<!-- expect

---
找到 8，下标 2
100 没找到
3 出现了 2 次
第一个偶数是 8
-->
```cpp
#include <cstdio>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 3, 8, 3, 1};

    // ① find：找一个值
    auto it = find(v.begin(), v.end(), 8);
    if (it != v.end()) {
        printf("找到 8，下标 %d\n", (int)(it - v.begin()));
    }

    // ② 找不到：返回 end()
    auto it2 = find(v.begin(), v.end(), 100);
    printf("%s\n", it2 == v.end() ? "100 没找到" : "找到了");

    // ③ count：数出现几次
    printf("3 出现了 %d 次\n", (int)count(v.begin(), v.end(), 3));

    // ④ find_if：找第一个满足"条件"的（这里找第一个偶数）
    auto it3 = find_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
    if (it3 != v.end()) {
        printf("第一个偶数是 %d\n", *it3);
    }

    return 0;
}
```

输出：

```text
找到 8，下标 2
100 没找到
3 出现了 2 次
第一个偶数是 8
```

::: range 四个常用查找算法
| 算法 | 作用 | 返回 |
| --- | --- | --- |
| `find(b, e, x)` | 找值等于 x 的元素 | 迭代器（找不到返回 `e`） |
| `find_if(b, e, pred)` | 找**第一个满足条件**的元素 | 迭代器 |
| `count(b, e, x)` | 数等于 x 的个数 | 整数 |
| `count_if(b, e, pred)` | 数满足条件的个数 | 整数 |

**它们的共同点：区间是左闭右开 `[begin, end)`**（见[迭代器与区间](/stl/iterators)）。
:::

## 关键过程与易错点

### 一、必须检查"找到没有"

::: pitfall 不检查 `end()` 就解引用 = 未定义行为
```cpp
auto it = find(v.begin(), v.end(), 100);
cout << *it;                  // ✗ 没找到时 it == end()，解引用是未定义行为
```

**正确写法**：

```cpp
auto it = find(v.begin(), v.end(), x);
if (it != v.end()) {
    cout << *it;              // ✓ 先确认找到了
}
```

**这和[二分查找](/stl/binary-search)里 `lower_bound` 返回 `end()` 是同一个坑。**

**记法：所有"返回迭代器"的查找，都要先和 `end()` 比一比。**
:::

### 二、`find` 是**线性**的：O(n)

```text
find 的实现就是"从头一个一个比过去"
最坏情况要比较 n 次
```

| 数据规模 | `find` 够用吗 |
| --- | --- |
| 查 1 次，`n ≤ 10⁶` | ✅ 够（10⁶ 次运算） |
| 查 m 次，`n` 和 `m` 都到 10⁵ | ❌ O(nm) = 10¹⁰ 超时 |
| 数据**已经有序** | 用 `lower_bound`（O(log n)） |
| 需要**反复查找** | 用 `set` / `map`（O(log n)） |

::: exam 选型对照表
| 场景 | 用什么 | 复杂度 |
| --- | --- | --- |
| 无序、只查一两次 | **`find`** | O(n) |
| 有序、查多次 | **`lower_bound`** | O(log n) |
| 需要反复判断"在不在" | **`set` / `map`** | O(log n) |
| 键是小整数 | **数组打标记** | **O(1)** |

**最后一行常被忽略**：如果值的范围不大（比如 `1 ~ 10⁵`），
用一个 `bool vis[100005]` 数组打标记，比任何容器都快。

```cpp
bool vis[100005] = {false};
vis[x] = true;                   // 标记
if (vis[y]) { }                  // O(1) 查询
```

**能用数组打标记，就别用 set。**
:::

### 三、容器自带的 `find` 更快

`set` / `map` 有自己的 `find` **成员函数**，复杂度 O(log n)：

```cpp
set<int> s = {1, 3, 5, 7};
auto it = s.find(5);             // ✓ O(log n)
auto it2 = find(s.begin(), s.end(), 5);   // ✗ O(n)，别这么写
```

**两者都能编译**，但复杂度差一个数量级——这是"能跑但慢"的典型陷阱
（和[二分查找](/stl/binary-search)里 `set` 的 `lower_bound` 一样）。

| 容器 | 用它自己的成员函数 |
| --- | --- |
| `set` / `multiset` | `s.find(x)` |
| `map` / `multimap` | `m.find(key)` |
| `string` | `s.find(t)` — **注意这是找子串，语义不同！** |

::: pitfall `string` 的 `find` 和算法版 `find` 语义不同
```cpp
string s = "hello world";

s.find("world");                              // 成员函数：找【子串】，返回下标
find(s.begin(), s.end(), 'w');                // 算法：找【单个字符】，返回迭代器
```

**名字一样，做的事不一样**：

| 写法 | 找什么 | 返回 |
| --- | --- | --- |
| `s.find("world")` | 子串 | 下标（或 `npos`） |
| `s.find('w')` | 单个字符 | 下标 |
| `find(s.begin(), s.end(), 'w')` | 单个字符 | 迭代器 |

**要判断"找到没有"，两者用的哨兵也不同**：

- 成员函数：`s.find(t) != string::npos`
- 算法：`it != s.end()`

**混用会得到完全错误的结果。**
:::

### 四、`find_if` 与 `lambda` 配合

`find_if` 的第三个参数是"条件"（谓词），**用 `lambda` 写最方便**：

```cpp
// 找第一个大于 100 的数
auto it = find_if(v.begin(), v.end(), [](int x) { return x > 100; });

// 找第一个长度超过 5 的字符串
auto it2 = find_if(words.begin(), words.end(),
                   [](const string &s) { return s.size() > 5; });
```

**`lambda` 的写法见[比较规则与函数对象](/stl/function-objects)。**

## 动手检查

1. 用 `find` 找一个不存在的值，然后**故意解引用**，看会发生什么。
2. 用 `count_if` 统计 `vector` 里有多少个偶数。
3. 用 `find_if` 找第一个能被 7 整除的数。
4. 分别用 `find(s.begin(), ...)` 和 `s.find(...)` 在字符串里找东西，对比返回值的类型。
5. 用数组打标记（`bool vis[]`）重写"判断某个数在不在"，和 `find` 比复杂度。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 在一个 `vector` 里找一个数，输出它的下标（或"没找到"） | `find` + 检查 `end()` |
| 基础 | 统计一个 `vector` 里有多少个偶数 | `count_if` |
| 巩固 | 找第一个大于平均值的数 | `find_if` + 先算平均值 |
| 巩固 | 判断两个集合是否"有交集" | `find` 或打标记 |
| 巩固 | 在一个单词里找出所有出现 `'a'` 的位置 | `find` 循环（注意起点往后移） |
| 挑战 | 用打标记数组和 `set` 两种方式做"判断 n 个数里有多少种不同的数"，比较速度 | 选型 |

::: pitfall "找所有出现位置"要记得移动起点
```cpp
int pos = s.find('a', 0);
while (pos != string::npos) {
    cout << pos << ' ';
    pos = s.find('a', pos + 1);        // ✓ 从下一个位置继续找
}
```

**如果写成 `s.find('a', pos)`，就会永远返回同一个位置——死循环。**

**这是"循环找子串"最常见的 bug。**
:::

## 下一节

查找是"找到就完事"。如果只想找**第 k 小**的元素，不需要全部排序呢？

[nth_element 第 k 小](/stl/nth-element)。
