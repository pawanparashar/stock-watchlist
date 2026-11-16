// Python interview-prep question bank for the Live Board's prep tile.
// To add more questions, just append objects to the array below — the board
// picks one per 10-minute slot (same pick on every screen), so a longer list
// simply means a longer cycle before anything repeats.
//
// PYTHON item types:
//   { type: "mcq",  topic, q, code, options: [...], answer: <index>, explain }
//   { type: "tip",  topic, q, code, explain }            // trick to learn
//   { type: "code", topic, q, code, explain }            // coding problem; code = solution
//   { type: "concept", ... }  // how-to-use cards: see PYTHON_CONCEPTS at the bottom

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

// CONCEPT cards: how to use a data structure / feature, with context, key
// points and a runnable example. Shape:
//   { type: "concept", topic, q, context, points: [...], code }
// They're interleaved into PYTHON_BANK below (one after every two quiz
// items) so the rotation mixes learning cards with practice questions.
var PYTHON_CONCEPTS = [
  {
    type: "concept", topic: "list",
    q: "Lists: the methods you'll use daily",
    context: "Ordered, mutable, allows duplicates. Your default container, and it doubles as a stack.",
    points: [
      "append / pop() at the END are O(1); insert(0, x) / pop(0) at the FRONT are O(n), so use deque for a queue",
      "'x in nums' scans the whole list (O(n)); use a set if you check membership a lot",
      "sort() sorts in place and returns None, so never write nums = nums.sort()",
      "remove(x) deletes only the FIRST match and raises ValueError if x is missing"
    ],
    code: "nums = [3, 1, 4]\nnums.append(1)        # [3, 1, 4, 1]\nnums.extend([5, 9])   # [3, 1, 4, 1, 5, 9]\nnums.insert(0, 2)     # [2, 3, 1, 4, 1, 5, 9]\nnums.pop()            # removes & returns 9\nnums.pop(0)           # removes & returns 2\nnums.remove(1)        # first 1 only -> [3, 4, 1, 5]\nprint(nums.index(4), nums.count(1))  # 1 1\nnums.sort()           # [1, 3, 4, 5]\nnums.reverse()        # [5, 4, 3, 1]\nprint(nums)           # [5, 4, 3, 1]"
  },
  {
    type: "concept", topic: "list slicing",
    q: "Slicing: a[start:stop:step]",
    context: "Slices never raise IndexError and always return a NEW list. stop is exclusive.",
    points: [
      "a[:] or a.copy() is a shallow copy; nested lists are still shared",
      "Negative indexes count from the end: a[-1] is the last item, a[-3:] the last three",
      "a[::-1] reverses; a[::2] takes every other item",
      "Slice assignment can replace a range with a different number of items"
    ],
    code: "a = [0, 1, 2, 3, 4, 5]\nprint(a[1:4])    # [1, 2, 3]\nprint(a[::2])    # [0, 2, 4]\nprint(a[-3:])    # [3, 4, 5]\nprint(a[::-1])   # [5, 4, 3, 2, 1, 0]\nb = a[:]         # shallow copy\na[1:3] = ['x']   # replace two items with one\nprint(a)         # [0, 'x', 3, 4, 5]\nprint(len(b))    # 6 (copy unaffected)"
  },
  {
    type: "concept", topic: "dict",
    q: "Dictionaries: key → value lookups",
    context: "Hash map with O(1) average get, set and 'in'. Reach for it whenever you look something up by a key.",
    points: [
      "d.get(k, default) avoids KeyError; d[k] raises it if k is missing",
      "Keys must be hashable: str, int and tuple work; list does not",
      "Insertion order is preserved (Python 3.7+)",
      "Loop with .items() for (key, value) pairs; use .keys() / .values() when you need just one side"
    ],
    code: "d = {'apple': 3}\nd['pear'] = 5               # add / update\nprint(d.get('kiwi', 0))     # 0, no KeyError\nd.setdefault('fig', 0)      # insert only if missing\nd.update({'apple': 4})\nfor k, v in d.items():\n    print(k, v)             # apple 4 / pear 5 / fig 0\ndel d['fig']\nprint('pear' in d)          # True\nprint(list(d))              # ['apple', 'pear']"
  },
  {
    type: "concept", topic: "set",
    q: "Sets: fast membership and de-duplication",
    context: "Unordered collection of unique, hashable items. 'x in s' is O(1), versus O(n) for a list.",
    points: [
      "Use for 'have I seen this?' checks (visited nodes in BFS/DFS, duplicates)",
      "& intersection, | union, - difference, ^ symmetric difference",
      "discard(x) is safe if x is missing; remove(x) raises KeyError",
      "set() is an empty set; {} is an empty DICT"
    ],
    code: "seen = set()\nfor x in [3, 1, 3, 2, 1]:\n    seen.add(x)\nprint(seen)                 # {1, 2, 3}\nprint(2 in seen)            # True, O(1)\na, b = {1, 2, 3}, {2, 3, 4}\nprint(a & b, a | b)         # {2, 3} {1, 2, 3, 4}\nprint(a - b, a ^ b)         # {1} {1, 4}\nseen.discard(99)            # no error\n# dedupe but keep order:\nprint(list(dict.fromkeys([3, 1, 3, 2])))  # [3, 1, 2]"
  },
  {
    type: "concept", topic: "tuple",
    q: "Tuples and namedtuple",
    context: "Immutable sequences. Because they're hashable, they can be dict keys or set members, which lists can't.",
    points: [
      "Return several values from a function: return total, avg",
      "Use as composite keys: grid[(row, col)], visited.add((r, c))",
      "Unpack directly: x, y = point",
      "namedtuple (or a dataclass) gives readable field names"
    ],
    code: "from collections import namedtuple\n\npoint = (3, 4)\nx, y = point\nPoint = namedtuple('Point', 'x y')\np = Point(3, 4)\nprint(p.x, p[1])          # 3 4\nlocs = {(0, 0): 'home'}   # tuple as a dict key\nprint(locs[(0, 0)])       # home\nprint(len(point), point.count(3))  # 2 1"
  },
  {
    type: "concept", topic: "str",
    q: "String methods you should know cold",
    context: "Strings are immutable: every method returns a NEW string. Build big strings with ''.join(list), not += in a loop.",
    points: [
      "strip / lower / upper / replace return new strings",
      "split(sep) → list; sep.join(list) → string",
      "find returns -1 when missing; index raises ValueError",
      "isalpha / isdigit / isalnum are handy for parsing and validation"
    ],
    code: "s = '  Hello, World  '\nt = s.strip()                 # 'Hello, World'\nprint(t.lower(), t.upper())   # hello, world HELLO, WORLD\nprint(t.split(', '))          # ['Hello', 'World']\nprint('-'.join(['a', 'b']))   # a-b\nprint(t.replace('World', 'Py'))  # Hello, Py\nprint(t.startswith('He'), t.find('o'), t.count('l'))  # True 4 3\nprint('abc'.isalpha(), '42'.isdigit())  # True True"
  },
  {
    type: "concept", topic: "stack & queue",
    q: "Stack (list) vs queue (deque)",
    context: "Stack = last in, first out (undo, brackets, DFS). Queue = first in, first out (BFS, task processing).",
    points: [
      "Stack: list.append() to push, list.pop() to pop, stack[-1] to peek",
      "Queue: deque.append() to enqueue, deque.popleft() to dequeue, both O(1)",
      "Never use list.pop(0) as a queue: it's O(n)",
      "deque(maxlen=N) keeps a rolling window of the last N items"
    ],
    code: "stack = []\nstack.append(1); stack.append(2)\nprint(stack.pop())      # 2 (LIFO)\n\nfrom collections import deque\nq = deque()\nq.append('a'); q.append('b')\nprint(q.popleft())      # a (FIFO)\nprint(stack[-1], q[0])  # peek: 1 b\n\nlast3 = deque([1, 2, 3, 4, 5], maxlen=3)\nprint(list(last3))      # [3, 4, 5]"
  },
  {
    type: "concept", topic: "heapq",
    q: "Heaps with heapq: always get the smallest fast",
    context: "A min-heap stored in a plain list. Use it for top-k, scheduling by priority, merging sorted lists, and Dijkstra.",
    points: [
      "heappush / heappop are O(log n); h[0] peeks the minimum in O(1)",
      "Python only has a min-heap: push -x for a max-heap",
      "Push (priority, item) tuples to order by priority",
      "heapify(list) turns an existing list into a heap in O(n)"
    ],
    code: "import heapq\n\nh = []\nfor x in [5, 1, 8, 3]:\n    heapq.heappush(h, x)\nprint(heapq.heappop(h))   # 1, smallest first\nprint(h[0])               # 3, peek\nprint(heapq.nsmallest(2, [5, 1, 8, 3]))  # [1, 3]\n\nmaxh = []\nfor x in [5, 1, 8]:\n    heapq.heappush(maxh, -x)   # negate for max-heap\nprint(-heapq.heappop(maxh))    # 8\n\ntasks = [(2, 'write'), (1, 'test')]\nheapq.heapify(tasks)\nprint(heapq.heappop(tasks))    # (1, 'test')"
  },
  {
    type: "concept", topic: "Counter",
    q: "Counter: counting made trivial",
    context: "A dict subclass that counts hashable items. Missing keys return 0 instead of raising KeyError.",
    points: [
      "Counter(iterable) counts everything in one line",
      "most_common(k) returns the top-k (item, count) pairs",
      "Counter(a) == Counter(b) is a one-line anagram check",
      "Supports +, - and update() for merging counts"
    ],
    code: "from collections import Counter\n\nc = Counter('mississippi')\nprint(c['s'], c['z'])        # 4 0\nprint(c.most_common(2))      # [('i', 4), ('s', 4)]\nc.update('ss')\nprint(c['s'])                # 6\nprint(Counter('abc') == Counter('cab'))  # True"
  },
  {
    type: "concept", topic: "functions",
    q: "Functions: arguments, defaults, *args, **kwargs",
    context: "Clean signatures make code easy to read and test. Interviewers notice keyword-only args and sensible defaults.",
    points: [
      "Return several values as a tuple and unpack them at the call site",
      "A bare * makes the arguments after it keyword-only (precision=...)",
      "*args collects extra positional args into a tuple; **kwargs collects keyword args into a dict",
      "Never use a mutable default ([] or {}); use None and create it inside"
    ],
    code: "def stats(nums, *, precision=2):\n    total = sum(nums)\n    return total, round(total / len(nums), precision)\n\nt, avg = stats([1, 2, 4])\nprint(t, avg)        # 7 2.33\n\ndef log(msg, *tags, **meta):\n    print(msg, tags, meta)\n\nlog('deploy', 'prod', 'eu', build=42)\n# deploy ('prod', 'eu') {'build': 42}"
  },
  {
    type: "concept", topic: "key functions",
    q: "sorted, min, max with key= (and lambda / map / filter)",
    context: "key= tells Python WHAT to compare. It works the same way in sorted, min, max and heapq.nlargest.",
    points: [
      "key=len, key=str.lower, key=lambda p: p[1]: any one-argument function works",
      "Return a tuple from key to sort by several fields",
      "map and filter return lazy iterators; wrap them in list() to see the values",
      "A comprehension is usually more readable than map + filter"
    ],
    code: "words = ['kiwi', 'fig', 'banana']\nprint(sorted(words, key=len))     # ['fig', 'kiwi', 'banana']\nprint(max(words, key=len))        # banana\nprint(list(map(str.upper, words)))  # ['KIWI', 'FIG', 'BANANA']\nprint(list(filter(lambda w: 'i' in w, words)))  # ['kiwi', 'fig']\nprint([w.upper() for w in words if 'i' in w])   # ['KIWI', 'FIG']"
  },
  {
    type: "concept", topic: "comprehensions",
    q: "Dict, set and nested comprehensions",
    context: "The same [expr for x in it if cond] pattern builds dicts and sets too, and nested loops read left to right.",
    points: [
      "{k: v for ...} builds a dict; {x for ...} builds a set",
      "[x for row in matrix for x in row] flattens: the outer loop comes first",
      "zip(*matrix) transposes rows into columns",
      "Swap keys and values with {v: k for k, v in d.items()}"
    ],
    code: "nums = [1, 2, 3, 4]\nsquares = {n: n * n for n in nums}       # {1: 1, 2: 4, 3: 9, 4: 16}\nevens = {n for n in nums if n % 2 == 0}  # {2, 4}\nmatrix = [[1, 2], [3, 4]]\nflat = [x for row in matrix for x in row]          # [1, 2, 3, 4]\ntransposed = [list(c) for c in zip(*matrix)]       # [[1, 3], [2, 4]]\ninverted = {v: k for k, v in squares.items()}\nprint(evens, flat, transposed, inverted[9])  # {2, 4} [1, 2, 3, 4] [[1, 3], [2, 4]] 3"
  },
  {
    type: "concept", topic: "choosing a structure",
    q: "Which data structure? Big-O cheat sheet",
    context: "Most interview optimizations come down to swapping a list scan for a dict or set lookup.",
    points: [
      "Look up by key → dict. 'Seen it?' or de-duplicate → set",
      "Ordered with index access → list. Queue / BFS → deque",
      "Repeatedly need the smallest or largest → heapq. Counting → Counter",
      "Sorted data plus searching → bisect (binary search, O(log n))"
    ],
    code: "# Operation           list        dict / set   deque\n# get by index/key    O(1)        O(1)         O(n)\n# x in container      O(n)        O(1)         O(n)\n# append / add        O(1)        O(1)         O(1)\n# pop from end        O(1)        -            O(1)\n# pop/insert front    O(n)        -            O(1)\n# sort                O(n log n)\n\n# heapq: push/pop O(log n), peek O(1)\n# bisect on a sorted list: O(log n) search"
  },
  {
    type: "concept", topic: "dataclass",
    q: "@dataclass: classes without boilerplate",
    context: "Auto-generates __init__, __repr__ and __eq__. Great for modelling records such as releases, incidents and orders.",
    points: [
      "Declare fields with type hints; defaults go after required fields",
      "Use field(default_factory=list) for mutable defaults",
      "frozen=True makes instances immutable and hashable",
      "Prints nicely and compares by value out of the box"
    ],
    code: "from dataclasses import dataclass, field\n\n@dataclass\nclass Release:\n    version: str\n    services: list = field(default_factory=list)\n    healthy: bool = True\n\nr = Release('2.4.0')\nr.services.append('auth')\nprint(r)   # Release(version='2.4.0', services=['auth'], healthy=True)\nprint(r == Release('2.4.0', ['auth']))  # True"
  },
  {
    type: "concept", topic: "itertools",
    q: "itertools: combinations, permutations, prefix sums",
    context: "Ready-made iterator tools that replace nested loops in brute-force and counting problems.",
    points: [
      "combinations(items, k): choose k without regard to order",
      "permutations(items): every ordering (n! of them, so they grow fast)",
      "product(..., repeat=n) replaces nested for-loops",
      "accumulate gives prefix sums; groupby groups consecutive runs"
    ],
    code: "from itertools import combinations, permutations, product, accumulate, groupby\n\nprint(list(combinations([1, 2, 3], 2)))  # [(1, 2), (1, 3), (2, 3)]\nprint(len(list(permutations('abc'))))    # 6\nprint(list(product([0, 1], repeat=2)))   # [(0, 0), (0, 1), (1, 0), (1, 1)]\nprint(list(accumulate([1, 2, 3, 4])))    # [1, 3, 6, 10]\nprint([(k, len(list(g))) for k, g in groupby('aaabbc')])  # [('a', 3), ('b', 2), ('c', 1)]"
  },
  {
    type: "concept", topic: "recursion",
    q: "Recursion and memoization with @lru_cache",
    context: "Recursion = base case + smaller sub-problem. Add a cache when the same sub-problems repeat (dynamic programming).",
    points: [
      "Always write the base case first",
      "@lru_cache(maxsize=None) memoizes; plain recursive fib(50) would take forever",
      "Python's default recursion limit is about 1000 frames; use iteration for deep inputs",
      "Tree and graph problems are naturally recursive (depth, paths, DFS)"
    ],
    code: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib(50))   # 12586269025\n\ndef depth(tree):  # tree as nested dicts\n    return 1 + max((depth(c) for c in tree.values()), default=0)\n\nprint(depth({'a': {'b': {}}, 'c': {}}))  # 3"
  }
];

