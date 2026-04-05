export const STUDY_SUBJECTS = [
  {
    key: 'dsa',
    title: 'Data Structures & Algorithms',
    shortTitle: 'DSA',
    description: 'Practice the coding patterns, problem types, and repeat questions asked across companies.'
  },
  {
    key: 'oops',
    title: 'Object Oriented Programming',
    shortTitle: 'OOPs',
    description: 'Revise core OOP concepts, principles, and common design-oriented interview prompts.'
  },
  {
    key: 'os',
    title: 'Operating Systems',
    shortTitle: 'OS',
    description: 'Prepare process, thread, synchronization, memory, and scheduling concepts asked in interviews.'
  },
  {
    key: 'dbms',
    title: 'Database Management Systems',
    shortTitle: 'DBMS',
    description: 'Cover SQL, normalization, transactions, indexing, and database design basics.'
  },
  {
    key: 'cn',
    title: 'Computer Networks',
    shortTitle: 'CN',
    description: 'Study networking fundamentals like protocols, TCP/IP, HTTP, DNS, and routing.'
  },
  {
    key: 'aptitude',
    title: 'Aptitude',
    shortTitle: 'Aptitude',
    description: 'Keep a shared bank of quantitative, logical reasoning, and puzzle-style questions.'
  },
  {
    key: 'system-design',
    title: 'System Design',
    shortTitle: 'System Design',
    description: 'Cover scalable architecture, API design, databases, caching, queues, and tradeoff discussions.'
  },
  {
    key: 'html',
    title: 'HTML',
    shortTitle: 'HTML',
    description: 'Revise semantic HTML, forms, accessibility, and structure-focused frontend questions.'
  },
  {
    key: 'css',
    title: 'CSS',
    shortTitle: 'CSS',
    description: 'Practice layouts, selectors, positioning, responsiveness, and browser rendering concepts.'
  },
  {
    key: 'javascript',
    title: 'JavaScript',
    shortTitle: 'JavaScript',
    description: 'Prepare closures, async behavior, event loop, prototypes, DOM, and language fundamentals.'
  },
  {
    key: 'python',
    title: 'Python',
    shortTitle: 'Python',
    description: 'Study Python syntax, data structures, OOP, iterators, decorators, and interview-focused coding patterns.'
  },
  {
    key: 'statistics',
    title: 'Statistics',
    shortTitle: 'Statistics',
    description: 'Focus on descriptive statistics, hypothesis testing, distributions, and analyst-focused concepts.'
  },
  {
    key: 'probability',
    title: 'Probability',
    shortTitle: 'Probability',
    description: 'Revise conditional probability, Bayes theorem, random variables, and expectation-based questions.'
  },
  {
    key: 'linear-algebra',
    title: 'Linear Algebra',
    shortTitle: 'Linear Algebra',
    description: 'Prepare vectors, matrices, eigenvalues, transformations, and ML-relevant fundamentals.'
  },
  {
    key: 'machine-learning',
    title: 'Machine Learning Algorithms',
    shortTitle: 'ML',
    description: 'Keep shared notes for regression, classification, clustering, trees, bias-variance, and evaluation metrics.'
  },
  {
    key: 'hr',
    title: 'HR & Behavioral',
    shortTitle: 'HR',
    description: 'Prepare personal, situational, and behavioral questions common across interviews.'
  }
];

export const getStudySubjectMeta = (subjectKey = '') =>
  STUDY_SUBJECTS.find((subject) => subject.key === subjectKey) || null;
