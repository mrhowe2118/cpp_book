# set 有序集合

`set` 是一个**会自动去重、自动排序**的容器。查找、插入、删除都是 O(log n)。

## 本节学会什么

- 用 `set` 完成"去重 + 排序"
- 掌握 `insert` / `count` / `find` / `erase` 这几个关键操作
- 知道 `set` 和 `vector` 各自的适用场景
- 认出"边遍历边删除"这个危险写法

## 为什么需要它

看一个需求：**给 n 个数，输出其中有多少个不同的数，并按从小到大列出**。

用数组做，你要写三步：

```cpp
sort(a, a + n);                                  // ① 排序
int m = unique(a, a + n) - a;                    // ② 去重
for (int i = 0; i < m; i++) cout << a[i];        // ③ 输出
```

用 `set`，插入的时候就已经做完了：

```cpp
set<int> s;
for (int i = 0; i < n; i++) {
    int x; cin >> x;
    s.insert(x);                                 // 插入即去重 + 排序
}
cout << s.size() << '\n';
for (int x : s) cout << x << ' ';
```

::: exam set 的三个"自动"
| 自动做的事 | 好处 |
| --- | --- |
| **去重** | 重复插入无效，不用手动处理 |
| **有序** | 遍历出来就是升序 |
| **快速查找** | `count` / `find` 都是 O(log n) |

**判断标准：如果题目需要"去重 + 有序 + 快速判断存在"，直接用 `set`。**
:::

## 最小可运行示例

<!-- expect

---
size = 3
count(3) = 1
count(9) = 0
1 2 3
after erase: size = 2
-->
```cpp
#include <cstdio>
#include <set>
using namespace std;

int main() {
    set<int> s;

    s.insert(3);
    s.insert(1);
    s.insert(3);          // 重复插入：什么都不会发生
    s.insert(2);

    printf("size = %d\n", (int)s.size());          // 3，不是 4

    printf("count(3) = %d\n", (int)s.count(3));    // 1：存在
    printf("count(9) = %d\n", (int)s.count(9));    // 0：不存在

    for (int x : s) printf("%d ", x);              // 自动升序
    printf("\n");

    s.erase(1);
    printf("after erase: size = %d\n", (int)s.size());

    return 0;
}
```

输出：

```text
size = 3
count(3) = 1
count(9) = 0
1 2 3
after erase: size = 2
```

**注意插入顺序是 3、1、3、2，但遍历出来是 `1 2 3`**——这就是"自动有序"。

## 关键过程与易错点

### 一、常用操作

| 操作 | 写法 | 复杂度 |
| --- | --- | --- |
| 插入 | `s.insert(x);` | O(log n) |
| 删除 | `s.erase(x);`（按值） | O(log n) |
| 查找是否存在 | `s.count(x);` | O(log n) |
| 查找位置 | `s.find(x);` | O(log n) |
| 元素个数 | `s.size();` | O(1) |
| 是否为空 | `s.empty();` | O(1) |
| 清空 | `s.clear();` | O(n) |
| 第一个元素 | `*s.begin();` | O(1) |
| 最后一个元素 | `*s.rbegin();` | O(1) |

::: pitfall `set` 不能用下标
```cpp
set<int> s;
cout << s[0];        // ✗ 编译错误！set 没有 operator[]
```

**为什么？** `set` 内部是一棵平衡树，元素不是连续存放的，**没法用"第几个"来定位**。

想取第 k 小，要用 `nth_element`（在有下标的容器上）或平衡树的高级用法。
**`set` 只提供"值"维度的访问，不提供"位置"维度的访问。**

要按顺序取，只能用迭代器遍历：

```cpp
int k = 0;
for (int x : s) {
    if (k == 2) { cout << x; break; }        // 第 3 小的（下标从 0 数）
    k++;
}
```
:::

### 二、`count` 和 `find` 怎么选

```cpp
if (s.count(x)) { }              // 只关心"在不在"
if (s.find(x) != s.end()) { }    // 关心"在不在"，且可能需要位置
```

| | `count` | `find` |
| --- | --- | --- |
| 返回 | 0 或 1（`set` 里） | 迭代器 或 `end()` |
| 用途 | 判断存在 | 判断存在 + 拿位置 |
| 可读性 | **更直接** | 稍啰嗦 |

**只想判断"在不在"，用 `count`**——它读起来更清楚。

::: pitfall `count` 返回的是"个数"，不是 `bool`
```cpp
if (s.count(x) == 1) { }    // 能用，但对 multiset 会出错（可能有多个）
if (s.count(x)) { }         // ✓ 推荐：非零即为真
```

`set` 里每个值最多一个，所以 `count` 只会是 0 或 1。
但[multimap](/stl/multimap) / `multiset` 里可能有多个——**用 `if (s.count(x))` 更安全**。
:::

### 三、和 `vector` 对比：什么时候用哪个

