import axios from 'axios'

// Get CSRF token from cookie
function getCSRFToken() {
  if (typeof document === 'undefined') return null
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
  
  return cookie ? cookie.split('=')[1] : null
}

// Create axios instance with CSRF token interceptor
const api = axios.create({ withCredentials: true })

// Add CSRF token to all mutating requests
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase()
  
  // Only add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCSRFToken()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }
  
  return config
})

export default api

// Export helper for manual token retrieval
export { getCSRFToken }
