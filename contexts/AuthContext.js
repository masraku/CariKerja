'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    console.log('🔄 AuthContext: Initial load')
    loadUser()
  }, [])

  // Load user from token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔑 Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND')
      
      if (!token) {
        console.log('❌ No token, user not authenticated')
        setLoading(false)
        return
      }

      console.log('📡 Fetching user data from /api/auth/me...')
      // Fetch user profile
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📥 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ User data loaded:', data.user)
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        // Token invalid, clear it
        console.log('❌ Invalid token, clearing...')
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Load user error:', error)
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
      console.log('✅ Auth loading complete')
    }
  }

  // Login function
  const login = async (token, userData) => {
    console.log('🔐 Login called with token:', token)
    localStorage.setItem('token', token)
    setUser(userData)
    setIsAuthenticated(true)
    
    // Refresh to get complete user data
    console.log('🔄 Refreshing user data...')
    await loadUser()
  }

  // Logout function
  const logout = () => {
    console.log('👋 Logout called')
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  // Refresh user data
  const refreshUser = async () => {
    console.log('🔄 Manual refresh user called')
    await loadUser()
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        login, 
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}