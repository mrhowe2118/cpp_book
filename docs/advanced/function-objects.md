# 函数对象与 lambda

::: range 先说明和 STL 那节的关系
[比较规则与函数对象](/stl/function-objects)讲的是**怎么用**（`sort` / `set` / `priority_queue` 怎么传规则）。

**这一节讲"它到底是什么、为什么能这么用"**——理解之后，那些写法就不再是"背下来的语法"。
:::

## 本节学会什么

- 说清什么是"函数对象"（一个能当函数用的对象）
- 理解 **`lambda` 本质上是编译器生成的一个类**
- 会用捕获列表，知道按值和按引用的差别
- 知道 STL 为什么用函数对象而不是普通函数
- 会用 `std::function`

## 为什么需要它

先看一个"普通函数做不到"的需求：**数一数比较了多少次**。

```cpp
bool isEven(int x) { return x % 2 == 0; }
```

这个函数**没有地方存"比较了多少次"**——它只有一个返回值。

::: exam 函数对象能"携带状态"
```cpp
struct Counter {
    int cnt = 0;                          // ← 状态存在对象里

    bool operator()(int x) {
        cnt++;                            // 每次调用都 +1
        return x % 2 == 0;
    }
};
```

**这就是"函数对象"的核心价值：它既是函数，又能保存数据。**

**为什么重要**：因为 STL 的算法（比如 `sort`）会**反复调用**你给的规则，
如果规则能带状态，你就能统计、缓存、或者做更复杂的事。
:::

## 最小可运行示例

<!-- expect

---
偶数个数 = 2
共比较了 5 次
-->
```cpp
#include <cstdio>

// 函数对象：重载了 operator() 的类
struct Counter {
    int cnt = 0;                    // 状态

    bool operator()(int x) {
        cnt++;
        return x % 2 == 0;
    }
};

int main() {
    Counter isEven;                 // 创建一个对象

    int a[5] = {1, 2, 3, 4, 5};
    int evens = 0;

    for (int i = 0; i < 5; i++) {
        if (isEven(a[i])) evens++;  // 像函数一样调用它
    }

    printf("偶数个数 = %d\n", evens);
    printf("共比较了 %d 次\n", isEven.cnt);

    return 0;
}
```

输出：

```text
偶数个数 = 2
共比较了 5 次
```

::: range 关键在 `operator()`
```cpp
bool operator()(int x) { ... }
//   ↑↑↑↑↑↑↑↑↑↑
//   这就是"调用运算符"
```

**重载了它，对象就能用 `对象(参数)` 的形式调用**——和函数一模一样。

**这就解释了 STL 的写法**：

```cpp
struct Cmp {
    bool operator()(int a, int b) const { return a > b; }
};
set<int, Cmp> s;                    // ← 需要的是【类型】，不是函数
```

`set` 的比较规则必须写在**类型**里，所以只能是"有类型的对象"——
**这正是函数对象存在的理由。**
:::

## 关键过程与易错点

### 一、`lambda` 的真面目

```cpp
auto f = [](int x) { return x * 2; };
```

**编译器看到这行，会生成一个类似这样的类：**

```cpp
class __Anonymous {
public:
    int operator()(int x) const { return x * 2; }
};
```

::: exam 所以 lambda 就是"函数对象的语法糖"
| | 函数对象 | `lambda` |
| --- | --- | --- |
| 本质 | 一个重载了 `()` 的类 | **编译器生成的匿名类的对象** |
| 写法 | 要写 `struct` + `operator()` | 一行 |
| 能不能带状态 | 可以（成员变量） | 可以（**捕获列表**） |
| 编译错误信息 | 清楚 | 常常很长（类型名是匿名的） |

**理解这一点，很多困惑就解开了**：

- 为什么 lambda 不能直接用于 `set` 的类型参数？→ 因为它的类型是匿名的
  （要用 `decltype`）
- 为什么 lambda 有"捕获列表"？→ 因为那对应"类的成员变量"
- 为什么 lambda 可以带状态？→ 因为它本来就是个对象
:::

### 二、捕获列表 = 给匿名类加成员变量

<!-- expect

---
大于 10 的有 2 个
总和 = 47
-->
```cpp
#include <cstdio>
#include <algorithm>
#include <vector>
using namespace std;

int main() {
    int threshold = 10;
    vector<int> v = {3, 15, 8, 20, 1};

    // [threshold] 按值捕获：把 threshold 复制一份存进 lambda 对象
    int big = (int)count_if(v.begin(), v.end(),
                            [threshold](int x) { return x > threshold; });
    printf("大于 %d 的有 %d 个\n", threshold, big);

    // [&sum] 按引用捕获：lambda 里改的就是外面的 sum
    int sum = 0;
    for_each(v.begin(), v.end(), [&sum](int x) { sum += x; });
    printf("总和 = %d\n", sum);

    return 0;
}
```

输出：

```text
大于 10 的有 2 个
总和 = 47
```

**捕获列表的写法对照**：

| 写法 | 含义 | 相当于 |
| --- | --- | --- |
| `[]` | 不捕获 | 没有成员变量 |
| `[x]` | **按值**捕获 `x` | 成员 `int x;`（拷贝） |
| `[&x]` | **按引用**捕获 `x` | 成员 `int &x;` |
| `[=]` | 按值捕获**所有用到的** | 多个拷贝成员 |
| `[&]` | 按引用捕获**所有用到的** | 多个引用成员 |

