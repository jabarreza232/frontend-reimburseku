import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
const apiClient = axios.create({
  baseURL: 'https://reimburseku.my.id/api', // Sementara diarahkan ke lokal karena Vercel limit
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