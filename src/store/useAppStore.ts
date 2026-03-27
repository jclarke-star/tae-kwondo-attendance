import { create } from 'zustand';
import { User, UserRole } from '@shared/types';
import { api } from '@/lib/api-client';
interface AppState {
  currentUser: User | null;
  userRole: UserRole | null;
  isVerifiedInstructor: boolean;
  verifiedPinHash: string | null;
  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  verifyInstructor: (pin: string) => Promise<boolean>;
  clearVerification: () => void;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  refreshUser: () => Promise<User | null>;
}
const STORAGE_KEY = 'tkd_attendance_userid';
const SKIN_KEY = 'tkd_attendance_skin';
const VERIFIED_KEY = 'tkd_instructor_verified';
const HASH_KEY = 'tkd_instructor_hash';
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  userRole: null,
  isVerifiedInstructor: false,
  verifiedPinHash: null,
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
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.removeItem(HASH_KEY);
    set({ userRole: role, isVerifiedInstructor: false, verifiedPinHash: null });
  },
  verifyInstructor: async (pin: string) => {
    const user = get().currentUser;
    if (!user) return false;
    try {
      const response = await api<{ verified: boolean; hash: string }>('/api/auth/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, pin })
      });
      if (response.verified) {
        localStorage.setItem(VERIFIED_KEY, 'true');
        localStorage.setItem(HASH_KEY, response.hash);
        set({ isVerifiedInstructor: true, verifiedPinHash: response.hash });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
  clearVerification: () => {
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.removeItem(HASH_KEY);
    set({ isVerifiedInstructor: false, verifiedPinHash: null });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SKIN_KEY);
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.removeItem(HASH_KEY);
    set({ currentUser: null, userRole: null, isVerifiedInstructor: false, verifiedPinHash: null });
  },
  restoreSession: async () => {
    const userId = localStorage.getItem(STORAGE_KEY);
    const skin = localStorage.getItem(SKIN_KEY) as UserRole | null;
    const verified = localStorage.getItem(VERIFIED_KEY) === 'true';
    const hash = localStorage.getItem(HASH_KEY);
    if (skin) {
      set({ userRole: skin, isVerifiedInstructor: verified, verifiedPinHash: hash });
    }
    if (!userId) return !!skin;
    try {
      const user = await api<User>(`/api/users/${userId}`);
      if (user && user.id) {
        set({ currentUser: user });
        return true;
      }
      return !!skin;
    } catch (e) {
      return !!skin;
    }
  },
  refreshUser: async () => {
    const user = get().currentUser;
    if (!user?.id) return null;
    try {
      const updatedUser = await api<User>(`/api/users/${user.id}`);
      set({ currentUser: updatedUser });
      return updatedUser;
    } catch (e) {
      return null;
    }
  }
}));