| | `vector` | `set` |
| --- | --- | --- |
| 下标访问 | ✅ 快 | ❌ 不支持 |
| 查找某个值 | O(n) 遍历 | **O(log n)** |
| 插入 | 末尾 O(1) | 任意位置 O(log n) |
| 自动去重 | ❌ | ✅ |
| 自动有序 | ❌（要 `sort`） | ✅ |
| 遍历速度 | **快**（连续内存） | 慢（树结构） |
| 内存 | 小 | **大**（每个元素有额外开销） |

::: range 选型的三条实用规则
| 需求 | 选 |
| --- | --- |
| 要下标、要频繁遍历、要快 | **`vector` + `sort`** |
| 反复判断"某个值在不在" | **`set`** |
| 要一边插入一边保持有序 | **`set`** |

**注意最后一条的反面**：如果你的数据**只插入不查询**，
那用 `vector` 存下来最后 `sort` 一次，往往比全程用 `set` 更快。

**`set` 快在"查找"，慢在"常数"**——它的每次操作都要走树，常数不小。
:::

### 四、`set` 里的元素不能改

```cpp
set<int> s = {1, 2, 3};
for (int x : s) x = 100;        // ✗ 改的是副本，而且 s 里的元素本来就不能改
```

::: pitfall 想"修改"元素，只能删了再插
```cpp
s.erase(x);
s.insert(新值);
```

**为什么不能直接改？** 因为 `set` 靠元素的值来决定它在树里的位置。
你改了值，树的结构就乱了。

**这是 `set` 最反直觉的一点**：它的元素是"只读"的。

（`map` 不一样——`map` 的**键**不能改，但**值**可以。）
:::

### 五、边遍历边删除：危险写法

```cpp
for (auto it = s.begin(); it != s.end(); ++it) {
    if (*it % 2 == 0) s.erase(it);      // ✗ it 失效，再 ++ 就出问题
}
```

**正确写法**用的是 `erase` 的返回值：

```cpp
for (auto it = s.begin(); it != s.end(); ) {
    if (*it % 2 == 0) it = s.erase(it);    // ✓ 返回下一个位置
    else ++it;                              //    不删才往后走
}
```

::: range 更简单、更安全的替代方案
**不要边遍历边删。** 先把要保留的挑出来：

```cpp
set<int> t;
for (int x : s) {
    if (x % 2 != 0) t.insert(x);      // 只保留奇数
}
s = t;                                 // 替换
```

**多用一个容器，但逻辑清楚得多。** 数据量不大时完全够用。

**判断标准**：如果删除逻辑简单（比如"删掉所有等于 x 的"），
用 `s.erase(x)` 一行就够——**根本不用遍历**。
:::

### 六、有序带来的额外能力

因为 `set` 内部是有序的，它能提供"找第一个不小于 x 的元素"：

```cpp
auto it = s.lower_bound(x);     // 第一个 >= x 的位置
auto it2 = s.upper_bound(x);    // 第一个 > x 的位置
```

**这是"有序集合"最有价值的地方**——在无序结构里你只能用 O(n) 扫描。

（`lower_bound` 的细节见[二分查找](/stl/binary-search)。）

## 动手检查

1. 用 `set` 完成"读入 n 个数，输出去重后从小到大"，和"`sort` + `unique`"版本对比代码长度。
2. 复现"重复插入无效"：插入 5 个 3，看 `size()` 是几。
3. 故意写 `s[0]`，把编译错误读一遍，理解"为什么不能下标访问"。
4. 用 `count` 判断一个数在不在集合里，测"在"和"不在"两种情况。
5. 用 `lower_bound` 找第一个不小于 x 的数，分别测 x 比所有数小、在中间、比所有数大。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入 n 个数，用 `set` 去重排序后输出 | 基本用法 |
| 基础 | [洛谷 P1059 明明的随机数](https://www.luogu.com.cn/problem/P1059) | **去重排序的经典题** |
| 巩固 | 读入一串单词，输出去重后按字典序排列的结果 | `set<string>` |
| 巩固 | 判断两组数是否完全相同（不考虑顺序） | `set` 比较 |
| 挑战 | [洛谷 P1102 A-B 数对](https://www.luogu.com.cn/problem/P1102) | `set` 加速查找（对比暴力） |

::: pitfall P1059 是 set 的"标准入门题"
它的要求就是"去重 + 排序"，正好是 `set` 的两个自动行为：

```cpp
set<int> s;
for (...) s.insert(x);
cout << s.size() << '\n';
for (int x : s) cout << x << ' ';
```

**做完这道题，再对比一下用数组 `sort` + `unique` 的写法**——
两种都对，但你会更清楚各自适合什么场景。
:::

## 下一节

`set` 存的是"一个键"。如果要把**一个键映射到一个值**（比如"人名 → 成绩"）呢？

[map 键值映射](/stl/map)。
