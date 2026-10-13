# pair 二元组

`pair` 是所有容器里最简单的：**把两个值绑成一个整体**。

简单到有点不起眼，但它在竞赛里出现频率极高——因为"**排序时按两个关键字**"这件事，
`pair` 自带支持。

## 本节学会什么

- 定义 `pair`，访问 `first` / `second`
- 记住 `pair` 的**比较规则**：先比 `first`，相同再比 `second`
- 会用 `pair` 数组配合 `sort` 完成**双关键字排序**（不用写 `cmp`）
- 会用 C++17 的**结构化绑定**让代码更清楚

## 为什么需要它

看一个常见需求：**给 n 个点按 x 从小到大排序，x 相同时按 y 从小到大排序**。

用结构体要写一个 `cmp`：

```cpp
struct Point { int x, y; };

bool cmp(const Point &a, const Point &b) {
    if (a.x != b.x) return a.x < b.x;
    return a.y < b.y;
}
sort(p, p + n, cmp);
```

用 `pair` **一行都不用写**：

```cpp
pair<int, int> p[1005];
sort(p, p + n);              // 就这么简单
```

::: exam pair 的比较规则正好是"双关键字"
```text
pair 的比较顺序：
  ① 先比 first
  ② first 相同，再比 second
  ③ second 也相同，视为相等

这正是"先按 x 排，再按 y 排"。
```

**所以只要你的排序规则是"两个字段、优先级依次"，`pair` 就能直接用。**
:::

## 最小可运行示例

<!-- expect

---
3 5
0
(1,9) (3,0) (3,1)
-->
```cpp
#include <cstdio>
#include <utility>
#include <algorithm>
using namespace std;

int main() {
    pair<int, int> a = {3, 5};
    pair<int, int> b = {3, 2};

    printf("%d %d\n", a.first, a.second);

    // 先比 first：都是 3，相同 → 再比 second：5 < 2 不成立
    printf("%d\n", a < b ? 1 : 0);

    // pair 数组排序：不需要 cmp
    pair<int, int> arr[3] = {{3, 1}, {1, 9}, {3, 0}};
    sort(arr, arr + 3);

    for (int i = 0; i < 3; i++) {
        printf("(%d,%d) ", arr[i].first, arr[i].second);
    }
    printf("\n");

    return 0;
}
```

输出：

```text
3 5
0
(1,9) (3,0) (3,1)
```

**排序结果 `(1,9) (3,0) (3,1)` 正好是"先按 x 升序，x 相同时按 y 升序"。**

## 关键过程与易错点

### 一、定义与访问

| 写法 | 说明 |
| --- | --- |
| `pair<int, int> p;` | 定义（两个 `int`） |
| `pair<int, string> p;` | 类型可以不同 |
| `pair<int, int> p = {3, 5};` | 直接初始化 |
| `p = make_pair(3, 5);` | `make_pair` 写法（会自动推导类型） |
| `p.first` / `p.second` | 访问两个成员 |
| `p = {1, 2};` | 整体赋值 |

::: pitfall `make_pair` 和 `{}` 的区别
```cpp
pair<int, long long> p;
p = make_pair(1, 2);         // 类型是 pair<int, int> → 会隐式转换
p = {1, 2LL};                // ✓ 更精确
```

**`make_pair` 会按参数推导类型**，有时候推导出的类型和你想要的不一样
（比如 `make_pair(1, 2)` 是 `pair<int,int>`）。

**大多数场合没区别。** 遇到类型不匹配的编译错误时，换成 `{}` 写法往往就好了。
:::

### 二、结构化绑定（C++17）：让代码更清楚

```cpp
pair<int, int> p = {3, 5};

// 老写法
cout << p.first << ' ' << p.second;

// C++17 结构化绑定
auto [x, y] = p;
cout << x << ' ' << y;
```

`auto [x, y] = p;` 的意思是"**把 p 拆成两个变量 x 和 y**"。

::: range 结构化绑定在遍历 map 时特别好用
```cpp
map<string, int> cnt;

// 老写法：到处都是 p.first / p.second
for (auto &p : cnt) cout << p.first << ' ' << p.second;

// 结构化绑定：一眼看懂
for (auto &[name, num] : cnt) cout << name << ' ' << num;
```

**注意要加 `&`**（否则改不到原元素）——这和[迭代器](/stl/iterators)里的规则一样。

**但要注意**：结构化绑定是 C++17 特性，**确认评测环境支持再用**（本书用 C++17）。
:::

