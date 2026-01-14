import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  register: async (data: any) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },
}

// Loans API
export const loansApi = {
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/api/loans', { params: { skip, limit } })
    return response.data
  },
  
  getById: async (loanId: number) => {
    const response = await api.get(`/api/loans/${loanId}`)
    return response.data
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/loans', data)
    return response.data
  },
  
  createBulk: async (loans: any[]) => {
    const response = await api.post('/api/loans/bulk', { loans })
    return response.data
  },
  
  update: async (loanId: number, data: any) => {
    const response = await api.put(`/api/loans/${loanId}`, data)
    return response.data
  },
  
  getRiskExplanation: async (loanId: number) => {
    const response = await api.get(`/api/loans/${loanId}/risk-explanation`)
    return response.data
  },
}

// Marketplace API
export const marketplaceApi = {
  search: async (filters?: any, skip = 0, limit = 100) => {
    const response = await api.post('/api/marketplace/search', filters || {}, {
      params: { skip, limit },
    })
    return response.data
  },
  
  getFeatured: async (limit = 10) => {
    const response = await api.get('/api/marketplace/featured', { params: { limit } })
    return response.data
  },
  
  getRecommendations: async (limit = 10) => {
    const response = await api.get('/api/marketplace/recommendations', { params: { limit } })
    return response.data
  },
}

// Transactions API
export const transactionsApi = {
  initiate: async (data: any) => {
    const response = await api.post('/api/transactions', data)
    return response.data
  },
  
  getAll: async (skip = 0, limit = 100) => {
    const response = await api.get('/api/transactions', { params: { skip, limit } })
    return response.data
  },
  
  getById: async (transactionId: number) => {
    const response = await api.get(`/api/transactions/${transactionId}`)
    return response.data
  },
}

// Admin API
export const adminApi = {
  getAllUsers: async (skip = 0, limit = 100) => {
    const response = await api.get('/api/admin/users', { params: { skip, limit } })
    return response.data
  },
  
  getAuditLogs: async (entityType?: string, skip = 0, limit = 100) => {
    const response = await api.get('/api/admin/audit-logs', {
      params: { entity_type: entityType, skip, limit },
    })
    return response.data
  },
  
  getLoanAuditLogs: async (loanId: number) => {
    const response = await api.get(`/api/admin/audit-logs/loan/${loanId}`)
    return response.data
  },
  
  updateUserStatus: async (userId: number, isActive: boolean) => {
    const response = await api.put(`/api/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    })
    return response.data
  },
  
  getAIModels: async () => {
    const response = await api.get('/api/admin/ai-models')
    return response.data
  },
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
