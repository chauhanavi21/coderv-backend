/**
 * Seed script for Extra Practice Quizzes.
 * Run AFTER the schema has been applied in Supabase SQL Editor.
 *
 *   node seedQuizzes.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ─────────────────────────────────────────────────────────────────────────────
// Quiz data — 6 quizzes, 10 questions each
// ─────────────────────────────────────────────────────────────────────────────
const QUIZZES = [
  {
    id: 'python-basics',
    title: 'Python Basics',
    description: '10 questions covering Python syntax, variables, loops, and functions',
    icon: '🐍',
    difficulty: 'easy',
    time_limit: 600,
    sort_order: 1,
    questions: [
      { q: 'What is the output of `print(type(42))`?', opts: ["<class 'float'>", "<class 'str'>", "<class 'int'>", "<class 'num'>"], a: 2 },
      { q: 'Which keyword is used to define a function in Python?', opts: ['func', 'define', 'function', 'def'], a: 3 },
      { q: 'What does `len([1, 2, 3])` return?', opts: ['2', '4', '3', '1'], a: 2 },
      { q: 'Which of these creates an empty dictionary?', opts: ['[]', '{}', '()', 'set()'], a: 1 },
      { q: 'What is the output of `2 ** 3`?', opts: ['6', '8', '9', '5'], a: 1 },
      { q: 'How do you start a comment in Python?', opts: ['//', '/*', '#', '--'], a: 2 },
      { q: 'What does `range(5)` produce?', opts: ['[1,2,3,4,5]', '[0,1,2,3,4]', '[0,1,2,3,4,5]', '[1,2,3,4]'], a: 1 },
      { q: 'Which method adds an item to the end of a list?', opts: ['add()', 'insert()', 'push()', 'append()'], a: 3 },
      { q: 'What is the result of `"hello"[1]`?', opts: ['h', 'e', 'l', 'he'], a: 1 },
      { q: 'What keyword exits a loop immediately?', opts: ['exit', 'stop', 'return', 'break'], a: 3 },
    ],
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: '10 questions covering arrays, lists, stacks, queues, and dictionaries',
    icon: '📊',
    difficulty: 'easy',
    time_limit: 720,
    sort_order: 2,
    questions: [
      { q: 'What is the time complexity of accessing an element in a Python list by index?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], a: 2 },
      { q: 'Which data structure uses LIFO (Last In, First Out)?', opts: ['Queue', 'Stack', 'List', 'Tree'], a: 1 },
      { q: 'Which data structure uses FIFO (First In, First Out)?', opts: ['Stack', 'Tree', 'Dictionary', 'Queue'], a: 3 },
      { q: 'What does `list.pop()` do by default?', opts: ['Removes first element', 'Removes last element', 'Removes all elements', 'Returns the first element'], a: 1 },
      { q: 'How do you check if a key exists in a Python dictionary?', opts: ['"key" in dict', 'dict.has("key")', 'dict.exists("key")', 'dict.find("key")'], a: 0 },
      { q: 'What is the average time complexity of dictionary lookup in Python?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], a: 3 },
      { q: 'Which of these is an immutable sequence in Python?', opts: ['list', 'set', 'dict', 'tuple'], a: 3 },
      { q: 'What does a set NOT allow?', opts: ['Strings', 'Duplicate values', 'Integers', 'Iteration'], a: 1 },
      { q: 'To implement a queue in Python, which module/class is most efficient?', opts: ['list with append/pop', 'tuple', 'collections.deque', 'dict'], a: 2 },
      { q: 'What is the worst-case time complexity of list.insert(0, x)?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2 },
    ],
  },
  {
    id: 'algorithms',
    title: 'Algorithms Challenge',
    description: '10 questions on sorting, searching, and recursion',
    icon: '🔄',
    difficulty: 'medium',
    time_limit: 900,
    sort_order: 3,
    questions: [
      { q: 'What is the best-case time complexity of binary search?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], a: 2 },
      { q: 'Which sorting algorithm has O(n log n) average case?', opts: ['Bubble sort', 'Insertion sort', 'Merge sort', 'Selection sort'], a: 2 },
      { q: 'What is the key idea behind divide and conquer?', opts: ['Use a hash table', 'Break the problem into smaller sub-problems', 'Sort first then search', 'Use dynamic programming'], a: 1 },
      { q: 'Which algorithm finds the shortest path in an unweighted graph?', opts: ['DFS', 'Dijkstra', 'BFS', 'Bellman-Ford'], a: 2 },
      { q: 'What is a base case in recursion?', opts: ['The first recursive call', 'A case that calls itself', 'The condition that stops recursion', 'The deepest stack frame'], a: 2 },
      { q: 'What is the time complexity of bubble sort in the worst case?', opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], a: 1 },
      { q: 'Which data structure is typically used to implement DFS?', opts: ['Queue', 'Priority Queue', 'Stack', 'Heap'], a: 2 },
      { q: 'What does memoization do in dynamic programming?', opts: ['Sorts results', 'Caches previously computed results', 'Removes duplicates', 'Reverses the array'], a: 1 },
      { q: 'What is the time complexity of linear search?', opts: ['O(1)', 'O(log n)', 'O(n log n)', 'O(n)'], a: 3 },
      { q: 'Which of these is NOT a stable sorting algorithm?', opts: ['Merge sort', 'Bubble sort', 'Heap sort', 'Insertion sort'], a: 2 },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: '10 questions on caching, load balancing, APIs, and distributed systems',
    icon: '🏗️',
    difficulty: 'medium',
    time_limit: 900,
    sort_order: 4,
    questions: [
      { q: 'What does a CDN (Content Delivery Network) primarily do?', opts: ['Encrypts data', 'Serves content from servers closer to the user', 'Manages databases', 'Handles authentication'], a: 1 },
      { q: 'What is a cache hit?', opts: ['A cache error', 'Data found in the cache', 'Data not in the cache', 'Cache overflow'], a: 1 },
      { q: 'What does horizontal scaling mean?', opts: ['Making one server faster', 'Adding more servers', 'Adding more RAM', 'Upgrading the CPU'], a: 1 },
      { q: 'Which HTTP status code means "Too Many Requests" (rate limited)?', opts: ['401', '404', '500', '429'], a: 3 },
      { q: 'What is the purpose of a load balancer?', opts: ['Encrypt traffic', 'Store session data', 'Distribute traffic across multiple servers', 'Cache responses'], a: 2 },
      { q: 'What does REST stand for?', opts: ['Rapid Event Streaming Transfer', 'Representational State Transfer', 'Resource Endpoint Structure Technology', 'Remote Execution Service Transfer'], a: 1 },
      { q: 'What is a message queue used for?', opts: ['Storing user sessions', 'Caching API responses', 'Decoupling services and handling async communication', 'Encrypting messages'], a: 2 },
      { q: 'Which consistency model guarantees all nodes see the same data at the same time?', opts: ['Eventual consistency', 'Strong consistency', 'Weak consistency', 'Causal consistency'], a: 1 },
      { q: 'What does idempotency mean in an API?', opts: ['The API is fast', 'Calling it multiple times has the same effect as calling it once', 'The API is stateless', 'The API uses caching'], a: 1 },
      { q: 'What is a circuit breaker pattern?', opts: ['A database replication strategy', 'A pattern that stops calling a failing service to prevent cascading failures', 'A load balancing technique', 'An encryption method'], a: 1 },
    ],
  },
  {
    id: 'databases',
    title: 'Database Systems',
    description: '10 questions on SQL, NoSQL, indexing, and database design',
    icon: '🗄️',
    difficulty: 'hard',
    time_limit: 900,
    sort_order: 5,
    questions: [
      { q: 'What does ACID stand for in databases?', opts: ['Array, Column, Index, Data', 'Atomicity, Consistency, Isolation, Durability', 'Access, Create, Insert, Delete', 'Assign, Connect, Insert, Delete'], a: 1 },
      { q: 'Which SQL clause filters rows AFTER grouping?', opts: ['WHERE', 'FILTER', 'GROUP BY', 'HAVING'], a: 3 },
      { q: 'What is a foreign key?', opts: ['A primary key in an encrypted table', 'A key that references the primary key of another table', 'A unique index on a column', 'A key used for authentication'], a: 1 },
      { q: 'What is database normalization?', opts: ['Speeding up queries with indexes', 'Replicating data across servers', 'Organizing data to reduce redundancy', 'Encrypting stored data'], a: 2 },
      { q: 'Which NoSQL database type stores data as key-value pairs?', opts: ['Document store (MongoDB)', 'Graph DB (Neo4j)', 'Column store (Cassandra)', 'Key-value store (Redis)'], a: 3 },
      { q: 'What does an index do in a database?', opts: ['Encrypts data', 'Creates a backup', 'Speeds up data retrieval at the cost of more storage', 'Removes duplicate rows'], a: 2 },
      { q: 'What is a JOIN in SQL?', opts: ['Splitting a table into two', 'Combining rows from two or more tables based on a related column', 'Deleting duplicate rows', 'Creating an index'], a: 1 },
      { q: 'What does SELECT DISTINCT do?', opts: ['Selects only NULL values', 'Selects encrypted rows', 'Returns only unique values', 'Selects the first row'], a: 2 },
      { q: 'What is eventual consistency in distributed databases?', opts: ['All nodes always have the same data', 'Data will become consistent given enough time', 'Transactions are always atomic', 'Queries always return fresh data'], a: 1 },
      { q: 'Which SQL command removes all rows from a table without deleting the table?', opts: ['DELETE', 'DROP', 'REMOVE', 'TRUNCATE'], a: 3 },
    ],
  },
  {
    id: 'oop-concepts',
    title: 'OOP Concepts',
    description: '10 questions on Object-Oriented Programming principles in Python',
    icon: '🧩',
    difficulty: 'hard',
    time_limit: 840,
    sort_order: 6,
    questions: [
      { q: 'What is encapsulation in OOP?', opts: ['Inheriting from a parent class', 'Bundling data and methods that operate on that data within one unit', 'Writing one function that works for multiple types', 'Hiding the implementation behind an interface'], a: 1 },
      { q: 'Which Python keyword is used to inherit from a class?', opts: ['extends', 'super', 'inherits', 'class Child(Parent):'], a: 3 },
      { q: 'What does `super()` do in Python?', opts: ['Creates a new instance', 'Calls the parent class method', 'Deletes the object', 'Defines a static method'], a: 1 },
      { q: 'What is polymorphism?', opts: ['Combining multiple classes into one', 'The ability of different objects to respond to the same method call', 'Hiding data from outside access', 'Defining a class inside another class'], a: 1 },
      { q: 'What is the `__init__` method?', opts: ['A destructor', 'A static method', 'A class-level method', 'A constructor called when an object is created'], a: 3 },
      { q: 'What does `@staticmethod` mean?', opts: ['The method can only be called on instances', 'The method belongs to the class but does not receive `self` or `cls`', 'The method is inherited automatically', 'The method cannot be overridden'], a: 1 },
      { q: 'What is abstraction in OOP?', opts: ['Storing data in a parent class', 'Hiding complex implementation details and showing only essentials', 'Creating multiple instances', 'Using global variables'], a: 1 },
      { q: 'Which principle states a class should have only one reason to change?', opts: ['Open/Closed Principle', 'Dependency Inversion', 'Single Responsibility Principle', 'Liskov Substitution'], a: 2 },
      { q: 'What is method overriding?', opts: ['Defining a new method in a child class with the same name as the parent', 'Creating two methods with the same name and different parameters', 'Calling a method twice', 'Deleting a parent method'], a: 0 },
      { q: 'What does `isinstance(obj, ClassName)` return?', opts: ['The class name', 'True if obj is an instance of ClassName', 'The number of instances', 'The parent class name'], a: 1 },
    ],
  },
];

async function insertBatch(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`[${table}] ${error.message}`);
}

async function seedQuizzes() {
  console.log('━━━ CoderV Quiz Seed ━━━');

  for (const quiz of QUIZZES) {
    const { questions, ...quizMeta } = quiz;

    // Upsert quiz metadata
    const { error: qErr } = await supabase
      .from('extra_quizzes')
      .upsert(quizMeta, { onConflict: 'id' });
    if (qErr) throw new Error(`[extra_quizzes] ${qErr.message}`);

    // Delete existing questions (clean re-seed)
    await supabase.from('extra_quiz_questions').delete().eq('quiz_id', quiz.id);

    // Insert questions
    const questionRows = questions.map((q, i) => ({
      quiz_id: quiz.id,
      sort_order: i,
      question_text: q.q,
      correct_index: q.a,
    }));
    await insertBatch('extra_quiz_questions', questionRows);

    // Fetch back IDs to link options
    const { data: insertedQs, error: fetchErr } = await supabase
      .from('extra_quiz_questions')
      .select('id, sort_order')
      .eq('quiz_id', quiz.id)
      .order('sort_order');
    if (fetchErr) throw fetchErr;

    // Insert options
    const optionRows = [];
    for (const row of insertedQs) {
      const q = questions[row.sort_order];
      q.opts.forEach((opt, oi) =>
        optionRows.push({ question_id: row.id, sort_order: oi, option_text: opt })
      );
    }
    await insertBatch('extra_quiz_options', optionRows);

    console.log(`  ✓ ${quiz.title} — ${questions.length} questions`);
  }

  console.log('\n━━━ Quiz seed complete! ━━━\n');
}

seedQuizzes().catch((err) => {
  console.error('\n✗ Quiz seed failed:', err.message);
  process.exit(1);
});
