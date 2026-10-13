# 结构体

当你要处理"**每个学生有姓名、语文、数学、英语三个成绩**"这类数据时，
用几个平行数组会越来越乱。**结构体把一组相关的数据打包成一个整体。**

## 本节学会什么

- 会定义 `struct`，会用 `.` 访问成员
- 会声明**结构体数组**，处理"一批对象"
- 会用 `sort` + 自定义比较函数给结构体排序（**含并列时的处理**）
- 知道结构体作为参数时是值传递，大结构体要用引用

## 为什么需要它

看一个真实需求：**给 n 个学生按总分排序**。

不用结构体，你得开三个平行数组：

```cpp
int chinese[1005], math[1005], english[1005];

// 排序时三个数组必须"一起动"
// 交换 chinese[i] 和 chinese[j] 时，
// math[i]、english[i] 也得跟着交换
// —— 手写排序的话，每个数组都要记得换
```

**问题很明显**：

| 问题 | 后果 |
| --- | --- |
| 数据分散在多个数组 | 排序、交换时**必须同步操作所有数组** |
| 漏换一个 | 数据错位，答案全乱 |
| 用 `sort` 更麻烦 | 没法直接交换"一组"数据 |

::: exam 结构体解决的正是"绑定"
把"本来就应该在一起"的数据放在一起：

```cpp
struct Student {
    int chinese, math, english;
    int total;              // 总分
};
```

这样 `st[i]` 就是**一个完整的学生的所有信息**。
排序时交换一个 `st[i]`，它的所有字段自动跟着走——**不会漏、不会错位**。

**判断标准：当"这几个变量总是一起出现、一起移动"时，就该用结构体。**
:::

## 最小可运行示例

给 n 个学生按总分从高到低排序，同分按编号小的在前。

<!-- expect
3
90 80 70
100 100 100
80 90 95
---
2 300
3 265
1 240
-->
```cpp
#include <cstdio>
#include <algorithm>
using namespace std;

const int MAXN = 1005;

struct Student {
    int id;                          // 编号
    int chinese, math, english;      // 三科成绩
    int total;                       // 总分
};

Student st[MAXN];                    // 结构体数组

// 比较函数：返回 true 表示 a 应该排在 b 前面
bool cmp(const Student &a, const Student &b) {
    if (a.total != b.total) return a.total > b.total;   // 总分高的在前
    return a.id < b.id;                                  // 同分：编号小的在前
}

int main() {
    int n;
    scanf("%d", &n);

    for (int i = 0; i < n; i++) {
        st[i].id = i + 1;
        scanf("%d %d %d", &st[i].chinese, &st[i].math, &st[i].english);
        st[i].total = st[i].chinese + st[i].math + st[i].english;
    }

    sort(st, st + n, cmp);               // 按自定义规则排序

    for (int i = 0; i < n; i++) {
        printf("%d %d\n", st[i].id, st[i].total);
    }
    return 0;
}
```

输入：

```text
3
90 80 70      → 总分 240
100 100 100   → 总分 300
80 90 95      → 总分 265
```

输出：

```text
2 300
3 265
1 240
```

## 关键过程与易错点

### 一、定义与使用

```cpp
struct Student {          // ① 用 struct 定义一个新类型
    int id;
    int total;
};                        // ② ← 这个分号不能少！

Student a;                // ③ 像用 int 一样用它
a.id = 1;                 // ④ 用 . 访问成员
a.total = 250;
```

::: pitfall 定义末尾的分号最容易漏
<!-- no-compile -->
```cpp
struct Student {
    int id;
}                         // ✗ 少了分号
int main() { }
```

**这个错误很讨厌**：因为 `struct` 定义后面少分号时，
编译器往往在**定义之后的第一个函数**那里报错，报错位置和错误位置对不上。

**看到"莫名其妙的报错"，检查一下最近的 `struct` / `class` 定义末尾有没有分号。**
:::

### 二、结构体数组：处理一批对象

```cpp
const int MAXN = 1005;
Student st[MAXN];          // 1005 个学生

st[i].id                   // 第 i 个学生的编号
st[i].chinese              // 第 i 个学生的语文
```

**读入时要注意 `&` 写在最外层**：

```cpp
scanf("%d %d %d", &st[i].chinese, &st[i].math, &st[i].english);
//                 ↑ 注意这里
```

### 三、用 `sort` + `cmp` 排序（本节最重要的技能）

```cpp
bool cmp(const Student &a, const Student &b) {
    return a.total > b.total;      // 返回 true = a 排在 b 前面
}
sort(st, st + n, cmp);
```

::: range `cmp` 的写法只需要记住一句话
**`cmp(a, b)` 返回 `true`，表示"a 应该排在 b 前面"。**

| 想要的顺序 | 写什么 |
| --- | --- |
| 按总分**从大到小** | `return a.total > b.total;` |
| 按总分**从小到大** | `return a.total < b.total;` |
| 总分相同时按编号**从小到大** | 见下面 |

