# 运算符重载

**让自定义类型也能用 `+`、`<`、`<<`。** 这是 C++ 里最实用、也最容易被滥用的特性。

竞赛里它最常见的用途是：**让结构体支持比较和输入输出**。

## 本节学会什么

- 重载 `<`，让结构体**直接可以 `sort`**（不用写 `cmp`）
- 重载 `+` 等算术运算符
- 重载 `<<`，让结构体**能直接用 `cout`**
- 知道哪些该重载、哪些不该

## 为什么需要它

回顾[结构体](/guide/structs)里的排序写法：

```cpp
struct Student { int total, id; };

bool cmp(const Student &a, const Student &b) {
    if (a.total != b.total) return a.total > b.total;
    return a.id < b.id;
}
sort(st, st + n, cmp);                 // 必须传 cmp
```

如果我们告诉编译器"`Student` 的 `<` 是什么意思"，就可以**不传 `cmp`**：

```cpp
sort(st, st + n);                       // 直接用默认比较
```

::: exam 运算符重载就是"给运算符定义新含义"
```cpp
a + b      对 int 是加法
a + b      对 Fraction 可以是分数加法
a < b      对 Student 可以是"按总分比大小"
```

**编译器的规则没变，只是你把"这个运算符对这个类型意味着什么"告诉它了。**
:::

## 最小可运行示例

<!-- expect

---
(1,2) < (3,5)
(1,2) + (3,5) = (4,7)
-->
```cpp
#include <cstdio>

struct Point {
    int x, y;
};

// 重载 < ：让 Point 支持比较
bool operator<(const Point &a, const Point &b) {
    if (a.x != b.x) return a.x < b.x;
    return a.y < b.y;
}

// 重载 + ：让 Point 支持相加
Point operator+(const Point &a, const Point &b) {
    return {a.x + b.x, a.y + b.y};
}

int main() {
    Point a = {1, 2};
    Point b = {3, 5};

    if (a < b) printf("(%d,%d) < (%d,%d)\n", a.x, a.y, b.x, b.y);

    Point c = a + b;
    printf("(%d,%d) + (%d,%d) = (%d,%d)\n", a.x, a.y, b.x, b.y, c.x, c.y);

    return 0;
}
```

输出：

```text
(1,2) < (3,5)
(1,2) + (3,5) = (4,7)
```

::: range 写法有个固定套路
```cpp
返回类型 operator 运算符(参数) { ... }

bool  operator<(const Point &a, const Point &b) { ... }
Point operator+(const Point &a, const Point &b) { ... }
```

**就是"函数名"变成了 `operator<` 这样的形式。**

**其他部分和普通函数完全一样**：有返回类型、有参数、有函数体。
:::

## 关键过程与易错点

### 一、重载 `<`：最实用的一个

**重载了 `<`，`sort` 和 `set` 就都能直接用了**：

```cpp
struct Student {
    int total, id;

    // 写成成员函数版本（推荐）
    bool operator<(const Student &other) const {
        if (total != other.total) return total > other.total;   // 总分降序
        return id < other.id;                                    // 编号升序
    }
};

sort(st, st + n);                    // ✓ 不用传 cmp 了
set<Student> s;                      // ✓ 也能用
```

::: pitfall 写成成员函数时要注意 `const`
```cpp
struct Student {
    bool operator<(const Student &other) const { ... }
    //                                   ↑ 别忘了
};
```

**`const` 表示"这个比较不修改自己"**——
不写的话，`const Student &` 的场合就用不了（和[类与对象](/advanced/classes)里的规矩一样）。

**记法：所有"比较类"的成员函数都加 `const`。**
:::

### 二、两种写法：成员函数 vs 全局函数

| 写法 | 例子 | 适用 |
| --- | --- | --- |
| **成员函数** | `bool operator<(const T &o) const` | 左操作数是 `T` 的情况 |
| **全局函数** | `bool operator<(const T &a, const T &b)` | 左右都可能是别的类型 |

**规则**：

```text
a < b   写成成员函数 → 相当于 a.operator<(b)     （a 必须是 T）
a < b   写成全局函数 → 相当于 operator<(a, b)     （两个参数都显式）
```

**什么时候必须用全局函数？** 当**左操作数不是你的类型**时：

```cpp
// 让 Point 能直接 cout 输出：左操作数是 ostream
ostream& operator<<(ostream &out, const Point &p) {
    out << '(' << p.x << ',' << p.y << ')';
    return out;
}
```

### 三、重载 `<<`：让结构体能 `cout`

<!-- expect

---
(3,5) (1,2)
-->
```cpp
#include <iostream>
using namespace std;

struct Point {
    int x, y;
};

// 注意：左操作数是 ostream，所以必须写成全局函数
ostream& operator<<(ostream &out, const Point &p) {
    out << '(' << p.x << ',' << p.y << ')';
    return out;                      // 返回 out，才能连续输出
}

int main() {
    Point a = {3, 5};
    Point b = {1, 2};

    cout << a << ' ' << b << '\n';   // 像内置类型一样输出
    return 0;
}
```

