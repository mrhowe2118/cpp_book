# map 键值映射

数组的下标只能是整数。但很多时候你想要"**用字符串当下标**"——比如"人名 → 成绩"。

`map` 就是干这个的：**任意类型做键，映射到任意类型的值。**

## 本节学会什么

- 用 `map` 建立"键 → 值"的映射
- 掌握 `m[key]` / `count` / `find` 的区别（**这里有个大坑**）
- 遍历 `map`，理解它按**键**自动排序
- 知道什么时候该用 `map`、什么时候普通数组就够

## 为什么需要它

看一个需求：**统计每个单词出现了几次**。

用数组？数组下标必须是整数，而单词是字符串：

```cpp
int cnt[???];                // 用什么当下标？
```

你可能想到"把字符串映射成一个整数"——但那正是 `map` 帮你做的事：

```cpp
map<string, int> cnt;
cnt["apple"]++;              // 用字符串当"下标"
```

::: exam map 和数组的关系
| | 数组 | `map` |
| --- | --- | --- |
| 键的类型 | 只能是整数，且连续 | **任意类型**（字符串、结构体……） |
| 键的范围 | 必须是 `0 ~ MAXN` 这样的连续区间 | 任意，稀疏也行 |
| 查找 | O(1)（直接算地址） | O(log n) |
| 内存 | 按上限开，可能浪费 | **按实际用到的数量** |

**"桶"和"map"解决的是同一件事**——用键找值。
区别是：键是**小整数且连续**时用数组，否则用 `map`。
:::

## 最小可运行示例

<!-- expect

---
apple 2
banana 2
cat 1
-->
```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    string words[5] = {"apple", "banana", "apple", "cat", "banana"};
    map<string, int> cnt;

    for (int i = 0; i < 5; i++) {
        cnt[words[i]]++;          // 计数：不存在时默认从 0 开始
    }

    // 遍历：map 按"键"自动排序
    for (auto &p : cnt) {
        cout << p.first << ' ' << p.second << '\n';
    }
    return 0;
}
```

输出：

```text
apple 2
banana 2
cat 1
```

**注意输出是按单词字典序排的**，而输入顺序是 `apple, banana, apple, cat, banana`——这就是 `map` 的"按键有序"。

::: range 遍历 map 时 `p` 是什么
`map<K, V>` 里的每个元素是一个 `pair<const K, V>`：

| 写法 | 含义 |
| --- | --- |
| `p.first` | **键**（key） |
| `p.second` | **值**（value） |

```cpp
for (auto &p : cnt) cout << p.first << ' ' << p.second;
for (auto &[k, v] : cnt) cout << k << ' ' << v;      // C++17 结构化绑定，更清楚
```

**本书用 C++17，所以第二种写法可以用**（需要确认评测环境支持）。
不确定时就用 `p.first` / `p.second`，最保险。
:::

## 关键过程与易错点

### 一、最大的坑：`[]` 会"顺手插入"

这是 `map` 最需要注意的一点：

<!-- expect

---
banana 不存在（其实已经被插进去了）
size = 2
banana 真的不存在
size = 1
-->
```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    // ✗ 用 [] 去"查询"
    map<string, int> m;
    m["apple"] = 5;

    if (m["banana"] == 0) {                     // 这一行就把 banana 插进去了！
        cout << "banana 不存在（其实已经被插进去了）\n";
    }
    cout << "size = " << m.size() << '\n';      // 2

    // ✓ 用 count 查询
    map<string, int> m2;
    m2["apple"] = 5;

    if (m2.count("banana") == 0) {
        cout << "banana 真的不存在\n";
    }
    cout << "size = " << m2.size() << '\n';     // 1，没被改变

    return 0;
}
```

::: exam 为什么会这样
`m[key]` 的语义是"**给我这个键对应的值的引用；如果键不存在，就先插入一个默认值**"。

所以：

- **写**的时候用它很方便：`m["apple"] = 5;`（不用管存不存在）
- **查**的时候用它很危险：会**悄悄改变容器**

| 想干什么 | 正确写法 |
| --- | --- |
| 赋值 / 累加 | `m[key] = v;` / `m[key]++;` ✅ |
| 判断存在 | **`m.count(key)`** ✅ |
| 取值（可能不存在） | 先 `count` 判断，再取；或用 `find` |

**纪律：只读的场合，一律用 `count` 或 `find`，不要用 `[]`。**
:::

### 二、用 `find` 取值

`find` 返回迭代器，能在"不存在"和"存在"之间明确区分：

```cpp
auto it = m.find("apple");
if (it != m.end()) {
    cout << it->first << " = " << it->second << '\n';   // it->second 是值
}
```