**多级排序（先总分降序，同分按编号升序）：**

```cpp
bool cmp(const Student &a, const Student &b) {
    if (a.total != b.total) return a.total > b.total;   // 第一优先级
    return a.id < b.id;                                  // 第二优先级
}
```

**写法规律**：一个个比下去，前一个不相等就直接返回结果，最后返回最后一级的比较。
:::

::: pitfall `cmp` 必须满足"严格弱序"
**最常见的错误**：写成 `>=` 或 `<=`。

```cpp
bool cmp(const Student &a, const Student &b) {
    return a.total >= b.total;     // ✗ 有重复总分时段错误 / 结果错乱
}
```

原因：`cmp(a, a)` 应该返回 `false`（自己不该排在自己前面），
而 `>=` 会返回 `true`，破坏了排序算法要求的"严格弱序"。

**纪律：`cmp` 里一律用 `<` 或 `>`，不用 `<=` `>=`。**
:::

### 四、结构体作为函数参数：值传递

```cpp
void print(Student s) {        // 传的是副本
    printf("%d\n", s.total);
}
```

和普通变量一样，**结构体也是值传递**——函数里的修改不影响外面。

::: pitfall 大结构体传参要加 `&`
```cpp
void work(Student s) { }          // ✗ 每次调用都复制一整个结构体
void work(const Student &s) { }   // ✓ 传引用，不复制，加 const 防止误改
```

结构体一大（比如里面有数组），复制就很慢。
**竞赛代码里结构体参数一律写 `const 类型名 &`。**

**注意**：这属于引用（下一节的[函数参数与引用](/guide/function-parameters)）。
你现在只需要记住这个写法就行。
:::

### 五、结构体里的数组

结构体可以包含数组，用来处理"每个对象有大小的数据"：

```cpp
struct Node {
    int id;
    int a[105];            // 每个对象自己有一个数组
    int cnt;
};
```

::: pitfall 结构体数组的大小要算清楚
```cpp
struct Node {
    int a[105];            // 每个对象约 420 字节
};
Node nodes[100005];        // 100005 × 420 ≈ 42 MB
```

**结构体里含数组时，整个结构体数组会膨胀得很快。**
声明前算一算：`sizeof(Node) × 元素个数`。

（可以用 `printf("%d\n", (int)sizeof(Node));` 实际看一眼。）
:::

### 六、结构体还能干什么

| 用途 | 例子 |
| --- | --- |
| 打包相关数据 | 学生、坐标点、边（图论） |
| 让代码更清楚 | `p.x, p.y` 比 `x[i], y[i]` 好读 |
| 配合排序 | 见上 |
| 配合 STL | `vector<Node>`、`queue<Node>`（后面学） |
| 作为图论的边 | `struct Edge { int to, w; };` |

**结构体是"从写脚本到写程序"的分界线**——你开始给自己的数据发明类型了。

## 动手检查

1. 把 `cmp` 里的 `a.total > b.total` 改成 `>=`，用有**同分**的数据测，观察结果。
   （这是亲手验证"严格弱序"的必要性。）
2. 用 `sizeof(Student)` 打印出这个结构体占多少字节，再算 `Student st[1005]` 占多少 MB。
3. 给 `Student` 加一个 `char name[25]`，改成按姓名排序（提示：`strcmp`）。
4. 把 `cmp` 的参数从 `const Student &` 改成 `Student`，编译运行，确认结果不变
   （只是慢了）。想想数据量大时会发生什么。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 定义一个 `Point { int x, y; }`，读入 n 个点，按 x 从小到大输出 | 结构体基础 + 排序 |
| 基础 | [洛谷 P5728 旗鼓相当的对手](https://www.luogu.com.cn/problem/P5728) | 结构体数组 + 多重比较 |
| 巩固 | [洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093) | **多级排序**（总分 → 语文 → 编号）的经典题 |
| 巩固 | [洛谷 P1104 生日](https://www.luogu.com.cn/problem/P1104) | 结构体 + 多关键字排序 |
| 挑战 | 定义一个点结构体，读入 n 个点，输出距离最近的两个点的距离 | 结构体 + 双重枚举 + 平方比较避免浮点 |

::: pitfall P1093 是本节的落点
它的排序规则有三层：**总分降序 → 语文降序 → 编号升序**。

写 `cmp` 的时候，先把三层规则用中文写下来，再逐层翻译成代码：

```cpp
if (a.total != b.total) return a.total > b.total;    // 第一层
if (a.chinese != b.chinese) return a.chinese > b.chinese;  // 第二层
return a.id < b.id;                                   // 第三层
```

**这个"先写中文再翻译"的习惯，能避免 90% 的排序写错。**
:::

## 下一节

结构体能打包数据了。接下来把**完整的数组与控制结构**串一遍：

[控制与数据单元练习](/guide/control-and-data-exercises)——第二阶段的验收。
