# 模板入门

**模板让"写一次，适应多种类型"成为可能。** 你其实一直在用它——`vector<int>`、`sort`、`set<string>` 都是模板。

这一节讲清它是什么，以及竞赛里什么时候值得自己写。

## 本节学会什么

- 写出函数模板和类模板
- 理解"模板参数"和"类型推导"
- 知道 STL 就是模板库
- 知道竞赛里**什么时候值得写模板、什么时候不值得**

## 为什么需要它

先看一个需求：**求两个数的最大值**。

三个类型就要写三份：

```cpp
int    myMax(int a, int b)       { return a > b ? a : b; }
double myMax(double a, double b) { return a > b ? a : b; }
char   myMax(char a, char b)     { return a > b ? a : b; }
```

**逻辑完全一样，只是类型不同。**

::: exam 模板把"类型"变成了参数
```cpp
template <typename T>
T myMax(T a, T b) { return a > b ? a : b; }
```

**`T` 是一个"类型的占位符"**——用的时候编译器自动把 `T` 换成实际类型。

**一行代码，适应所有支持 `>` 的类型。**
:::

## 最小可运行示例

<!-- expect

---
5
2.5
z
-->
```cpp
#include <cstdio>

// 函数模板：T 是类型参数
template <typename T>
T myMax(T a, T b) {
    return a > b ? a : b;
}

int main() {
    printf("%d\n",   myMax(3, 5));        // T 推导为 int
    printf("%.1f\n", myMax(2.5, 1.5));    // T 推导为 double
    printf("%c\n",   myMax('a', 'z'));    // T 推导为 char

    return 0;
}
```

输出：

```text
5
2.5
z
```

::: range 三处语法点
| 写法 | 含义 |
| --- | --- |
| `template <typename T>` | 声明一个类型参数 `T` |
| `T myMax(T a, T b)` | 返回值、参数都用 `T` |
| `myMax(3, 5)` | **编译器自动推导** `T = int` |

**`typename` 也可以写成 `class`**（这里两者完全等价，和"类"没关系）：

```cpp
template <class T>        // 和 template <typename T> 一样
```

**现代写法推荐 `typename`**（`class` 容易让人误以为只能传类类型）。
:::

## 关键过程与易错点

### 一、你一直在用模板

| 你写过 | 它其实是 |
| --- | --- |
| `vector<int>` | 类模板，`T = int` |
| `vector<string>` | 类模板，`T = string` |
| `pair<int, int>` | 类模板，两个类型参数 |
| `sort(a, a + n)` | 函数模板，`T` 是元素类型 |
| `max(a, b)` | 函数模板 |
| `set<int, greater<int>>` | 类模板，两个参数（元素类型 + 比较类型） |

::: exam 看懂 `vector<int>` 的完整含义
```cpp
vector<int> v;
//     ↑   ↑
//  模板名  类型参数
```

**`vector` 本身不是一个类型，`vector<int>` 才是。**

**这就解释了为什么不能写 `vector v;`**——编译器不知道 `T` 是什么。

**也解释了为什么 `vector<vector<int>>` 要写两层尖括号**：
外层 `vector` 的元素类型是内层 `vector<int>`。
:::

### 二、类模板

```cpp
template <typename T>
struct MyArray {
    T a[1005];
    int n = 0;

    void push(T x) { a[n++] = x; }

    T getMax() {
        T mx = a[0];
        for (int i = 1; i < n; i++) if (a[i] > mx) mx = a[i];
        return mx;
    }
};

MyArray<int> ai;              // T = int
MyArray<double> ad;           // T = double
```

**和函数模板一样，用的时候要显式写类型参数**（类模板不能自动推导 `T`）。

::: pitfall 类模板的类型参数必须显式写
```cpp
MyArray a;                    // ✗ 编译错误：不知道 T 是什么
MyArray<int> a;               // ✓
```

**C++17 起有个例外**（CTAD，类模板参数推导）：

