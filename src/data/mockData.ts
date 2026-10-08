export interface Course {
  id: string;
  code: string;
  title: string;
  professor: string;
  room: string;
  location: string;
  attended: number;
  total: number;
  type: 'Lab' | 'Theory';
  credits: number;
  targetPercentage: number;
}

export type Weekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface TimetableSlot {
  id: string;
  day: Weekday;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  professor: string;
  room: string;
  location: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isLab: boolean;
  labMultiplier?: number;
  status: 'attended' | 'upcoming' | 'active' | 'missed' | 'cancelled';
  elapsedMinutes?: number;
  remainingMinutes?: number;
}

export interface Assignment {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  room: string;
  weightage: string;
  dueDate: string;
  timeLeft: string;
  description: string;
  progressPercentage: number;
  milestones: string;
  status: 'pending' | 'submitted';
  category: 'urgent' | 'week' | 'upcoming';
  partners?: string[];
}

export interface Holiday {
  id: string;
  date: string;
  day: Weekday;
  title: string;
  type: 'Public' | 'Institutional' | 'Fest' | 'Exam Preparation';
  notes?: string;
}

export interface StudentProfile {
  name: string;
  rollNo: string;
  semester: string;
  branch: string;
  section: string;
  college: string;
  cgpa: number;
  targetRule: number;
  totalAttended: number;
  totalHeld: number;
}

export const initialProfile: StudentProfile = {
  name: 'Durga Prasad',
  rollNo: '22CS084',
  semester: 'Sem 5',
  branch: 'Computer Science & Engineering',
  section: 'A',
  college: 'Institute of Engineering & Technology',
  cgpa: 8.74,
  targetRule: 75.0,
  totalAttended: 92,
  totalHeld: 115,
};

export const initialCourses: Course[] = [
  {
    id: 'chem',
    code: 'CH-102',
    title: 'Engineering Chemistry',
    professor: 'Dr. V. Sharma',
    room: 'HALL 201',
    location: 'Science Block • 2F',
    attended: 17,
    total: 25,
    type: 'Theory',
    credits: 3,
    targetPercentage: 75.0,
  },
  {
    id: 'cn',
    code: 'CS-503',
    title: 'Computer Networks',
    professor: 'Prof. S. Rao',
    room: 'HALL 103',
    location: 'North Wing • 1F',
    attended: 33,
    total: 40,
    type: 'Theory',
    credits: 4,
    targetPercentage: 75.0,
  },
  {
    id: 'os',
    code: 'CS-402L',
    title: 'Operating Systems Lab',
    professor: 'Prof. M. Jenkins',
    room: 'LAB 402',
    location: 'Tech Block • 4F',
    attended: 21,
    total: 27,
    type: 'Lab',
    credits: 2,
    targetPercentage: 75.0,
  },
  {
    id: 'dbms',
    code: 'CS-502',
    title: 'Database Systems',
    professor: 'Prof. C. Thorne',
    room: 'LEC HALL 2',
    location: 'Central Wing • 2F',
    attended: 21,
    total: 23,
    type: 'Theory',
    credits: 4,
    targetPercentage: 75.0,
  },
];

