import { create } from 'zustand';
import { User, UserRole } from '@shared/types';
import { api } from '@/lib/api-client';
interface AppState {
  currentUser: User | null;
  userRole: UserRole | null;
  setCurrentUser: (user: User | null) => void;
  setUserRole: (role: UserRole | null) => void;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  refreshUser: () => Promise<User | null>;
}
const STORAGE_KEY = 'taekwongo_userid';
const SKIN_KEY = 'taekwongo_skin';
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  userRole: null,
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
    set({ userRole: role });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SKIN_KEY);
    set({ currentUser: null, userRole: null });
  },
  restoreSession: async () => {
    const userId = localStorage.getItem(STORAGE_KEY);
    const skin = localStorage.getItem(SKIN_KEY) as UserRole | null;
    if (skin) {
      set({ userRole: skin });
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