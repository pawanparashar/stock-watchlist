// Interview-prep question bank for the Live Board's two prep tiles.
// To add more questions, just append objects to the arrays below — the board
// picks one per 10-minute slot (same pick on every screen), so a longer list
// simply means a longer cycle before anything repeats.
//
// PYTHON item types:
//   { type: "mcq",  topic, q, code, options: [...], answer: <index>, explain }
//   { type: "tip",  topic, q, code, explain }            // trick to learn
//   { type: "code", topic, q, code, explain }            // coding problem; code = solution
//
// BEHAVIORAL items:
//   { q, theme, star: { s, t, a, r }, tip }
//   Sample answers are written for an engineering-manager profile (release
//   management, reliability, observability, global teams) — treat them as a
//   structure to copy, and swap in your own real stories and numbers.

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

var BEHAVIORAL_BANK = [
  {
    q: "Tell me about a production incident you led. What happened and what did you change afterward?",
    theme: "Ownership · Incident management",
    star: {
      s: "A config change in a release caused elevated API errors for a subset of customers during peak hours.",
      t: "As incident commander I had to restore service fast, keep stakeholders informed, and stop it recurring.",
      a: "Declared a SEV quickly, rolled back within minutes using our release tooling, assigned clear roles (comms, investigation, mitigation), and posted 15-minute status updates. Afterward I ran a blameless postmortem and added a config canary stage plus an automated error-rate gate on rollout.",
      r: "Customer impact was cut to about 20 minutes, and config-related incidents dropped sharply over the next two quarters."
    },
    tip: "Use real numbers (MTTR, error rate, customers affected) and spend most of the time on what you changed in the system, not on heroics."
  },
  {
    q: "Describe a time you disagreed with your manager or a senior leader.",
    theme: "Courage · Disagree and commit",
    star: {
      s: "Leadership wanted to ship a major release before a holiday freeze, but our reliability signals were still yellow.",
      t: "I needed to push back with data without blocking the business goal.",
      a: "I brought defect-trend, test-coverage and on-call load data, and proposed shipping a smaller, feature-flagged scope on time with the rest two weeks later.",
      r: "Leadership agreed. The core features launched on time with no SEVs over the holiday, and the rest shipped cleanly in January."
    },
    tip: "Show that you disagreed with data, offered an alternative, and would have committed fully if the decision had gone the other way."
  },
  {
    q: "Tell me about a time you had to deal with an underperforming engineer.",
    theme: "People management · Coaching",
    star: {
      s: "A strong engineer's output and code quality dropped noticeably over two sprints.",
      t: "I wanted to find the root cause and get them back on track, fairly and quickly.",
      a: "I held a private 1:1 that started with curiosity rather than judgment, found that unclear ownership plus a personal situation were behind it, adjusted their scope, set clear 30-day goals, and checked in weekly.",
      r: "Within about six weeks they were back to their previous level and later took ownership of a key component."
    },
    tip: "Show empathy and clear expectations together. Mention documentation and what you would do if things hadn't improved, which shows judgment."
  },
  {
    q: "How do you manage a team spread across time zones?",
    theme: "Global teams · Communication",
    star: {
      s: "My team spans the US and India, with very little overlap in working hours.",
      t: "Keep delivery moving and the team connected without burning anyone out on late calls.",
      a: "I made written-first communication the default (design docs, async standups), defined a short overlap window for decisions only, rotated meeting times so the same region didn't always carry the late slot, and set up follow-the-sun handoffs for releases and on-call.",
      r: "Cycle time improved, after-hours meetings went down, and engagement scores rose in both locations."
    },
    tip: "Describe concrete mechanisms (handoff templates, rotating meetings, documented decisions) rather than saying 'I communicate well'."
  },
  {
    q: "Tell me about a time you improved a process significantly.",
    theme: "Impact · Continuous improvement",
    star: {
      s: "Our release process was manual, took most of a day, and failed often.",
      t: "Make releases faster and safer without slowing down feature work.",
      a: "I mapped the pipeline, found the slowest manual gates, automated smoke and regression checks, added progressive rollout with automatic rollback on SLO breach, and tracked DORA metrics.",
      r: "Release time fell from hours to under an hour, change-failure rate dropped, and the team moved from weekly to daily deployments."
    },
    tip: "Quantify before and after. DORA metrics (deploy frequency, lead time, change-failure rate, MTTR) are an interviewer favorite."
  },
  {
    q: "Describe a time you failed. What did you learn?",
    theme: "Self-awareness · Growth",
    star: {
      s: "I committed to an aggressive timeline for an observability migration without enough discovery.",
      t: "Deliver the migration while keeping alerting reliable.",
      a: "Halfway through we hit gaps in legacy alert coverage. I reset expectations with stakeholders early, added a parallel-run phase, and re-planned with the team.",
      r: "We delivered about a month late with no missed alerts. Since then I always time-box a discovery spike before committing to dates."
    },
    tip: "Pick a real failure that you clearly owned. Most of the answer should be about the lesson and how you behave differently now."
  },
  {
    q: "How do you prioritize when everything is urgent?",
    theme: "Prioritization · Judgment",
    star: {
      s: "In one quarter we had a security remediation deadline, a big customer feature, and rising on-call pages all at once.",
      t: "Decide what to do first and get the stakeholders aligned.",
      a: "I ranked work by customer and business impact, risk and effort, protected roughly 20% of capacity for reliability, made the trade-offs visible in a one-page plan, and got explicit sign-off on what was deferred.",
      r: "We met the security deadline, shipped the feature one sprint later with stakeholders' agreement, and cut pages by about 30%."
    },
    tip: "Name the framework you use (impact vs effort, RICE) and stress that you make trade-offs explicit and agreed, not silent."
  },
  {
    q: "Tell me about a time you had to influence without authority.",
    theme: "Influence · Cross-team",
    star: {
      s: "A partner team's service caused many of our release rollbacks, but they didn't report to me.",
      t: "Get them to invest in fixes that weren't on their roadmap.",
      a: "I built a shared dashboard showing the impact on both teams, framed the problem around their own goals, proposed a joint, small-scope fix, and offered two of my engineers to pair with them.",
      r: "They prioritized it, rollbacks caused by that service nearly disappeared, and we set up a monthly joint reliability review."
    },
    tip: "Influence = data + empathy for their goals + making it easy for them to say yes."
  },
  {
    q: "How do you handle conflict between two engineers on your team?",
    theme: "Conflict resolution",
    star: {
      s: "Two senior engineers disagreed strongly over an architecture choice, and code reviews had become tense.",
      t: "Resolve the technical decision and repair the working relationship.",
      a: "I met each of them one-on-one to understand their concerns, then facilitated a session focused on written decision criteria, had them co-author an ADR, and made the final call where it was still a split.",
      r: "We shipped the chosen design, both engineers were credited on the ADR, and their collaboration improved noticeably."
    },
    tip: "Separate the people from the problem, and show you will make the call when consensus doesn't come."
  },
  {
    q: "Tell me about a time you had to deliver bad news to stakeholders.",
    theme: "Communication · Transparency",
    star: {
      s: "Two weeks before launch, load testing showed we would not hit our latency SLO.",
      t: "Tell the stakeholders and propose a path forward.",
      a: "I raised it immediately rather than hoping for a fix, explained the risk in business terms, and offered options: delay two weeks, or launch to 10% of traffic behind a flag.",
      r: "They chose the phased launch. We hit the SLO at full rollout three weeks later and trust went up because there were no surprises."
    },
    tip: "Escalate early, quantify the impact, and always bring options together with a recommendation."
  },
  {
    q: "How do you grow and develop the engineers on your team?",
    theme: "Coaching · Talent",
    star: {
      s: "Several mid-level engineers wanted to grow toward senior roles.",
      t: "Create real growth paths, not just feedback.",
      a: "I wrote individual growth plans tied to the career ladder, gave stretch ownership (release captain, incident commander rotations), paired them with senior mentors, and gave specific feedback every month.",
      r: "Three engineers were promoted within about a year, and attrition on the team stayed low."
    },
    tip: "Mention specific mechanisms and a measurable result such as promotions or retention."
  },
  {
    q: "Tell me about a time you made a decision with incomplete data.",
    theme: "Bias for action · Judgment",
    star: {
      s: "During an outage, the root cause was unclear and two teams' changes had gone out in the same window.",
      t: "Restore service quickly without making things worse.",
      a: "I weighed which change was easiest to reverse and lowest risk, rolled that one back first while keeping the investigation running in parallel, and set a 10-minute checkpoint to try the second option.",
      r: "The first rollback fixed it, service came back about 40 minutes sooner than waiting for full root cause, and we added change-correlation to our dashboards."
    },
    tip: "Show that you know which decisions are reversible: move fast on those and be careful with the irreversible ones."
  },
  {
    q: "Why are you looking for a new role?",
    theme: "Motivation",
    star: {
      s: "I've grown a lot in my current role, leading release management and reliability for a global team.",
      t: "Find a role with broader scope and impact.",
      a: "I'm looking for a team where I can apply what I've built (reliable delivery, observability, building strong teams) at a larger scale or in a new domain.",
      r: "This role matches that because [specific thing about the company or team]."
    },
    tip: "Stay positive and forward-looking, never criticize your current employer, and tie your answer to something specific about THIS company."
  },
  {
    q: "Tell me about a time you raised the bar on quality.",
    theme: "High standards",
    star: {
      s: "Flaky tests were causing engineers to ignore CI failures.",
      t: "Make CI trustworthy again.",
      a: "I tracked how flaky each test was, quarantined the worst offenders, made each fix owned by a team with an SLA, and blocked merges on any new flaky tests.",
      r: "CI pass reliability rose to about 98%, and engineers started trusting red builds again, which caught real bugs earlier."
    },
    tip: "Show how you turned a vague 'quality' goal into a metric with clear owners."
  },
  {
    q: "Describe a time you had to scale a team quickly.",
    theme: "Hiring · Scaling",
    star: {
      s: "We had approved headcount to grow the team by about 50% in two quarters.",
      t: "Hire fast without lowering the bar, and onboard the new people well.",
      a: "I structured interviews with clear rubrics, trained interviewers, built a 30-60-90 onboarding plan with a buddy system, and sequenced hires so senior engineers joined first.",
      r: "We filled the roles on time, new hires shipped to production in their first month, and every hire passed probation."
    },
    tip: "Hiring speed + quality bar + onboarding = a complete answer."
  },
  {
    q: "Tell me about a time you went above and beyond for a customer.",
    theme: "Customer obsession",
    star: {
      s: "An enterprise customer kept hitting intermittent failures that our metrics didn't show.",
      t: "Find the problem and win back their trust.",
      a: "I set up a joint debug session, added tracing for their specific traffic pattern, found an edge case at a timeout boundary, shipped a fix, and set up a dashboard they could watch.",
      r: "The failures stopped, the customer renewed, and the new tracing caught two similar issues for other customers."
    },
    tip: "Connect the customer's pain to a systemic improvement that helped more than one customer."
  },
  {
    q: "How do you balance technical debt against new features?",
    theme: "Strategy · Trade-offs",
    star: {
      s: "Product pressure kept pushing reliability work down the backlog, and incidents were rising.",
      t: "Win a sustainable investment in reducing debt.",
      a: "I used error budgets: when we were within SLO we shipped features freely, and when we burned the budget, reliability work took priority. I also reserved a fixed 20% of capacity and reported debt in business terms.",
      r: "Incidents fell, product partners accepted the model because it was based on data, and feature velocity actually went up."
    },
    tip: "Error budgets and SLOs are a strong, credible answer for an SRE-leaning manager."
  },
  {
    q: "Tell me about a time you received tough feedback.",
    theme: "Self-awareness · Coachability",
    star: {
      s: "A skip-level review said I was too involved in technical details and was becoming a bottleneck.",
      t: "Delegate more effectively.",
      a: "I asked for specific examples, defined clear decision rights for my leads, moved from approving designs to coaching on them, and asked for feedback again after a quarter.",
      r: "Decisions sped up, two leads grew noticeably, and I had more time for cross-team strategy."
    },
    tip: "Show that you asked questions instead of getting defensive, made a concrete change, and checked whether it worked."
  },
  {
    q: "Describe a large, cross-team project you led end to end.",
    theme: "Leadership · Execution",
    star: {
      s: "We had to move all services to a new observability platform within a hard vendor-contract deadline.",
      t: "Coordinate many teams and hit the date without losing any alerts.",
      a: "I built a migration playbook and tooling, ran it in waves starting with low-risk services, held a weekly cross-team sync with a RAG tracker, and parallel-ran alerting before each cutover.",
      r: "We finished before the deadline with no missed alerts, and the new platform cut monitoring costs significantly."
    },
    tip: "Show the structure you used: a phased plan, risk management, a communication cadence, and measurable results."
  },
  {
    q: "How do you build trust with a new team?",
    theme: "Leadership · Culture",
    star: {
      s: "I took over an existing team that had had several managers in a short time.",
      t: "Earn trust quickly and stabilize the team.",
      a: "I held listening 1:1s in the first two weeks, collected the team's top pain points, fixed two quick wins visibly, was open about what I didn't know yet, and did exactly what I said I would.",
      r: "Engagement scores went up within a quarter and attrition stopped."
    },
    tip: "Listen first, deliver early wins, and be consistent. Trust comes from doing what you said, repeatedly."
  },
  {
    q: "Tell me about a time you had to say no.",
    theme: "Focus · Stakeholder management",
    star: {
      s: "A senior stakeholder asked to slip a large feature into a release that was already locked.",
      t: "Protect release stability while keeping the relationship.",
      a: "I explained the risk using data from past late additions, offered a fast-follow release a week later, and offered to put it behind a flag if it was truly urgent.",
      r: "They accepted the fast-follow, the release went out cleanly, and the feature shipped a week later."
    },
    tip: "A good 'no' comes with a 'here's what I can do instead'."
  },
  {
    q: "How do you measure your team's success?",
    theme: "Metrics · Outcomes",
    star: {
      s: "My team's success had been measured mainly by tickets closed.",
      t: "Move to measures based on outcomes.",
      a: "I introduced a balanced scorecard: DORA metrics for delivery, SLO attainment for reliability, customer-impacting incidents, and team health (engagement, on-call load). We reviewed it monthly.",
      r: "The team focused on what mattered, and leadership began using the scorecard as a template for other teams."
    },
    tip: "Balance delivery, quality, customer outcomes and team health. Warn that any single metric gets gamed."
  },
  {
    q: "Tell me about a time you handled ambiguity.",
    theme: "Ambiguity · Initiative",
    star: {
      s: "I was asked to 'improve reliability' with no clear scope or definition.",
      t: "Turn the vague goal into a concrete plan.",
      a: "I analyzed six months of incidents, grouped the root causes, defined SLOs with product, picked the top three themes, and proposed a quarterly roadmap with success metrics.",
      r: "The plan was approved, and customer-impacting incidents dropped significantly over the following two quarters."
    },
    tip: "Show how you created clarity: gather data, frame the problem, propose a plan, and set metrics."
  },
  {
    q: "Describe a time you had to manage burnout on your team.",
    theme: "Team health · Empathy",
    star: {
      s: "On-call load spiked after a big launch, and engineers were visibly exhausted.",
      t: "Cut the load quickly and fix the cause.",
      a: "I added a secondary on-call, gave time off in lieu, ran a page-reduction sprint to remove noisy alerts and automate common fixes, and tracked pages per shift.",
      r: "Pages per shift dropped by more than half within a month, and the next engagement survey recovered."
    },
    tip: "Show both immediate relief and the systemic fix."
  },
  {
    q: "What's your management philosophy?",
    theme: "Leadership style",
    star: {
      s: "(Framework question, so answer with principles and an example.)",
      t: "Explain how you lead, in about 90 seconds.",
      a: "Three principles: (1) clarity, meaning everyone knows the goal and why it matters; (2) ownership, where I hand over problems rather than tasks; (3) psychological safety, with blameless postmortems and open disagreement. Then give one short story showing all three.",
      r: "The result is a team that ships reliably and grows its own leaders."
    },
    tip: "Keep it to three principles and back each one with a real example. Avoid buzzwords without evidence."
  },
  {
    q: "Tell me about a time you used data to change a decision.",
    theme: "Data-driven",
    star: {
      s: "The team believed most production bugs came from one legacy service.",
      t: "Confirm where our investment should actually go.",
      a: "I tagged six months of incidents by root cause and component, which showed that deployment configuration, not the legacy service, caused most of the problems.",
      r: "We redirected the planned rewrite effort to config validation, which prevented far more incidents for much less effort."
    },
    tip: "Good stories show data overturning an assumption, including your own."
  }
];