::: pitfall 按值捕获的变量改不了
```cpp
int cnt = 0;
for_each(v.begin(), v.end(), [cnt](int x) { cnt++; });   // ✗ 编译错误
```

**按值捕获时，lambda 里的 `cnt` 是成员变量的副本**——
**默认是 `const` 的，不能改**。

**两种改法**：

```cpp
for_each(v.begin(), v.end(), [&cnt](int x) { cnt++; });       // ✓ 按引用
for_each(v.begin(), v.end(), [cnt](int x) mutable { cnt++; }); // ✓ 加 mutable（改的是副本）
```

**推荐用 `&` 版本**——`mutable` 改的是副本，外面的 `cnt` 不会变，
容易让人误解。
:::

### 三、按引用捕获的陷阱：悬空

::: pitfall lambda 活得比被捕获的变量久 → 悬空引用
```cpp
auto makeAdder() {
    int base = 10;
    return [&base](int x) { return x + base; };    // ✗ base 已经销毁
}
```

**函数返回后 `base` 就没了，但 lambda 里还存着它的引用。**

**调用这个 lambda 是未定义行为**（可能崩溃，也可能读到垃圾值）。

**规则**：如果 lambda 会比被捕获的变量活得更久 → **用按值捕获 `[base]`**。

**竞赛里的实际情况**：lambda 基本都"当场使用"（传给 `sort` 就完事），
**很少遇到这个问题**。但要记住这条规律。
:::

### 四、STL 为什么用函数对象而不是函数指针

| | 普通函数 | 函数对象 / lambda |
| --- | --- | --- |
| 能带状态吗 | ❌ | ✅ |
| 能内联优化吗 | 通常不行（要通过指针调用） | **能**（类型已知，编译器可以直接内联） |
| 能捕获外部变量吗 | ❌ | ✅ |
| 能当类型参数吗 | ❌ | ✅ |

::: exam 最关键的两条
1. **能带状态**（上面演示的 `Counter`）
2. **能内联**——这一点对性能影响很大

```text
函数指针：sort 每次比较都要"通过指针跳过去"，无法内联
函数对象：类型在编译期确定，编译器可以把比较逻辑直接内联进排序循环
```

**所以 STL 的算法一律接受"函数对象"**——既能带状态，又不损失性能。

**这也是为什么 `sort` 配 lambda 通常比配函数指针快。**
:::

### 五、`std::function`：把各种"可调用物"统一存起来

```cpp
#include <functional>

std::function<int(int, int)> f;      // 声明：接受两个 int，返回 int

f = [](int a, int b) { return a + b; };        // 存 lambda
f = [](int a, int b) { return a * b; };        // 换一个

cout << f(3, 5);                                // 15
```

**用途**：需要"把函数当变量保存、之后再用"的时候。

| | `auto` 存 lambda | `std::function` |
| --- | --- | --- |
| 能重新赋值成别的 lambda 吗 | ❌ | ✅ |
| 性能 | 好（能内联） | 差一点（多一层间接） |
| 适合 | 当场使用 | 需要统一存储 / 当参数传递 |

::: pitfall 竞赛里 `std::function` 要慎用
**它比 lambda 满**（多一次函数调用开销）。

**能用 `auto` 或模板的地方，就别用 `std::function`。**

**什么时候真的需要**：写一个"可以接受任意比较规则的排序函数"：

```cpp
void mySort(vector<int> &v, std::function<bool(int,int)> cmp) { ... }
```

**竞赛里这种需求很少**（直接用 `sort` 传 lambda 就行）。
:::

## 动手检查

1. 写一个函数对象，记录它被调用了多少次；用它配合 `count_if` 统计偶数，并输出调用次数。
2. 把示例里的 `[threshold]` 改成 `[&threshold]`，确认结果一样（说明只读时两者都行）。
3. 写一个 lambda 按值捕获一个变量，在里面尝试修改它，把编译错误读一遍。
4. 写一个"返回 lambda"的函数，先用 `[&]`（有 bug），再用 `[=]` 修好。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 写一个函数对象判断"是不是质数"，配合 `count_if` 统计质数个数 | 函数对象 |
| 基础 | 用 lambda 给 `vector` 降序排序 | lambda |
| 巩固 | 写一个能记录"比较次数"的函数对象，配合 `sort` 用它 | 状态 |
| 巩固 | 用 `[&]` 捕获写一个求数组和的 lambda | 捕获 |
| 巩固 | 写一个返回 lambda 的函数，先复现悬空引用的 bug，再用 `[=]` 修好 | 生命周期 |
| 挑战 | 用 `std::function` 写一个"接受任意比较规则"的通用查找函数 | `std::function` |

::: pitfall 一个实用的判断：什么时候该用 lambda，什么时候该写函数
| 情况 | 选择 |
| --- | --- |
| 只在一处用、逻辑短（≤ 3 行） | **lambda** ✅ |
| 逻辑较长（超过 5 行） | 写成独立函数（**可读性更好**） |
| 多处复用 | 独立函数 |
| **需要作为"类型"传给容器** | 函数对象（`struct` + `operator()`） |
| 需要捕获外部变量 | **lambda** ✅ |

**总结：`sort` 的 `cmp` 用 lambda；`set` / `map` 的比较用函数对象；
逻辑复杂了就提成独立函数。**
:::

## 下一节

函数和类都能"泛化"——写一次，适应多种类型。这就是[模板入门](/advanced/templates)。
