// mockData.js
// Use this mock data to test the UI components without a backend.
// Replace with actual API responses when ready.

export const MOCK_SUBJECTS = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'webdev', name: 'Web Development' },
  { id: 'algorithms', name: 'Algorithms & Data Structures' },
  { id: 'databases', name: 'Database Systems' },
];

export const MOCK_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswerIndex: 2,
    explanation: 'In a balanced BST, the height of the tree is log(n), meaning each comparison halves the remaining search space, resulting in O(log n) time complexity.',
  },
  {
    id: 'q2',
    question: 'Which HTTP status code signifies that a client must authenticate itself to get the requested response?',
    options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Internal Server Error'],
    correctAnswerIndex: 0,
    explanation: '401 Unauthorized indicates that the request lacks valid authentication credentials. 403 Forbidden indicates the server understands the request but refuses to authorize it.',
  },
  {
    id: 'q3',
    question: 'In React, what hook would you use to perform side effects in functional components?',
    options: ['useState', 'useEffect', 'useMemo', 'useContext'],
    correctAnswerIndex: 1,
    explanation: 'useEffect serves the purpose of lifecycle methods (componentDidMount, componentDidUpdate, componentWillUnmount) combined for managing side effects.',
  },
  {
    id: 'q4',
    question: 'Which of the following data structures operates on a First-In, First-Out (FIFO) basis?',
    options: ['Stack', 'Queue', 'Binary Tree', 'Max Heap'],
    correctAnswerIndex: 1,
    explanation: 'A Queue works on the FIFO (First-In, First-Out) principle, where the first element added is the first one to be removed.',
  },
];

export const MOCK_HISTORY = [
  {
    id: 'att-1',
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    score: 8,
    totalQuestions: 10,
    date: '2026-09-20',
    details: [
      {
        question: 'What is the worst-case time complexity of QuickSort?',
        userAnswer: 'O(n^2)',
        correctAnswer: 'O(n^2)',
        isCorrect: true,
      },
      {
        question: 'Which data structure is used for Breadth-First Search (BFS)?',
        userAnswer: 'Queue',
        correctAnswer: 'Queue',
        isCorrect: true,
      },
      {
        question: 'Is a linked list indexed by default?',
        userAnswer: 'Yes',
        correctAnswer: 'No',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'att-2',
    subject: 'Web Development',
    topic: 'Modern CSS & Flexbox',
    difficulty: 'Easy',
    score: 10,
    totalQuestions: 10,
    date: '2026-09-18',
    details: [
      {
        question: 'What CSS property aligns items along the cross axis in Flexbox?',
        userAnswer: 'align-items',
        correctAnswer: 'align-items',
        isCorrect: true,
      },
    ],
  },
  {
    id: 'att-3',
    subject: 'Database Systems',
    topic: 'SQL Joins & Indexing',
    difficulty: 'Hard',
    score: 6,
    totalQuestions: 10,
    date: '2026-09-12',
    details: [
      {
        question: 'What type of index uses B-Trees in PostgreSQL by default?',
        userAnswer: 'B-Tree',
        correctAnswer: 'B-Tree',
        isCorrect: true,
      },
    ],
  },
];