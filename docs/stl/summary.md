# STL 总复习

STL 部分到这里结束了。这一节只做一件事：**把"该用哪个容器/算法"变成一张能查的表。**

## 本节学会什么

- 用一张**选型表**，看到需求就知道该用什么
- 通过能力清单确认 STL 真的学会了
- 用一道综合题把容器、迭代器、算法串起来
- 知道 STL 的学习重点不是背 API，而是**背选型**

## 为什么需要它

STL 的知识点很散：23 个页面、几十个 API。

**但实际用的时候，你需要的只有一件事：选对工具。**

```text
"我要反复取最小值"     → priority_queue
"我要去重后按顺序输出"  → sort + unique 或 set
"我要查某个人在不在"    → map / set
"我要两端都能操作"      → deque
"我要按两个关键字排序"  → pair + sort
```

::: exam 复习 STL 的正确方式
**不是"再过一遍每个容器的 API"，而是"把需求映射到容器"。**

下面两张表（容器选型 + 算法选型）就是这一节的产出。
**把它们抄下来，做题时对着查**——查几次就记住了。
:::

## 容器选型表

### 按"我要做什么"查

| 需求 | 用什么 | 为什么 |
| --- | --- | --- |
| 存一排数，长度固定 | **数组** | 最快最简单 |
| 存一排数，长度不定 | **`vector`** | 自动扩容、能下标访问 |
| 两端都要插入删除 | **`deque`** | 两端都是 O(1) |
| 只在一端进出（后进先出） | **`stack`** | 语义清楚 |
| 两端进出（先进先出） | **`queue`** | 语义清楚 |
| **反复取最大值/最小值** | **`priority_queue`** | 堆顶 O(1) |
| 去重 + 有序 | **`set`** | 插入即去重排序 |
| 去重但**不需要顺序** | `sort` + `unique` | 常数更小 |
| 键 → 值 | **`map`** | 键可以是任意类型 |
| 键 → 多个值 | **`map<K, vector<V>>`** | 比 `multimap` 灵活 |
| 只要小整数打标记 | **`bool` 数组** | **O(1)，比 set 快** |
| 大批二进制位 | **`bitset`** | 省内存 + 整体位运算 |

### 按"我要什么操作"查（复杂度对照）

| 容器 | 随机访问 | 查找 | 插入（末尾） | 有序 | 去重 |
| --- | --- | --- | --- | --- | --- |
| 数组 / `vector` | **O(1)** | O(n) | O(1) | ❌ | ❌ |
| `deque` | O(1) | O(n) | O(1) | ❌ | ❌ |
| `stack` / `queue` | ❌ | ❌ | O(1) | ❌ | ❌ |
| `priority_queue` | 只能看堆顶 | ❌ | **O(log n)** | 部分有序 | ❌ |
| `set` / `map` | ❌ | **O(log n)** | O(log n) | **✅** | **✅** |
| `bitset` | O(1) | ❌ | — | ❌ | ❌ |

::: exam 三条最实用的选型规则
1. **能用数组就用数组**（小整数打标记比 `set` 快得多）
2. **需要有序或反复查找 → `set` / `map`**
3. **反复取最值 → `priority_queue`**

**其余的容器，等你真的需要时再查表。**
:::

## 算法选型表

| 需求 | 算法 | 复杂度 | 在哪一节 |
| --- | --- | --- | --- |
| 排序 | `sort` | O(n log n) | [sort](/stl/sort) |
| 稳定排序 | `stable_sort` | O(n log n) | [sort](/stl/sort) |
| 去重（先排序） | `unique` | O(n) | [unique](/stl/unique) |
| 翻转 | `reverse` | O(n) | |
| 找值 | `find` | O(n) | [find](/stl/find) |
| 找满足条件的 | `find_if` | O(n) | [find](/stl/find) |
| 统计 | `count` / `count_if` | O(n) | [find](/stl/find) |
| **有序区间查找** | **`lower_bound`** | **O(log n)** | [二分查找](/stl/binary-search) |
| 第 k 小 | `nth_element` | 平均 O(n) | [nth_element](/stl/nth-element) |
| 最值 | `max_element` / `min_element` | O(n) | |
| 下一个排列 | `next_permutation` | O(n) | |

::: range 一条容易忽略的规律
**"O(n) 的算法 + O(n log n) 的排序" = O(n log n)。**

所以如果你已经要排序，顺手用 `unique` / `lower_bound` 都是**免费的**。

**反过来**：如果只需要"找一次"，别为了用 `lower_bound` 先排序——
排序本身就要 O(n log n)，比直接 `find` 的 O(n) 还慢。
:::

## 能力清单：学完应该能做到

::: range 第一组：容器基础
- [ ] 说出 `vector` 和普通数组各自的适用场景
- [ ] 说清 `begin()` / `end()` 的含义（左闭右开）
- [ ] 用三种方式遍历容器（下标 / 迭代器 / 范围 `for`）
- [ ] 说出 `size()` 是无符号数会带来什么问题
:::

::: range 第二组：容器选型
- [ ] 看到"去重 + 有序"能想到 `set` 或 `sort` + `unique`
- [ ] 看到"反复取最值"能想到 `priority_queue`
- [ ] 看到"键值映射"能想到 `map`（并知道小整数该用数组）
- [ ] 说出 `priority_queue` 和 `set` 的核心区别（能不能查找/删除任意元素）
:::

