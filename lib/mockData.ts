// lib/mockData.ts
export const mockStudents = {
  'student1': {
    id: 'student1',
    name: 'Alice Johnson',
    courses: [
      { name: 'Quantitative Methods', progress: 65, risk: 'Falling behind - complete assignments!' },
      { name: 'Data Structures', progress: 85, risk: null },
    ],
    gpaTrends: { labels: ['Sem 1', 'Sem 2', 'Current'], data: [3.2, 3.5, 3.4] }, 
    nudges: [
      'Assignment due in Quantitative Methods tomorrow!',
      'Review Data Structures notes for quiz.',
    ],
    resources: [
      { title: 'Quantitative Methods Notes', link: 'https://example.com/notes' },
      { title: 'Data Structures Tutorial', link: 'https://example.com/tutorial' },
    ],
  },
  'student2': {
    id: 'student2',
    name: 'Bob Smith',
    courses: [
      { name: 'Machine Learning', progress: 40, risk: 'High risk - study for upcoming exam.' },
      { name: 'Data Structures', progress: 70, risk: null },
    ],
    gpaTrends: { labels: ['Sem 1', 'Sem 2', 'Current'], data: [3.0, 3.1, 3.2] },
    nudges: [
      'Exam in Machine Learning in 3 days - review notes.',
      'Submit Data Structures project by next week!',
    ],
    resources: [
      { title: 'Past Papers for ML', link: 'https://example.com/papers' },
      { title: 'Khan Academy: Stats Basics', link: 'https://khanacademy.org/stats' },
    ],
  },
};
