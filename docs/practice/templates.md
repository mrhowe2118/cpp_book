# 必背模板

**考场上你不能带任何资料。** 所以有些代码必须能在脑子里、在手上——**不看键盘就能打出来**。

这一节给你一份清单：背哪些、每个用在什么时候、最容易错在哪。

## 本节学会什么

- 知道哪 8 个模板是"CSP-J/S 必背"级别的
- 每个模板都拿到一份**经过编译和运行验证**的正确版本
- 学会"默打训练法"，而不是死记硬背
- 知道每个模板最容易写错的那一处

::: range 这一节的代码都是真的跑过的
下面每个模板都是**完整可运行的程序**，输出结果由 `npm run examples` 自动复验。

所以你可以放心直接背——**它们不是伪代码，是正确的代码。**
:::

## 为什么需要它

先算一笔时间的账。

考场上你写一道题，从零开始敲 `#include`、`main`、读入……大概要 2～3 分钟。
四道题就是 10 分钟——**而这 10 分钟敲的东西，100% 是重复的**。

默打模板把这段时间压到几乎为零：

| | 现敲 | 默打 |
| --- | --- | --- |
| 程序骨架 + `freopen` | 2～3 分钟 | 30 秒 |
| 二分查找边界 | 容易写错，要反复调 | 一次写对 |
| 并查集 / 01 背包 | 3～5 分钟 | 1 分钟 |
| **出错概率** | 高（尤其边界） | 低（练过的） |

::: exam 背模板不是为了快，是为了"不错"
速度只是附带的。**真正的收益是正确率**：

二分查找的 `l <= r` 还是 `l < r`、`mid + 1` 还是 `mid`——
这些边界每次现推都可能错。**背下来的模板是练过几十遍的正确版本。**
:::

## 关键过程与易错点

程序骨架（`#include` + `freopen` + `int main`）在 [申诉不是安全网](/practice/five-gates/appeal) 里已经给过，
下面这 8 个是**算法模板**。

### 1. 排序 + 去重

**什么时候用**：统计有多少个不同的数、排序后处理、配合二分。

<!-- expect
6
3 1 3 2 1 2
---
3
1 2 3
-->
```cpp
#include <cstdio>
#include <algorithm>
using namespace std;

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

    sort(a + 1, a + n + 1);                    // 排序：区间是 [1, n+1)
    int m = unique(a + 1, a + n + 1) - (a + 1); // 去重：返回去重后的尾指针

    printf("%d\n", m);
    for (int i = 1; i <= m; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}
```

::: pitfall 两个高频错误
1. **`sort(a + 1, a + n + 1)` 的右端点是 `n + 1`**，不是 `n`。
   STL 的区间是**左闭右开**，写成 `a + n` 会漏掉最后一个元素。
2. **`unique` 不删除元素，只把重复的移到后面。** 必须用它的返回值算出新长度，
   否则你输出的还是原来的 `n` 个数。
:::

### 2. 二分查找

**什么时候用**：在有序数组里找一个数；或者找"第一个满足条件的位置"。

<!-- expect
5 3
1 3 5 7 9
5
1
8
---
3
1
-1
-->
```cpp
#include <cstdio>

const int MAXN = 100005;
int a[MAXN];

int main() {
    int n, q;
    scanf("%d %d", &n, &q);
    for (int i = 1; i <= n; i++) scanf("%d", &a[i]);

    while (q--) {
        int x;
        scanf("%d", &x);

        int l = 1, r = n, ans = -1;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (a[mid] == x) { ans = mid; break; }
            else if (a[mid] < x) l = mid + 1;   // 目标在右半边
            else r = mid - 1;                   // 目标在左半边
        }
        printf("%d\n", ans);
    }
    return 0;
}
```

::: pitfall 二分只有三种错法
1. **`mid` 用 `(l + r) / 2`，不要用 `(l + r + 1) / 2`**（这个版本容易死循环，除非配套改边界）
2. **`l = mid + 1` 和 `r = mid - 1` 必须带 `±1`**。写成 `l = mid` 就死循环。
3. **循环条件是 `l <= r`**（闭区间版本），不是 `l < r`

**另一种写法**：不想手写就用现成的 `lower_bound` / `upper_bound`（见 [STL：二分查找](/stl/binary-search)）。
:::

### 3. 二分答案

**什么时候用**：题目问"**最大/最小的** X，使得……成立"，而且 X 越大越难满足（或越小越难满足）。

<!-- expect
3 7
20 15 10
---
5
-->
```cpp
#include <cstdio>
using namespace std;

const int MAXN = 100005;
int a[MAXN];
int n, k;

// 判断：切成每段 len 长，能不能切出至少 k 段
bool check(int len) {
    if (len == 0) return false;
    long long cnt = 0;
    for (int i = 0; i < n; i++) cnt += a[i] / len;
    return cnt >= k;
}

int main() {
    scanf("%d %d", &n, &k);
    int mx = 0;
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);
        if (a[i] > mx) mx = a[i];
    }

    int l = 0, r = mx, ans = 0;
    while (l <= r) {
        int mid = (l + r) / 2;
        if (check(mid)) {
            ans = mid;      // 可行 → 记下来，试着更大
            l = mid + 1;
        } else {
            r = mid - 1;    // 不可行 → 只能更小
        }
    }
    printf("%d\n", ans);
    return 0;
}
```