| | `count` | `find` | `[]` |
| --- | --- | --- | --- |
| 返回 | 0 / 1 | 迭代器 | 值的引用 |
| 会插入吗 | ❌ | ❌ | **✅ 会！** |
| 用途 | 判断存在 | 判断 + 取值 | 赋值 / 累加 |

### 三、`map` 的键不能改

```cpp
for (auto &p : m) p.first = "x";        // ✗ 编译错误：键是 const
for (auto &p : m) p.second = 100;       // ✓ 值可以改
```

::: pitfall 想改键，只能删了再插
```cpp
int v = m["old"];
m.erase("old");
m["new"] = v;
```

**和 `set` 里"元素不能改"是同一个道理**——
`map` 靠键来决定元素在树里的位置，改了键结构就乱了。
:::

### 四、遍历是有序的，别指望插入顺序

`map` 内部是平衡树，**按 `key` 排序**（默认 `less`，即升序）。

```cpp
map<int, string> m;
m[3] = "c";
m[1] = "a";
m[2] = "b";

for (auto &p : m) cout << p.first << ' ';    // 输出 1 2 3，不是 3 1 2
```

::: range 如果只关心"查找"，不关心顺序
用 `unordered_map`（哈希表）：

```cpp
#include <unordered_map>
unordered_map<string, int> cnt;
```

| | `map` | `unordered_map` |
| --- | --- | --- |
| 内部结构 | 平衡树 | 哈希表 |
| 操作复杂度 | O(log n) | **平均 O(1)** |
| 遍历顺序 | **按键有序** | 不确定 |
| 常数 | 较大 | 较小 |

**竞赛建议**：

- 需要**有序遍历**（比如按键从小到大输出）→ `map`
- 只做**计数 / 查找** → `unordered_map` 更快

**但要注意**：`unordered_map` 在某些评测机上可能被卡（构造哈希冲突），
**不确定时用 `map` 更稳**。
:::

### 五、什么时候用 `map`，什么时候用数组

| 键的情况 | 用什么 |
| --- | --- |
| 小整数，范围连续（`0 ~ 10⁵`） | **数组 / `vector`**（O(1)，最快） |
| 大整数（如 `10⁹`），很稀疏 | `map` 或先离散化 |
| 字符串 | **`map`** |
| 需要按键排序 | **`map`** |

::: exam 一条实战提醒
**能用数组的时候，一定用数组。**

```cpp
int cnt[100005];            // ✓ O(1)，快，简单
map<int, int> cnt;          // 键是 0~10⁵ 的整数时，没必要
```

`map` 的每次操作都要走树（O(log n)），常数还不小。
**数组能解决的，不要用 `map`。**
:::

## 动手检查

1. 复现"用 `[]` 查询会插入"的问题：用 `[]` 读一个不存在的键，然后打印 `size()`。
2. 用 `map` 统计一段文字里每个字母出现的次数，按字母顺序输出。
3. 把遍历里的 `p.first` / `p.second` 改成结构化绑定 `auto &[k, v]`，确认结果一致。
4. 用 `find` 查一个存在的键和一个不存在的键，分别输出对应的信息。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 统计一组单词里每个词出现的次数，按字典序输出 | `map<string,int>` |
| 基础 | [洛谷 P1308 统计单词数](https://www.luogu.com.cn/problem/P1308) | `map` + 字符串处理 |
| 巩固 | 读入 n 个学生的姓名和成绩，输出每个学生的成绩（同名学生累加） | `map` 累加 |
| 巩固 | 判断两个字符串是不是"字母异位词"（组成字母相同） | `map` 计数对比 |
| 挑战 | [洛谷 P2580 于是他错误的点名开始了](https://www.luogu.com.cn/problem/P2580) | `map` 记录状态（区分"没出现"和"重复出现"） |

::: pitfall P2580 是 `map` 的经典用法
它要区分三种情况：**名字没出现过 / 出现过一次 / 出现过两次以上**。

用 `map<string, int>` 记录"被点到的次数"：

```cpp
if (!m.count(name)) cout << "WRONG\n";        // 名单里没有
else if (m[name] == 1) { cout << "OK\n"; m[name]++; }   // 第一次点到
else cout << "REPEAT\n";                      // 重复点到
```

**这里就能看出 `count` 和 `[]` 的配合**：用 `count` 判断，用 `[]` 取值和修改。
:::

## 下一节

`map` 和 `set` 是"有序容器"。接下来看两个**限制更多、但语义更清楚**的容器适配器：

[stack 栈](/stl/stack)——后进先出。