### 三、`pair` 在竞赛里的三个高频用法

| 用法 | 例子 |
| --- | --- |
| **双关键字排序** | `pair<int,int> a[]; sort(a, a+n);` |
| **带权图存边** | `vector<pair<int,int>> g[]; g[u].push_back({v, w});` |
| **优先队列的排序依据** | `priority_queue<pair<int,int>> pq;` |

::: range 邻接表的常用写法
```cpp
// g[u] 里存 (终点, 边权)
vector<pair<int, int>> g[MAXN];

g[u].push_back({v, w});           // 加一条 u → v、权值 w 的边

for (auto &[to, w] : g[u]) {      // 遍历 u 的所有邻边
    cout << to << ' ' << w << '\n';
}
```

**比开三个数组（`to[]`、`w[]`、`next[]`）清楚得多。**

注意 `priority_queue` 用 `pair` 时是**默认按 `first` 从大到小**——
如果要按距离从小到大，常用"存负数"的技巧（见[优先队列](/stl/priority-queue)）。
:::

### 四、`pair` 装不下三个值怎么办

| 想要几个值 | 用什么 |
| --- | --- |
| 2 个 | `pair` |
| 3 个 | 自己定义 `struct`（STL 没有 `triple`） |
| 多个 | 自己定义 `struct` |

```cpp
// 三个值就自己定义
struct Node {
    int a, b, c;
};

bool cmp(const Node &x, const Node &y) {
    if (x.a != y.a) return x.a < y.a;
    if (x.b != y.b) return x.b < y.b;
    return x.c < y.c;
}
```

**两个用 `pair`，三个以上用 `struct`。** 这是竞赛里的常规选择。

### 五、嵌套 `pair`

`pair` 可以嵌套，用来表示"三个值"：

```cpp
pair<int, pair<int, int>> p = {1, {2, 3}};
cout << p.first << ' ' << p.second.first << ' ' << p.second.second;
```

::: pitfall 嵌套 pair 的写法容易看晕
```cpp
p.second.first          // 里面的第一个
p.second.second         // 里面的第二个
```

**比较规则也变成"先比最外层，再逐层往里"**：
先比 `p.first`，再比 `p.second.first`，最后比 `p.second.second`。

**如果字段超过两个，直接定义 `struct` 更好读。** 嵌套 `pair` 只在临时场景用。
:::

## 动手检查

1. 定义两个 `pair`，用 `<` 比较，在纸上先写出结果再运行验证。
2. 用 `pair` 数组存 5 个点，`sort` 后输出，验证是"先 x 后 y"。
3. 把 `p.first` / `p.second` 改成结构化绑定 `auto [x, y] = p;`。
4. 用 `pair<pair<int,int>, int>` 表示三个值，写出它的比较顺序。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入 n 个点，按 x 升序、x 相同时按 y 升序输出 | `pair` + `sort` |
| 基础 | 用 `pair` 存"成绩、学号"，按成绩降序输出（提示：存负数或自定义） | `pair` 的比较方向 |
| 巩固 | 用 `vector<pair<int,int>>` 建一个带权图的邻接表并输出 | 邻接表 |
| 巩固 | [洛谷 P1104 生日](https://www.luogu.com.cn/problem/P1104) | 多关键字排序（可用 `struct` 或嵌套 `pair`） |
| 挑战 | 用 `pair` + `priority_queue` 实现"每次取最小" | `pair` 与堆配合 |

::: pitfall 第 2 题的提示：`pair` 只有升序
`pair` 的比较是**固定**的（先比 `first` 小者优先），**不能反过来**。

想按 `first` **降序**，有两个办法：

1. **把值取负**：`{-score, id}`（最简单）
2. **自定义 `cmp`**：`sort` 时传一个比较函数

```cpp
pair<int, int> a[] = {{90, 1}, {95, 2}};
// 想按成绩降序 → 存成负数
a[0] = {-90, 1};
a[1] = {-95, 2};
sort(a, a + 2);              // -95 < -90 → 95 分的排在前面
```

**"存负数换取反向排序"是竞赛里很常用的技巧**，
在 `priority_queue` 里也用得多。
:::

## 下一节

`pair` 只能装两个值。`vector` / `set` / `map` 这些容器的共同点是什么？

用[比较规则与函数对象](/stl/function-objects)把"怎么排序"这件事讲透——
包括那个最实用的 `lambda`。