::: pitfall 二分答案的三个关键
1. **`check` 函数必须是"单调"的**：如果 `len` 可行，那么比 `len` 小的都可行。
   **先想清楚单调性，再写二分**——方向搞反了，怎么写都错。
2. **`ans` 要单独记**。不能直接输出 `l` 或 `r`，边界情况下它们不一定是答案。
3. **注意 `check` 里的溢出**。计数用 `long long`，别用 `int`。
:::

### 4. 差分：区间加，最后求值

**什么时候用**：要给一个区间里**所有数同时加上 v**，做很多次，最后问每个位置的值。

<!-- expect
5 2
1 2 3 4 5
1 3 10
2 4 1
---
11 13 14 5 5
-->
```cpp
#include <cstdio>
using namespace std;

const int MAXN = 100005;
long long d[MAXN];      // 差分数组

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    // 读入初始序列，同时建立差分：d[i] = a[i] - a[i-1]
    int prev = 0;
    for (int i = 1; i <= n; i++) {
        int x;
        scanf("%d", &x);
        d[i] = x - prev;
        prev = x;
    }

    // 每次区间加：只改两个位置！
    while (m--) {
        int l, r, v;
        scanf("%d %d %d", &l, &r, &v);
        d[l] += v;
        d[r + 1] -= v;
    }

    // 前缀和还原出最终序列
    long long cur = 0;
    for (int i = 1; i <= n; i++) {
        cur += d[i];
        printf("%lld ", cur);
    }
    printf("\n");
    return 0;
}
```

::: range 前缀和 vs 差分：一对反操作
| | 解决的问题 | 预处理 | 单次操作 |
| --- | --- | --- | --- |
| **前缀和** | 多次**求区间和** | O(n) | O(1) |
| **差分** | 多次**区间加** | O(n) | O(1) |

**前缀和的逆运算是差分。** 记一个就够推另一个：

```text
原数组  a:  1  2  3  4  5
前缀和  s:  1  3  6 10 15      s[i] = s[i-1] + a[i]
差分    d:  1  1  1  1  1       d[i] = a[i] - a[i-1]
```
:::

### 5. 埃氏筛：筛质数

**什么时候用**：需要 1～n 里所有质数，或判断很多个数是不是质数。

<!-- expect
100
---
25
-->
```cpp
#include <cstdio>

const int MAXN = 1000005;
bool notPrime[MAXN];      // 开全局，见资源关

int main() {
    int n;
    scanf("%d", &n);

    int cnt = 0;
    for (int i = 2; i <= n; i++) {
        if (!notPrime[i]) {
            cnt++;
            // 从 i*i 开始筛（更小的倍数已经被更小的质数筛过了）
            for (long long j = 1LL * i * i; j <= n; j += i) {
                notPrime[j] = true;
            }
        }
    }
    printf("%d\n", cnt);
    return 0;
}
```

::: pitfall 两个细节
1. **内层循环变量必须是 `long long`**。`i * i` 在 `i` 接近 10⁵ 时还是安全的，
   但写 `1LL * i * i` 是零成本的保险。
2. **从 `i * i` 开始，不是 `i * 2`**。更小的倍数已经被筛过了，跳过它们更快。
:::

### 6. gcd 与快速幂

**什么时候用**：约分、判断互质；快速幂用于大指数取模（如求 `a^b mod p`）。

<!-- expect
12 4
---
4 20736
-->
```cpp
#include <cstdio>
using namespace std;

// 辗转相除求最大公约数
long long gcd(long long a, long long b) {
    while (b) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// 快速幂：a^b（不取模版本）
long long qpow(long long a, long long b) {
    long long res = 1;
    while (b) {
        if (b & 1) res *= a;    // 这一位是 1，乘进去
        a *= a;                 // 底数平方
        b >>= 1;                // 指数右移
    }
    return res;
}

int main() {
    long long a, b;
    scanf("%lld %lld", &a, &b);
    printf("%lld %lld\n", gcd(a, b), qpow(a, b));
    return 0;
}
```

::: pitfall 快速幂不取模会溢出
上面的 `qpow` **没有取模**，`a` 稍大、`b` 稍大就会溢出。

题目要求"求 `a^b mod p`"时，**每一步都要取模**：

```cpp
long long qpow(long long a, long long b, long long p) {
    long long res = 1 % p;
    a %= p;
    while (b) {
        if (b & 1) res = res * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return res;
}
```

**另外**：C++17 起标准库自带 `std::gcd`（在 `<numeric>` 里），可以直接用。
:::

### 7. 并查集

**什么时候用**：判断"两个元素是否在同一集合"、合并集合；Kruskal、连通块计数。

