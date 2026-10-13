# string 字符串

::: range 先说明和前面那一节的关系
[string 的基础用法](/guide/cpp-string)（定义、读入、`+`、`==`、`size()` 的无符号坑）
在快速入门里已经讲过了。

**这一节讲 STL 视角的 `string`**：
它作为**容器**能配合哪些算法、有哪些高频成员函数、
以及数字和字符串怎么互转。
:::

## 本节学会什么

- 把 `string` 当容器用，配合 `sort` / `reverse` / `find` 等算法
- 掌握 `substr` / `find` / `replace` 这几个高频成员函数
- 会用 `to_string` / `stoi` 在数字和字符串之间转换
- 知道 `+=` 和 `+` 在性能上的差别

## 为什么需要它

`string` 有个特殊地位：**它既是"字符串"，也是一个"字符容器"。**

```text
作为字符串：能拼接、比较、取子串、查找
作为容器：  能用 begin()/end()，能配合 STL 算法
```

::: exam 这个双重身份带来很多便利
```cpp
string s = "banana";

sort(s.begin(), s.end());        // 像排数组一样排字符 → "aaabnn"
reverse(s.begin(), s.end());     // 翻转 → "nnbaaa"
count(s.begin(), s.end(), 'a');  // 数有几个 'a'
```

**很多字符串题可以"当成数组来排序/统计"**，这比手写字符处理简洁得多。
:::

## 最小可运行示例

<!-- expect

---
11
hello
world
6
找不到
-->
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "hello world";

    cout << s.size() << '\n';                          // 长度
    cout << s.substr(0, 5) << '\n';                    // 从 0 开始取 5 个
    cout << s.substr(6) << '\n';                       // 从 6 开始取到末尾
    cout << (int)s.find("world") << '\n';              // 找到的位置

    cout << (s.find("xyz") == string::npos ? "找不到" : "找到了") << '\n';

    return 0;
}
```

输出：

```text
11
hello
world
6
找不到
```

::: range 三个函数的参数规则
| 写法 | 含义 |
| --- | --- |
| `s.substr(pos, len)` | 从 `pos` 开始，取 `len` 个字符 |
| `s.substr(pos)` | 从 `pos` 开始，**一直到末尾** |
| `s.find(t)` | 返回 `t` **第一次**出现的位置 |
| `s.find(t, pos)` | 从 `pos` 开始找 |
| `s.rfind(t)` | 找**最后**一次出现的位置 |

**找不到时返回 `string::npos`**（一个很大的无符号数，**不是 -1**）。
:::

## 关键过程与易错点

### 一、像容器一样用：配合 STL 算法

<!-- expect

---
aaabnn
nnbaaa
3
-->
```cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s = "banana";

    sort(s.begin(), s.end());                    // 字符排序
    cout << s << '\n';

    reverse(s.begin(), s.end());                 // 翻转
    cout << s << '\n';

    cout << count(s.begin(), s.end(), 'a') << '\n';   // 数 'a' 的个数

    return 0;
}
```

输出：

```text
aaabnn
nnbaaa
3
```

**注意**：`sort` 之后是 `aaabnn`，**翻转后是 `nnbaaa`**，
数 `'a'` 还是 3 个——翻转不改变字符的种类和数量。

::: range 字符串能用的 STL 算法
| 算法 | 例子 | 用途 |
| --- | --- | --- |
| `sort` | `sort(s.begin(), s.end())` | 字符排序（判断异位词常用） |
| `reverse` | `reverse(s.begin(), s.end())` | 翻转 |
| `count` | `count(s.begin(), s.end(), c)` | 数某个字符 |
| `find`（算法版） | `find(s.begin(), s.end(), c)` | 找某个字符的位置 |
| `unique` | `unique(s.begin(), s.end())` | 相邻去重（要先排序） |
| `next_permutation` | `next_permutation(s.begin(), s.end())` | 枚举所有排列 |

**注意区分两个 `find`**：

- `s.find("abc")` —— **成员函数**，找子串，返回下标
- `find(s.begin(), s.end(), 'a')` —— **算法**，找单个字符，返回迭代器
:::

### 二、数字 ↔ 字符串

<!-- expect

---
427
428
-->
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    int x = 42;
    string s = to_string(x);        // 数字 → 字符串
    s += "7";
    cout << s << '\n';

    int y = stoi(s);                // 字符串 → 数字
    cout << y + 1 << '\n';

    return 0;
}
```

输出：

```text
427
428
```

**常用的转换函数：**

| 函数 | 作用 |
| --- | --- |
| `to_string(x)` | 把数字转成字符串（支持 `int`、`long long`、`double`…） |
| `stoi(s)` | 字符串 → `int` |
| `stoll(s)` | 字符串 → `long long` |
| `stod(s)` | 字符串 → `double` |
| `stoi(s, nullptr, 2)` | 按 **2 进制**解析 |

