# 函数入门

代码一长，就会出现**同一段逻辑抄好几遍**的情况。函数就是把这些重复的东西**收起来、起个名字**。

## 本节学会什么

- 自己定义函数：返回类型、函数名、参数、函数体
- 分清"值传递"和"引用传递"，知道为什么交换两个数会失败
- 会用 `return`，包括提前返回
- 避免函数名和标准库重名
- 学会把重复的逻辑抽成函数

## 为什么需要它

看一段"判断质数"的代码，如果不用函数，会变成这样：

```cpp
// 判断 a 是不是质数
bool aIsPrime = true;
for (int i = 2; i * i <= a; i++) if (a % i == 0) { aIsPrime = false; break; }

// 判断 b 是不是质数
bool bIsPrime = true;
for (int i = 2; i * i <= b; i++) if (b % i == 0) { bIsPrime = false; break; }

// 判断 c 是不是质数
bool cIsPrime = true;
for (int i = 2; i * i <= c; i++) if (c % i == 0) { cIsPrime = false; break; }
```

**同一段逻辑抄了三遍。** 三个问题：

1. **写起来累**：抄三遍就要改三遍变量名，很容易漏一个
2. **改起来险**：逻辑要改（比如加上 `n < 2` 的判断），得改三处，漏一处就出错
3. **读起来乱**：看代码的人得自己认出来"这三段是一回事"

::: exam 函数解决的正是这三件事
| 问题 | 函数怎么解决 |
| --- | --- |
| 写起来累 | 写一次，用很多次 |
| 改起来险 | 只改函数体一处 |
| 读起来乱 | 名字就是注释：`isPrime(x)` 一眼看懂 |

**判断标准：同一段逻辑出现第二次，就该抽成函数。**
:::

## 最小可运行示例

<!-- expect
100
---
25
-->
```cpp
#include <cstdio>

// 判断 n 是不是质数
bool isPrime(int n) {
    if (n < 2) return false;              // 0 和 1 不是质数
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;      // 找到一个因子，不是质数
    }
    return true;                           // 一个因子都没有，是质数
}

int main() {
    int n;
    scanf("%d", &n);

    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (isPrime(i)) cnt++;             // 用的时候就像用一个现成的工具
    }
    printf("%d\n", cnt);
    return 0;
}
```

输入 `100`，输出 `25`（100 以内有 25 个质数）。

### 函数的四个部分

```cpp
bool isPrime(int n) { ... }
// ↑     ↑      ↑
// ①     ②      ③
//                ④ 函数体
```

| 部分 | 含义 | 这里是什么 |
| --- | --- | --- |
| ① 返回类型 | 函数"算出来"的是什么类型 | `bool`（是/否） |
| ② 函数名 | 怎么称呼它 | `isPrime` |
| ③ 参数列表 | 需要给它什么 | 一个 `int`，名字叫 `n` |
| ④ 函数体 | 具体怎么做 | 试除 |

**调用时**：`isPrime(i)` 把 `i` 传给 `n`，函数算出结果，把 `bool` 交回来。

::: pitfall 函数名不能和标准库重名
```cpp
int max(int a, int b) { }      // ✗ max 是标准库的
int sort(int x) { }            // ✗ sort 也是
int time(int x) { }            // ✗ time 也是
```

这和[编译关](/practice/five-gates/compile)里那份黑名单是同一个问题——
**函数名也一样会撞车**。

安全做法：换个名字或加前缀。

```cpp
int myMax(int a, int b) { }    // ✓
int getMax(int a, int b) { }   // ✓
```
:::

## 关键过程与易错点

### 一、值传递：函数拿到的是**副本**

这是初学者最容易困惑的一点。

<!-- expect
x = 1, y = 2
-->
```cpp
#include <cstdio>

void swapWrong(int a, int b) {     // 参数是副本
    int t = a;
    a = b;
    b = t;                          // 改的只是副本，外面的 x、y 不受影响
}

int main() {
    int x = 1, y = 2;
    swapWrong(x, y);
    printf("x = %d, y = %d\n", x, y);   // 没有交换成功
    return 0;
}
```

输出 `x = 1, y = 2`——**交换失败了**。

::: range 为什么？画个图就懂了
```text
调用 swapWrong(x, y) 时：

   main 里              swapWrong 里
   x = 1  ──复制──→     a = 1
   y = 2  ──复制──→     b = 2

   函数里把 a、b 换了个位置：

   x = 1               a = 2
   y = 2               b = 1

   函数结束，a、b 被销毁 → x、y 从来没变过
```

**值传递 = 复印一份给对方改，原件不变。**
:::

那怎么才能真的交换？用**引用**：

