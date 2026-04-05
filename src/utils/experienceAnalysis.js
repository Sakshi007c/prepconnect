const SUBJECT_KEYWORDS = {
  dsa: [
    'array', 'string', 'linked list', 'linkedlist', 'tree', 'graph', 'heap',
    'stack', 'queue', 'recursion', 'dynamic programming', 'dp', 'greedy',
    'binary search', 'sliding window', 'two pointer', 'backtracking',
    'sorting', 'trie', 'segment tree', 'hashmap', 'hash map', 'time complexity',
    'space complexity', 'leetcode', 'codeforces', 'algorithm', 'palindrome',
    'subarray', 'substring', 'bfs', 'dfs', 'topological sort',
    'array', 'string', 'linked list', 'linkedlist', 'tree', 'graph', 'heap',
    'stack', 'queue', 'recursion', 'dynamic programming', 'dp', 'greedy',
    'binary search', 'sliding window', 'two pointer', 'backtracking',
    'sorting', 'trie', 'segment tree', 'hashmap', 'hash map','time complexity', 'space complexity', 'algorithm',
    'substring', 'subarray', 'palindrome', 'permutation', 'combination','matrix', 'binary tree', 'bst', 'prefix', 'anagram','duplicate', 'search', 'insert', 'delete',
  'merge', 'sorted array', 'rotated array','island', 'graph traversal', 'bfs', 'dfs','topological', 'cache', 'lru','stock', 'peak', 'minimum', 'maximum','power', 'sqrt', 'two sum','longest substring without repeating characters',
  'median of two sorted arrays','longest palindromic substring','zigzag conversion','string to integer','container with most water','longest common prefix',
  'remove nth node from end of list','merge k sorted lists','swap nodes in pairs','remove duplicates from sorted array',
  'remove element','search in rotated sorted array','find first and last position','search insert position',
  'count and say','first missing positive','permutations','pow','n queens','maximum subarray','spiral matrix',
  'jump game','plus one','add binary','sqrt','climbing stairs','edit distance','search a 2d matrix','sort colors',
  'combinations','subsets','word search','largest rectangle in histogram','binary tree inorder traversal',
  'unique binary search trees','symmetric tree','level order traversal','construct binary tree','balanced binary tree',
  'flatten binary tree','pascal triangle','best time to buy and sell stock','number of islands',
  'course schedule','implement trie','contains duplicate','maximal square','invert binary tree',
  'kth smallest element','power of two','valid anagram','lru cache','binary tree postorder traversal',
  'container with most water',
  'dungeon game',
  'find first and last position of element in sorted array',
  'first missing positive',
  'house robber',
  'majority element',
  'missing ranges',
  'n-queens',
  'pascal\'s triangle',
  'pascal\'s triangle ii',
  'search insert position',
  'single number',
  'single number ii',
  'strobogrammatic number',
  'sum root to leaf numbers',
  'surrounded regions'
]
,
  
  oops: [
    'oops', 'oop', 'object oriented', 'class', 'object', 'inheritance',
    'polymorphism', 'abstraction', 'encapsulation', 'interface',
    'abstract class', 'constructor', 'virtual function', 'method overloading',
    'method overriding', 'solid', 'aggregation', 'composition', 'association',
    'dependency injection', 'singleton', 'factory pattern', 'design pattern'
  ],
  os: [
    'os', 'operating system', 'process', 'thread', 'deadlock', 'cpu scheduling',
    'paging', 'segmentation', 'virtual memory', 'mutex', 'semaphore',
    'critical section', 'context switch', 'race condition', 'starvation',
    'multithreading', 'scheduling', 'ipc', 'inter process communication'
  ],
  dbms: [
    'dbms', 'database', 'sql', 'normalization', 'transaction', 'acid',
    'join', 'index', 'primary key', 'foreign key', 'er diagram', 'locking',
    'concurrency control', 'query optimization', 'schema', 'candidate key',
    'stored procedure', 'trigger', 'cursor', 'nosql', 'mongodb'
  ]
};

const SUBJECT_ALIASES = {
  dsa: ['dsa', 'coding', 'coding round', 'algorithm', 'problem solving', 'leetcode'],
  oops: ['oops', 'oop', 'object oriented', 'll d', 'low level design'],
  os: ['os', 'operating system', 'computer networks and os', 'cn/os'],
  dbms: ['dbms', 'database', 'sql', 'database management'],
  other: ['hr', 'behavioral', 'behavioural', 'managerial', 'culture fit', 'resume', 'project', 'introduction']
};

