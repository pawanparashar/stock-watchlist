// Python interview-prep question bank for the Live Board's prep tile.
// To add more questions, just append objects to the array below — the board
// picks one per 10-minute slot (same pick on every screen), so a longer list
// simply means a longer cycle before anything repeats.
//
// PYTHON item types:
//   { type: "mcq",  topic, q, code, options: [...], answer: <index>, explain }
//   { type: "tip",  topic, q, code, explain }            // trick to learn
//   { type: "code", topic, q, code, explain }            // coding problem; code = solution

var PYTHON_BANK = [
  {
    type: "mcq", topic: "Mutable default args",
    q: "What does this print?",
    code: "def add(x, items=[]):\n    items.append(x)\n    return items\n\nadd(1)\nprint(add(2))",
    options: ["[2]", "[1, 2]", "[1]", "Error"],
    answer: 1,
    explain: "Default values are created ONCE when the function is defined, so every call shares the same list. Fix: use items=None, then items = [] if items is None."
  },
  {
    type: "tip", topic: "enumerate",
    q: "Loop with an index — the Pythonic way",
    code: "names = ['ana', 'bo', 'cy']\nfor i, name in enumerate(names, start=1):\n    print(i, name)\n# 1 ana\n# 2 bo\n# 3 cy",
    explain: "Never write range(len(x)) just to get an index. enumerate() gives (index, value) pairs, and start= sets the first number."
  },
  {
    type: "code", topic: "Hash map",
    q: "Two Sum: return indices of the two numbers that add up to target.",
    code: "def two_sum(nums, target):\n    seen = {}                 # value -> index\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))  # [0, 1]",
    explain: "One pass with a dict: for each number, check whether its complement was already seen. O(n) time, O(n) space, versus O(n²) for nested loops."
  },
  {
    type: "mcq", topic: "Slicing",
    q: "What does this print?",
    code: "s = 'python'\nprint(s[::-1], s[1:4], s[-2:])",
    options: ["nohtyp yth on", "nohtyp pyt on", "python yth no", "nohtyp yth no"],
    answer: 0,
    explain: "[::-1] reverses. [1:4] takes indices 1,2,3 (stop is exclusive) → 'yth'. [-2:] takes the last two characters → 'on'."
  },
  {
    type: "tip", topic: "zip",
    q: "Walk two lists together with zip()",
    code: "names  = ['ana', 'bo']\nscores = [91, 78]\nfor n, s in zip(names, scores):\n    print(f'{n}: {s}')\n\nlookup = dict(zip(names, scores))  # {'ana': 91, 'bo': 78}",
    explain: "zip() pairs items up and stops at the shortest list. dict(zip(keys, values)) is the fastest way to build a dict from two lists."
  },
  {
    type: "mcq", topic: "is vs ==",
    q: "What does this print?",
    code: "a = [1, 2]\nb = [1, 2]\nc = a\nprint(a == b, a is b, a is c)",
    options: ["True True True", "True False True", "False False True", "True False False"],
    answer: 1,
    explain: "== compares values; 'is' compares identity (the same object in memory). a and b are equal but separate lists; c is just another name for a."
  },
  {
    type: "code", topic: "Counter",
    q: "Find the first non-repeating character in a string.",
    code: "from collections import Counter\n\ndef first_unique(s):\n    counts = Counter(s)\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1\n\nprint(first_unique('leetcode'))     # 0\nprint(first_unique('loveleetcode')) # 2",
    explain: "Two passes: Counter counts everything once, then scan in order. O(n). Counter is a dict subclass that is perfect for any 'how many times' question."
  },
  {
    type: "tip", topic: "List comprehension",
    q: "Map + filter in one line",
    code: "nums = [1, 2, 3, 4, 5, 6]\nsquares_of_evens = [n * n for n in nums if n % 2 == 0]\n# [4, 16, 36]\n\nlabels = ['even' if n % 2 == 0 else 'odd' for n in nums]",
    explain: "Shape: [expression for item in iterable if condition]. To choose between two values, put if/else BEFORE the for; a filter-only if goes AFTER it."
  },
  {
    type: "mcq", topic: "Integer division",
    q: "What does this print?",
    code: "print(7 // 2, -7 // 2, 7 % 3, -7 % 3)",
    options: ["3 -3 1 -1", "3 -4 1 2", "3 -4 1 -1", "3.5 -3.5 1 2"],
    answer: 1,
    explain: "// rounds DOWN (toward -infinity), so -7 // 2 = -4. % always takes the sign of the divisor, so -7 % 3 = 2. Interviewers love this one."
  },
  {
    type: "tip", topic: "defaultdict",
    q: "Group items without key-exists checks",
    code: "from collections import defaultdict\n\nwords = ['eat', 'tea', 'tan', 'ate', 'nat']\ngroups = defaultdict(list)\nfor w in words:\n    groups[''.join(sorted(w))].append(w)\n\nprint(list(groups.values()))\n# [['eat', 'tea', 'ate'], ['tan', 'nat']]",
    explain: "defaultdict(list) creates an empty list the first time a key is used, so you never write 'if key not in d'. This snippet IS the Group Anagrams interview problem."
  },
  {
    type: "mcq", topic: "Shallow copy",
    q: "What does this print?",
    code: "grid = [[0] * 2] * 2\ngrid[0][0] = 9\nprint(grid)",
    options: ["[[9, 0], [0, 0]]", "[[9, 0], [9, 0]]", "[[9, 9], [0, 0]]", "Error"],
    answer: 1,
    explain: "* 2 copies the REFERENCE to the inner list, so both rows are the same object. Build grids with a comprehension instead: [[0] * 2 for _ in range(2)]."
  },
  {
    type: "code", topic: "Stack",
    q: "Valid Parentheses: are the brackets in '([]{})' balanced?",
    code: "def is_valid(s):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack\n\nprint(is_valid('([]{})'))  # True\nprint(is_valid('(]'))      # False",
    explain: "Push openers; on a closer, pop and check that it matches. A Python list is a stack: append() and pop() are both O(1)."
  },
  {
    type: "tip", topic: "f-strings",
    q: "f-string formatting cheat sheet",
    code: "price, pct, n = 1234.5678, 0.0712, 42\nprint(f'{price:,.2f}')  # 1,234.57\nprint(f'{pct:.1%}')     # 7.1%\nprint(f'{n:05d}')       # 00042\nprint(f'{n=}')          # n=42  (handy for debugging)",
    explain: "Put a format spec after the colon. {x=} prints both the name and the value, which is a quick debug trick."
  },
  {
    type: "mcq", topic: "Sets",
    q: "What does this print?",
    code: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(a & b, a | b, a - b)",
    options: ["{2, 3} {1, 2, 3, 4} {1}", "{1, 4} {1, 2, 3, 4} {1}", "{2, 3} {1, 2, 3, 4} {4}", "Error"],
    answer: 0,
    explain: "& is intersection, | is union, - is difference (in a but not in b). Membership tests on a set are O(1), versus O(n) on a list."
  },
  {
    type: "code", topic: "Sliding window",
    q: "Length of the longest substring without repeating characters.",
    code: "def longest_unique(s):\n    last = {}            # char -> last index seen\n    start = best = 0\n    for i, ch in enumerate(s):\n        if ch in last and last[ch] >= start:\n            start = last[ch] + 1\n        last[ch] = i\n        best = max(best, i - start + 1)\n    return best\n\nprint(longest_unique('abcabcbb'))  # 3\nprint(longest_unique('pwwkew'))    # 3",
    explain: "A sliding window: move start past the previous copy of a repeated character. O(n). This pattern solves a whole family of 'longest/shortest substring' questions."
  },
  {
    type: "mcq", topic: "Truthiness",
    q: "How many of these are truthy?",
    code: "values = [0, '', [], {}, None, '0', [0], 0.0]\nprint(sum(bool(v) for v in values))",
    options: ["0", "1", "2", "3"],
    answer: 2,
    explain: "Empty containers, 0, 0.0, '' and None are falsy. '0' is a non-empty string and [0] is a non-empty list, so both are truthy: 2."
  },
  {
    type: "tip", topic: "sorted with key",
    q: "Sort by any field with key=",
    code: "people = [('ana', 31), ('bo', 25), ('cy', 31)]\n\nby_age = sorted(people, key=lambda p: p[1])\n# age DESC, then name ASC:\nranked = sorted(people, key=lambda p: (-p[1], p[0]))\n# [('ana', 31), ('cy', 31), ('bo', 25)]",
    explain: "key= returns what to compare. Returning a tuple sorts by several fields; negate a number to reverse just that field. sorted() returns a new list; .sort() sorts in place."
  },
  {
    type: "mcq", topic: "Closures",
    q: "What does this print?",
    code: "funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])",
    options: ["[0, 1, 2]", "[2, 2, 2]", "[0, 0, 0]", "Error"],
    answer: 1,
    explain: "A lambda looks up i when it is CALLED, not when it is created. By then the loop has finished and i = 2. Fix: lambda i=i: i."
  },
  {
    type: "code", topic: "Heap",
    q: "Top K Frequent Elements: the k most common numbers.",
    code: "from collections import Counter\nimport heapq\n\ndef top_k(nums, k):\n    counts = Counter(nums)\n    return heapq.nlargest(k, counts, key=counts.get)\n\nprint(top_k([1, 1, 1, 2, 2, 3], 2))  # [1, 2]\n# shortcut: [x for x, _ in Counter(nums).most_common(k)]",
    explain: "Count with Counter, then pick the top k with a heap: O(n log k). Mention most_common() in an interview, but be ready to explain the heap."
  },
  {
    type: "tip", topic: "Unpacking",
    q: "Star-unpacking and swaps",
    code: "a, b = 1, 2\na, b = b, a              # swap, no temp variable\n\nfirst, *middle, last = [1, 2, 3, 4, 5]\n# first=1, middle=[2, 3, 4], last=5\n\ndef f(*args, **kwargs):\n    print(args, kwargs)\nf(1, 2, x=3)             # (1, 2) {'x': 3}",
    explain: "*name collects 'the rest' into a list. In a function signature, *args collects extra positional arguments into a tuple and **kwargs collects keyword arguments into a dict."
  },
  {
    type: "mcq", topic: "Strings are immutable",
    q: "What happens?",
    code: "s = 'hello'\ns[0] = 'H'\nprint(s)",
    options: ["Hello", "hello", "TypeError", "Hhello"],
    answer: 2,
    explain: "Strings cannot be changed in place: 'str' object does not support item assignment. Build a new string instead: s = 'H' + s[1:]. In loops, collect pieces in a list and ''.join() them."
  },
  {
    type: "code", topic: "Two pointers",
    q: "Is the string a palindrome, ignoring case and non-letters?",
    code: "def is_pal(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        if not s[l].isalnum(): l += 1\n        elif not s[r].isalnum(): r -= 1\n        elif s[l].lower() != s[r].lower(): return False\n        else: l, r = l + 1, r - 1\n    return True\n\nprint(is_pal('A man, a plan, a canal: Panama'))  # True",
    explain: "Two pointers moving inward, with O(1) extra space. The one-liner is cleaned == cleaned[::-1], but it uses O(n) memory. Offer both."
  },
  {
    type: "mcq", topic: "Dict ordering & get",
    q: "What does this print?",
    code: "d = {'b': 1, 'a': 2}\nd['c'] = 3\nprint(list(d), d.get('z', 0), d.get('z'))",
    options: ["['a', 'b', 'c'] 0 None", "['b', 'a', 'c'] 0 None", "['b', 'a', 'c'] 0 KeyError", "['c', 'b', 'a'] 0 None"],
    answer: 1,
    explain: "Since Python 3.7, dicts keep insertion order. .get(key, default) never raises; with no default it returns None. d['z'] would raise KeyError."
  },
  {
    type: "tip", topic: "any / all",
    q: "Replace flag loops with any() and all()",
    code: "nums = [3, 8, 12]\nhas_even  = any(n % 2 == 0 for n in nums)   # True\nall_pos   = all(n > 0 for n in nums)        # True\n\n# generator expression, no [] needed: lazy + short-circuits",
    explain: "any() stops at the first True and all() stops at the first False. Passing a generator (no square brackets) avoids building a list."
  },
  {
    type: "mcq", topic: "Generators",
    q: "What does this print?",
    code: "gen = (x * 2 for x in range(3))\nprint(list(gen), list(gen))",
    options: ["[0, 2, 4] [0, 2, 4]", "[0, 2, 4] []", "[] []", "Error"],
    answer: 1,
    explain: "A generator can only be consumed once. The second list() gets nothing. If you need several passes, store the results in a list."
  },
  {
    type: "code", topic: "Binary search",
    q: "Binary search: index of target in a sorted list, or -1.",
    code: "def bsearch(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target: return mid\n        if nums[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n\nprint(bsearch([1, 3, 5, 7, 9], 7))  # 3\n# stdlib: import bisect; bisect.bisect_left(nums, 7)",
    explain: "O(log n). The classic bugs are lo < hi vs lo <= hi and forgetting the ±1. Know the bisect module too."
  },
  {
    type: "tip", topic: "Exceptions",
    q: "try / except / else / finally",
    code: "def parse(s):\n    try:\n        n = int(s)\n    except ValueError as e:\n        print('bad input:', e)\n        return None\n    else:\n        return n * 2      # runs only if no exception\n    finally:\n        print('always runs')",
    explain: "Catch specific exceptions, never a bare except:. else = the success path. finally always runs, even after return, so it is the place for cleanup."
  },
  {
    type: "mcq", topic: "Scope",
    q: "What happens?",
    code: "count = 0\ndef bump():\n    count += 1\nbump()\nprint(count)",
    options: ["1", "0", "UnboundLocalError", "NameError"],
    answer: 2,
    explain: "Assigning to count inside the function makes it local to the whole function, so 'count += 1' reads a local that does not exist yet. Use 'global count' (or better, return the new value)."
  },
  {
    type: "code", topic: "Merge intervals",
    q: "Merge overlapping intervals.",
    code: "def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    out = []\n    for s, e in intervals:\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out\n\nprint(merge([[1, 3], [8, 10], [2, 6]]))  # [[1, 6], [8, 10]]",
    explain: "Sort by start, then either extend the last interval or start a new one. O(n log n). Shows up in scheduling and on-call questions, which suits an SRE background."
  },
  {
    type: "tip", topic: "with / context managers",
    q: "Always open files with 'with'",
    code: "with open('log.txt') as f:\n    for line in f:          # streams, doesn't load whole file\n        if 'ERROR' in line:\n            print(line.strip())\n# file is closed automatically, even on exceptions",
    explain: "'with' guarantees cleanup. Iterating the file object reads it line by line, so it works on huge log files. Log parsing is a very common practical interview task."
  },
  {
    type: "mcq", topic: "Tuples",
    q: "What does this print?",
    code: "t = (1)\nu = (1,)\nprint(type(t).__name__, type(u).__name__)",
    options: ["tuple tuple", "int tuple", "int int", "tuple int"],
    answer: 1,
    explain: "Parentheses alone just group an expression; it is the COMMA that makes a tuple. (1) is the int 1, while (1,) is a one-element tuple."
  },
  {
    type: "code", topic: "Log parsing",
    q: "Count ERROR lines per service from log lines like '2026-11-15 ERROR payments timeout'.",
    code: "from collections import Counter\n\nlogs = [\n    '2026-11-15 ERROR payments timeout',\n    '2026-11-15 INFO auth ok',\n    '2026-11-15 ERROR payments 500',\n    '2026-11-15 ERROR auth expired',\n]\nerrors = Counter(\n    line.split()[2] for line in logs if line.split()[1] == 'ERROR'\n)\nprint(errors.most_common())  # [('payments', 2), ('auth', 1)]",
    explain: "split() plus Counter covers most log-analysis questions. Follow-ups: handle malformed lines with try/except, and use regex (re) for messy formats."
  },
  {
    type: "mcq", topic: "Chained comparison",
    q: "What does this print?",
    code: "x = 5\nprint(1 < x < 10, 1 < x > 3, (1 < x) < 10)",
    options: ["True True True", "True False True", "True True False", "False True True"],
    answer: 0,
    explain: "a < b < c means (a < b) and (b < c). 1 < x > 3 is (1 < 5) and (5 > 3), which is True. (1 < x) is True, and True == 1, so 1 < 10 is also True."
  },
  {
    type: "tip", topic: "deque",
    q: "Use deque for queues (BFS)",
    code: "from collections import deque\n\nq = deque([1])\nq.append(2)        # add right\nq.appendleft(0)    # add left\nq.popleft()        # O(1) — list.pop(0) is O(n)!\n\nrecent = deque(maxlen=3)   # keeps only last 3 items",
    explain: "list.pop(0) shifts every element. deque pops from both ends in O(1), so it is the standard queue for BFS. maxlen= gives a free rolling window."
  },
  {
    type: "code", topic: "BFS",
    q: "Number of islands in a grid of '1' (land) and '0' (water).",
    code: "from collections import deque\n\ndef islands(grid):\n    rows, cols, seen, count = len(grid), len(grid[0]), set(), 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1' and (r, c) not in seen:\n                count += 1\n                q = deque([(r, c)]); seen.add((r, c))\n                while q:\n                    x, y = q.popleft()\n                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        nx, ny = x + dx, y + dy\n                        if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == '1' and (nx, ny) not in seen:\n                            seen.add((nx, ny)); q.append((nx, ny))\n    return count\n\nprint(islands(['110', '010', '001']))  # 2",
    explain: "Each unvisited piece of land starts a BFS that marks its whole island as seen. O(rows × cols). The same template solves most grid and graph questions."
  },
  {
    type: "mcq", topic: "join & split",
    q: "What does this print?",
    code: "words = 'a,b,,c'.split(',')\nprint(len(words), '-'.join(words))",
    options: ["3 a-b-c", "4 a-b--c", "4 a-b-c", "3 a-b--c"],
    answer: 1,
    explain: "split(',') keeps empty strings between consecutive commas, giving ['a', 'b', '', 'c']. Note that split() with no argument splits on runs of whitespace and drops empty strings."
  },
  {
    type: "tip", topic: "Decorators",
    q: "A timing decorator in 6 lines",
    code: "import time, functools\n\ndef timed(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        t = time.perf_counter()\n        result = fn(*args, **kwargs)\n        print(f'{fn.__name__} took {time.perf_counter() - t:.3f}s')\n        return result\n    return wrapper\n\n@timed\ndef work(): time.sleep(0.1)",
    explain: "A decorator is a function that takes a function and returns a wrapped one. functools.wraps keeps the original name and docstring. Common in observability code."
  },
  {
    type: "mcq", topic: "Copy",
    q: "What does this print?",
    code: "import copy\na = [[1], [2]]\nb = a.copy()\nc = copy.deepcopy(a)\na[0].append(9)\nprint(b[0], c[0])",
    options: ["[1, 9] [1]", "[1] [1]", "[1, 9] [1, 9]", "[1] [1, 9]"],
    answer: 0,
    explain: ".copy() is shallow: a new outer list holding the SAME inner lists. deepcopy copies the nested objects too, so c is unaffected."
  },
  {
    type: "code", topic: "Dynamic programming",
    q: "Climbing stairs: how many ways to climb n steps taking 1 or 2 at a time?",
    code: "def climb(n):\n    a, b = 1, 1        # ways(0), ways(1)\n    for _ in range(n - 1):\n        a, b = b, a + b\n    return b\n\nprint(climb(5))  # 8\n\n# or memoize the recursion:\nfrom functools import lru_cache",
    explain: "ways(n) = ways(n-1) + ways(n-2), which is Fibonacci. Two variables give O(1) space. Mention @lru_cache as the quick way to memoize a recursive solution."
  },
  {
    type: "mcq", topic: "Class vs instance attrs",
    q: "What does this print?",
    code: "class Team:\n    members = []\n    def add(self, m):\n        self.members.append(m)\n\nx, y = Team(), Team()\nx.add('ana')\nprint(y.members)",
    options: ["[]", "['ana']", "AttributeError", "None"],
    answer: 1,
    explain: "members is a CLASS attribute, shared by every instance. Per-object state belongs in __init__: self.members = []."
  }
];
