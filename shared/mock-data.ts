import type { User, ClassSession, GradingEvent, Badge } from './types';
export const MOCK_BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Checked in 5 minutes before class started!'
  },
  {
    id: 'b2',
    name: 'Power Kicker',
    icon: '💥',
    description: 'Completed 10 classes in a row.'
  },
  {
    id: 'b3',
    name: 'Attendance Pro',
    icon: '🏆',
    description: 'Reached a 5-day training streak!'
  }
];
export const MOCK_USERS: User[] = [
  {
    id: 'u-instructor',
    name: 'Master Lee',
    role: 'instructor',
    belt: 'Black Belt (9th Dan)',
    avatar: '🥋',
    totalSessions: 100,
    streak: 0,
    badges: []
  },
  {
    id: 'u-timmy',
    name: 'Timmy Tiger',
    role: 'student',
    belt: 'White Belt',
    avatar: '🐯',
    totalSessions: 9, // One session away from "Power Kicker"
    streak: 4, // One session away from "Attendance Pro"
    badges: [MOCK_BADGES[0]]
  },
  {
    id: 'u-sarah',
    name: 'Sarah Shark',
    role: 'student',
    belt: 'Yellow Belt',
    avatar: '🦈',
    totalSessions: 25,
    streak: 12,
    badges: [MOCK_BADGES[0], MOCK_BADGES[2]]
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