const BEHAVIORAL_KEYWORDS = [
  'introduce yourself',
  'tell me about yourself',
  'why should we hire you',
  'why do you want to join',
  'why this company',
  'greatest strength',
  'greatest weakness',
  'conflict',
  'leadership',
  'team conflict',
  'challenge you faced',
  'project you are proud of',
  'resume',
  'internship experience',
  'deadline',
  'failure',
  'success story',
  'where do you see yourself',
  'hr round',
  'managerial round',
  'situation',
  'pressure',
  'teamwork'
];

const QUESTION_LEADERS = [
  'q.',
  'q:',
  'question:',
  'questions:',
  'asked:',
  'they asked',
  'asked me',
  'interviewer asked',
  'technical questions',
  'coding questions'
];

export const QUESTION_CATEGORIES = ['dsa', 'oops', 'os', 'dbms', 'other'];

const sanitizeQuestion = (question) => {
  return question
    .replace(/^[\s\-*\u2022\d.():]+/, '')
    .replace(/^(q(?:uestion)?s?[:. -]\s*)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeQuestion = (question) => {
  return sanitizeQuestion(question)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const detectExplicitSubject = (text = '') => {
  const lowerText = text.toLowerCase();

  for (const [category, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if (aliases.some((alias) => lowerText.includes(alias))) {
      return category;
    }
  }

  return null;
};

const scoreQuestionByKeywords = (question = '') => {
  const lowerQuestion = question.toLowerCase();
  const scores = Object.fromEntries(
    Object.keys(SUBJECT_KEYWORDS).map((category) => [category, 0])
  );

  Object.entries(SUBJECT_KEYWORDS).forEach(([category, keywords]) => {
    scores[category] = keywords.reduce(
      (count, keyword) => count + (lowerQuestion.includes(keyword) ? 1 : 0),
      0
    );
  }); 

  return scores;
};

export const classifyQuestionSubject = (question, contextHint = null) => {
  const lowerQuestion = question.toLowerCase();
  const explicitQuestionSubject = detectExplicitSubject(question);
  if (explicitQuestionSubject && explicitQuestionSubject !== 'other') {
    return explicitQuestionSubject;
  }

  if (BEHAVIORAL_KEYWORDS.some((keyword) => lowerQuestion.includes(keyword))) {
    return 'other';
  }

  const scores = scoreQuestionByKeywords(question);
  const rankedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestCategory, bestScore] = rankedScores[0];
  const secondScore = rankedScores[1]?.[1] || 0;

  if (contextHint && (bestScore === 0 || bestScore === secondScore)) {
    return contextHint;
  }

  if (bestScore === 0) {
    return contextHint || 'other';
  }

  if (bestScore === 1 && secondScore === 1) {
    return contextHint || bestCategory;
  }

  return bestCategory;
};

export const getFrequencyLabel = (count) => {
  if (count >= 6) return 'Very High';
  if (count >= 4) return 'High';
  if (count >= 2) return 'Medium';
  return 'Low';
};

export const createEmptyQuestionBuckets = () => ({
  dsa: [],
  oops: [],
  os: [],
  dbms: [],
  other: []
});

const normalizeContentForExtraction = (content = '') => {
  return content
    .replace(/\r/g, '\n')
    .replace(/(?:^|\s)(Q(?:uestion)?\s*\d+\s*[\]).:-]\s*)/gi, '\n$1')
    .replace(/(?:^|\s)(\d+\s*[\]).:-]\s*)(?=[A-Z(])/g, '\n$1')
    .replace(/(?:^|\s)([ivxlcdm]+\s*[\]).:-]\s*)(?=[A-Z(])/gi, '\n$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
};

const buildQuestionEntries = (content = '') => {
  if (!content.trim()) return [];

  const candidates = new Map();
  const normalizedContent = normalizeContentForExtraction(content);
  const lines = normalizedContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  let currentContext = null;

  lines.forEach((line) => {
    const explicitLineSubject = detectExplicitSubject(line);
    if (explicitLineSubject) {
      currentContext = explicitLineSubject;
    }

    const cleanLine = sanitizeQuestion(line);
    if (!cleanLine) return;

    if (cleanLine.includes('?')) {
      cleanLine
        .split('?')
        .map((part) => sanitizeQuestion(part))
        .filter(Boolean)
        .forEach((part) => {
          const question = `${part}?`;
          const key = normalizeQuestion(question);
          if (!candidates.has(key)) {
            candidates.set(key, { question, contextHint: currentContext });
          }
        });
      return;
    }

    if (
      QUESTION_LEADERS.some((leader) => cleanLine.toLowerCase().includes(leader)) ||
      /^(\d+[\].)]\s+|[-*\u2022]\s+)/.test(line)
    ) {
      const key = normalizeQuestion(cleanLine);
      if (!candidates.has(key)) {
        candidates.set(key, { question: cleanLine, contextHint: currentContext });
      }
    }
  });

  normalizedContent
    .split(/[.!?\n]/)
    .map((part) => sanitizeQuestion(part))
    .filter(Boolean)
    .forEach((part) => {
      const lowerPart = part.toLowerCase();
      if (
        QUESTION_LEADERS.some((leader) => lowerPart.includes(leader)) ||
        lowerPart.includes('difference between') ||
        lowerPart.startsWith('implement ') ||
        lowerPart.startsWith('design ') ||
        lowerPart.startsWith('write ') ||
        lowerPart.startsWith('explain ') ||
        lowerPart.startsWith('what is ') ||
        lowerPart.startsWith('how does ') ||
        lowerPart.startsWith('why ')
      ) {
        const question = part.endsWith('?') ? part : `${part}?`;
        const key = normalizeQuestion(question);
        if (!candidates.has(key)) {
          candidates.set(key, {
            question,
            contextHint: detectExplicitSubject(part)
          });
        }
      }
    });

  return Array.from(candidates.values()).filter(
    ({ question }) => sanitizeQuestion(question).length >= 8
  );
};