```cpp
pair p(1, 2);                 // C++17 能推导出 pair<int,int>
vector v = {1, 2, 3};         // C++17 能推导出 vector<int>
```

**但竞赛里建议还是显式写清楚**——可读性更好，也不依赖具体标准。
:::

### 三、多个类型参数

```cpp
template <typename K, typename V>
struct MyPair {
    K first;
    V second;
};

MyPair<int, string> p;
```

**`map<K, V>` 就是这样的双参数模板**（实际上还有第三个比较参数）。

### 四、模板的编译错误很长，怎么读

::: pitfall 模板报错动辄几十行
```cpp
template <typename T>
T myMax(T a, T b) { return a > b ? a : b; }

struct Node { int x; };            // 没有定义 >
myMax(Node{1}, Node{2});           // ✗ 报错会很长
```

**读法**：

```text
① 找 "error:" 那一行（不是 "note:" 或 "required from"）
② 看它提到的【操作】是什么（这里是 operator>）
③ 回到你自己的代码，看那个类型有没有这个操作
```

**关键：不要被几十行吓到，只找第一条 `error:` 和它提到的操作/类型。**
:::

### 五、竞赛里什么时候值得写模板

::: exam 说实话：很少
| 场景 | 值得写模板吗 |
| --- | --- |
| 一道题里对 `int` 和 `long long` 各写一遍同样的逻辑 | ✅ 可以 |
| 写一个通用的线段树 / 平衡树（考试用） | ✅ 值得 |
| 只是"少写几行" | ❌ 不值得（可读性变差） |
| 想让代码"看起来高级" | ❌ **绝对不要** |

**模板的代价**：

- 编译错误信息变得很长
- 调试时类型不直观
- 读代码的人要多想一层

**竞赛里的判断标准**：**这个逻辑真的要对多种类型用吗？**

- 是，而且逻辑不短 → 模板
- 不是，或者只有一种类型 → **老老实实写具体类型**
:::

### 六、一个实用的例子：泛型取最值

```cpp
template <typename T>
T arrayMax(T a[], int n) {
    T mx = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > mx) mx = a[i];
    }
    return mx;
}

int ai[5] = {3, 1, 4, 1, 5};
double ad[3] = {2.5, 1.5, 3.5};

cout << arrayMax(ai, 5);      // 5
cout << arrayMax(ad, 3);      // 3.5
```

**这是模板最典型的用途**：一个不涉及具体类型的通用操作。

## 动手检查

1. 写一个 `template <typename T> void swap2(T &a, T &b)`，分别用于 `int` 和 `string`。
2. 写一个 `template <typename T> T arrayMin(T a[], int n)`。
3. 故意用一个没有定义 `>` 的结构体调用 `myMax`，把报错读一遍（**只找第一条 `error:`**）。
4. 用 `MyArray<int>` 和 `MyArray<string>` 各创建一个实例，验证它们互不影响。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 写一个泛型的 `myMin` / `myMax` | 函数模板 |
| 基础 | 写一个泛型的数组求和函数 | 函数模板 + 数组 |
| 巩固 | 写一个泛型的 `MyVector`（支持 `push_back`、`size`、`[]`） | 类模板 |
| 巩固 | 写一个泛型的冒泡排序 | 模板 + 算法 |
| 挑战 | 写一个泛型的"快速幂" | 模板的实际用途 |

::: pitfall 一个提醒：模板不是"必须学的进阶内容"
**这本书前面 27 节里，你几乎没写过自己的模板**——因为不需要。

**你需要的模板能力其实只有两件事**：

1. **看得懂** `vector<int>`、`map<string, int>` 是什么意思
2. **看得懂**模板的报错信息（找第一条 `error:`）

**"会写模板"是加分项，不是必需品。**
别为了学模板而学模板——先把算法练好。
:::

## 下一节

模板是 C++ 的"泛型"能力。最后一节看几个**日常最实用的现代 C++ 特性**：

[现代 C++ 实用特性](/advanced/modern-cpp)。
