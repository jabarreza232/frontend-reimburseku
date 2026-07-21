import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Jika sedang di-build untuk production (cPanel), arahkan ke domain utama.
// Jika sedang di lokal (dev), gunakan '/api' agar proxy Vite tetap berjalan.
const apiUrl = import.meta.env.PROD 
  ? 'https://reimburseku.my.id/api' 
  : '/api'

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // opsional
})

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token // Mengambil token dari store
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient