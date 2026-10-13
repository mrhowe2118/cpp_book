# C++ string

上一节的 C 风格字符串能干活，但**每一步都要你操心**：算长度、留 `'\0'`、记得用 `strcmp`。

C++ 的 `string` 把这些全接过去了。**能用 `string` 就别手写 `char[]`。**

## 本节学会什么

- 用 `string` 定义、读入、输出字符串
- 掌握拼接、比较、取子串、查找这几个高频操作
- 知道怎么读**含空格的一整行**
- 避开 `size()` 是无符号数带来的那个经典陷阱

## 为什么需要它

把上一节的麻烦和 `string` 的做法并排看：

| 想干什么 | C 风格 | `string` |
| --- | --- | --- |
| 定义 | `char s[1005];` | `string s;` |
| 求长度 | `strlen(s)` | `s.size()` |
| 拼接 | `strcat(a, b);` | `a += b;` 或 `a = a + b` |
| 复制 | `strcpy(a, b);` | `a = b;` |
| 比较相等 | `strcmp(a, b) == 0` | `a == b` |
| 判断大小 | `strcmp(a, b) < 0` | `a < b` |
| 会不会越界 | **会，要自己算** | 自动管理 |

::: exam `string` 的三个"解放"
1. **不用算数组多大**——它会自动增长
2. **不用管 `'\0'`**——内部帮你处理了
3. **比较直接写 `==`**——不用记 `strcmp` 返回 0 表示相等

**代码更短、出错更少。这就是它的全部理由。**
:::

## 最小可运行示例

<!-- expect
abc
---
3
a b c
-->
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;                    // 读入一个单词（遇空白停）

    cout << s.size() << '\n';    // 长度

    // 像数组一样用下标访问
    for (int i = 0; i < (int)s.size(); i++) {
        cout << s[i] << ' ';
    }
    cout << '\n';

    return 0;
}
```

输入 `abc`，输出：

```text
3
a b c
```

::: pitfall 注意那个 `(int)` 强制转换
```cpp
for (int i = 0; i < (int)s.size(); i++)
```

`s.size()` 返回的是**无符号数**。和 `int i` 比较时会有警告，
**更糟的是 `s.size() - 1` 这种写法会出事**（下面专门讲）。

**养成习惯：`s.size()` 参与整数运算时，先转 `(int)`。**
:::

## 关键过程与易错点

### 一、读取：三种方式，别搞混

| 想读什么 | 写法 |
| --- | --- |
| 一个单词（遇到空格/换行就停） | `cin >> s;` |
| **一整行（含空格）** | `getline(cin, s);` |
| 先读数字再读整行 | `cin >> n;` → `cin.ignore();` → `getline(cin, s);` |

::: pitfall 混用 `>>` 和 `getline` 会读到空串
```cpp
int n;
string s;
cin >> n;              // 读完数字，换行符还留在缓冲区
getline(cin, s);       // ✗ 立刻读到那个换行符，s 变成空字符串
```

**修法**：中间吃掉那个换行符。

```cpp
cin >> n;
cin.ignore();          // ✓ 或 cin.ignore(1000, '\n');
getline(cin, s);
```

这和[输入输出](/guide/input-output)里讲的是同一个坑——
**只要 `>>` 和 `getline` 混用，就要想着它。**
:::

### 二、拼接、比较、子串

<!-- expect

---
hello world
a < b
-->
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string a = "hello", b = "world";

    // 拼接：直接用 +
    cout << a + " " + b << '\n';

    // 比较：直接用 == < >，比的是字典序
    cout << (a < b ? "a < b" : "a >= b") << '\n';

    return 0;
}
```

输出：

```text
hello world
a < b
```

**常用操作一览：**

| 操作 | 写法 | 说明 |
| --- | --- | --- |
| 拼接 | `a + b`、`a += b` | `+=` 更省（不用新建对象） |
| 比较 | `a == b`、`a < b` | **字典序**，逐字符比编码 |
| 取子串 | `s.substr(pos, len)` | 从 `pos` 开始取 `len` 个字符 |
| 查找 | `s.find(t)` | 返回下标；**找不到返回 `string::npos`** |
| 插入 | `s.insert(pos, t)` | 在 `pos` 处插入 |
| 删除 | `s.erase(pos, len)` | 从 `pos` 起删 `len` 个 |
| 清空 | `s.clear()` | |
| 判空 | `s.empty()` | 比 `s.size() == 0` 更清楚 |

::: pitfall `find` 找不到时返回的不是 -1
```cpp
if (s.find("abc") != string::npos) { }     // ✓ 正确写法
if (s.find("abc") >= 0) { }                // ✗ 永远成立（无符号数）
```

`string::npos` 是一个**很大的无符号数**（不是 -1）。

**和 `size()` 一样，`find` 的返回值也是无符号的。**
:::

### 三、最大的陷阱：`size()` 是无符号数

<!-- expect

---
以为不会进来，其实进来了
len - 5 <= 0
-->
```cpp
#include <cstdio>
#include <string>
using namespace std;

int main() {
    string s = "abc";            // 长度 3

    // ✗ s.size() 是无符号数：3 - 5 不会变成 -2，而是"回绕"成一个极大的数
    if (s.size() - 5 > 0) printf("以为不会进来，其实进来了\n");
    else printf("不会走到这里\n");

    // ✓ 先转成 int 再算
    int len = (int)s.size();
    if (len - 5 > 0) printf("这次对了\n");
    else printf("len - 5 <= 0\n");

    return 0;
}
```

输出：

```text
以为不会进来，其实进来了
len - 5 <= 0
```

::: exam 这个坑的典型场景
```cpp
// 想判断"字符串长度至少为 5"
if (s.size() - 5 >= 0) { }        // ✗ 永远成立！
if (s.size() >= 5) { }            // ✓ 直接比，不要先减
```

**规则：不要在 `size()` 的结果上做减法。**
要减就先 `(int)` 转换。

**这个 bug 不报错、只是逻辑永远成立**，属于最难查的那类。
:::

### 四、遍历：范围 `for` 更省事

```cpp
string s = "hello";

// 传统写法
for (int i = 0; i < (int)s.size(); i++) cout << s[i];

// 范围 for（C++11）：依次取出每个字符
for (char c : s) cout << c;

// 想修改原字符串，要加 &
for (char &c : s) c = toupper(c);
```

"范围 `for`"也叫**遍历**写法，读起来更清楚。**但要注意加不加 `&` 的区别**：

| 写法 | 效果 |
| --- | --- |
| `for (char c : s)` | `c` 是**副本**，改它不影响 `s` |
| `for (char &c : s)` | `c` 是**引用**，改它会改到 `s` |

（引用的概念见[函数参数与引用](/guide/function-parameters)。）

### 五、和 C 风格互转

```cpp
string s = "hello";

// string → C 风格
const char *p = s.c_str();          // 用于需要 char* 的场合（如 printf）
printf("%s\n", s.c_str());

// C 风格 → string
char buf[100] = "world";
string t = buf;                      // 直接赋值
string u(buf);                       // 或这样构造
```

::: pitfall `printf` 不能直接打印 `string`
```cpp
string s = "hello";
printf("%s\n", s);              // ✗ 输出乱码或崩溃
printf("%s\n", s.c_str());      // ✓
```

`printf` 认的是 C 风格的 `char*`。用 `cout` 就没这个限制：

```cpp
cout << s << '\n';              // ✓ 可以直接输出
```
:::

### 六、性能小提示

| 做法 | 说明 |
| --- | --- |
| `s += t` | 比 `s = s + t` 好（不用新建临时对象） |
| 拼接大量字符串前 `s.reserve(n)` | 预留空间，减少反复扩容 |
| 循环里反复调用 `s.size()` | 影响很小，但可以用 `int len = s.size();` 存起来 |

**竞赛里通常不用操心这些。** 只要记住 `+=` 比 `+` 略好就够了。

## 动手检查

1. 把示例里的 `(int)s.size()` 改成 `s.size()`，编译看看有没有警告。
2. 复现"`size() - 5 > 0` 永远成立"，然后用两种方式修好：
   先 `(int)` 转换，或改成 `s.size() >= 5`。
3. 用 `getline` 读入一整行含空格的句子，输出它的长度。
4. 复现"`cin >> n` 后 `getline` 读到空串"，再用 `cin.ignore()` 修好。
5. 用 `s.find("ab")` 查找，分别测"能找到"和"找不到"两种情况，用 `string::npos` 判断。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入一个单词，倒序输出 | `size()` + 下标 |
| 基础 | 读入一个单词，判断是不是回文 | 首尾比较 |
| 基础 | [洛谷 P1308 统计单词数](https://www.luogu.com.cn/problem/P1308) | `getline` + 大小写 + 查找 |
| 巩固 | 读入两个字符串，输出拼接结果和较长者的长度 | `+` 与 `size()` |
| 巩固 | 读入一个句子，统计单词个数 | 遍历 + 判断空白 |
| 挑战 | 读入一个句子，把每个单词首字母改成大写后输出 | 遍历 + 修改（注意 `&`） |

::: pitfall 用 `string` 重做 P1308，对比一下
这道题在[C 风格字符串](/guide/c-strings)那节也出现过。用 `string` 重写一遍，你会发现：

- 不用算数组多大
- 不用管 `'\0'`
- 比较用 `==`，不用记 `strcmp`

**同一个"懂原理"的人，用 `string` 写的代码更短、更快写完。**
:::

## 下一节

字符串告一段落。下一节是集中训练：[字符串练习](/guide/string-exercises)。

之后回到之前留的悬念——[函数参数与引用](/guide/function-parameters)：
`swapWrong` 为什么交换失败、`&` 到底做了什么。