```cpp
void swapRight(int &a, int &b) {   // 加 & 表示"引用"，不是副本
    int t = a; a = b; b = t;
}
```

`&` 的意思是"直接操作原来那个变量"。**详见 [函数参数与引用](/guide/function-parameters)。**

### 二、`return`：交回结果，并立刻结束函数

`return` 有两个作用：

1. **把值交回去**
2. **立刻结束整个函数**（后面的代码不执行）

这个"立刻结束"很有用——可以省掉一堆 `else`：

```cpp
bool isPrime(int n) {
    if (n < 2) return false;          // 直接返回，不用写 else
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;  // 提前返回
    }
    return true;
}
```

::: pitfall 有返回值的函数，每条路径都要 `return`
```cpp
int f(int x) {
    if (x > 0) return 1;
    // ✗ x <= 0 时没有返回值
}
```

这样写编译器会警告（`-Wall` 会提示 `control reaches end of non-void function`），
运行时返回的是一个**垃圾值**。

**if 的每个分支、加上最后，都要能 return。**
:::

### 三、`void`：不返回东西的函数

只做事、不算值的函数，返回类型写 `void`：

```cpp
void printLine(int n) {
    for (int i = 0; i < n; i++) printf("-");
    printf("\n");
}
```

`void` 函数里可以写 `return;`（用来提前结束），但**不能写 `return 值;`**。

### 四、定义要在使用之前

<!-- no-compile -->
```cpp
int main() {
    f();            // ✗ 编译器还不知道 f 是什么
}

int f() { }         // 定义在下面
```

两种解决办法：

| 办法 | 做法 |
| --- | --- |
| **把函数写在 `main` 前面** | ✅ 最常用，简单 |
| 前向声明 | 在 `main` 前写一行 `int f();`，定义放后面 |

**竞赛代码里一律把函数写在 `main` 上面。**

### 五、数组作为参数：传的是"首地址"

```cpp
void fill(int a[], int n) {        // a[] 不写长度
    for (int i = 0; i < n; i++) a[i] = i;
}
```

注意：**数组作为参数时，"副本"的说法不成立**——函数里改 `a[i]` 会影响到外面。

原因是数组传参会退化成指针（传的是首元素的地址）。

| 传的东西 | 函数里的修改会不会影响外面 |
| --- | --- |
| 普通变量（`int`、`double`） | **不会**（值传递） |
| 数组 | **会** |
| 结构体 | **不会**（除非用引用） |

::: pitfall 数组参数一定要另外传长度
```cpp
void fill(int a[]) { }        // ✗ 函数里不知道 a 有多长
void fill(int a[], int n) { } // ✓ 把长度一起传进去
```

C++ 里数组传参**会丢掉长度信息**，所以必须额外传一个 `n`。

**第 0 节的 `MAXN` 常量在这里帮不上忙**——它只是容量上限，不是实际长度。
:::

## 动手检查

1. 把 `swapWrong` 改成用引用 `int &a, int &b`，重新运行，确认交换成功。
2. 写一个 `int max3(int a, int b, int c)` 函数，返回三个数的最大值，然后手动测 8 种大小关系。
3. 故意写一个有返回值的函数，让某条分支没有 `return`，编译时看警告，运行时看结果。
4. 把你在[循环结构](/guide/loops)里写过的某道题的重复逻辑，抽成一个函数。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 写 `bool isEven(int n)`，判断偶数 | 最简单的函数 |
| 基础 | 写 `int gcd(int a, int b)`（辗转相除），求两个数的最大公约数 | 带循环的函数 |
| 基础 | 写 `void printStars(int n)`，输出 n 个 `*` | `void` 函数 |
| 巩固 | [洛谷 P5736 质数筛](https://www.luogu.com.cn/problem/P5736) | 把 `isPrime` 用起来 |
| 巩固 | [洛谷 P1075 质因数分解](https://www.luogu.com.cn/problem/P1075) | 函数 + 循环配合 |
| 挑战 | 写 `bool isPerfect(int n)`（完全数判断），输出 1～10000 里所有完全数 | 函数 + 嵌套循环 + 复杂度 |

::: pitfall 题目里凡是要"判断"的，几乎都能写成 `bool` 函数
`isPrime`、`isEven`、`isLeap`（闰年）、`isPalindrome`（回文）……

**把判断逻辑写成 `bool` 函数，主程序会变得非常干净：**

```cpp
for (int i = 1; i <= n; i++)
    if (isPrime(i)) printf("%d ", i);
```

一眼就能看出在干什么。**这是从"能写出来"到"写得清楚"的第一步。**
:::

## 下一节

`swapWrong` 为什么失败、引用为什么能成功——这里还有一块要讲清楚：

[函数参数与引用](/guide/function-parameters)。
