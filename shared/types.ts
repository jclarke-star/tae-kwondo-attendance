export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'student' | 'instructor';
export interface User {
  id: string;
  name: string;
  role: UserRole;
  belt: string;
  avatar: string;
  totalSessions?: number;
}
export interface ClassSession {
  id: string;
  title: string;
  date: string; // ISO string
  instructorId: string;
  pendingCheckIns: string[]; // User IDs
  confirmedCheckIns: string[]; // User IDs
}
export interface GradingEvent {
  id: string;
  title: string;
  date: string; // ISO string
  description: string;
  targetBelts: string[]; // Belts eligible for this grading
}
export const BELT_ORDER = [
  "White Belt",
  "Yellow Belt",
  "Green Belt",
  "Blue Belt",
  "Red Belt",
  "Black Belt (1st Dan)",
  "Black Belt (2nd Dan)"
];