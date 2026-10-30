import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import axios from 'axios'
import { currentAdminRequest, loginRequest, type AdminUser } from './auth.api'
import { getAuthToken, setAuthToken } from '../../lib/api'




interface AuthContextValue {
  admin: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function restoreSession() {
      try {
        if (getAuthToken()) {
          const current = await currentAdminRequest()
          if (alive) setAdmin(current)
        }
      } catch {
        setAuthToken(null)
        if (alive) setAdmin(null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    void restoreSession()
    return () => {
      alive = false
    }
  }, [])

  async function signIn(email: string, password: string) {
    setAdmin(await loginRequest(email, password))
  }
  function signOut() {
    setAuthToken(null)
    setAdmin(null)
  }

  const value = useMemo(
    () => ({ admin, loading, signIn, signOut }),
    [admin, loading],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (!error.response)
      return 'Unable to reach the server. Check that the API is running.'
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
