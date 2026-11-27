/**
 * api.js — Centralised Axios instance for Vite
 *
 * - Reads VITE_API_BASE_URL (falls back to http://localhost:8000)
 * - Request interceptor attaches Authorization: Bearer <access_token>
 * - Response interceptor handles 401:
 *     calls POST /api/auth/refresh once with refresh_token and retries
 *     if refresh fails, clears tokens and rejects with RedirectToLoginError
 */

import axios from 'axios'

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ── Token helpers ──────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')

export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// ── Sentinel error — signals the caller to redirect to /login ─────────────────
export class RedirectToLoginError extends Error {
  constructor() {
    super('Session expired. Please log in again.')
    this.name = 'RedirectToLoginError'
  }
}

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token before every request
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 401 refresh & retry interceptor ───────────────────────────────────────────
let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new RedirectToLoginError()

  // Use bare axios so we don't trigger this interceptor recursively
  const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
    refresh_token: refreshToken,
  })

  setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        clearTokens()
        return Promise.reject(new RedirectToLoginError())
      }
    }

    if (error.response?.status === 401) {
      clearTokens()
      return Promise.reject(new RedirectToLoginError())
    }

    return Promise.reject(error)
  }
)

export default api
