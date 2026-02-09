import { create } from 'zustand'

interface SessionExpiredState {
  isExpired: boolean
  setExpired: (expired: boolean) => void
}

export const useSessionExpiredStore = create<SessionExpiredState>((set) => ({
  isExpired: false,
  setExpired: (expired: boolean) => set({ isExpired: expired }),
}))

