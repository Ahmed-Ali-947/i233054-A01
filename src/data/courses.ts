export const ATTENDANCE_THRESHOLD = 75;

export type Course = {
  id: string;
  name: string;
  code: string;
  instructor: string;
  accent: string;
  classesAttended: number;
  classesHeld: number;
  marks: number[];
  assignmentTitle: string;
  assignmentDue: string | null;
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'algorithms',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    instructor: 'Dr. Sara Malik',
    accent: '#457D67',
    classesAttended: 15,
    classesHeld: 20,
    marks: [72, 78, 75, 81],
    assignmentTitle: 'Graph traversal problem set',
    assignmentDue: '2026-10-08',
  },
  {
    id: 'databases',
    name: 'Database Systems',
    code: 'CS315',
    instructor: 'Prof. Imran Shah',
    accent: '#6D75AF',
    classesAttended: 13,
    classesHeld: 18,
    marks: [68, 74, 79, 76],
    assignmentTitle: 'Library schema & SQL queries',
    assignmentDue: '2026-10-05',
  },
  {
    id: 'networks',
    name: 'Computer Networks',
    code: 'CS322',
    instructor: 'Dr. Noor Ahmed',
    accent: '#D38B4D',
    classesAttended: 17,
    classesHeld: 20,
    marks: [81, 77, 84, 88],
    assignmentTitle: 'Packet capture lab report',
    assignmentDue: '2026-10-17',
  },
  {
    id: 'statistics',
    name: 'Applied Statistics',
    code: 'MTH210',
    instructor: 'Dr. Hina Qureshi',
    accent: '#4B8C9B',
    classesAttended: 13,
    classesHeld: 19,
    marks: [75, 71, 78, 82],
    assignmentTitle: 'Confidence intervals worksheet',
    assignmentDue: '2026-10-22',
  },
  {
    id: 'design',
    name: 'Human-Computer Interaction',
    code: 'SE340',
    instructor: 'Ms. Layla Hassan',
    accent: '#B86F82',
    classesAttended: 10,
    classesHeld: 14,
    marks: [83, 79, 86, 84],
    assignmentTitle: 'Interface usability reflection',
    assignmentDue: null,
  },
];

export function isUpcomingAssignment(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(`${dueDate}T23:59:59`).getTime() >= Date.now();
}
