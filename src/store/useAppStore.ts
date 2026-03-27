import { create } from 'zustand';
import { User } from '@shared/types';
import { api } from '@/lib/api-client';
interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
}
const STORAGE_KEY = 'taekwongo_userid';
export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ currentUser: user });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ currentUser: null });
  },
  restoreSession: async () => {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) return false;
    try {
      const user = await api<User>(`/api/users/${userId}`);
      if (user && user.id) {
        set({ currentUser: user });
        return true;
      }
      // If user data is invalid, clear storage
      localStorage.removeItem(STORAGE_KEY);
      return false;
    } catch (e) {
      // Clear storage on 404 or network error to avoid stuck sessions
      localStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null });
      return false;
    }
  }
}));