<!-- expect
5 4
1 1 2
1 3 4
2 1 2
2 1 3
---
Yes
No
-->
```cpp
#include <cstdio>
using namespace std;

const int MAXN = 100005;
int fa[MAXN];

void init(int n) {
    for (int i = 1; i <= n; i++) fa[i] = i;    // 每个元素自成一个集合
}

// 找根 + 路径压缩
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

void merge(int x, int y) {
    fa[find(x)] = find(y);                     // 把 x 的根挂到 y 的根上
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    init(n);

    while (m--) {
        int op, x, y;
        scanf("%d %d %d", &op, &x, &y);
        if (op == 1) merge(x, y);
        else printf("%s\n", find(x) == find(y) ? "Yes" : "No");
    }
    return 0;
}
```

::: pitfall 并查集只要写对两行
```cpp
int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }
void merge(int x, int y) { fa[find(x)] = find(y); }
```

**最容易错的地方**：`merge` 里写成 `fa[x] = y`（忘了先找根）。
一旦写错，路径压缩也救不回来——**必须对根操作**。
:::

### 8. 01 背包

**什么时候用**：每件物品**最多取一次**，容量有限，求最大价值。

<!-- expect
3 10
5 10
4 40
6 30
---
70
-->
```cpp
#include <cstdio>
using namespace std;

const int MAXN = 1005;
int w[MAXN], v[MAXN];      // 重量、价值
int dp[10005];             // dp[j] = 容量为 j 时的最大价值

int main() {
    int n, cap;
    scanf("%d %d", &n, &cap);
    for (int i = 1; i <= n; i++) scanf("%d %d", &w[i], &v[i]);

    for (int i = 1; i <= n; i++) {
        // 关键：容量 j 必须倒序遍历
        for (int j = cap; j >= w[i]; j--) {
            int cand = dp[j - w[i]] + v[i];
            if (cand > dp[j]) dp[j] = cand;
        }
    }
    printf("%d\n", dp[cap]);
    return 0;
}
```

::: pitfall 倒序是 01 背包的命门
内层 `j` **必须从大到小**循环。原因：

- **倒序** → 用到的 `dp[j - w[i]]` 还是"没放第 i 件物品"的旧值 → **每件只取一次** ✅
- **正序** → `dp[j - w[i]]` 可能已经放过了第 i 件 → 变成**完全背包**（每件能取无限次）❌

**记法：01 背包倒着走，完全背包正着走。**
:::

## 默打训练法

死记硬背记不住，也容易在紧张时忘掉。用这个办法：

::: exam 三步默打法
1. **理解每一行在干什么**。比如二分那里"`mid + 1` 是因为 mid 已经查过了"——
   理解之后就不是背符号，而是背逻辑。
2. **合上所有资料，凭记忆打一遍**，然后对照找差异。
   差异处就是你真正没记住的地方。
3. **隔一天再打一遍**，然后隔三天再打一遍。

**一个模板打对三遍，才算真的背下来了。** 只打一遍是"当时会"，不是"考场上会"。
:::

### 优先级：哪些先背

| 优先级 | 模板 | 理由 |
| --- | --- | --- |
| ⭐⭐⭐ | 程序骨架 + `freopen` | 每题都要用 |
| ⭐⭐⭐ | 排序 + 去重 | 使用频率最高 |
| ⭐⭐⭐ | 二分查找 / 二分答案 | 边界最容易写错 |
| ⭐⭐ | 前缀和 / 差分 | 一次学会两个 |
| ⭐⭐ | gcd / 快速幂 | 短，好记 |
| ⭐⭐ | 并查集 | 短，但容易写错 |
| ⭐ | 埃氏筛 | 用到再背 |
| ⭐ | 01 背包 | 依赖 DP 理解，别硬背 |

## 动手检查

1. 从今天开始，每次写代码**不看任何东西**先默打一遍骨架，再开始写题目。
2. 挑上面 3 个模板，按"默打三步法"练一遍，记录你每次漏掉的地方。
3. 把二分查找的 `l <= r` 改成 `l < r` 试试，看看会错在哪里。（理解比记住重要）
4. 把 01 背包的内层循环改成正序，用样例跑一遍，看结果变成什么。

## 立即练习

| 难度 | 练习 | 练什么 |
| --- | --- | --- |
| 基础 | 默打"排序 + 去重"，不看资料 | 最常用的模板 |
| 基础 | 默打二分查找，然后用 [洛谷 P2249 查找](https://www.luogu.com.cn/problem/P2249) 验证 | 边界正确性 |
| 巩固 | 用二分答案模板做 [洛谷 P2440 木材加工](https://www.luogu.com.cn/problem/P2440) | 二分答案的完整流程 |
| 巩固 | 用差分做一道区间修改题 | 差分的方向别搞反 |
| 挑战 | 默打 01 背包，并解释为什么内层要倒序 | 理解而非记忆 |

## 下一节

模板会打了，但**你怎么知道自己写对了**？样例只能测一种情况。

下一节讲一个能自己验证自己的办法：**对拍**。
