import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GlobalState {
  isUploading: boolean;
  setUploading: (status: boolean) => void;
  theme: 'Dark' | 'Light' | 'System';
  setTheme: (theme: 'Dark' | 'Light' | 'System') => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isUploading: false,
      setUploading: (status) => set({ isUploading: status }),
      theme: 'System',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'cryptonest-storage',
    }
  )
);
