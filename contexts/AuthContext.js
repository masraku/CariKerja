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
    loadUser()
  }, [])

  // Check token expiry every minute
  useEffect(() => {
    const checkTokenExpiry = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          if (user.tokenExpiresAt && Date.now() >= user.tokenExpiresAt) {
            logout()
          }
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }

    // Check immediately
    checkTokenExpiry()

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Load user from token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Fetch user profile
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        // Store user data with expiry time
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        // Token invalid or expired, clear it
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
  }

  // Login function
  const login = async (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
    
    // Refresh to get complete user data
    await loadUser()
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
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