::: range 第三组：算法与比较规则
- [ ] 写出 `sort` 的三种用法（升序 / 降序 / 自定义 `cmp`）
- [ ] 说清 `cmp` 为什么不能用 `<=`
- [ ] 说清 `priority_queue` 的比较方向和 `sort` **相反**
- [ ] 会用 `lambda` 写比较规则
- [ ] 用 `lower_bound` 找"第一个 ≥ x"的位置，并判断"存不存在"
- [ ] 记得 `sort` + `unique` + **用返回值**
:::

::: exam 判定标准
**第二组（容器的选型）最重要。**

API 忘了可以查，但**选错容器会让算法复杂度差一个数量级**——
选了 `set` 去替代数组打标记、或者在需要反复取最值时用 `vector` 每次扫一遍，
这类错误**不是"写错了"，而是"一开始就选错了"**。
:::

## 综合例题：把容器和算法串起来

**题目**：给 n 个学生的姓名和成绩，要求：

1. 按成绩从高到低输出
2. 成绩相同的按姓名**字典序**输出
3. 如果有重名同分的记录，只保留一条

<!-- expect
5
Tom 90
Amy 95
Tom 90
Bob 88
Amy 80
---
Amy 95
Tom 90
Bob 88
Amy 80
-->
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

bool cmp(const Student &a, const Student &b) {
    if (a.score != b.score) return a.score > b.score;   // 成绩降序
    return a.name < b.name;                              // 姓名升序
}

int main() {
    int n;
    cin >> n;

    // 用 set 去重：需要给 Student 定义比较规则，这里改用 pair 存
    set<pair<string, int>> seen;
    vector<Student> v;

    for (int i = 0; i < n; i++) {
        string name;
        int score;
        cin >> name >> score;

        if (seen.count({name, score})) continue;   // 重复记录，跳过
        seen.insert({name, score});
        v.push_back({name, score});
    }

    sort(v.begin(), v.end(), cmp);

    for (auto &s : v) {
        cout << s.name << ' ' << s.score << '\n';
    }
    return 0;
}
```

输入 5 条记录（其中 `Tom 90` 重复了两次），输出 4 条。

::: range 这道题用了多少个 STL 组件
| 组件 | 用在哪 |
| --- | --- |
| `string` | 存姓名 |
| `vector` | 存学生列表 |
| `set` | 去重（记录见过的"姓名+成绩"） |
| `pair` | 作为 `set` 的元素 |
| `struct` | 因为要按两列排序，用结构体更清楚 |
| `sort` + `cmp` | 多关键字排序 |
| 范围 `for` | 输出 |

**一道题把这一部分的绝大部分内容都用上了。**

**注意这里的设计取舍**：去重用 `set<pair<...>>`（因为 `pair` 自带比较），
排序用 `struct` + `cmp`（因为要按两列、且顺序和 `pair` 不同）。
**"选对工具"就体现在这些地方。**
:::

## 动手检查

1. 把上面例题的 `set` 换成"先全部读进来、排序后手动去重"，对比代码长度和复杂度。
2. 把 `cmp` 里的成绩改成升序，观察输出变化。
3. 用 `map<string, int>` 重写"去重"部分（提示：同名学生只留一个的做法不一样）。
4. 把两张选型表抄到一张纸上。

## 立即练习

::: exam STL 部分的最终验收
不看资料，完成下面三件事：

**① 说出选型**
给五个需求，分别说出该用什么容器，并说明理由：

1. 反复取出一堆数里最小的
2. 判断某个字符串有没有出现过
3. 统计每个单词出现几次，最后按字典序输出
4. 给一组点按 x 升序、x 相同时按 y 升序排序
5. 求一组数的中位数

**② 写出代码**
把上面 5 个需求**各写一段能跑的程序**（可以只写核心部分）。

**③ 做一道综合题**
[洛谷 P1093 奖学金](https://www.luogu.com.cn/problem/P1093)（多关键字排序）
或 [洛谷 P1059 明明的随机数](https://www.luogu.com.cn/problem/P1059)（去重排序）。

**三件都做到，STL 就过关了。**
:::

::: range 五道选型题的答案（先自己想）
| 需求 | 用什么 | 理由 |
| --- | --- | --- |
| ① 反复取最小 | `priority_queue`（小根堆） | 堆顶 O(1)，插入 O(log n) |
| ② 判断字符串在不在 | `set<string>` | 查找 O(log n) |
| ③ 单词计数 + 字典序输出 | `map<string, int>` | 计数 + 自动按键排序 |
| ④ 双关键字排序 | `pair<int,int>` 数组 + `sort` | `pair` 自带双关键字比较 |
| ⑤ 中位数 | `nth_element` | 平均 O(n)，比全排序快 |

**注意④**：如果两个关键字之外还要第三个，就得用 `struct` + `cmp` 了。
:::

## 下一步去哪

| 想学什么 | 去哪 |
| --- | --- |
| 准备考试，把分拿到手 | [考前实战](/practice/) |
| 补语法基础 | [快速入门](/guide/) |
| 学进阶语言特性 | [进阶主题](/advanced/) |
| 查资料 | [附录](/appendix/) |

::: range 一个提醒：STL 不是"用现成工具"那么简单
学 STL 之前，你的选择只有"数组 + 循环"。

学完之后，你能根据**问题结构**选工具。这个能力会一直用下去：

- **`set` 让你不用手写去重排序**
- **`priority_queue` 让你不用每次找最大值**
- **`lower_bound` 让你不用手写二分**
- **`map` 让你不用为"字符串下标"发愁**

**每一次选对，都是"少写一段容易出错的代码"。**

这也是为什么[必背模板](/practice/templates)里说：
**"能用 STL 解决，就不要手写。"**
:::
