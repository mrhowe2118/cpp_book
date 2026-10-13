# 现代 C++ 实用特性

C++11/14/17 带来了很多**真正省事**的写法。这一节挑出**竞赛里值得用的那些**。

## 本节学会什么

- 会用 `auto`、范围 `for`、结构化绑定、`nullptr`
- 会用统一的 `{}` 初始化
- 会用 `using` 定义类型别名
- 知道**哪些新特性值得用、哪些应该避开**

## 为什么需要它

对比一下同一个程序的新旧写法：

```cpp
// 老写法
vector<pair<string, int>>::iterator it;
for (it = v.begin(); it != v.end(); ++it) {
    cout << it->first << ' ' << it->second << '\n';
}

// 新写法
for (auto &[name, score] : v) {
    cout << name << ' ' << score << '\n';
}
```

::: exam 现代 C++ 的价值：少写、少错、更清楚
| 新特性 | 省掉了什么 |
| --- | --- |
| `auto` | 写一遍又长又容易错的类型名 |
| 范围 `for` | 迭代器的样板代码 |
| 结构化绑定 | 到处写 `.first` / `.second` |
| `{}` 初始化 | 老式初始化的各种歧义 |

**这些都是"读起来更像人话"的改进**——和本书的取向一致。
:::

## 最小可运行示例

<!-- expect

---
5 2 8 1
42 3.14 hello
-->
```cpp
#include <cstdio>
#include <vector>
#include <string>
using namespace std;

int main() {
    // auto：让编译器推导类型
    auto x = 42;                     // int
    auto y = 3.14;                   // double
    auto s = string("hello");        // string

    // 统一的 {} 初始化
    vector<int> v = {5, 2, 8, 1};

    // 范围 for
    for (auto val : v) printf("%d ", val);
    printf("\n");

    printf("%d %.2f %s\n", x, y, s.c_str());

    return 0;
}
```

输出：

```text
5 2 8 1
42 3.14 hello
```

## 值得用的特性

### 1. `auto`：让编译器推导类型

```cpp
auto x = 42;                          // int
auto d = 3.14;                        // double
auto it = v.begin();                  // vector<int>::iterator（不用手写！）
auto p = make_pair(1, 2);             // pair<int,int>
```

::: pitfall `auto` 会忽略引用和 `const`（要显式写）
```cpp
vector<int> v = {1, 2, 3};

for (auto x : v) x *= 2;              // ✗ x 是副本，v 没变
for (auto &x : v) x *= 2;             // ✓ 要加 &

const int c = 5;
auto a = c;                           // a 是 int，不是 const int
```

**"范围 `for` 想修改元素要加 `&`"** 这个坑在
[C++ string](/guide/cpp-string)和[迭代器与区间](/stl/iterators)里都出现过。

**记法：`auto` 只推导"值类型"，引用和 const 要你自己写。**
:::

::: pitfall 什么时候**不要**用 auto
```cpp
auto n = v.size();                    // ⚠️ n 是 size_t（无符号），不是 int
for (int i = 0; i < n; i++) v[i]--;   // 容易触发无符号比较警告
```

**`auto` 会把 `size()` 的无符号性带进来**——
[那个经典陷阱](/guide/cpp-string)反而更难发现了。

**建议：**

- `auto` 用在**类型名很长**的地方（迭代器、`pair`）
- **简单类型**（`int`、`double`）直接写出来更清楚
- `size()` 的结果**显式写 `int`**：`int n = (int)v.size();`
:::

### 2. 范围 `for`：遍历的最简写法

```cpp
for (int x : v) cout << x;            // 只读
for (int &x : v) x *= 2;              // 要修改
for (const auto &x : v) cout << x;    // 只读 + 不复制（大对象推荐）
```

| 写法 | 适合 |
| --- | --- |
| `for (int x : v)` | 简单类型，只读 |
| `for (int &x : v)` | 需要修改 |
| `for (const auto &x : v)` | 大对象（`string`、结构体），只读 |

### 3. 结构化绑定（C++17）：拆开 `pair`

```cpp
pair<int, string> p = {1, "abc"};
auto [id, name] = p;                  // 拆成两个变量
cout << id << ' ' << name;

// 遍历 map 时特别好用
for (auto &[key, val] : mp) {
    cout << key << ' ' << val;
}
```

**注意遍历时要加 `&`**（否则改不到原元素）。

### 4. `{}` 统一初始化

```cpp
int a{5};                             // 等价于 int a = 5;
vector<int> v = {1, 2, 3};
pair<int,int> p = {1, 2};
int arr[] = {1, 2, 3};
```

::: pitfall `{}` 有一个"意外的好处"：禁止窄化
```cpp
int a = 3.14;                         // 能编译（3.14 被截断成 3）⚠️
int b{3.14};                          // ✗ 编译错误（{} 不允许丢精度）
```

**`{}` 会拒绝"会丢数据的转换"**——这能帮你发现一些隐蔽的 bug。