export const initialTimetable: TimetableSlot[] = [
  // Monday
  {
    id: 'slot-mon-1',
    day: 'MON',
    courseId: 'cn',
    courseTitle: 'Computer Networks',
    courseCode: 'CS-503',
    professor: 'Prof. S. Rao',
    room: 'HALL 103',
    location: 'North Wing • 1F',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },
  {
    id: 'slot-mon-2',
    day: 'MON',
    courseId: 'dbms',
    courseTitle: 'Database Systems',
    courseCode: 'CS-502',
    professor: 'Prof. C. Thorne',
    room: 'LEC HALL 2',
    location: 'Central Wing • 2F',
    startTime: '10:45 AM',
    endTime: '12:15 PM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },
  {
    id: 'slot-mon-3',
    day: 'MON',
    courseId: 'chem',
    courseTitle: 'Engineering Chemistry',
    courseCode: 'CH-102',
    professor: 'Dr. V. Sharma',
    room: 'HALL 201',
    location: 'Science Block • 2F',
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },

  // Tuesday
  {
    id: 'slot-tue-1',
    day: 'TUE',
    courseId: 'os',
    courseTitle: 'Operating Systems Lab',
    courseCode: 'CS-402L',
    professor: 'Prof. M. Jenkins',
    room: 'LAB 402',
    location: 'Tech Block • 4F',
    startTime: '09:30 AM',
    endTime: '12:30 PM',
    durationMinutes: 180,
    isLab: true,
    labMultiplier: 2,
    status: 'attended',
  },
  {
    id: 'slot-tue-2',
    day: 'TUE',
    courseId: 'cn',
    courseTitle: 'Computer Networks Tutorial',
    courseCode: 'CS-503T',
    professor: 'Prof. S. Rao',
    room: 'ROOM 305',
    location: 'North Wing • 3F',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },

  // Wednesday
  {
    id: 'slot-wed-1',
    day: 'WED',
    courseId: 'chem',
    courseTitle: 'Engineering Chemistry',
    courseCode: 'CH-102',
    professor: 'Dr. V. Sharma',
    room: 'HALL 201',
    location: 'Science Block • 2F',
    startTime: '08:30 AM',
    endTime: '10:00 AM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },
  {
    id: 'slot-wed-2',
    day: 'WED',
    courseId: 'dbms',
    courseTitle: 'Database Systems Lab',
    courseCode: 'CS-502L',
    professor: 'Prof. C. Thorne',
    room: 'DATABASE LAB',
    location: 'Central Wing • 3F',
    startTime: '10:15 AM',
    endTime: '12:15 PM',
    durationMinutes: 120,
    isLab: true,
    labMultiplier: 2,
    status: 'attended',
  },

  // Thursday
  {
    id: 'slot-thu-1',
    day: 'THU',
    courseId: 'cn',
    courseTitle: 'Computer Networks',
    courseCode: 'CS-503',
    professor: 'Prof. S. Rao',
    room: 'HALL 103',
    location: 'North Wing • 1F',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },
  {
    id: 'slot-thu-2',
    day: 'THU',
    courseId: 'os',
    courseTitle: 'Operating Systems Theory',
    courseCode: 'CS-402',
    professor: 'Prof. M. Jenkins',
    room: 'HALL 402',
    location: 'Tech Block • 4F',
    startTime: '01:00 PM',
    endTime: '02:30 PM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },

  // Friday (Current Day from Stitch)
  {
    id: 'slot-fri-1',
    day: 'FRI',
    courseId: 'math',
    courseTitle: 'Discrete Mathematics',
    courseCode: 'MATH-301',
    professor: 'Prof. Alan Turing',
    room: 'HALL 101',
    location: 'North Wing • 1F',
    startTime: '08:30 AM',
    endTime: '10:00 AM',
    durationMinutes: 90,
    isLab: false,
    status: 'attended',
  },
  {
    id: 'slot-fri-2',
    day: 'FRI',
    courseId: 'os',
    courseTitle: 'Operating Systems Lab',
    courseCode: 'CS-402L',
    professor: 'Prof. M. Jenkins',
    room: 'LAB 402',
    location: 'Tech Block • 4F',
    startTime: '10:15 AM',
    endTime: '11:45 AM',
    durationMinutes: 90,
    isLab: true,
    labMultiplier: 2,
    status: 'active',
    elapsedMinutes: 58,
    remainingMinutes: 32,
  },
  {
    id: 'slot-fri-3',
    day: 'FRI',
    courseId: 'dbms',
    courseTitle: 'Database Systems',
    courseCode: 'CS-502',
    professor: 'Prof. C. Thorne',
    room: 'LEC HALL 2',
    location: 'Central Wing • 2F',
    startTime: '12:00 PM',
    endTime: '01:15 PM',
    durationMinutes: 75,
    isLab: false,
    status: 'upcoming',
  },
  {
    id: 'slot-fri-4',
    day: 'FRI',
    courseId: 'cn',
    courseTitle: 'Computer Networks',
    courseCode: 'CS-503',
    professor: 'Prof. S. Rao',
    room: 'HALL 204',
    location: 'North Wing • 2F',
    startTime: '02:30 PM',
    endTime: '04:00 PM',
    durationMinutes: 90,
    isLab: false,
    status: 'upcoming',
  },

  // Saturday
  {
    id: 'slot-sat-1',
    day: 'SAT',
    courseId: 'seminar',
    courseTitle: 'Technical Seminar & Industry Talk',
    courseCode: 'SEM-501',
    professor: 'Guest Speakers',
    room: 'AUDITORIUM',
    location: 'Main Block • Ground Fl',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 120,
    isLab: false,
    status: 'upcoming',
  },
];

export const initialHolidays: Holiday[] = [
  {
    id: 'hol-1',
    date: 'Oct 02, 2026',
    day: 'FRI',
    title: 'Gandhi Jayanti',
    type: 'Public',
    notes: 'National Holiday - Classes Suspended',
  },
  {
    id: 'hol-2',
    date: 'Oct 15, 2026',
    day: 'THU',
    title: 'Mid-Term Study Preparation',
    type: 'Institutional',
    notes: 'Central Library remains open 24/7',
  },
  {
    id: 'hol-3',
    date: 'Nov 04, 2026',
    day: 'WED',
    title: 'Annual Tech Fest "InnovateX"',
    type: 'Fest',
    notes: 'No lectures scheduled • Hackathons & Expos',
  },
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-1',
    courseCode: 'CS-501',
    courseName: 'Distributed Systems',
    title: 'Distributed Systems Project - Part 2: Raft Consensus',
    room: 'Hall 402',
    weightage: '25% Final Weight',
    dueDate: 'Tomorrow, 11:59 PM',
    timeLeft: '26h left',
    description: 'Implement leader election, log replication, and heartbeat fault handling using Go/Python.',
    progressPercentage: 75,
    milestones: '3 of 4 milestones verified',
    status: 'pending',
    category: 'urgent',
  },
  {
    id: 'asg-2',
    courseCode: 'CS-503',
    courseName: 'Database Systems',
    title: 'Database Schema Normalization Assignment',
    room: 'Lec Hall 2',
    weightage: '15% Final Grade',
    dueDate: 'Oct 4, 05:00 PM',
    timeLeft: 'In 2 days',
    description: 'Decompose BCNF relation schemas and compute minimal covers for relation set R.',
    progressPercentage: 40,
    milestones: '1 of 3 questions solved',
    status: 'pending',
    category: 'urgent',
    partners: ['AM', 'LK'],
  },
  {
    id: 'asg-3',
    courseCode: 'CS-410',
    courseName: 'Operating Systems',
    title: 'Virtual Memory & Page Replacement Simulator',
    room: 'Lab 402',
    weightage: '10% Lab Weight',
    dueDate: 'Oct 6, 11:59 PM',
    timeLeft: 'In 4 days',
    description: 'Implement LRU, FIFO and Optimal page fault simulators with benchmark tests.',
    progressPercentage: 20,
    milestones: 'Setup completed',
    status: 'pending',
    category: 'week',
  },
  {
    id: 'asg-4',
    courseCode: 'MATH-301',
    courseName: 'Discrete Mathematics',
    title: 'Graph Theory & Dijkstra Proofs',
    room: 'Hall 101',
    weightage: '10% Homework',
    dueDate: 'Oct 1, 11:59 PM',
    timeLeft: 'Completed',
    description: 'Prove Eulerian graph properties and solve topological sorting questions.',
    progressPercentage: 100,
    milestones: 'All 5 proofs completed',
    status: 'submitted',
    category: 'upcoming',
  },
];
