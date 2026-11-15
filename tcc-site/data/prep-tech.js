/* ============================================================================
 * TCC PREP+ — technical (CS) MCQ bank + coding problems
 * ---------------------------------------------------------------------------
 * Feeds the technical MCQ section and the coding round of the multi-round
 * paper engine. Everything here is ORIGINAL TCC writing: the CS concepts are
 * common property, but the wording, the code, the expected approaches and the
 * explanations were written for TCC.
 * ==========================================================================*/

'use strict';

/* ── technical MCQ bank (used by the `tech: ['cs']` sections) ──────────── */
const CS = [
  { q: 'Which data structure gives O(1) average lookup by key?', options: ['Array', 'Hash table', 'Linked list', 'Binary tree'], answer: 1, explain: 'A hash table maps keys to buckets in constant average time; worst case can degrade to O(n).', topic: 'Data Structures' },
  { q: 'What is the time complexity of a balanced binary search tree lookup?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1, explain: 'Each comparison halves the remaining tree, giving logarithmic height-based lookup.', topic: 'Data Structures' },
  { q: 'Which normal form removes partial dependencies on a composite key?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1, explain: '2NF removes partial dependencies of non-key attributes on part of a composite primary key.', topic: 'DBMS' },
  { q: 'In SQL, which clause filters rows after aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], answer: 1, explain: 'WHERE filters before grouping; HAVING filters the aggregated groups.', topic: 'DBMS' },
  { q: 'What does an index primarily speed up?', options: ['Inserts', 'Deletes', 'Reads', 'Schema changes'], answer: 2, explain: 'Indexes speed reads at the cost of slower writes, because the index must be maintained too.', topic: 'DBMS' },
  { q: 'Which scheduling algorithm can cause starvation?', options: ['Round robin', 'Shortest job first', 'First come first served', 'FIFO'], answer: 1, explain: 'Shortest job first can starve long jobs if short ones keep arriving.', topic: 'Operating Systems' },
  { q: 'What is thrashing in an operating system?', options: ['High CPU use', 'Excessive paging', 'Disk failure', 'Deadlock'], answer: 1, explain: 'Thrashing is excessive page swapping that leaves little time for useful work.', topic: 'Operating Systems' },
  { q: 'A deadlock requires which four conditions?', options: ['Mutual exclusion, hold and wait, no preemption, circular wait', 'Caching, paging, swapping, locking', 'Fork, exec, wait, exit', 'Read, write, lock, unlock'], answer: 0, explain: 'All four Coffman conditions must hold simultaneously for a deadlock.', topic: 'Operating Systems' },
  { q: 'What is the main advantage of a thread over a process?', options: ['More memory', 'Cheaper context switching', 'Stronger isolation', 'Simpler code'], answer: 1, explain: 'Threads share an address space, so switching between them is cheaper than between processes.', topic: 'Operating Systems' },
  { q: 'Which layer of the OSI model routes packets between networks?', options: ['Data link', 'Network', 'Transport', 'Session'], answer: 1, explain: 'The network layer (layer 3) handles logical addressing and routing.', topic: 'Networking' },
  { q: 'Which protocol guarantees ordered, reliable delivery?', options: ['UDP', 'TCP', 'ICMP', 'ARP'], answer: 1, explain: 'TCP provides ordered, reliable, connection-oriented delivery; UDP does not.', topic: 'Networking' },
  { q: 'What does DNS resolve?', options: ['MAC to IP', 'Domain names to IP addresses', 'Ports to services', 'Packets to frames'], answer: 1, explain: 'DNS maps human-readable domain names to IP addresses.', topic: 'Networking' },
  { q: 'Which OOP principle hides internal state behind a public interface?', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], answer: 2, explain: 'Encapsulation bundles data with the methods that operate on it and controls access.', topic: 'OOP' },
  { q: 'Method overloading is an example of which?', options: ['Runtime polymorphism', 'Compile-time polymorphism', 'Encapsulation', 'Inheritance'], answer: 1, explain: 'Overloading is resolved at compile time based on the signature; overriding is runtime.', topic: 'OOP' },
  { q: 'In OOP, what does an abstract class require of subclasses?', options: ['Nothing', 'Implementation of abstract methods', 'A constructor only', 'A static method'], answer: 1, explain: 'Concrete subclasses must implement the abstract methods declared by the parent.', topic: 'OOP' },
  { q: 'What is the space complexity of storing an n x n matrix?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], answer: 2, explain: 'An n x n matrix holds n² elements.', topic: 'Complexity' },
  { q: 'Which sorting algorithm is stable and runs in O(n log n) worst case?', options: ['Quick sort', 'Heap sort', 'Merge sort', 'Selection sort'], answer: 2, explain: 'Merge sort guarantees O(n log n) and preserves the relative order of equal elements.', topic: 'Algorithms' },
  { q: 'Binary search requires which precondition?', options: ['Unique elements', 'A sorted array', 'Even length', 'Numeric keys'], answer: 1, explain: 'Binary search only works when the search space is ordered.', topic: 'Algorithms' },
  { q: 'What is the output of a post-order tree traversal?', options: ['Root first', 'Left, right, root', 'Root, left, right', 'Left, root, right'], answer: 1, explain: 'Post-order visits left subtree, right subtree, then the root — used for deletions.', topic: 'Data Structures' },
  { q: 'Which structure is ideal for implementing a priority queue?', options: ['Stack', 'Queue', 'Heap', 'Array'], answer: 2, explain: 'A binary heap gives O(log n) insert and extract-min/max.', topic: 'Data Structures' },
  { q: 'In a singly linked list, what is the cost of deleting the tail node?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, explain: 'You must walk to the node before the tail, which is O(n).', topic: 'Data Structures' },
  { q: 'What does the CAP theorem trade off?', options: ['Speed, size, cost', 'Consistency, availability, partition tolerance', 'Reads, writes, storage', 'Latency, throughput, jitter'], answer: 1, explain: 'A distributed system can fully guarantee only two of consistency, availability and partition tolerance.', topic: 'Systems' },
  { q: 'Which is a property of a good hash function?', options: ['Frequent collisions', 'Uniform distribution', 'Sequential output', 'Reversible for all inputs'], answer: 1, explain: 'Uniform distribution minimises collisions and keeps lookups near O(1).', topic: 'Data Structures' },
  { q: 'What is the purpose of a foreign key?', options: ['Speed up joins', 'Enforce referential integrity', 'Encrypt data', 'Sort rows'], answer: 1, explain: 'A foreign key ensures a value in one table matches a key in another.', topic: 'DBMS' },
  { q: 'Which of these is an ACID property of a transaction?', options: ['Atomicity', 'Availability', 'Agility', 'Asynchrony'], answer: 0, explain: 'ACID is atomicity, consistency, isolation, durability.', topic: 'DBMS' },
  { q: 'What does idempotency mean for an API operation?', options: ['It is fast', 'Repeating it has the same effect as doing it once', 'It is cached', 'It is encrypted'], answer: 1, explain: 'An idempotent operation can be retried safely without changing the end state.', topic: 'Systems' },
  { q: 'Which HTTP status code means "created"?', options: ['200', '201', '204', '301'], answer: 1, explain: '201 Created indicates a new resource was successfully created.', topic: 'Networking' },
  { q: 'What is memoisation?', options: ['Caching results of subproblems', 'Writing documentation', 'Compressing code', 'Freeing memory'], answer: 0, explain: 'Memoisation stores subproblem results so they are not recomputed — the core of dynamic programming.', topic: 'Algorithms' },
  { q: 'A greedy algorithm is correct when the problem has which property?', options: ['Overlapping subproblems', 'Optimal substructure with a greedy choice', 'Unsorted input', 'Constant size'], answer: 1, explain: 'A greedy choice must be safe: a locally optimal choice leads to a globally optimal solution.', topic: 'Algorithms' },
  { q: 'What is a race condition?', options: ['A sorting bug', 'Unpredictable output from unsynchronised concurrent access', 'A memory leak', 'A type error'], answer: 1, explain: 'When two threads access shared state without synchronisation, the result depends on timing.', topic: 'Operating Systems' },
  { q: 'Which data structure best detects whether a string has duplicate characters in one pass?', options: ['Stack', 'Hash set', 'Queue', 'Binary tree'], answer: 1, explain: 'A hash set gives O(1) membership checks, so one pass suffices.', topic: 'Data Structures' },
  { q: 'What does Big-O describe?', options: ['Exact runtime', 'An upper bound on growth', 'Memory size', 'Line count'], answer: 1, explain: 'Big-O gives an asymptotic upper bound on how the cost grows with input size.', topic: 'Complexity' },
  { q: 'Which traversal produces sorted output from a binary search tree?', options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], answer: 1, explain: 'In-order traversal of a BST visits nodes in ascending key order.', topic: 'Data Structures' },
  { q: 'What is the worst-case complexity of Quick sort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 2, explain: 'With a consistently poor pivot choice, partitioning degrades to O(n²).', topic: 'Algorithms' },
  { q: 'In Git, what does a merge conflict mean?', options: ['A lost commit', 'Two branches changed the same lines differently', 'A corrupt repo', 'A network error'], answer: 1, explain: 'Git cannot auto-merge when the same region was changed differently in both branches.', topic: 'Systems' },
  { q: 'What is the primary role of a load balancer?', options: ['Encrypt traffic', 'Distribute requests across servers', 'Compress responses', 'Cache pages'], answer: 1, explain: 'A load balancer spreads incoming requests to keep servers evenly used and available.', topic: 'Systems' },
  { q: 'Which is true of a stack in recursion?', options: ['It is unused', 'It stores each call frame', 'It stores heap objects', 'It stores files'], answer: 1, explain: 'Each recursive call pushes a frame with its parameters and locals.', topic: 'Data Structures' },
  { q: 'What does normalisation mainly reduce?', options: ['Query speed', 'Data redundancy', 'Storage cost of indexes', 'Number of tables'], answer: 1, explain: 'Normalisation removes redundant data and update anomalies, often adding joins.', topic: 'DBMS' },
  { q: 'Which of these best describes a microservice architecture?', options: ['One large deployable unit', 'Independently deployable services', 'A single database', 'A monolith split at build time'], answer: 1, explain: 'Microservices are small, independently deployable services with clear boundaries.', topic: 'Systems' },
  { q: 'What is the result of 5 & 3 in most languages (bitwise AND)?', options: ['1', '2', '7', '8'], answer: 0, explain: '5 = 101, 3 = 011; AND gives 001 = 1.', topic: 'Programming' },
  { q: 'What is the purpose of a try/catch block?', options: ['Speed up code', 'Handle exceptions gracefully', 'Declare variables', 'Free memory'], answer: 1, explain: 'It lets a program recover from or report runtime errors instead of crashing.', topic: 'Programming' }
];

/* ── coding problems ──────────────────────────────────────────────────────
   Each problem has a plain-English statement, one or more worked examples,
   and a `starter` per language. Grading of the coding round is done by the
   learner comparing against the shown expected outputs (and, where a live
   compiler is available, by running their code against the sample input).   */
const CODING = [
  {
    id: 'two-sum',
    title: 'Pair with a given sum',
    difficulty: 'Easy',
    topic: 'Hashing',
    statement: 'Given an array of integers and a target, return the indices of the two numbers that add up to the target. Exactly one solution exists, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', why: 'nums[0] + nums[1] = 2 + 7 = 9' }
    ],
    approach: 'Walk the array once, keeping a hash map from value to index. For each number, check whether (target − number) is already in the map. That turns an O(n²) double loop into O(n).',
    complexity: 'Time O(n), space O(n)',
    leaderboard_goal: 'Return any valid pair; order of indices does not matter.',
    testcases: [
      { input: '2 7 11 15\n9', output: '[0, 1]' },
      { input: '3 2 4\n6', output: '[1, 2]' },
      { input: '3 3\n6', output: '[0, 1]' }
    ],
    starter: {
      python: 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))',
      javascript: 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\nconsole.log(JSON.stringify(twoSum([2,7,11,15], 9)));',
      java: 'import java.util.*;\npublic class Main {\n  public static int[] twoSum(int[] nums, int target) {\n    Map<Integer,Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int need = target - nums[i];\n      if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n      seen.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n  public static void main(String[] a) {\n    System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));\n  }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<int> nums={2,7,11,15}; int target=9;\n  unordered_map<int,int> seen;\n  for(int i=0;i<(int)nums.size();i++){\n    int need=target-nums[i];\n    if(seen.count(need)){ cout<<"["<<seen[need]<<", "<<i<<"]"; return 0; }\n    seen[nums[i]]=i;\n  }\n  cout<<"[]";\n}'
    }
  },
  {
    id: 'reverse-string',
    title: 'Reverse a string in place',
    difficulty: 'Easy',
    topic: 'Two pointers',
    statement: 'Given a string (as an array of characters), reverse it in place using O(1) extra space and return the result.',
    examples: [
      { input: 's = "hello"', output: '"olleh"', why: 'Swapping from both ends inward reverses the string.' }
    ],
    approach: 'Use two pointers, one at each end. Swap the characters and move both inward until they meet. No extra array is needed.',
    complexity: 'Time O(n), space O(1)',
    leaderboard_goal: 'Do not allocate a second string of length n.',
    testcases: [
      { input: 'hello', output: 'olleh' },
      { input: 'abcd', output: 'dcba' },
      { input: 'x', output: 'x' }
    ],
    starter: {
      python: 'def reverse_string(s):\n    s = list(s)\n    i, j = 0, len(s) - 1\n    while i < j:\n        s[i], s[j] = s[j], s[i]\n        i, j = i + 1, j - 1\n    return "".join(s)\n\nprint(reverse_string("hello"))',
      javascript: 'function reverseString(s) {\n  const a = s.split("");\n  let i = 0, j = a.length - 1;\n  while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; }\n  return a.join("");\n}\nconsole.log(reverseString("hello"));',
      java: 'public class Main {\n  public static String reverse(String s) {\n    char[] a = s.toCharArray();\n    int i = 0, j = a.length - 1;\n    while (i < j) { char t = a[i]; a[i] = a[j]; a[j] = t; i++; j--; }\n    return new String(a);\n  }\n  public static void main(String[] x){ System.out.println(reverse("hello")); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s="hello";\n  int i=0,j=s.size()-1;\n  while(i<j) swap(s[i++],s[j--]);\n  cout<<s;\n}'
    }
  },
  {
    id: 'max-subarray',
    title: 'Maximum subarray sum',
    difficulty: 'Medium',
    topic: 'Dynamic programming',
    statement: 'Given an array of integers, find the contiguous subarray with the largest sum and return that sum.',
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', why: 'The subarray [4, -1, 2, 1] sums to 6.' }
    ],
    approach: "Kadane's algorithm: keep a running sum and reset it to the current element whenever it would drop below the element itself. Track the best sum seen. The recurrence is cur = max(x, cur + x).",
    complexity: 'Time O(n), space O(1)',
    leaderboard_goal: 'Handle all-negative arrays correctly (answer is the largest single element).',
    testcases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6' },
      { input: '1', output: '1' },
      { input: '-5 -2 -8', output: '-2' }
    ],
    starter: {
      python: 'def max_subarray(nums):\n    best = cur = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    return best\n\nprint(max_subarray([-2,1,-3,4,-1,2,1,-5,4]))',
      javascript: 'function maxSubarray(nums) {\n  let best = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}\nconsole.log(maxSubarray([-2,1,-3,4,-1,2,1,-5,4]));',
      java: 'public class Main {\n  public static int maxSub(int[] nums){\n    int best=nums[0], cur=nums[0];\n    for(int i=1;i<nums.length;i++){ cur=Math.max(nums[i],cur+nums[i]); best=Math.max(best,cur); }\n    return best;\n  }\n  public static void main(String[] x){ System.out.println(maxSub(new int[]{-2,1,-3,4,-1,2,1,-5,4})); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<int> a={-2,1,-3,4,-1,2,1,-5,4};\n  int best=a[0], cur=a[0];\n  for(size_t i=1;i<a.size();i++){ cur=max(a[i],cur+a[i]); best=max(best,cur); }\n  cout<<best;\n}'
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Balanced brackets',
    difficulty: 'Easy',
    topic: 'Stack',
    statement: 'Given a string containing just the characters (, ), {, }, [ and ], decide whether the brackets are balanced and correctly nested.',
    examples: [
      { input: 's = "()[]{}"', output: 'true', why: 'Every opening bracket is closed by the matching type in order.' }
    ],
    approach: 'Push each opening bracket onto a stack. On a closing bracket, the top of the stack must be its matching opener, which you then pop. At the end the stack must be empty.',
    complexity: 'Time O(n), space O(n)',
    leaderboard_goal: 'Return false for an empty-stack close, like ")" or "(]".',
    testcases: [
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' },
      { input: '([)]', output: 'false' }
    ],
    starter: {
      python: 'def is_valid(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        else:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack\n\nprint(is_valid("()[]{}"))',
      javascript: 'function isValid(s) {\n  const pairs = { ")": "(", "]": "[", "}": "{" };\n  const stack = [];\n  for (const ch of s) {\n    if ("([{".includes(ch)) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}\nconsole.log(isValid("()[]{}"));',
      java: 'import java.util.*;\npublic class Main {\n  public static boolean valid(String s){\n    Map<Character,Character> p=new HashMap<>();\n    p.put(\')\',\'(\'); p.put(\']\',\'[\'); p.put(\'}\',\'{\');\n    Deque<Character> st=new ArrayDeque<>();\n    for(char c:s.toCharArray()){\n      if("([{".indexOf(c)>=0) st.push(c);\n      else if(st.isEmpty()||st.pop()!=p.get(c)) return false;\n    }\n    return st.isEmpty();\n  }\n  public static void main(String[] x){ System.out.println(valid("()[]{}")); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s="()[]{}"; stack<char> st; bool ok=true;\n  for(char c:s){\n    if(c==\'(\'||c==\'[\'||c==\'{\') st.push(c);\n    else { if(st.empty()){ok=false;break;} char t=st.top(); st.pop();\n      if((c==\')\'&&t!=\'(\')||(c==\']\'&&t!=\'[\')||(c==\'}\'&&t!=\'{\')){ok=false;break;} }\n  }\n  cout<<((ok&&st.empty())?"true":"false");\n}'
    }
  },
  {
    id: 'merge-intervals',
    title: 'Merge overlapping intervals',
    difficulty: 'Medium',
    topic: 'Sorting',
    statement: 'Given a list of intervals, merge all overlapping intervals and return the resulting list.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', why: '[1,3] and [2,6] overlap and merge into [1,6].' }
    ],
    approach: 'Sort intervals by start. Then sweep: if the next interval starts before or at the current end, extend the current end; otherwise push the finished interval and start a new one.',
    complexity: 'Time O(n log n) (sort dominates), space O(n)',
    leaderboard_goal: 'Treat touching intervals like [1,2] and [2,3] as overlapping.',
    testcases: [
      { input: '1 3 | 2 6 | 8 10 | 15 18', output: '[[1, 6], [8, 10], [15, 18]]' },
      { input: '1 4 | 4 5', output: '[[1, 5]]' }
    ],
    starter: {
      python: 'def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    out = []\n    for s, e in intervals:\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out\n\nprint(merge([[1,3],[2,6],[8,10],[15,18]]))',
      javascript: 'function merge(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const [s, e] of intervals) {\n    if (out.length && s <= out[out.length - 1][1]) out[out.length - 1][1] = Math.max(out[out.length - 1][1], e);\n    else out.push([s, e]);\n  }\n  return out;\n}\nconsole.log(JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]])));',
      java: 'import java.util.*;\npublic class Main {\n  public static int[][] merge(int[][] xs){\n    Arrays.sort(xs,(a,b)->a[0]-b[0]);\n    List<int[]> out=new ArrayList<>();\n    for(int[] x: xs){\n      if(!out.isEmpty() && x[0]<=out.get(out.size()-1)[1]) out.get(out.size()-1)[1]=Math.max(out.get(out.size()-1)[1],x[1]);\n      else out.add(new int[]{x[0],x[1]});\n    }\n    return out.toArray(new int[0][]);\n  }\n  public static void main(String[] a){ System.out.println(Arrays.deepToString(merge(new int[][]{{1,3},{2,6},{8,10},{15,18}}))); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<vector<int>> xs={{1,3},{2,6},{8,10},{15,18}};\n  sort(xs.begin(),xs.end());\n  vector<vector<int>> out;\n  for(auto &x: xs){\n    if(!out.empty() && x[0]<=out.back()[1]) out.back()[1]=max(out.back()[1],x[1]);\n    else out.push_back(x);\n  }\n  cout<<"[";\n  for(size_t i=0;i<out.size();i++){ cout<<"["<<out[i][0]<<", "<<out[i][1]<<"]"; if(i+1<out.size()) cout<<", "; }\n  cout<<"]";\n}'
    }
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz variant',
    difficulty: 'Easy',
    topic: 'Basics',
    statement: 'Print the numbers 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
    examples: [
      { input: 'n = 5', output: '1 2 Fizz 4 Buzz', why: '3 is a multiple of 3, 5 of 5.' }
    ],
    approach: 'Loop from 1 to n. Check divisibility by 15 first, then 3, then 5, then fall through to the number.',
    complexity: 'Time O(n), space O(1)',
    leaderboard_goal: 'Check 15 before 3 and 5, or you will print Fizz/Buzz instead of FizzBuzz.',
    testcases: [
      { input: '5', output: '1 2 Fizz 4 Buzz' },
      { input: '15', output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz' }
    ],
    starter: {
      python: 'def fizzbuzz(n):\n    out = []\n    for i in range(1, n + 1):\n        if i % 15 == 0: out.append("FizzBuzz")\n        elif i % 3 == 0: out.append("Fizz")\n        elif i % 5 == 0: out.append("Buzz")\n        else: out.append(str(i))\n    return " ".join(out)\n\nprint(fizzbuzz(5))',
      javascript: 'function fizzbuzz(n) {\n  const out = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) out.push("FizzBuzz");\n    else if (i % 3 === 0) out.push("Fizz");\n    else if (i % 5 === 0) out.push("Buzz");\n    else out.push(String(i));\n  }\n  return out.join(" ");\n}\nconsole.log(fizzbuzz(5));',
      java: 'public class Main {\n  public static void main(String[] x){\n    StringBuilder sb=new StringBuilder();\n    for(int i=1;i<=5;i++){\n      if(i%15==0) sb.append("FizzBuzz");\n      else if(i%3==0) sb.append("Fizz");\n      else if(i%5==0) sb.append("Buzz");\n      else sb.append(i);\n      sb.append(" ");\n    }\n    System.out.println(sb.toString().trim());\n  }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  for(int i=1;i<=5;i++){\n    if(i%15==0) cout<<"FizzBuzz";\n    else if(i%3==0) cout<<"Fizz";\n    else if(i%5==0) cout<<"Buzz";\n    else cout<<i;\n    cout<<" ";\n  }\n}'
    }
  },
  {
    id: 'binary-search',
    title: 'Binary search',
    difficulty: 'Easy',
    topic: 'Searching',
    statement: 'Given a sorted array and a target, return the index of the target or -1 if it is not present. Your solution must run in O(log n).',
    examples: [
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', why: 'nums[4] = 9.' }
    ],
    approach: 'Maintain low and high pointers. Check the midpoint, then discard the half that cannot contain the target. Avoid overflow in the midpoint calculation with low + (high − low) / 2.',
    complexity: 'Time O(log n), space O(1)',
    leaderboard_goal: 'Return -1 cleanly when the target is absent.',
    testcases: [
      { input: '-1 0 3 5 9 12\n9', output: '4' },
      { input: '-1 0 3 5 9 12\n2', output: '-1' }
    ],
    starter: {
      python: 'def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if nums[mid] == target: return mid\n        if nums[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1\n\nprint(binary_search([-1,0,3,5,9,12], 9))',
      javascript: 'function binarySearch(nums, target) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([-1,0,3,5,9,12], 9));',
      java: 'public class Main {\n  public static int bs(int[] a,int t){\n    int lo=0,hi=a.length-1;\n    while(lo<=hi){ int m=lo+(hi-lo)/2; if(a[m]==t) return m; if(a[m]<t) lo=m+1; else hi=m-1; }\n    return -1;\n  }\n  public static void main(String[] x){ System.out.println(bs(new int[]{-1,0,3,5,9,12},9)); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  vector<int> a={-1,0,3,5,9,12}; int t=9, lo=0, hi=a.size()-1, ans=-1;\n  while(lo<=hi){ int m=lo+(hi-lo)/2; if(a[m]==t){ans=m;break;} if(a[m]<t) lo=m+1; else hi=m-1; }\n  cout<<ans;\n}'
    }
  },
  {
    id: 'first-unique-char',
    title: 'First non-repeating character',
    difficulty: 'Easy',
    topic: 'Hashing',
    statement: 'Given a string, return the index of the first character that appears exactly once. Return -1 if every character repeats.',
    examples: [
      { input: 's = "lovely"', output: '0', why: '"l" appears once and comes first.' }
    ],
    approach: 'Count occurrences in a hash map on a first pass, then walk the string again and return the first index whose count is 1.',
    complexity: 'Time O(n), space O(k) where k is the alphabet size',
    leaderboard_goal: 'Two passes is fine — do not try to do it in one.',
    testcases: [
      { input: 'lovely', output: '0' },
      { input: 'aabb', output: '-1' },
      { input: 'tccprep', output: '2' }
    ],
    starter: {
      python: 'def first_uniq(s):\n    from collections import Counter\n    c = Counter(s)\n    for i, ch in enumerate(s):\n        if c[ch] == 1: return i\n    return -1\n\nprint(first_uniq("lovely"))',
      javascript: 'function firstUniq(s) {\n  const c = {};\n  for (const ch of s) c[ch] = (c[ch] || 0) + 1;\n  for (let i = 0; i < s.length; i++) if (c[s[i]] === 1) return i;\n  return -1;\n}\nconsole.log(firstUniq("lovely"));',
      java: 'public class Main {\n  public static int firstUniq(String s){\n    int[] c=new int[256];\n    for(char ch:s.toCharArray()) c[ch]++;\n    for(int i=0;i<s.length();i++) if(c[s.charAt(i)]==1) return i;\n    return -1;\n  }\n  public static void main(String[] x){ System.out.println(firstUniq("lovely")); }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s="lovely"; int c[256]={0};\n  for(char ch:s) c[(unsigned char)ch]++;\n  for(int i=0;i<(int)s.size();i++) if(c[(unsigned char)s[i]]==1){ cout<<i; return 0; }\n  cout<<-1;\n}'
    }
  },
  {
    id: 'count-vowels',
    title: 'Count vowels and consonants',
    difficulty: 'Easy',
    topic: 'Strings',
    statement: 'Given a string, return the number of vowels and the number of consonants in it. Ignore spaces and punctuation.',
    examples: [
      { input: 's = "TCC Prep"', output: 'vowels 2, consonants 4', why: 'e is a vowel; T, C, C, P, r are consonants.' }
    ],
    approach: 'Lowercase the string, then walk it once, counting characters that are letters and checking membership in the vowel set.',
    complexity: 'Time O(n), space O(1)',
    leaderboard_goal: 'Do not count spaces or punctuation.',
    testcases: [
      { input: 'TCC Prep', output: 'vowels 2, consonants 4' },
      { input: 'aeiou', output: 'vowels 5, consonants 0' }
    ],
    starter: {
      python: 'def count(s):\n    v = c = 0\n    for ch in s.lower():\n        if ch.isalpha():\n            if ch in "aeiou": v += 1\n            else: c += 1\n    return f"vowels {v}, consonants {c}"\n\nprint(count("TCC Prep"))',
      javascript: 'function count(s) {\n  let v = 0, c = 0;\n  for (const ch of s.toLowerCase()) {\n    if (/[a-z]/.test(ch)) { if ("aeiou".includes(ch)) v++; else c++; }\n  }\n  return `vowels ${v}, consonants ${c}`;\n}\nconsole.log(count("TCC Prep"));',
      java: 'public class Main {\n  public static void main(String[] a){\n    String s="TCC Prep".toLowerCase(); int v=0,c=0;\n    for(char ch:s.toCharArray()) if(Character.isLetter(ch)){ if("aeiou".indexOf(ch)>=0) v++; else c++; }\n    System.out.println("vowels "+v+", consonants "+c);\n  }\n}',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s="TCC Prep"; int v=0,c=0;\n  for(char ch:s){ char l=tolower(ch); if(isalpha((unsigned char)l)){ if(string("aeiou").find(l)!=string::npos) v++; else c++; } }\n  cout<<"vowels "<<v<<", consonants "<<c;\n}'
    }
  }
];

module.exports = { CS, CODING };
