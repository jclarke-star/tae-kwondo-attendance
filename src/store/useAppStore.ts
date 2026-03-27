import { create } from 'zustand';
import { User } from '@shared/types';
interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}
export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));