// ===========================================================================
// WEEK 1-2 BASICS: arrays (Python lists) and strings, from zero.
// Level 1 = Basics (week 1), level 2 = Easy (week 2). The board's weekly
// schedule (see PREP_WEEK_PATTERNS in board.html) mixes in harder levels
// from week 3 onward. Items are shown in the order listed within a level.
// ===========================================================================
var PYTHON_BASICS = [
  // ---------------- Level 1: lists ----------------
  {
    level: 1, type: "concept", topic: "list basics",
    q: "What is a list? (Python's array)",
    context: "A list holds items in order. Python has no separate 'array' for everyday use: a list IS the dynamic array, and it grows as you add items.",
    points: [
      "Create with square brackets: nums = [10, 20, 30]",
      "Indexes start at 0; nums[-1] is the last item",
      "len(nums) gives the number of items",
      "Lists are mutable: nums[1] = 25 changes the item in place",
      "Reading past the end (nums[3] here) raises IndexError"
    ],
    code: "nums = [10, 20, 30]\nprint(nums[0], nums[-1], len(nums))   # 10 30 3\nnums[1] = 25\nprint(nums)                            # [10, 25, 30]\nempty = []\nmixed = [1, 'two', 3.0]   # any types are allowed\nprint(len(empty), mixed)  # 0 [1, 'two', 3.0]"
  },
  {
    level: 1, type: "mcq", topic: "list indexing",
    q: "What does this print?",
    code: "nums = [5, 10, 15, 20]\nprint(nums[1], nums[-2])",
    options: ["10 15", "5 15", "10 20", "15 10"],
    answer: 0,
    explain: "Index 1 is the SECOND item (counting starts at 0), so 10. -2 counts back from the end: -1 is 20, -2 is 15."
  },
  {
    level: 1, type: "mcq", topic: "IndexError",
    q: "What happens?",
    code: "nums = [1, 2, 3]\nprint(nums[3])",
    options: ["3", "None", "IndexError", "0"],
    answer: 2,
    explain: "A 3-item list has indexes 0, 1 and 2. Index 3 doesn't exist, so Python raises IndexError: list index out of range. The last valid index is len(nums) - 1."
  },
  {
    level: 1, type: "concept", topic: "adding items",
    q: "Adding to a list: append, insert, extend",
    context: "Three ways to add, and picking the right one matters for speed and for the result you get.",
    points: [
      "append(x) adds ONE item at the end, which is fast (O(1))",
      "insert(i, x) adds at position i; it's slower because later items shift (O(n))",
      "extend(other) adds EACH item from another list",
      "a + b makes a NEW list and leaves a and b unchanged"
    ],
    code: "fruits = ['apple']\nfruits.append('banana')          # add one at the end\nfruits.insert(0, 'cherry')       # add at position 0\nfruits.extend(['kiwi', 'fig'])   # add many\nprint(fruits)  # ['cherry', 'apple', 'banana', 'kiwi', 'fig']\nboth = [1, 2] + [3]\nprint(both)    # [1, 2, 3]"
  },
  {
    level: 1, type: "mcq", topic: "append vs extend",
    q: "What does this print?",
    code: "a = [1, 2]\na.append([3, 4])\nprint(len(a))",
    options: ["4", "3", "2", "Error"],
    answer: 1,
    explain: "append adds its argument as ONE item, so the whole list [3, 4] becomes a single element: [1, 2, [3, 4]], which has length 3. extend([3, 4]) would give [1, 2, 3, 4], length 4."
  },
  {
    level: 1, type: "concept", topic: "removing items",
    q: "Removing from a list: remove, pop, del",
    context: "Remove by VALUE with remove(); remove by POSITION with pop() or del.",
    points: [
      "remove(x) deletes the first item equal to x and raises ValueError if it's missing",
      "pop() removes and RETURNS the last item; pop(i) does the same at index i",
      "del nums[i] deletes by index without returning anything",
      "clear() empties the whole list"
    ],
    code: "nums = [4, 7, 9, 7]\nnums.remove(7)        # first 7 -> [4, 9, 7]\nlast = nums.pop()     # 7 -> [4, 9]\nfirst = nums.pop(0)   # 4 -> [9]\ndel nums[0]           # -> []\nprint(nums, last, first)  # [] 7 4"
  },
  {
    level: 1, type: "concept", topic: "looping",
    q: "Looping over a list",
    context: "for x in list visits every item. Only use indexes when you actually need the position.",
    points: [
      "for t in temps: is the simplest and most Pythonic loop",
      "for i in range(len(temps)): gives you indexes when you need them",
      "Accumulator pattern: start total = 0 and add to it inside the loop",
      "Don't add or remove items in a list while looping over it; build a new list instead"
    ],
    code: "temps = [68, 72, 75]\nfor t in temps:\n    print(t)               # 68 / 72 / 75\nfor i in range(len(temps)):\n    print(i, temps[i])     # 0 68 / 1 72 / 2 75\ntotal = 0\nfor t in temps:\n    total += t\nprint(round(total / len(temps), 1))  # 71.7 (average)"
  },
  {
    level: 1, type: "mcq", topic: "loop + condition",
    q: "What does this print?",
    code: "nums = [1, 2, 3, 4]\ntotal = 0\nfor n in nums:\n    if n % 2 == 0:\n        total += n\nprint(total)",
    options: ["10", "6", "4", "2"],
    answer: 1,
    explain: "n % 2 == 0 is True only for even numbers, so the loop adds 2 + 4 = 6. % is the remainder operator."
  },
  {
    level: 1, type: "concept", topic: "built-in functions",
    q: "Built-ins that work on any list",
    context: "Before writing a loop, check whether a built-in already does the job. They're shorter and faster.",
    points: [
      "len, sum, min and max work on any list of numbers",
      "sorted(list) returns a NEW sorted list; reverse=True sorts largest first",
      "'x in list' checks whether x is there (True / False)",
      "list.count(x) counts how many times x appears"
    ],
    code: "scores = [88, 92, 79, 92]\nprint(len(scores), sum(scores))     # 4 351\nprint(min(scores), max(scores))     # 79 92\nprint(sorted(scores))               # [79, 88, 92, 92]\nprint(sorted(scores, reverse=True)) # [92, 92, 88, 79]\nprint(92 in scores, scores.count(92))  # True 2"
  },
  {
    level: 1, type: "mcq", topic: "sort vs sorted",
    q: "What does this print?",
    code: "a = [3, 1, 2]\nb = a.sort()\nprint(a, b)",
    options: ["[1, 2, 3] None", "[3, 1, 2] [1, 2, 3]", "[1, 2, 3] [1, 2, 3]", "Error"],
    answer: 0,
    explain: "a.sort() sorts the list IN PLACE and returns None, so a changes and b is None. Use b = sorted(a) when you want a new sorted list and the original kept."
  },
  {
    level: 1, type: "mcq", topic: "slicing basics",
    q: "What does this print?",
    code: "letters = ['a', 'b', 'c', 'd', 'e']\nprint(letters[1:3])",
    options: ["['b', 'c']", "['b', 'c', 'd']", "['a', 'b', 'c']", "['c', 'd']"],
    answer: 0,
    explain: "A slice [start:stop] includes start but EXCLUDES stop, so you get indexes 1 and 2. A handy rule: stop - start = number of items (3 - 1 = 2)."
  },
  {
    level: 1, type: "mcq", topic: "slicing basics",
    q: "What does this print?",
    code: "letters = ['a', 'b', 'c', 'd', 'e']\nprint(letters[:2] + letters[3:])",
    options: ["['a', 'b', 'd', 'e']", "['a', 'b', 'c', 'd', 'e']", "['a', 'd', 'e']", "['b', 'd', 'e']"],
    answer: 0,
    explain: "[:2] means 'from the start up to index 2' → ['a', 'b']. [3:] means 'from index 3 to the end' → ['d', 'e']. Together they skip 'c' at index 2, a common way to drop one item."
  },
  {
    level: 1, type: "tip", topic: "range",
    q: "range(): the numbers your loops walk through",
    code: "print(list(range(5)))          # [0, 1, 2, 3, 4]\nprint(list(range(2, 6)))       # [2, 3, 4, 5]\nprint(list(range(10, 0, -3)))  # [10, 7, 4, 1]\nfor i in range(3):\n    print('hi', i)             # hi 0 / hi 1 / hi 2",
    explain: "range(stop), range(start, stop) and range(start, stop, step). Like slices, stop is NOT included. A negative step counts down."
  },
  {
    level: 1, type: "mcq", topic: "range",
    q: "What does this print?",
    code: "print(list(range(1, 10, 4)))",
    options: ["[1, 5, 9]", "[1, 5]", "[1, 4, 7, 10]", "[4, 8]"],
    answer: 0,
    explain: "Start at 1 and add 4 each time: 1, 5, 9. The next value, 13, is past the stop of 10."
  },
  {
    level: 1, type: "code", topic: "find max manually",
    q: "Find the largest number in a list WITHOUT using max().",
    code: "def largest(nums):\n    best = nums[0]            # assume the first is biggest\n    for n in nums[1:]:\n        if n > best:\n            best = n          # found a bigger one\n    return best\n\nprint(largest([3, 9, 2, 7]))  # 9",
    explain: "Keep a 'best so far' variable and update it as you scan: one pass, O(n). Interviewers often ask for this by hand. Mention the edge case: an empty list would fail at nums[0]."
  },
  {
    level: 1, type: "code", topic: "count manually",
    q: "Count how many times a value appears, without .count().",
    code: "def count_of(nums, target):\n    count = 0\n    for n in nums:\n        if n == target:\n            count += 1\n    return count\n\nprint(count_of([1, 2, 1, 1], 1))  # 3",
    explain: "The counter pattern: start at 0 and add 1 every time a condition is true. The same shape works for 'how many even numbers', 'how many words longer than 5', and so on."
  },
  {
    level: 1, type: "code", topic: "reverse a list",
    q: "Reverse a list (three ways).",
    code: "nums = [1, 2, 3, 4]\nprint(nums[::-1])           # [4, 3, 2, 1]  new list\nprint(list(reversed(nums))) # [4, 3, 2, 1]  new list\n\n# in place, with two pointers (the interview version):\nl, r = 0, len(nums) - 1\nwhile l < r:\n    nums[l], nums[r] = nums[r], nums[l]   # swap\n    l += 1\n    r -= 1\nprint(nums)                 # [4, 3, 2, 1]",
    explain: "[::-1] is the quick answer. The two-pointer swap reverses in place with O(1) extra memory, and is the first two-pointer pattern worth learning."
  },
  {
    level: 1, type: "concept", topic: "2D lists",
    q: "Lists of lists (2D arrays / grids)",
    context: "A grid is a list of rows, and each row is a list. Access an item with grid[row][col].",
    points: [
      "len(grid) is the number of rows; len(grid[0]) is the number of columns",
      "Loop rows with for row in grid:, then cells with for x in row:",
      "Build an empty grid with a comprehension: [[0] * cols for _ in range(rows)]",
      "Never write [[0] * 3] * 2: every row would be the SAME list"
    ],
    code: "grid = [[1, 2, 3],\n        [4, 5, 6]]\nprint(grid[1][2])               # 6  (row 1, col 2)\nprint(len(grid), len(grid[0]))  # 2 3  rows, cols\nfor row in grid:\n    print(sum(row))             # 6 / 15\nblank = [[0] * 3 for _ in range(2)]\nprint(blank)                    # [[0, 0, 0], [0, 0, 0]]"
  },
  {
    level: 1, type: "tip", topic: "copying lists",
    q: "b = a does NOT copy a list",
    code: "nums = [1, 2, 3]\nsame = nums          # just a second name for the SAME list\ncopy = nums.copy()   # a real copy (nums[:] also works)\nnums.append(4)\nprint(same)          # [1, 2, 3, 4]\nprint(copy)          # [1, 2, 3]",
    explain: "Assignment never copies in Python; it only adds another name. Use .copy() or [:] when you need an independent list."
  },
  {
    level: 1, type: "tip", topic: "empty check",
    q: "Checking whether a list is empty",
    code: "nums = []\nif not nums:\n    print('empty')       # the Pythonic way\nif len(nums) == 0:\n    print('also empty')  # works, but longer\nnums.append(1)\nif nums:\n    print('has items')",
    explain: "An empty list counts as False and a non-empty list as True, so 'if not nums' reads naturally. The same rule applies to strings, dicts and sets."
  },
  {
    level: 1, type: "mcq", topic: "in operator",
    q: "What does this print?",
    code: "print(3 in [1, 2, 3], 'a' in 'cat', [1] in [1, 2])",
    options: ["True True False", "True True True", "True False False", "Error"],
    answer: 0,
    explain: "'in' checks membership: 3 is in the list, and 'a' is a substring of 'cat'. [1] is a LIST, and the list [1, 2] doesn't contain a list, only the numbers 1 and 2, so it's False."
  },
  // ---------------- Level 1: strings ----------------
  {
    level: 1, type: "concept", topic: "string basics",
    q: "Strings: text as a sequence of characters",
    context: "A string works like a read-only list of characters: you can index it, slice it, loop over it and use len().",
    points: [
      "Quotes: 'single' and \"double\" are the same thing",
      "s[0] is the first character and s[-1] the last",
      "Strings are IMMUTABLE: s[0] = 'J' raises TypeError",
      "To 'change' a string, build a new one: 'J' + s[1:]"
    ],
    code: "name = 'Python'\nprint(name[0], name[-1], len(name))  # P n 6\nprint('th' in name)                  # True\nprint(name[0:2])                     # Py\nnew = 'J' + name[1:]\nprint(new)                           # Jython"
  },
  {
    level: 1, type: "mcq", topic: "string indexing",
    q: "What does this print?",
    code: "s = 'hello'\nprint(s[1] + s[-1])",
    options: ["eo", "ho", "el", "ol"],
    answer: 0,
    explain: "s[1] is 'e' (the second character) and s[-1] is 'o' (the last one). + joins strings together."
  },
  {
    level: 1, type: "concept", topic: "string methods",
    q: "Everyday string methods",
    context: "Methods never change the original string; they return a NEW one. Save the result: s = s.strip().",
    points: [
      "strip() removes spaces from both ends (lstrip / rstrip for one side)",
      "lower() and upper() change case; compare text case-insensitively with a.lower() == b.lower()",
      "replace(old, new) swaps every occurrence",
      "count(x) counts occurrences; find(x) returns the position, or -1 if missing"
    ],
    code: "msg = '  Hi There  '\nprint(msg.strip())           # Hi There\nprint(msg.strip().upper())   # HI THERE\nprint('a-b-c'.replace('-', '+'))  # a+b+c\nprint('banana'.count('a'))   # 3\nprint('banana'.find('n'))    # 2\nprint('banana'.find('z'))    # -1"
  },
  {
    level: 1, type: "mcq", topic: "immutable strings",
    q: "What does this print?",
    code: "s = 'cat'\ns.upper()\nprint(s)",
    options: ["cat", "CAT", "Cat", "None"],
    answer: 0,
    explain: "upper() RETURNS a new string, but the result was thrown away and s itself never changes. Write s = s.upper() to keep it."
  },
  {
    level: 1, type: "concept", topic: "split & join",
    q: "split() and join(): converting between strings and lists",
    context: "split breaks a string into a list; join glues a list of strings back together. You'll use this pair constantly.",
    points: [
      "'a,b,c'.split(',') gives ['a', 'b', 'c']",
      "split() with no argument splits on any whitespace and ignores extra spaces",
      "join is called ON the separator: ', '.join(words)",
      "join needs strings; convert numbers first with str(n)"
    ],
    code: "line = 'red,green,blue'\ncolors = line.split(',')\nprint(colors, len(colors))   # ['red', 'green', 'blue'] 3\nprint(' | '.join(colors))    # red | green | blue\nprint('the  quick fox'.split())  # ['the', 'quick', 'fox']\nprint('-'.join(str(n) for n in [1, 2, 3]))  # 1-2-3"
  },
  {
    level: 1, type: "mcq", topic: "split",
    q: "What does this print?",
    code: "print('a b c'.split())",
    options: ["['a', 'b', 'c']", "['a b c']", "['a', ' ', 'b', ' ', 'c']", "('a', 'b', 'c')"],
    answer: 0,
    explain: "split() with no argument splits on whitespace and returns a LIST of the words. Use list('abc') to split a string into single characters."
  },
  {
    level: 1, type: "concept", topic: "looping strings",
    q: "Looping over a string and building a new one",
    context: "for ch in word visits each character. To build a result, collect pieces in a list and join them once at the end.",
    points: [
      "'ch in \"aeiou\"' is a quick test for a vowel",
      "Counter pattern: vowels += 1 inside an if",
      "Build with parts.append(...) and then ''.join(parts)",
      "s += ch inside a loop works, but copies the string every time"
    ],
    code: "word = 'hello'\nvowels = 0\nfor ch in word:\n    if ch in 'aeiou':\n        vowels += 1\nprint(vowels)              # 2\nparts = []\nfor ch in word:\n    parts.append(ch.upper())\nprint(''.join(parts))      # HELLO\nprint('-'.join(word))      # h-e-l-l-o"
  },
  {
    level: 1, type: "code", topic: "palindrome",
    q: "Reverse a string, and check if a word is a palindrome.",
    code: "print('hello'[::-1])          # olleh\n\ndef is_palindrome(s):\n    s = s.lower()             # 'Level' -> 'level'\n    return s == s[::-1]\n\nprint(is_palindrome('Level'))   # True\nprint(is_palindrome('Python'))  # False",
    explain: "[::-1] reverses any sequence. Lower-casing first makes the check case-insensitive. Follow-up interview version: ignore spaces and punctuation, or solve it with two pointers."
  },
  {
    level: 1, type: "mcq", topic: "string operators",
    q: "What does this print?",
    code: "print('ab' * 3 + 'c')",
    options: ["abababc", "ab3c", "Error", "aaabbbc"],
    answer: 0,
    explain: "* repeats a string ('ab' * 3 = 'ababab') and + joins strings. Both also work on lists: [0] * 3 is [0, 0, 0]."
  },
  {
    level: 1, type: "mcq", topic: "str + int",
    q: "What happens?",
    code: "age = 5\nprint('Age: ' + age)",
    options: ["Age: 5", "Age:5", "TypeError", "None"],
    answer: 2,
    explain: "Python won't silently mix str and int: 'can only concatenate str (not \"int\") to str'. Fix it with 'Age: ' + str(age) or, better, f'Age: {age}'."
  },
  {
    level: 1, type: "concept", topic: "f-strings",
    q: "f-strings: the easy way to build text",
    context: "Put f before the quotes and any expression inside {} gets filled in. It's the modern, readable way to format.",
    points: [
      "f'{name} scored {score}' inserts the variable values",
      "{score:.1f} rounds to 1 decimal place; {n:,} adds thousands commas",
      "Any expression works: f'{len(items)} items'",
      "Use str(x) when you really need + concatenation"
    ],
    code: "name, score = 'Asha', 93.456\nprint(f'{name} scored {score}')      # Asha scored 93.456\nprint(f'{name} scored {score:.1f}')  # Asha scored 93.5\nprint(f'{1234567:,}')                # 1,234,567\nitems = ['a', 'b']\nprint(f'{len(items)} items')         # 2 items"
  },
  {
    level: 1, type: "code", topic: "word count",
    q: "Count the words in a sentence, and find the longest word.",
    code: "def word_count(sentence):\n    return len(sentence.split())\n\ndef longest_word(sentence):\n    return max(sentence.split(), key=len)\n\ns = 'Python is fun to learn'\nprint(word_count(s))     # 5\nprint(longest_word(s))   # Python",
    explain: "split() turns the sentence into a list of words, and list tools do the rest. max(..., key=len) compares by length; on a tie it keeps the first word."
  },

  // ---------------- Level 2: easy (week 2) ----------------
  {
    level: 2, type: "concept", topic: "list comprehension",
    q: "List comprehensions, step by step",
    context: "A comprehension is a for-loop that builds a list, written in one line. Learn to translate between the two forms.",
    points: [
      "Shape: [expression for item in list]",
      "Add a filter: [n for n in nums if n % 2 == 1]",
      "Read it out loud: 'n times 2, for each n in nums'",
      "If it doesn't fit on one readable line, use a normal loop"
    ],
    code: "nums = [1, 2, 3, 4, 5]\n\ndoubled = []                 # loop version\nfor n in nums:\n    doubled.append(n * 2)\n\ndoubled = [n * 2 for n in nums]          # same, one line\nodds = [n for n in nums if n % 2 == 1]\nprint(doubled, odds)   # [2, 4, 6, 8, 10] [1, 3, 5]"
  },
  {
    level: 2, type: "concept", topic: "lists effectively",
    q: "Using lists effectively",
    context: "Small habits that make list code faster and cleaner, the kind interviewers notice.",
    points: [
      "Build with append or a comprehension; avoid list = list + [x] in a loop (it copies every time)",
      "Checking membership many times? Convert to a set once: O(1) lookups",
      "Need both index and value? Use enumerate, not range(len(...))",
      "Turning a list of values into text? Use ','.join(...) once at the end"
    ],
    code: "squares = [i * i for i in range(5)]      # [0, 1, 4, 9, 16]\nallowed = set(['a', 'b', 'c'])\nprint('b' in allowed)                    # True, O(1)\nfor i, v in enumerate(squares):\n    if v > 5:\n        print('first > 5 at index', i)   # first > 5 at index 3\n        break\nprint(','.join(str(x) for x in squares)) # 0,1,4,9,16"
  },
  {
    level: 2, type: "concept", topic: "strings effectively",
    q: "Using strings effectively",
    context: "Clean the input first, then compare or parse it. Most string bugs come from stray spaces and letter case.",
    points: [
      "strip() and lower() before comparing user input",
      "split() a string into parts and unpack them: user, domain = email.split('@')",
      "startswith / endswith read better than slicing comparisons",
      "Build long strings with ''.join(parts), not += in a loop"
    ],
    code: "email = '  Asha@Example.COM '\nclean = email.strip().lower()\nuser, domain = clean.split('@')\nprint(user, domain)              # asha example.com\nprint(clean.endswith('.com'))    # True\nprint(clean[:3])                 # ash\nprint('@' in clean)              # True"
  },
  {
    level: 2, type: "code", topic: "remove duplicates",
    q: "Remove duplicates from a list but KEEP the original order.",
    code: "def dedupe(nums):\n    seen = set()\n    out = []\n    for n in nums:\n        if n not in seen:\n            seen.add(n)\n            out.append(n)\n    return out\n\nprint(dedupe([3, 1, 3, 2, 1]))   # [3, 1, 2]\nprint(list(set([3, 1, 3, 2, 1]))) # [1, 2, 3], order NOT guaranteed",
    explain: "A set gives O(1) 'have I seen it?' checks and the list keeps the order, for O(n) overall. list(set(x)) is shorter but can reorder the items. The one-liner list(dict.fromkeys(nums)) also keeps order."
  },
  {
    level: 2, type: "code", topic: "second largest",
    q: "Find the second-largest DISTINCT number in one pass.",
    code: "def second_largest(nums):\n    first = second = float('-inf')\n    for n in nums:\n        if n > first:\n            first, second = n, first\n        elif first > n > second:\n            second = n\n    return second\n\nprint(second_largest([4, 9, 2, 9, 7]))  # 7",
    explain: "Track the top two as you go. The 'first > n > second' check skips duplicates of the max. One pass, O(n), versus sorting at O(n log n)."
  },
  {
    level: 2, type: "code", topic: "two pointers",
    q: "Move all zeros to the end of the list, in place, keeping the other numbers' order.",
    code: "def move_zeros(nums):\n    write = 0                      # next slot for a non-zero\n    for n in nums:\n        if n != 0:\n            nums[write] = n\n            write += 1\n    for i in range(write, len(nums)):\n        nums[i] = 0\n    return nums\n\nprint(move_zeros([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]",
    explain: "A 'write pointer' marks where the next kept item goes. This read/write two-pointer pattern also solves removing an element or deduping a sorted array in place."
  },
  {
    level: 2, type: "code", topic: "running sum",
    q: "Running (prefix) sum: each position holds the total so far.",
    code: "def running_sum(nums):\n    out, total = [], 0\n    for n in nums:\n        total += n\n        out.append(total)\n    return out\n\nprint(running_sum([1, 2, 3, 4]))   # [1, 3, 6, 10]",
    explain: "Prefix sums let you get the sum of any range in O(1) later: sum(i..j) = pre[j] - pre[i-1]. A building block for many array problems."
  },
  {
    level: 2, type: "code", topic: "rotate list",
    q: "Rotate a list to the right by k steps.",
    code: "def rotate(nums, k):\n    k %= len(nums)            # k may be bigger than the length\n    return nums[-k:] + nums[:-k]\n\nprint(rotate([1, 2, 3, 4, 5], 2))   # [4, 5, 1, 2, 3]\nprint(rotate([1, 2, 3], 4))         # [3, 1, 2]",
    explain: "Slice off the last k items and put them in front. k %= len handles k larger than the list. Follow-up: do it in place by reversing the whole list, then each part."
  },
  {
    level: 2, type: "code", topic: "merge sorted",
    q: "Merge two sorted lists into one sorted list.",
    code: "def merge(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    return out + a[i:] + b[j:]     # add leftovers\n\nprint(merge([1, 4, 7], [2, 3, 8]))  # [1, 2, 3, 4, 7, 8]",
    explain: "Two pointers, always taking the smaller front item: O(len(a) + len(b)). This is the heart of merge sort and of merging sorted logs."
  },
  {
    level: 2, type: "code", topic: "anagram",
    q: "Are two words anagrams (same letters, different order)?",
    code: "def is_anagram(a, b):\n    return sorted(a) == sorted(b)\n\nprint(is_anagram('listen', 'silent'))  # True\nprint(is_anagram('rat', 'car'))        # False\nprint(sorted('cab'))                   # ['a', 'b', 'c']",
    explain: "sorted() on a string returns its characters as a sorted list, so equal lists mean the same letters. That's O(n log n); comparing letter counts (dict or Counter) is O(n)."
  },
  {
    level: 2, type: "concept", topic: "char counting",
    q: "Counting characters with a dict",
    context: "'How many of each?' is one of the most common string tasks, and dict.get(key, 0) makes it a one-liner inside the loop.",
    points: [
      "counts.get(ch, 0) returns 0 the first time a character is seen",
      "Loop over counts.items() to read the results",
      "Find the most frequent character with max(counts, key=counts.get)",
      "Later you'll swap all this for collections.Counter"
    ],
    code: "word = 'banana'\ncounts = {}\nfor ch in word:\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)                     # {'b': 1, 'a': 3, 'n': 2}\nprint(max(counts, key=counts.get))  # a"
  },
  {
    level: 2, type: "code", topic: "word tricks",
    q: "Reverse the word order, and capitalise each word.",
    code: "s = 'hello big world'\nprint(' '.join(s.split()[::-1]))                     # world big hello\nprint(' '.join(w.capitalize() for w in s.split()))   # Hello Big World\nprint(s.title())                                     # Hello Big World",
    explain: "split → change the list → join is the universal recipe for word-level string problems. title() is the built-in shortcut for capitalising each word."
  },
  {
    level: 2, type: "concept", topic: "ord & chr",
    q: "Characters as numbers: ord() and chr()",
    context: "Every character has a number code. ord('a') is 97. Use it for letter positions, shifts and alphabet-sized counting arrays.",
    points: [
      "ord(ch) turns a character into a number; chr(n) turns it back",
      "ord(ch) - ord('a') gives a letter's position from 0 to 25",
      "A 26-slot list [0] * 26 can count lowercase letters",
      "isalpha, isdigit, isupper and islower check the type of a character"
    ],
    code: "print(ord('a'), chr(98))       # 97 b\nprint(ord('c') - ord('a'))     # 2 (letter position)\nshifted = ''.join(chr((ord(c) - 97 + 1) % 26 + 97) for c in 'xyz')\nprint(shifted)                 # yza (Caesar shift by 1)\nprint('a1'.isalnum(), 'A'.isupper())  # True True"
  },
  {
    level: 2, type: "mcq", topic: "slice with step",
    q: "What does this print?",
    code: "print('abcdef'[1:5:2])",
    options: ["bd", "bdf", "ace", "bcde"],
    answer: 0,
    explain: "Start at index 1 ('b'), step 2, and stop before index 5: indexes 1 and 3 → 'bd'. The step is the third number in [start:stop:step]."
  },
  {
    level: 2, type: "mcq", topic: "enumerate",
    q: "What does this print?",
    code: "for i, ch in enumerate('ab', start=1):\n    print(i, ch, end=' ')",
    options: ["1 a 2 b ", "0 a 1 b ", "a 1 b 2 ", "Error"],
    answer: 0,
    explain: "enumerate gives (index, item) pairs, and start=1 makes the counting begin at 1. end=' ' prints a space instead of a newline."
  }
];

// Difficulty for the original quiz/concept items (keyed by topic):
// 2 = easy, 3 = medium, 4 = advanced. Anything unlisted defaults to 3.
var PREP_LEVEL_BY_TOPIC = {
  "Slicing": 2, "enumerate": 2, "zip": 2, "is vs ==": 2, "List comprehension": 2,
  "Integer division": 2, "f-strings": 2, "Sets": 2, "Truthiness": 2,
  "Strings are immutable": 2, "Dict ordering & get": 2, "Tuples": 2, "join & split": 2,
  "list": 2, "list slicing": 2, "dict": 2, "set": 2, "str": 2,
  "Sliding window": 4, "Closures": 4, "Heap": 4, "Merge intervals": 4, "BFS": 4,
  "Decorators": 4, "Dynamic programming": 4, "Class vs instance attrs": 4,
  "heapq": 4, "dataclass": 4, "itertools": 4, "recursion": 4
};

PYTHON_BANK = PYTHON_BASICS.concat(PYTHON_BANK, PYTHON_CONCEPTS).map(function (it) {
  if (!it.level) it.level = PREP_LEVEL_BY_TOPIC[it.topic] || 3;
  return it;
});
