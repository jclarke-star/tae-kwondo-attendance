import type { User, ClassSession, GradingEvent } from './types';
export const MOCK_USERS: User[] = [
  {
    id: 'u-instructor',
    name: 'Master Lee',
    role: 'instructor',
    belt: 'Black Belt (9th Dan)',
    avatar: '🥋',
    totalSessions: 100
  },
  {
    id: 'u-timmy',
    name: 'Timmy Tiger',
    role: 'student',
    belt: 'White Belt',
    avatar: '🐯',
    totalSessions: 12
  },
  {
    id: 'u-sarah',
    name: 'Sarah Shark',
    role: 'student',
    belt: 'Yellow Belt',
    avatar: '🦈',
    totalSessions: 25
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
export const MOCK_GRADING_EVENTS: GradingEvent[] = [
  {
    id: 'g-1',
    title: 'Junior Belt Grading',
    date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    description: 'Quarterly grading for White and Yellow belts.',
    targetBelts: ['White Belt', 'Yellow Belt']
  }
];