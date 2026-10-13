# 比较规则与函数对象

**几乎所有 STL 容器和算法都需要知道"谁大谁小"。** 这一节把"怎么告诉它们"这件事讲透。

学会之后，`sort` / `set` / `map` / `priority_queue` 的自定义排序就都是一回事了。

## 本节学会什么

- 知道"比较规则"在哪些地方要用
- 掌握三种写法：**普通函数、函数对象、`lambda`**
- 会用 `lambda` 把 `cmp` 写得更短
- 分清 `sort` 的 `cmp` 和 `priority_queue` 的比较（**方向是反的**）
- 知道 `set` / `map` 的自定义比较要注意什么

## 为什么需要它

前面几节零散地出现过"自定义比较"：

| 在哪 | 怎么传 |
| --- | --- |
| [sort](/stl/sort) | `sort(a, a + n, cmp)` |
| [set](/stl/set) | `set<int, greater<int>>` |
| [priority_queue](/stl/priority-queue) | `priority_queue<int, vector<int>, greater<int>>` |
| [map](/stl/map) | `map<string, int, Cmp>` |

::: exam 它们其实是同一件事
**都是"告诉容器/算法：a 和 b 谁应该排前面"。**

只是传递方式不同：

- **算法**（`sort`）→ 把规则**当参数传进去**
- **容器**（`set`/`map`/`priority_queue`）→ 规则**写在类型里**

**理解了这一点，四处的写法就统一了。**
:::

## 最小可运行示例

<!-- expect

---
5 4 3 -1 -1
-1 -1 3 4 5
-->
```cpp
#include <cstdio>
#include <cstdlib>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {3, -1, 4, -1, 5};

    // ① lambda：降序
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    for (int x : v) printf("%d ", x);
    printf("\n");

    // ② lambda：按绝对值升序
    sort(v.begin(), v.end(), [](int a, int b) { return abs(a) < abs(b); });
    for (int x : v) printf("%d ", x);
    printf("\n");

    return 0;
}
```

输出：

```text
5 4 3 -1 -1
-1 -1 3 4 5
```

### `lambda` 就是"写在使用处的匿名函数"

```cpp
[](int a, int b) { return a > b; }
// ↑  ↑           ↑
// 捕获列表 参数   函数体
```

| 部分 | 含义 | 这里 |
| --- | --- | --- |
| `[]` | **捕获列表**：要不要用外面的变量 | 空的（没用到外部变量） |
| `(int a, int b)` | 参数 | 两个待比较的元素 |
| `{ return a > b; }` | 函数体 | 返回"a 是否该排在 b 前面" |

**和写一个独立的 `cmp` 函数完全等价，只是写在了使用的地方。**

::: exam lambda 的两个好处
```cpp
// 用独立函数
bool cmp(int a, int b) { return a > b; }
sort(v.begin(), v.end(), cmp);

// 用 lambda
sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
```

1. **不用起名字**——比较规则常常只用一次，起名字是负担
2. **就近可读**——规则就写在 `sort` 那一行，不用翻到别处
:::

## 关键过程与易错点

### 一、三种写法对比

| 写法 | 例子 | 适合 |
| --- | --- | --- |
| **普通函数** | `bool cmp(int a, int b) { return a > b; }` | 逻辑较长、多处复用 |
| **函数对象** | `struct Cmp { bool operator()(int a, int b) { return a > b; } };` | **需要"类型"的场合**（`set`/`map`） |
| **lambda** | `[](int a, int b) { return a > b; }` | 临时用一次（**最常用**） |

::: pitfall 函数对象是"能当函数用的对象"
```cpp
struct Cmp {
    bool operator()(int a, int b) {         // 重载了调用运算符
        return a > b;
    }
};

Cmp c;
c(3, 5);                    // 像函数一样调用对象 → false
```

**它不是函数，是个"重载了 `()` 的结构体"。**

**为什么需要它？** 因为 `set` / `map` 的比较规则必须写在**类型**里：

```cpp
set<int, Cmp> s;            // ← 需要的是类型 Cmp，不是一个函数
```

**所以容器用函数对象，算法用函数或 lambda。**
:::

### 二、`lambda` 也能用在容器上（但要加 `decltype`）

C++17 里可以这样：

```cpp
auto cmp = [](const string &a, const string &b) { return a.size() < b.size(); };
set<string, decltype(cmp)> s(cmp);        // C++11 起可用
```

**注意两处细节**：

1. `decltype(cmp)` 是**类型**，不是值
2. 构造时要**把 `cmp` 传进去**（lambda 没有默认构造函数）

**写起来比函数对象啰嗦。** 需要给容器定制比较时，一般还是用函数对象。

### 三、`set` / `map` 的比较必须满足"严格弱序"

::: pitfall `set` 的 `cmp` 写成 `<=` 会静默丢元素
```cpp
struct BadCmp {
    bool operator()(const int &a, const int &b) const {
        return a <= b;              // ✗ 危险
    }
};
set<int, BadCmp> s;
```

