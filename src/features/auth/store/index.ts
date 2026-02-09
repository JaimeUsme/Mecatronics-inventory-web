import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  company: 'wispro' | 'mecatronics' | null
  setAuth: (auth: {
    accessToken: string
    isAuthenticated: boolean
    company: 'wispro' | 'mecatronics'
  }) => void
  logout: () => void
}

// Generar un ID único por pestaña si no existe
function getTabId(): string {
  let tabId = sessionStorage.getItem('tab-id')
  if (!tabId) {
    tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('tab-id', tabId)
  }
  return tabId
}

// Storage personalizado que usa una clave única por pestaña
const createTabStorage = () => {
  const tabId = getTabId()
  const storageKey = `auth-storage-${tabId}`
  
  return {
    getItem: (_name: string): string | null => {
      try {
        const value = sessionStorage.getItem(storageKey)
        return value
      } catch (error) {
        console.error('Error reading from storage:', error)
        return null
      }
    },
    setItem: (_name: string, value: string): void => {
      try {
        sessionStorage.setItem(storageKey, value)
      } catch (error) {
        console.error('Error writing to storage:', error)
      }
    },
    removeItem: (_name: string): void => {
      try {
        sessionStorage.removeItem(storageKey)
      } catch (error) {
        console.error('Error removing from storage:', error)
      }
    },
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      company: null,
      setAuth: (auth) => {
        set({
          accessToken: auth.accessToken,
          isAuthenticated: auth.isAuthenticated,
          company: auth.company,
        })
      },
      logout: () => {
        set({
          accessToken: null,
          isAuthenticated: false,
          company: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createTabStorage()),
    }
  )
)

