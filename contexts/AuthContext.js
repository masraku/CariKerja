'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCSRFToken } from '@/lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from token
  const loadUser = useCallback(async () => {
    try {
      // Legacy cleanup: JWT should live in the httpOnly cookie, not localStorage.
      localStorage.removeItem('token')
      
      // Fetch user profile
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        // Store user data with expiry time
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        // Session invalid or expired, clear cached user state
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Load user error:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      const csrfToken = getCSRFToken()
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
      })
    } catch (e) {
      console.error('Logout API failed', e)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }, [router])

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Login function
  const login = async (userData) => {
    localStorage.removeItem('token')
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    
    // Refresh to get complete user data
    await loadUser()
  }

  // Refresh user data
  const refreshUser = async () => {
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