export const extractQuestionsFromContent = (content = '') => {
  return buildQuestionEntries(content).map(({ question }) => sanitizeQuestion(question));
};

export const buildQuestionsFromText = (content = '', source = 'experience') => {
  const buckets = {
    dsa: new Map(),
    oops: new Map(),
    os: new Map(),
    dbms: new Map(),
    other: new Map()
  };

  buildQuestionEntries(content).forEach(({ question, contextHint }) => {
    const normalized = normalizeQuestion(question);
    if (!normalized) return;

    const category = classifyQuestionSubject(question, contextHint);
    const bucket = buckets[category];
    const current = bucket.get(normalized) || {
      q: sanitizeQuestion(question),
      freqCount: 0,
      source
    };

    current.freqCount += 1;
    current.freq = getFrequencyLabel(current.freqCount);
    if (category === 'dsa' && !current.difficulty) {
      current.difficulty = 'Medium';
    }

    bucket.set(normalized, current);
  });

  return Object.fromEntries(
    QUESTION_CATEGORIES.map((category) => [
      category,
      Array.from(buckets[category].values()).sort((a, b) => b.freqCount - a.freqCount || a.q.localeCompare(b.q))
    ])
  );
};

export const analyzeExperienceQuestions = (experiences = []) => {
  const companyQuestionMap = {};

  experiences.forEach((experience) => {
    const companyKey = (experience.company || '').trim().toLowerCase();
    if (!companyKey) return;

    if (!companyQuestionMap[companyKey]) {
      companyQuestionMap[companyKey] = {
        dsa: [],
        oops: [],
        os: [],
        dbms: [],
        other: []
      };
    }

    companyQuestionMap[companyKey] = mergeCompanyQuestions(
      companyQuestionMap[companyKey],
      buildQuestionsFromText(experience.content, 'experience')
    );
  });

  return companyQuestionMap;
};

export const mergeCompanyQuestions = (manualQuestions = {}, analyzedQuestions = {}) => {
  return QUESTION_CATEGORIES.reduce((merged, category) => {
    const bucket = new Map();
    const manualList = Array.isArray(manualQuestions?.[category]) ? manualQuestions[category] : [];
    const analyzedList = Array.isArray(analyzedQuestions?.[category]) ? analyzedQuestions[category] : [];

    manualList.forEach((item) => {
      const normalized = normalizeQuestion(item?.q || '');
      if (!normalized) return;

      bucket.set(normalized, {
        ...item,
        q: sanitizeQuestion(item.q),
        freqCount: item.freqCount || 0,
        source: item.source || 'manual'
      });
    });

    analyzedList.forEach((item) => {
      const normalized = normalizeQuestion(item?.q || '');
      if (!normalized) return;

      if (bucket.has(normalized)) {
        const existing = bucket.get(normalized);
        const combinedCount = Math.max(existing.freqCount || 0, item.freqCount || 0);
        bucket.set(normalized, {
          ...existing,
          freqCount: combinedCount,
          freq: combinedCount > 0 ? getFrequencyLabel(combinedCount) : (existing.freq || item.freq),
          source: existing.source === 'manual' ? `manual+${item.source || 'experience'}` : (item.source || 'experience')
        });
        return;
      }

      bucket.set(normalized, {
        ...item,
        q: sanitizeQuestion(item.q),
        source: item.source || 'experience'
      });
    });

    merged[category] = Array.from(bucket.values()).sort((a, b) => {
      const countDiff = (b.freqCount || 0) - (a.freqCount || 0);
      if (countDiff !== 0) return countDiff;
      return (a.q || '').localeCompare(b.q || '');
    });

    return merged;
  }, createEmptyQuestionBuckets());
};
