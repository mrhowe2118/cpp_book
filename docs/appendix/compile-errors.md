# 常见编译错误速查

**这一节是"字典"，不是"课文"。** 编译报错时翻到这里查。

## 本节学会什么

- 学会**读报错的顺序**（这一条比记住所有错误都重要）
- 拿到一张"报错信息 → 原因 → 改法"的对照表
- 知道五个最高频的编译错误
- 知道怎么用编译器把问题逼出来

## 为什么需要它

初学阶段，**"编译错误"是最大的时间黑洞**：

```text
改了 5 分钟，报错 20 行，看不出哪一条才是真的。
```

::: exam 读报错的三个动作
```text
① 只看【最前面一条】错误（后面的往往是连锁反应）
② 看【行号】，但往【上一行】也看一眼（少分号常报在下一行）
③ 把报错里的【标识符名】和你的代码对照（那是关键线索）
```

**做到这三条，80% 的编译错误能自己解决。**
:::

## 五个最高频的错误

::: range 先看这五个，它们占绝大多数
| 报错关键词 | 真正的原因 | 改法 |
| --- | --- | --- |
| `expected ';' before ...` | **上一行**少了分号 | 往上看一行 |
| `'xxx' was not declared in this scope` | 变量没定义 / 拼错 / **缺 `#include`** | 检查拼写和头文件 |
| `expected unqualified-id before ...` | **全角标点**、或括号不配对 | 删掉重打这一行 |
| `'xxx' redeclared as different kind of symbol` | **变量名和标准库重名** | 换名字（见[编译关](/practice/five-gates/compile)） |
| `undefined reference to 'main'` | `main` 拼错（`mian`/`Main`） | 检查拼写 |
:::

## 按类别速查

### 一、语法类

| 报错信息 | 原因 | 改法 |
| --- | --- | --- |
| `expected ';' before '}' token` | 少分号 | 看报错行的**上一行**末尾 |
| `expected ')' before ...` | 括号不配对 | 数一遍 `(` 和 `)` |
| `expected '}' at end of input` | 少一个大括号 | 数一遍 `{` 和 `}` |
| `expected unqualified-id before ...` | **全角标点** | 删掉重打（切英文输入法） |
| `stray '\357' in program` | 源文件里有中文/全角字符 | 检查标点、注释 |
| `expected primary-expression before ';' token` | 表达式写漏了（比如 `a + ;`） | 检查这一行 |

::: pitfall 全角标点是最"看不见"的错
中文输入法下的 `；` `，` `（` `）` `“` `”` 和英文的**在屏幕上几乎一样**。

**判断方法**：把那一行删掉，切到英文输入法重打一遍。
或者注意光标宽度——全角标点占两个字符宽。
:::

### 二、符号类

| 报错信息 | 原因 | 改法 |
| --- | --- | --- |
| `'x' was not declared in this scope` | 变量没定义 / 拼错 / 作用域不对 | 检查定义位置和拼写 |
| `'sort' was not declared` | **缺头文件** | 加 `#include <algorithm>` |
| `'cout' was not declared` | 缺 `<iostream>` 或 `std::` | 加 `#include <iostream>` |
| `'y1' cannot be used as a function` | **变量名撞标准库** | 换名字 |
| `redefinition of 'int x'` | 同一个作用域里定义了两次 | 删掉多余的定义 |
| `'x' redeclared as different kind of symbol` | 同名但类型不同 | 换名字 |

::: range 常用的"用了什么就要 include 什么"
| 用了 | 要加 |
| --- | --- |
| `cout` `cin` | `#include <iostream>` |
| `printf` `scanf` | `#include <cstdio>` |
| `sort` `max` `min` `find` `lower_bound` | `#include <algorithm>` |
| `sqrt` `abs` | `#include <cmath>` |
| `strlen` `strcmp` `memset` | `#include <cstring>` |
| `string` | `#include <string>` |
| `vector` `set` `map` `queue` `stack` | 各自的头文件 |
| `greater<int>()` | `#include <functional>` |
| `to_string` `stoi` | `#include <string>` |
:::

### 三、类型类

| 报错信息 | 原因 | 改法 |
| --- | --- | --- |
| `invalid conversion from 'const char*' to 'int'` | 类型对不上 | 检查赋的值 |
| `cannot convert 'std::string' to 'const char*'` | `printf` 不能直接打 `string` | 用 `s.c_str()` |
| `invalid operands to binary +` | 两种不能相加的类型 | 检查两边类型 |
| `no matching function for call to 'f(...)'` | 参数类型/个数不对 | 对照函数定义 |
| `assignment to expression with array type` | 想给数组整体赋值 | 用循环或 `memcpy` |

::: pitfall `printf` 的格式符写错**不会报错**
```cpp
long long x = 10000000000LL;
printf("%d\n", x);        // ✗ 编译能过，输出垃圾值
printf("%lld\n", x);      // ✓
```

**这是"能编译但结果错"的典型**——编译器只给警告（`-Wall` 会提示）。

