<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, BarChart3, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import AuthService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
const router = useRouter()
const isLoading = ref(false)
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
async function handleLogin() {
  errorMsg.value = ''
  isLoading.value = true

  try {
    // Pemanggilan API kini sangat bersih
    const res = await AuthService.login({
      email: email.value,
      password: password.value,
    })

    // 1. Simpan Token
    authStore.setAuthData(res.data)

    // 3. Redirect berdasarkan role
    const roleSlug = res.data.role.slug
    if (roleSlug === 'admin') {
      router.push('/admin/dasbor')
    } else if (roleSlug === 'finance-staff') { // <--- Tambahkan else di sini
      router.push('/finance/dasbor')
    } else {
      router.push('/staf/dasbor')
    }

  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Email atau password salah.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand">
        <div class="logo">RK</div>
        <h1>ReimburseKu</h1>
      </div>
      <div class="hero-content">
        <h2>Sistem Manajemen Reimbursement</h2>
        <p>Kelola dan pantau proses reimbursement Anda dengan mudah, cepat, dan transparan.</p>

        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <Zap :size="18" />
            </div>
            <span>Proses Cepat & Mudah</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <BarChart3 :size="18" />
            </div>
            <span>Pantau Status Real-time</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <ShieldCheck :size="18" />
            </div>
            <span>Aman & Terpercaya</span>
          </div>
        </div>

        <div class="lottie-container" style="margin-top: 2.5rem; display: flex; justify-content: center; opacity: 0.9;">
           <Vue3Lottie 
             animationLink="https://assets3.lottiefiles.com/packages/lf20_jcikwtux.json" 
             :height="280" 
             :width="280" 
           />
        </div>
      </div>
      <div class="abstract-shape"></div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2>Selamat Datang!</h2>
          <p>Masuk ke portal ReimburseKu</p>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control" placeholder="nama@email.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrap">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control"
                placeholder="••••••••" required />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
            <span v-if="!isLoading">Masuk
              <ArrowRight :size="16" />
            </span>
            <span v-else class="loader"></span>
          </button>
        </form>
        <!-- <button @click="handleLogin" class="btn btn-primary login-btn" :disabled="isLoading">
          <span v-if="!isLoading">Masuk ke Dashboard</span>
          <span v-else class="loader"></span>
          <ArrowRight v-if="!isLoading" :size="18" />
        </button> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background-color: white;
}

.login-left {
  flex: 1.2;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e3a8a 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.logo {
  width: 48px;
  height: 48px;
  background: white;
  color: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.hero-content {
  margin-top: auto;
  margin-bottom: auto;
  max-width: 480px;
  z-index: 2;
}

.hero-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.feature-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.abstract-shape {
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 1;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: white;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  /* Dihapus shadow agar menyatu dengan background putih */
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--color-text-muted);
}

.input-wrap {
  position: relative;
  width: 100%;
}

.input-wrap .form-control {
  padding-right: 2.75rem;
}

.eye-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--color-text-main);
}

.login-btn {
  width: 100%;
  height: 3rem;
  font-size: 1rem;
  margin-top: 1rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  display: inline-block;
}

@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
}
</style>
