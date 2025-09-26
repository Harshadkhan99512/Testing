import { create } from 'zustand'

type UIState = {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' })
}))