**所以一定要开 `-Wall`**，并且**注意看警告**。
:::

### 四、链接类

| 报错信息 | 原因 | 改法 |
| --- | --- | --- |
| `undefined reference to 'main'` | `main` 拼错、或压根没写 | 检查拼写 |
| `undefined reference to 'f()'` | 函数声明了但没实现 | 补上函数体 |
| `multiple definition of 'x'` | 全局变量定义了两次 | 检查是不是在头文件里定义了变量 |

::: range 「编译错误」和「链接错误」的区别
| | 发生时机 | 典型信息 |
| --- | --- | --- |
| **编译错误** | 翻译源代码时 | `expected`、`was not declared` |
| **链接错误** | 把所有部分拼起来时 | `undefined reference` |

**看到 `undefined reference` 就知道：语法没问题，是"少了个东西"。**

（想了解编译到底分几步，看[计算机原理](/advanced/computer-fundamentals)。）
:::

### 五、其他

| 现象 | 原因 | 改法 |
| --- | --- | --- |
| 提示找不到源文件 | 文件名写错 / **扩展名被隐藏** | 打开"显示文件扩展名" |
| 编译了一个空文件 | 实际是 `main.cpp.txt` | 同上 |
| 报错指向标准库内部 | 通常是**你的名字撞了标准库** | 见[变量名黑名单](/practice/five-gates/compile) |
| `warning: unused variable` | 变量定义了没用 | 删掉或使用它 |
| `warning: control reaches end of non-void function` | 有返回值的函数漏了 `return` | 补上 |
| 提示源文件过大 | 超过大小限制 | 检查是不是把测试数据贴进去了 |

## 关键过程与易错点

### 一、用编译器"把问题逼出来"

::: exam 两个有用的编译选项
```bash
g++ -std=c++17 -Wall -Wextra main.cpp -o main
```

| 选项 | 作用 |
| --- | --- |
| `-Wall` | 打开**大部分警告**（未初始化、格式符错、赋值当条件…） |
| `-Wextra` | 再打开**一些额外的警告** |

**把警告当错误看。** 编译器警告的地方，往往就是 bug 所在。
:::

### 二、故意制造错误（最快的学法）

**这一节最好的使用方式**：亲手把每种错误造一次，读一遍报错。

| 想造什么错 | 怎么做 |
| --- | --- |
| 少分号 | 删掉某行末尾的 `;` |
| 括号不配对 | 删掉一个 `)` |
| 全角标点 | 把 `;` 换成中文 `；` |
| 缺头文件 | 删掉 `#include <algorithm>` 但保留 `sort` |
| 变量名撞库 | 定义 `int time = 1;` |
| main 拼错 | 写成 `int mian()` |
| 类型不匹配 | 把 `string` 传给 `printf("%s", ...)` |

**每个花 1 分钟，一共 7 分钟。**
**这 7 分钟能省掉你以后几十次的"看不懂报错"。**
:::

### 三、看不懂报错时的求助顺序

```text
① 只看第一条错误
② 看行号，并且往上看一行
③ 对照本页的速查表
④ 检查这一行的标点是全角还是半角
⑤ 把报错信息复制出去搜索（去掉自己的文件名和路径）
⑥ 还是不行 → 把代码缩到最小，看哪一行开始出错
```

::: pitfall 第 ⑥ 步：最小化复现
**方法**：把代码一段段注释掉（或用 `#if 0`），直到能编译；
再一段段加回来，找到出错的那一段。

**这是"二分定位"的思路**（见[测试与调试](/guide/testing-and-debugging)），
对运行时的 bug 也管用。
:::

## 动手检查

1. 从"五个最高频的错误"里挑三个，**亲手制造并读一遍报错**。
2. 把报错信息里的行号和实际出错行对照，验证"少分号报在下一行"。
3. 故意写全角 `；`，看报错信息长什么样（记住这个关键词）。
4. 删掉 `#include <algorithm>` 但用 `sort`，读报错。
5. 写 `int mian()`，看链接错误长什么样。

## 立即练习

::: exam 建立你自己的报错本
拿一张纸（或一个文件），分两列：

```text
| 报错信息（截取关键词） | 真正的原因 |
|------------------------|-----------|
| expected ';' before     | 上一行少分号 |
| was not declared        | 缺 include 或拼错 |
| （你自己遇到的）          | （你自己总结的） |
```

**每次解决一个编译错误，就往里加一行。**

**考前翻一遍这个本子，比刷十道题有用。**
:::

::: range 一个习惯：编译前先扫一眼
```text
□ 每一行末尾有分号吗？
□ 括号配对了吗？
□ 标点是半角吗？
□ 用到的函数都 include 了吗？
□ 变量名有没有撞标准库？
```

**30 秒的检查，能省掉大部分编译错误。**
:::

## 相关章节

- 更深入的编译关（评测机上的编译问题）→ [编译关](/practice/five-gates/compile)
- 编译器警告怎么用 → [编译关](/practice/five-gates/compile)
- 环境还没装好 → [Windows 环境搭建](/appendix/windows-setup)
