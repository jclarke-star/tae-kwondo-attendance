import { create } from 'zustand';
import { User } from '@shared/types';
import { api } from '@/lib/api-client';
interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  refreshUser: () => Promise<User | null>;
}
const STORAGE_KEY = 'taekwongo_userid';
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => {
    if (user && user.id) {
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
      localStorage.removeItem(STORAGE_KEY);
      return false;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      set({ currentUser: null });
      return false;
    }
  },
  refreshUser: async () => {
    const user = get().currentUser;
    if (!user?.id) return null;
    try {
      const updatedUser = await api<User>(`/api/users/${user.id}`);
      // Only update if something changed to prevent unnecessary re-renders
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