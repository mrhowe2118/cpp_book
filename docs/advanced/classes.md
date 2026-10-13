# 类与对象入门

::: range 这一节是选读
[结构体](/guide/structs)你已经会了。**类就是"能带函数的结构体"**——
多出来的能力叫"封装"，而竞赛里 90% 的场景用结构体就够了。

**所以这一节的目标是"看得懂、知道什么时候值得用"，不是"必须用"。**
:::

## 本节学会什么

- 写出带成员函数的类
- 会用构造函数和析构函数
- 理解 `private` / `public` 的用途
- 判断**什么时候该用类、什么时候结构体就够了**

## 为什么需要它

先看一个需求：**维护一个"栈"**。

用结构体 + 手写函数：

```cpp
struct MyStack {
    int a[1005];
    int top;
};

void push(MyStack &s, int x) { s.a[++s.top] = x; }
int pop(MyStack &s) { return s.a[s.top--]; }
```

**问题**：数据和操作是**分开**的。谁都可以直接写 `s.top = 100`，把栈搞坏。

用类，把操作**放进类型里**：

```cpp
class MyStack {
private:                      // ← 外面改不到
    int a[1005];
    int top;

public:                       // ← 外面只能用这些
    MyStack() : top(0) { }
    void push(int x) { a[++top] = x; }
    int pop() { return a[top--]; }
    bool empty() const { return top == 0; }
};
```

::: exam "封装"到底解决了什么
```cpp
MyStack s;
s.push(3);
s.push(5);
cout << s.pop();        // 5

s.top = 100;            // ✗ 编译错误：top 是 private
```

**使用者只能通过 `push` / `pop` 来操作**——
**他不可能"忘记维护 top"，也不可能"把 top 弄错"。**

**这就是封装的价值：把"必须一起做的事"锁在一起。**
:::

## 最小可运行示例

<!-- expect

---
pop: 5
pop: 3
empty: 1
-->
```cpp
#include <cstdio>

class MyStack {
private:
    int a[1005];
    int top;

public:
    MyStack() { top = 0; }               // 构造函数：初始化

    void push(int x) {
        a[++top] = x;
    }

    int pop() {
        return a[top--];
    }

    bool empty() const {
        return top == 0;
    }
};

int main() {
    MyStack s;

    s.push(3);
    s.push(5);

    printf("pop: %d\n", s.pop());
    printf("pop: %d\n", s.pop());
    printf("empty: %d\n", s.empty());

    return 0;
}
```

输出：

```text
pop: 5
pop: 3
empty: 1
```

## 关键过程与易错点

### 一、`class` 和 `struct` 只差一个默认权限

| | `struct` | `class` |
| --- | --- | --- |
| 默认访问权限 | **`public`** | **`private`** |
| 其他 | 完全一样 | 完全一样 |

```cpp
struct A { int x; };        // x 默认是 public
class  B { int x; };        // x 默认是 private
```

**惯例**：

- 只是"打包数据" → 用 `struct`
- 有"需要保护的内部状态" → 用 `class`，并且显式写 `public:` / `private:`

### 二、构造函数：对象创建时自动调用

```cpp
class Point {
public:
    int x, y;
    Point() { x = 0; y = 0; }              // 无参构造
    Point(int a, int b) { x = a; y = b; }  // 带参构造
};
```

| 写法 | 效果 |
| --- | --- |
| `Point p;` | 调用无参构造 |
| `Point p(3, 5);` | 调用带参构造 |
| `Point p = {3, 5};` | 聚合初始化（**没有自定义构造函数时才可用**） |

::: pitfall 写了构造函数就没法用 `{}` 初始化了
```cpp
class Point {
public:
    int x, y;
    Point() { x = 0; y = 0; }
};

Point p = {3, 5};        // ✗ 编译错误（有自定义构造函数时不能用聚合初始化）
Point p(3, 5);           // ✓ 但如果没定义带参构造，这也不行
```

**这是从"结构体"转到"类"时最容易踩的坑。**

**结构体可以直接 `{3, 5}` 初始化**，而一旦你写了构造函数，这个能力就没了。

**解决**：写一个带参构造，或者干脆写 `Point() = default;`。
:::

### 三、初始化列表：更地道的写法

```cpp
class Point {
    int x, y;
public:
    Point(int a, int b) : x(a), y(b) { }   // ← 冒号后面是初始化列表
};
```