::: pitfall `stoi` 遇到非数字会抛异常
```cpp
int x = stoi("12abc");        // 返回 12（只解析能解析的部分）
int y = stoi("abc");          // ✗ 抛出 std::invalid_argument 异常
```

**在竞赛里异常很危险**（有些评测环境下行为不可控）。

**所以更好的做法是自己写解析**（用 `s[i] - '0'` 逐位累加），
或者先确认字符串确实只含数字。

**什么时候 `to_string` 好用**：把数字拼进输出信息里，
或者需要"把数字当字符串处理"（比如数位统计）。
:::

### 三、`+=` 比 `+` 好

```cpp
s += "abc";              // ✓ 直接在原串后面接
s = s + "abc";           // 会先造一个临时字符串，再赋值回去
```

| 写法 | 过程 | 建议 |
| --- | --- | --- |
| `s += t` | 原地追加 | **推荐** |
| `s = s + t` | 新建临时对象 → 复制 → 赋值 | 能用 `+=` 就用它 |
| 大量拼接前 `s.reserve(n)` | 预留空间 | 数据量大时有用 |

**循环里拼字符串时，这个差别会很明显。**

### 四、几个必须记住的成员函数

| 操作 | 写法 | 说明 |
| --- | --- | --- |
| 长度 | `s.size()` / `s.length()` | 完全等价，**返回无符号数** |
| 判空 | `s.empty()` | 比 `s.size() == 0` 清楚 |
| 取子串 | `s.substr(pos, len)` | 越界会抛异常 |
| 查找 | `s.find(t)` | 找不到返回 `npos` |
| 末尾追加字符 | `s.push_back(c)` | 等价于 `s += c` |
| 删掉末尾 | `s.pop_back()` | 常用于去尾部换行 |
| 首个 / 末个字符 | `s.front()` / `s.back()` | 注意空串时是未定义行为 |
| 插入 | `s.insert(pos, t)` | 在 `pos` 前插入 |
| 删除 | `s.erase(pos, len)` | 从 `pos` 起删 `len` 个 |
| 替换 | `s.replace(pos, len, t)` | 把 `[pos, pos+len)` 换成 `t` |

::: pitfall `substr` 的越界行为
```cpp
string s = "abc";
cout << s.substr(5);          // ✗ pos 越界 → 抛 std::out_of_range
```

**`substr` 会检查越界并抛异常**（和 `vector::operator[]` 不同，它是安全的）。

**但竞赛里宁可自己判断**：

```cpp
if (pos <= (int)s.size()) {
    cout << s.substr(pos);
}
```
:::

### 五、和 C 风格字符串的互转

```cpp
string s = "hello";

// string → C 风格（给 printf 用）
printf("%s\n", s.c_str());

// C 风格 → string
char buf[100] = "world";
string t = buf;                  // 直接赋值
```

**注意**：`printf("%s", s)` 是错的，必须写 `s.c_str()`。

（详见 [C 风格字符串](/guide/c-strings) 与 [C++ string](/guide/cpp-string)。）

## 动手检查

1. 用 `sort` 和 `count` 判断两个单词是不是"字母异位词"（组成字母相同）。
2. 用 `substr` 取一个字符串的前 3 个字符和后 3 个字符。
3. 用 `find` 找出一个单词里所有出现 `"ab"` 的位置（提示：循环 + 起点往后移）。
4. 用 `to_string` 把 1～100 拼成一个长字符串，再统计里面有几个 `'1'`。
5. 比较 `s += t` 和 `s = s + t` 拼 10000 次的结果是否一致（正确性一样，速度不同）。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 读入一个单词，排序后输出 | 当容器用 |
| 基础 | 判断两个单词是否互为异位词 | `sort` 后比较 |
| 巩固 | 读入一个句子，把每个单词翻转后输出 | `substr` + `reverse` |
| 巩固 | [洛谷 P1553 数字反转（升级版）](https://www.luogu.com.cn/problem/P1553) | `substr` + `find` + 分情况 |
| 巩固 | [洛谷 P1308 统计单词数](https://www.luogu.com.cn/problem/P1308) | `find` 循环查找 |
| 挑战 | 用一个字符串实现"大整数加法" | 逐位处理（`s[i] - '0'`） |

::: pitfall P1553 是 `string` 成员函数的综合练习
它要处理整数、小数、分数、百分数四种情况的反转。

**用 `find` 定位分隔符、用 `substr` 切开、用 `reverse` 翻转**——
这三件套组合起来，比手写字符数组清爽很多。

**做完这道题，`string` 的常用函数就都练到了。**
:::

## 下一节

`string` 存的是"一串字符"。如果只想把**两个值绑在一起**呢？

[pair 二元组](/stl/pair)——它是所有容器里最简单、也最常用的一个。
