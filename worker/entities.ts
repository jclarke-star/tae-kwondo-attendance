import { IndexedEntity } from "./core-utils";
import type { User, ClassSession } from "@shared/types";
import { MOCK_USERS, MOCK_CLASSES } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", role: "student", belt: "", avatar: "" };
  static seedData = MOCK_USERS;
}
export class ClassSessionEntity extends IndexedEntity<ClassSession> {
  static readonly entityName = "class_session";
  static readonly indexName = "class_sessions";
  static readonly initialState: ClassSession = { 
    id: "", 
    title: "", 
    date: "", 
    instructorId: "", 
    pendingCheckIns: [], 
    confirmedCheckIns: [] 
  };
  static seedData = MOCK_CLASSES;
  async checkIn(userId: string): Promise<ClassSession> {
    return this.mutate(s => {
      if (s.pendingCheckIns.includes(userId) || s.confirmedCheckIns.includes(userId)) return s;
      return { ...s, pendingCheckIns: [...s.pendingCheckIns, userId] };
    });
  }
  async approveCheckIn(userId: string): Promise<ClassSession> {
    return this.mutate(s => {
      const pending = s.pendingCheckIns.filter(id => id !== userId);
      if (s.confirmedCheckIns.includes(userId)) return { ...s, pendingCheckIns: pending };
      return { 
        ...s, 
        pendingCheckIns: pending, 
        confirmedCheckIns: [...s.confirmedCheckIns, userId] 
      };
    });
  }
  async denyCheckIn(userId: string): Promise<ClassSession> {
    return this.mutate(s => ({
      ...s,
      pendingCheckIns: s.pendingCheckIns.filter(id => id !== userId)
    }));
  }
}