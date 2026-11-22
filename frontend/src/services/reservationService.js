
import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// =====================================
// CSRF TOKEN
// =====================================

let csrfToken = null

export const initializeCSRF = async () => {
  const response = await API.get('/csrf/')
  csrfToken = response.data.csrfToken

  return csrfToken
}

// Send CSRF token with requests that modify data
API.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    if (!csrfToken) {
      await initializeCSRF()
    }

    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

// =====================================
// RESERVATIONS
// =====================================

export const getReservations = async () => {
  const response = await API.get('/reservations/')
  return response.data
}

export const getChambres = async () => {
  const response = await API.get('/chambres/')
  return response.data
}

export const createReservation = async (reservationData) => {
  const response = await API.post('/reservations/', reservationData)
  return response.data
}

export const cancelReservation = async (id) => {
  const response = await API.patch(`/reservations/${id}/cancel/`)
  return response.data
}


export default API