**和"在函数体里赋值"的区别**：

| 写法 | 过程 |
| --- | --- |
| `Point(int a, int b) { x = a; }` | 先默认初始化，再赋值 |
| `Point(int a, int b) : x(a) { }` | **直接初始化** |

**对 `int` 这类简单类型没差别**，但对 `string`、`vector` 这类成员，
初始化列表**效率更高**（省掉一次默认构造 + 赋值）。

**顺带一个必须用初始化列表的场合**：成员是 `const` 或引用时，**只能**用初始化列表。

### 四、`const` 成员函数

```cpp
bool empty() const { return top == 0; }
//             ↑ 表示"这个函数不会修改对象"
```

::: pitfall 忘了写 `const`，就没法在 const 对象上调用
```cpp
class MyStack {
public:
    bool empty() { return top == 0; }      // ✗ 没写 const
};

void f(const MyStack &s) {
    if (s.empty()) { }                     // ✗ 编译错误：const 对象不能调用非 const 函数
}
```

**回顾[函数参数与引用](/guide/function-parameters)里的规矩**：
结构体/类作参数一律写 `const 类型 &`。

**这就要求"只读"的成员函数必须标 `const`**——否则在这个最常用的场景下用不了。

**纪律：不修改成员的函数，一律加 `const`。**
:::

### 五、竞赛里什么时候真的需要类

::: exam 大部分时候，结构体就够了
| 需求 | 用什么 |
| --- | --- |
| 打包几个数据（学生、边、坐标） | **`struct`** ✅ |
| 需要自定义排序 | `struct` + `cmp` |
| 需要保护内部状态（栈、队列、并查集） | 类（但通常也可以用 `struct` + 函数） |
| 需要重载运算符 | 类或结构体都行 |
| 写"模板容器" | 类模板 |

**竞赛代码的现实**：

```text
90% 的场景：结构体 + 全局数组 + 函数
 9% 的场景：结构体 + 运算符重载
 1% 的场景：真正需要封装（写库、写模板）
```

**所以：先掌握结构体。类等你有"想保护的东西"时再学。**
:::

### 六、一个实用的例子：并查集封装

```cpp
struct DSU {
    int fa[100005];

    void init(int n) {
        for (int i = 1; i <= n; i++) fa[i] = i;
    }
    int find(int x) {
        return fa[x] == x ? x : fa[x] = find(fa[x]);
    }
    void merge(int x, int y) {
        fa[find(x)] = find(y);
    }
};
```

**这里用的是 `struct` 而不是 `class`**——因为 `fa` 直接暴露出来也没关系，
而且这样写比"类 + 成员函数"更符合竞赛习惯（见[必背模板](/practice/templates)里的并查集）。

**注意**：这是"带函数的结构体"，功能上和类完全一样。

## 动手检查

1. 把示例里的 `class` 改成 `struct`，去掉 `private`/`public`，确认仍能编译。
2. 写一个 `Point` 类，带 `(x, y)` 构造函数，输出两点距离。
3. 故意在类外访问 `private` 成员，把编译错误读一遍。
4. 把 `empty()` 的 `const` 去掉，再写一个 `const MyStack &` 参数的函数调用它，
   看编译错误。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 写一个 `Point` 类（含构造函数、打印函数） | 类基础 |
| 基础 | 用 `struct` 和 `class` 各写一遍同一个栈，对比写法 | 两者差别 |
| 巩固 | 用 `struct` + 成员函数封装一个并查集 | 竞赛里的真实用法 |
| 巩固 | 写一个 `Fraction` 类，支持 `+` 和约分 | 为下一节的运算符重载做准备 |
| 挑战 | 用类实现一个"支持 push/pop/查询最小值的栈" | 封装的实际价值 |

::: pitfall 一个提醒：不要为了"面向对象"而面向对象
竞赛代码追求的是**写对、写快、看得懂**。

**把一个 20 行的程序拆成 5 个类是负优化**——
它增加了阅读成本，却没有换来任何好处。

**判断标准：有没有"必须一起维护的状态"？**

- 有（比如栈的 `top` 和数组必须同步）→ 封装有价值
- 没有（只是几个数据）→ 用 `struct`
:::

## 下一节

如果想让 `Point` 支持 `p1 + p2` 或者 `p1 < p2` 呢？

[运算符重载](/advanced/operator-overloading)——让自定义类型像内置类型一样用。