**后果**：`set` 认为 `a` 和 `b` 相等时（`cmp(a,b)` 和 `cmp(b,a)` 都为真），
它会把它们当成**同一个元素**，于是**后插入的被丢掉**。

**结果：`size()` 比预期小，元素莫名消失。**

**纪律**：`cmp` 里一律用 `<` 或 `>`，**绝不用 `<=` `>=`**。
（和 [sort 的 cmp](/stl/sort) 是同一条纪律。）
:::

### 四、`sort` 和 `priority_queue` 的方向**相反**

这是最容易搞错的一点，单独列表强调：

| | `sort` 的 `cmp` | `priority_queue` 的比较 |
| --- | --- | --- |
| 返回 `true` 表示 | a 排在 b **前面** | a 的优先级**比 b 低** |
| 想"大的在前" | `return a > b;` | `return a < b;` |
| 记法 | "a 该在前面吗？" | **"a 比 b 差吗？"** |

::: range 为什么优先队列是反的
因为 `priority_queue` 的堆顶是"最后被比较规则判为最大"的那个。

```text
Cmp(a, b) 返回 true 的意思是："a 的优先级低于 b"
于是 b 会被放到更靠上的位置 → b 先出队
```

**写反了的症状：输出的顺序完全颠倒。** 遇到就先检查这里。

**最稳的做法**：先用一小组数据测一下顺序，再往题目里套。
:::

### 五、常用的现成比较规则

不用自己写的时候，直接用标准库提供的：

| 规则 | 含义 |
| --- | --- |
| `less<int>()` | 小的在前（**默认**） |
| `greater<int>()` | 大的在前 |
| `less<string>()` | 字典序 |

```cpp
sort(a, a + n, greater<int>());                       // 降序
priority_queue<int, vector<int>, greater<int>> pq;    // 小根堆
set<int, greater<int>> s;                             // 从大到小
```

**注意 `greater` 这个名字容易误解**：

- `greater` 表示"**大的排在前面**"
- 用在 `priority_queue` 上，堆顶就是**最小的**（因为"大的排在后面"）

**记忆：`greater` 描述的是"谁大谁优先靠前"，而在堆里"靠前"意味着"先出"。**

### 六、`lambda` 捕获外部变量

```cpp
int limit = 10;
sort(v.begin(), v.end(), [limit](int a, int b) {
    // 只用 a、b 之间的比较，但需要用到 limit
    return a % limit < b % limit;
});
```

| 写法 | 含义 |
| --- | --- |
| `[]` | 不捕获 |
| `[limit]` | 按值捕获（复制一份） |
| `[&limit]` | 按引用捕获 |
| `[=]` / `[&]` | 捕获所有用到的变量（按值 / 按引用） |

::: pitfall 按引用捕获要小心变量生命周期
```cpp
auto makeCmp() {
    int x = 10;
    return [&x](int a, int b) { return a % x < b % x; };   // ✗ x 已经销毁
}
```

**函数返回后 `x` 就没了，lambda 里的引用悬空**——调用时是未定义行为。

**竞赛里 `lambda` 基本都用在"当场使用"的场景**（传给 `sort` 就完事），
不太会遇到这个问题。但要记住：**按值捕获更安全**。
:::

## 动手检查

1. 用三种写法（函数 / 函数对象 / lambda）实现同一个"降序"比较，对比代码长度。
2. 用 `lambda` 写一个"按字符串长度排序"的规则，给 `sort` 用。
3. 用 `greater<int>()` 给 `set` 排序，验证遍历是**从大到小**。
4. 把 `priority_queue` 的比较规则写反，运行看输出顺序是否颠倒。
5. 把 `set` 的比较规则写成 `<=`，插入几个相同元素，看 `size()` 是不是变小了。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 用 `lambda` 给 `vector<int>` 降序排序 | lambda 基础 |
| 基础 | 用 `lambda` 按绝对值排序 | 自定义规则 |
| 巩固 | 用函数对象给 `set<string>` 按长度排序 | 容器的比较规则 |
| 巩固 | 用 `lambda` 给 `pair` 数组按 `second` 排序 | pair + lambda |
| 巩固 | [洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093) | 多关键字（用 lambda 重写试试） |
| 挑战 | 用 `lambda` + `decltype` 给 `priority_queue` 定制比较 | lambda 用在容器上 |

::: pitfall 第 5 题的提示
```cpp
auto cmp = [](const pair<int,int> &a, const pair<int,int> &b) {
    return a.second > b.second;          // 按 second 降序
};
sort(v.begin(), v.end(), cmp);
```

**注意 lambda 写在这行之前**（C++ 里要先定义后使用）。

**如果想在 lambda 里"临时"排序，也可以直接把 lambda 写在 `sort` 的参数里**——
这也是最常见的形式。

**但这道题其实用 `pair` 更方便**：如果排序规则正好是"先比某个、再比另一个"，
直接用 `pair` 就不用写 `cmp` 了（见 [pair 二元组](/stl/pair)）。
:::

## 下一节

比较规则讲完了，接下来看几个 STL 算法：

[find 查找](/stl/find)——在不排序的情况下找元素。
