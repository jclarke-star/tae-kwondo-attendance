import type { User, ClassSession } from './types';
export const MOCK_USERS: User[] = [
  { 
    id: 'u-instructor', 
    name: 'Master Lee', 
    role: 'instructor', 
    belt: 'Black Belt (9th Dan)', 
    avatar: '🥋' 
  },
  { 
    id: 'u-timmy', 
    name: 'Timmy Tiger', 
    role: 'student', 
    belt: 'Yellow Belt', 
    avatar: '🐯' 
  },
  { 
    id: 'u-sarah', 
    name: 'Sarah Shark', 
    role: 'student', 
    belt: 'Green Belt', 
    avatar: '🦈' 
  }
];
export const MOCK_CLASSES: ClassSession[] = [
  {
    id: 'c-today',
    title: 'Afternoon Kickers',
    date: new Date().toISOString(),
    instructorId: 'u-instructor',
    pendingCheckIns: [],
    confirmedCheckIns: []
  }
];