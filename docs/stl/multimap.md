# multimap 一键多值

`map` 是"一个键对应一个值"。**`multimap` 允许一个键对应多个值**——而且同名数据可以重复。

::: exam 先说结论：这一节是"了解即可"
`multimap` 在实际竞赛里**用得很少**，因为多数场景有更好的选择。

**但你要知道它存在、知道它和 `map` 的区别**——
做题时看到 `multimap` 不会懵，也能在某些场景下用它少写几行代码。

**这一节的重点是"知道有这么个东西"，而不是"必须会用"。**
:::

## 本节学会什么

- 知道 `multimap` 和 `map` 的核心区别
- 会用 `insert`（**不能用 `[]`**）和 `equal_range`
- 知道竞赛里"一键多值"更常用的两种写法
- 能判断什么时候该用 `multimap`

## 为什么需要它

先看 `map` 的限制：

```cpp
map<string, int> m;
m["Tom"] = 90;
m["Tom"] = 85;              // 覆盖了！只剩 85
```

**一个键只能留一个值。**

如果需求是"一个学生有多次考试成绩，都要留着"呢？

| 需求 | `map` | `multimap` |
| --- | --- | --- |
| 一个键一个值 | ✅ | ✅ |
| **一个键多个值** | ❌ 会覆盖 | ✅ |
| 键可以重复出现 | ❌ | ✅ |
| 用 `[]` 访问 | ✅ | **❌ 不支持** |
| 查找某个键 | `m[key]` | `equal_range` / `count` |

## 最小可运行示例

<!-- expect

---
Tom 有几个成绩：2
Tom 90
Tom 85
-->
```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    multimap<string, int> mm;

    mm.insert({"Tom", 90});
    mm.insert({"Tom", 85});        // 同一个键，第二个值不会覆盖第一个
    mm.insert({"Amy", 95});

    // count 返回"这个键有几个值"
    cout << "Tom 有几个成绩：" << mm.count("Tom") << '\n';

    // equal_range 取出这个键的所有值
    auto range = mm.equal_range("Tom");
    for (auto it = range.first; it != range.second; ++it) {
        cout << it->first << ' ' << it->second << '\n';
    }

    return 0;
}
```

输出：

```text
Tom 有几个成绩：2
Tom 90
Tom 85
```

## 关键过程与易错点

### 一、不能用 `[]`

::: pitfall `multimap` 没有 `operator[]`
```cpp
multimap<string, int> mm;
mm["Tom"] = 90;            // ✗ 编译错误！
```

**为什么？** 因为 `mm["Tom"]` 无法回答"你要改哪一个 Tom 的值"——
一个键可能对应好几个值。

**只能用 `insert`**：

```cpp
mm.insert({"Tom", 90});
mm.insert(make_pair("Tom", 85));      // 老写法，等价
```

**这个限制其实是好事**：它避免了"以为在改，其实覆盖了"的隐蔽 bug。
:::

### 二、取一个键的所有值：`equal_range`

```cpp
auto range = mm.equal_range("Tom");
for (auto it = range.first; it != range.second; ++it) {
    cout << it->second << '\n';
}
```

`equal_range` 返回一对迭代器 `[first, second)`，表示"这个键占据的区间"——
**又是左闭右开区间**（见[迭代器与区间](/stl/iterators)）。

| 返回值 | 含义 |
| --- | --- |
| `range.first` | 第一个等于该键的位置 |
| `range.second` | **最后一个等于该键的位置的下一个** |

::: range 也可以分开取
```cpp
auto lo = mm.lower_bound("Tom");     // 第一个 >= "Tom"
auto hi = mm.upper_bound("Tom");     // 第一个 > "Tom"
// [lo, hi) 就是 "Tom" 的所有值
```

**这和 `equal_range` 是一回事**——`equal_range` 就是这两个的组合。
:::

### 三、`multimap` 也是有序的

键按大小排序，**同一个键内部保持插入顺序**（C++11 起保证）。

所以上面示例里 `Tom` 的两个值输出是 `90` 然后 `85`——
**保持了我插入的顺序**，不是按值排序。

**这点要注意**：如果你需要"同一个键内部按值排序"，
`multimap` 做不到，得自己再排一次。

### 四、竞赛里"一键多值"更常用的两种写法

::: exam 说实话：大部分时候你不会用 multimap
| 需求 | 更常用的做法 |
| --- | --- |
| 每个键对应一个**列表** | **`map<键, vector<值>>`** ← 最常用 |
| 只是要统计每个键出现几次 | **`map<键, int>`** 计数 |
| 需要按键排序输出所有键值对 | `vector<pair<键, 值>>` + `sort` |

**为什么 `map<K, vector<V>>` 更常用？**

```cpp
map<string, vector<int>> m;
m["Tom"].push_back(90);
m["Tom"].push_back(85);

for (int x : m["Tom"]) cout << x << ' ';      // ✓ 直接当列表用
```

**它更灵活**：可以对每个键的列表单独排序、查找、统计。
:::

### 五、什么时候真的该用 `multimap`

| 场景 | 用 `multimap` 合适吗 |
| --- | --- |
| 只需要"插入 + 遍历某个键的所有值" | ✅ 合适，代码短 |
| 需要修改某个值 | ❌ 不行（`multimap` 的值可以改，但你得先找到它） |
| 需要对每个键的列表排序/查找 | ❌ 用 `map<K, vector<V>>` |
| 需要按下标访问 | ❌ 有序容器都没有下标 |

**判断标准：如果你发现自己想对"一个键的那些值"做任何额外操作，
就换成 `map<K, vector<V>>`。**
:::

## 动手检查

1. 把示例里的 `multimap` 改成 `map`，运行看输出有什么变化（应该只剩一个 `Tom`）。
2. 故意写 `mm["Tom"] = 90;`，把编译错误读一遍。
3. 用 `equal_range` 统计 `Tom` 有几个值，和 `count` 的结果对比。
4. 用 `map<string, vector<int>>` 重写示例，对比两种写法的代码量和使用感受。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 用 `multimap` 存"姓名 → 多次成绩"，输出每个人的所有成绩 | `insert` + `equal_range` |
| 基础 | 用 `map<string, vector<int>>` 重做上面一题 | 对比两种写法 |
| 巩固 | 给一批"班级 → 学生"的数据，输出每个班的学生（按班级排序） | 一键多值 |
| 巩固 | 统计每个单词出现在哪些行号 | `map<string, vector<int>>` |
| 挑战 | [洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093) 的另一种解法：用 `multimap` 按总分分组 | 体会"什么时候不该用它" |

::: pitfall 第 5 题会让你明白为什么不常用
用 `multimap` 解 P1093 会很难受，因为：

- 需要**多关键字排序** → `multimap` 只能按一个键排
- 需要**按下标输出前 k 个** → `multimap` 没有下标
- 需要**同分时按编号排** → 得把编号塞进键里（很别扭）

**而用 `struct` + `sort` + `cmp` 就很自然。**

**这就是"了解一个工具"和"滥用一个工具"的区别。**
:::

## 下一节

STL 的容器部分到这里就齐了。接下来是**算法**部分：
查找、去重、第 k 小、位集。

已经写完的算法：[sort](/stl/sort)、[二分查找](/stl/binary-search)、[unique](/stl/unique)。