**但竞赛里 `=` 更常见、更省事。两种都行，知道差别就好。**
:::

### 5. `nullptr`：替换 `NULL`

```cpp
int *p = nullptr;                     // ✓ C++11 起推荐
int *q = NULL;                        // 老写法
```

**为什么更好**：`NULL` 本质是 `0`，在重载时可能被当成整数；
`nullptr` 有独立类型，不会有歧义。

**竞赛里其实很少用**指针——但 `freopen` 返回值检查时可以用：

```cpp
if (freopen("apple.in", "r", stdin) == nullptr) { ... }
```

### 6. `using`：类型别名

```cpp
using ll = long long;                          // 比 typedef 清楚
using pii = pair<int, int>;
using vp = vector<pair<int, int>>;
```

**用途**：把长类型名缩短。

::: pitfall `using` 别名别起得太短
```cpp
using P = pair<int,int>;
using VP = vector<P>;

VP g[MAXN];                                    // 读代码的人要想一下
```

**适度的别名让代码更短；过度别名让代码加密。**
`ll` 表示 `long long` 是竞赛惯例，大家都认识；
`P`、`VP` 这种就得看上下文了。
:::

## 应该避开的特性

::: pitfall 这些"新特性"在竞赛里不划算
| 特性 | 为什么不划算 |
| --- | --- |
| `auto` 到处用 | 类型不直观，调试时看不出变量是什么 |
| 复杂的模板元编程 | 编译慢、报错长，收益极低 |
| 异常处理 `try/catch` | 评测环境行为不可控；而且**不该用它处理逻辑** |
| `std::function` | 比 lambda 慢（见[函数对象](/advanced/function-objects)） |
| 智能指针 `shared_ptr` | 竞赛里不需要手动管理内存 |
| 多线程 | 竞赛不支持 |
| `auto` 接 `size()` | 把无符号陷阱藏得更深 |

**判断标准：这个特性让我"少写几行"还是"更清楚"？**

- 更清楚 → 用
- 只是更短，但类型变模糊 → 别用
:::

## 一个综合例子

<!-- expect

---
a 1
c 3
b 2
---
3
---
c 3
b 2
a 1
-->
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Item {
    string name;
    int val;
};

int main() {
    // 范围 for + 结构化绑定 + {}
    vector<pair<string, int>> v = {{"a", 1}, {"c", 3}, {"b", 2}};

    for (const auto &[name, val] : v) {
        cout << name << ' ' << val << '\n';
    }
    cout << "---\n";

    // lambda 排序（按 val 降序）
    sort(v.begin(), v.end(),
         [](const pair<string, int> &x, const pair<string, int> &y) {
             return x.second > y.second;
         });

    cout << v.size() << '\n';
    cout << "---\n";

    for (const auto &[name, val] : v) {
        cout << name << ' ' << val << '\n';
    }

    return 0;
}
```

这一点代码把人这一部分学的东西都用上了：
`vector`、`pair`、范围 `for`、结构化绑定、`lambda`、`const &`。

## 动手检查

1. 把示例里的 `auto x = 42;` 改成 `auto x = v.size();`，观察类型变成了什么（提示：用 `sizeof` 或观察警告）。
2. 用范围 `for` 把 `vector` 里所有元素加 1（注意 `&`）。
3. 用结构化绑定遍历一个 `map`，输出所有键值对。
4. 故意写 `int b{3.14};`，看编译错误。
5. 用 `using ll = long long;` 简化一段代码，对比可读性。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 用 `auto` 和范围 `for` 重写一段遍历代码 | 基本用法 |
| 基础 | 用结构化绑定遍历一个 `map` | C++17 |
| 巩固 | 用 `lambda` + `sort` 按 `pair` 的 `second` 排序 | lambda |
| 巩固 | 用 `using` 给三个长类型起别名，简化一段代码 | 类型别名 |
| 挑战 | 把[基础篇总复习](/guide/summary)的综合例题用现代 C++ 重写一遍 | 综合 |

::: pitfall 最后一节的提醒：新特性要"用得值"
**这本书里所有"现代 C++"的用法，都是因为"写得更清楚"才用的**：

- 范围 `for` 让遍历更直观
- 结构化绑定让 `map` 遍历不用写 `.second`
- `const auto &` 让参数传递又短又安全

**但 `auto` 也有反例**（藏起类型、藏起无符号性）。

**判断标准始终是那一条：读代码的人（包括三个月后的你）能不能更快看懂？**
:::

## 全书最后一句话

到这里，整本书读完了。回到最开始[开始编程](/guide/getting-started)说的：

> 学习语法之前，先要有一条能自己走通的路。

你现在的路是这样的：

```text
写代码 → 编译运行 → 测边界 → 估复杂度 → 用 STL 提效
   → 考前过五道关 → 把会的分拿到手
```

**算法决定你的上限，习惯决定你能拿到多少。**

**祝你 RP++。**
