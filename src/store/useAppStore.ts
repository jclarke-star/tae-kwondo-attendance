import { create } from 'zustand';
import { User, UserRole } from '@shared/types';
import { api } from '@/lib/api-client';
interface AppState {
  currentUser: User | null;
  userRole: UserRole | null;
  isVerifiedInstructor: boolean;
  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  verifyInstructor: (pin: string) => boolean;
  clearVerification: () => void;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  refreshUser: () => Promise<User | null>;
}
const STORAGE_KEY = 'tkd_attendance_userid';
const SKIN_KEY = 'tkd_attendance_skin';
const VERIFIED_KEY = 'tkd_instructor_verified';
const INSTRUCTOR_PIN = '1234';
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  userRole: null,
  isVerifiedInstructor: false,
  setCurrentUser: (user) => {
    if (user && user.id) {
      localStorage.setItem(STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ currentUser: user });
  },
  setUserRole: (role) => {
    if (role) {
      localStorage.setItem(SKIN_KEY, role);
    } else {
      localStorage.removeItem(SKIN_KEY);
    }
    // Clear verification if switching away from instructor or to it fresh
    localStorage.removeItem(VERIFIED_KEY);
    set({ userRole: role, isVerifiedInstructor: false });
  },
  verifyInstructor: (pin: string) => {
    if (pin === INSTRUCTOR_PIN) {
      localStorage.setItem(VERIFIED_KEY, 'true');
      set({ isVerifiedInstructor: true });
      return true;
    }
    return false;
  },
  clearVerification: () => {
    localStorage.removeItem(VERIFIED_KEY);
    set({ isVerifiedInstructor: false });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SKIN_KEY);
    localStorage.removeItem(VERIFIED_KEY);
    set({ currentUser: null, userRole: null, isVerifiedInstructor: false });
  },
  restoreSession: async () => {
    const userId = localStorage.getItem(STORAGE_KEY);
    const skin = localStorage.getItem(SKIN_KEY) as UserRole | null;
    const verified = localStorage.getItem(VERIFIED_KEY) === 'true';
    if (skin) {
      set({ userRole: skin, isVerifiedInstructor: verified });
    }
    if (!userId) return !!skin;
    try {
      const user = await api<User>(`/api/users/${userId}`);
      if (user && user.id) {
        set({ currentUser: user });
        return true;
      }
      localStorage.removeItem(STORAGE_KEY);
      return !!skin;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null });
      return !!skin;
    }
  },
  refreshUser: async () => {
    const user = get().currentUser;
    if (!user?.id) return null;
    try {
      const updatedUser = await api<User>(`/api/users/${user.id}`);
      if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        set({ currentUser: updatedUser });
      }
      return updatedUser;
    } catch (e) {
      console.error('Failed to refresh user', e);
      return null;
    }
  }
}));