输出 `(3,5) (1,2)`。

::: pitfall 忘了 `return out`，就不能连续输出
```cpp
ostream& operator<<(ostream &out, const Point &p) {
    out << '(' << p.x << ',' << p.y << ')';
    // ✗ 没有 return
}
```

**必须返回 `out`**，否则 `cout << a << ' ' << b` 会在第一个 `<<` 之后就断掉
（因为拿不到"还能继续输出"的流对象）。

**返回类型是 `ostream&`（引用），不能是 `ostream`（拷贝流是禁止的）。**
:::

### 四、`sort` 和 `priority_queue` 的方向问题

回顾[比较规则与函数对象](/stl/function-objects)里那条最容易错的：

| | 重载 `<` 之后 | 说明 |
| --- | --- | --- |
| `sort` | 按你定义的 `<` **升序** | 正常 |
| `priority_queue` | 按你定义的 `<` **反着来** | 堆顶是"最大"的 |

::: range 一个容易混的例子
```cpp
struct Node {
    int d;
    bool operator<(const Node &o) const {
        return d > o.d;              // 注意这里写的是 >
    }
};

priority_queue<Node> pq;             // 堆顶是 d 最小的！
```

**因为 `priority_queue` 的堆顶是"最大元素"，
而你定义的 `<` 说"d 大的反而更小"，所以 d 最小的成了堆顶。**

**这就是"用小根堆要给反向比较"的原理**——
和[优先队列](/stl/priority-queue)里 `greater<int>` 的道理一样。
:::

### 五、竞赛里推荐重载哪些

| 运算符 | 推荐 | 用途 |
| --- | --- | --- |
| `<` | ✅ **强烈推荐** | 让 `sort` / `set` 直接用 |
| `==` | ✅ 推荐 | 判断相等 |
| `+` `-` `*` | ✅ 看需要 | 分数、向量、高精度 |
| `<<` | ✅ 推荐 | 调试时直接输出结构体 |
| `>>` | 🔶 可选 | 简化读入 |
| `++` `--` | ⚠️ 少用 | 容易混乱 |
| `[]` | 🔶 可选 | 自定义容器 |
| `()` | ✅ 见[函数对象](/advanced/function-objects) | 让对象能当函数用 |

::: pitfall 不要重载语义不明的运算符
```cpp
Point operator*(const Point &a, const Point &b) { ... }   // ⚠️ 点积？叉积？分量乘？
```

**乘法对"点"有歧义**（点积、叉积、逐分量乘……）。
**重载之后读代码的人不知道是哪个。**

**建议：语义明确的才重载。**
不确定就写一个名字清楚的普通函数：

```cpp
int dot(const Point &a, const Point &b);        // ✓ 一看就懂
int cross(const Point &a, const Point &b);
```
:::

## 动手检查

1. 给 `Point` 重载 `==`，比较两个点是否相同。
2. 给 `Point` 重载 `<`，然后**不传 `cmp`** 直接 `sort` 一个 `Point` 数组。
3. 把 `operator<<` 的 `return out;` 删掉，编译看报什么错。
4. 定义一个 `Node`，重载 `<` 让 `priority_queue<Node>` 的堆顶是**最小值**。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 给 `Point` 重载 `+`、`-`、`==` | 基本重载 |
| 基础 | 给 `Point` 重载 `<`，然后直接 `sort` | 替代 `cmp` |
| 巩固 | 写一个 `Fraction`（分数）类，重载 `+` 并自动约分 | 运算符重载的典型用法 |
| 巩固 | 给结构体重载 `<<`，让调试输出更简单 | 输出运算符 |
| 巩固 | [洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093)：改用重载 `<` 实现，不写 `cmp` | 对比两种写法 |
| 挑战 | 用重载 `[]` 写一个"下标从 1 开始"的数组包装 | 高级重载 |

::: pitfall 重载 `<` 替代 `cmp` 的取舍
| | 重载 `<` | 写 `cmp` |
| --- | --- | --- |
| `sort` 时 | 不用传参数 | 每次要传 |
| 多种排序规则 | **做不到**（只能有一种） | ✅ 可以写多个 |
| `set` / `map` | ✅ 直接用 | 要写在类型里 |

**关键取舍：**

- **一种排序规则** → 重载 `<` 更省事
- **同一道题要按不同规则排两次** → 写 `cmp`（或者 `lambda`）

**例如"先按总分排输出一次，再按语文排输出一次"——这种情况必须用 `cmp`。**
:::

## 下一节

`operator()` 有一种特别有用的用法：**让对象能像函数一样被调用**。

[函数对象与 lambda](/advanced/function-objects)。
