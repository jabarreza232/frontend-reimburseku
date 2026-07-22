<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, BarChart3, ShieldCheck, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-vue-next'
import AuthService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import { Vue3Lottie } from 'vue3-lottie'

const router = useRouter()
const isLoading = ref(false)
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const errorMsg = ref('')

// === CAPTCHA STATE ===
const captchaCanvas = ref(null)
const captchaCode = ref('')
const captchaInput = ref('')

// Cek local storage untuk 'Remember Me'
if (localStorage.getItem('rememberedEmail')) {
  email.value = localStorage.getItem('rememberedEmail')
  rememberMe.value = true
}

// === FUNGSI GENERATE CAPTCHA (CANVAS) ===
function generateCaptcha() {
  if (!captchaCanvas.value) return
  
  const ctx = captchaCanvas.value.getContext('2d')
  const width = captchaCanvas.value.width
  const height = captchaCanvas.value.height

  // Bersihkan canvas
  ctx.clearRect(0, 0, width, height)
  
  // Background color
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, height)

  // Karakter acak (tanpa O, 0, I, l agar tidak membingungkan user)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaCode.value = code

  // Tambahkan Noise (Garis acak agar sulit dibaca bot OCR)
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  // Draw Text dengan rotasi dan posisi acak
  ctx.font = 'bold 24px Arial'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < code.length; i++) {
    const x = 20 + (i * 20)
    const y = height / 2 + (Math.random() * 10 - 5)
    const angle = Math.random() * 0.4 - 0.2 // Rotasi miring
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillStyle = '#1e293b'
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
  
  // Kosongkan input setiap kali captcha di-refresh
  captchaInput.value = ''
}

// Generate captcha saat komponen dimuat
onMounted(() => {
  generateCaptcha()
})

async function handleLogin() {
  errorMsg.value = ''
  
  // 1. Validasi CAPTCHA (Case Insensitive)
  if (captchaInput.value.toLowerCase() !== captchaCode.value.toLowerCase()) {
    errorMsg.value = 'Kode Keamanan tidak sesuai, silakan coba lagi.'
    generateCaptcha() // Refresh captcha jika salah
    return
  }

  isLoading.value = true

  try {
    const res = await AuthService.login({
      email: email.value,
      password: password.value,
    })

    // Simpan Token
    authStore.setAuthData(res.data)

    // Remember Me logic
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value.trim())
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Redirect berdasarkan role
    const roleSlug = res.data.role.slug
    if (roleSlug === 'admin') {
      router.push('/admin/dasbor')
    } else if (roleSlug === 'finance-staff') {
      router.push('/finance/dasbor')
    } else {
      router.push('/staf/dasbor')
    }

  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Email atau password salah.'
    generateCaptcha() // Refresh captcha jika login gagal
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Bagian Kiri (Hanya Tampil di Desktop/Tablet Besar) -->
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
            <div class="feature-icon"><Zap :size="18" /></div>
            <span>Proses Cepat & Mudah</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><BarChart3 :size="18" /></div>
            <span>Pantau Status Real-time</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><ShieldCheck :size="18" /></div>
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

    <!-- Bagian Kanan (Form Login) -->
    <div class="login-right">
      <div class="login-card">
        
        <!-- Mobile Branding (Hanya Tampil di Mobile) -->
        <div class="mobile-brand">
          <div class="mobile-logo">RK</div>
          <h1>ReimburseKu</h1>
        </div>

        <div class="login-header">
          <h2>Selamat Datang!</h2>
          <p>Masuk ke portal ReimburseKu</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input id="email" v-model="email" type="email" class="form-control" placeholder="nama@email.com" required autocomplete="email" autofocus @blur="email = email.trim()" />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="input-wrap">
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                <EyeOff v-if="showPassword" :size="16" aria-hidden="true" />
                <Eye v-else :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- === INPUT CAPTCHA === -->
          <div class="form-group">
            <label class="form-label">Kode Keamanan</label>
            <div class="captcha-wrapper">
              <div class="captcha-box">
                <canvas ref="captchaCanvas" width="130" height="42" class="captcha-canvas" @click="generateCaptcha" title="Klik untuk memuat ulang"></canvas>
                <button type="button" class="btn-refresh" @click="generateCaptcha" title="Muat ulang kode">
                  <RefreshCw :size="16" />
                </button>
              </div>
              <input 
                v-model="captchaInput" 
                type="text" 
                class="form-control captcha-input" 
                placeholder="Ketik kode" 
                required 
                maxlength="5"
                autocomplete="off"
              />
            </div>
          </div>

          <div class="form-group remember-me-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>Ingat Saya</span>
            </label>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
            <span v-if="!isLoading">Masuk <ArrowRight :size="16" /></span>
            <span v-else class="loader"></span>
          </button>
        </form>
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

/* KIRI: Desktop Only */
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
  border-radius: var(--radius-md, 8px);
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

/* KANAN: Form Area */
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
}

/* Mobile Brand (Hidden by default on Desktop) */
.mobile-brand {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.mobile-logo {
  width: 40px;
  height: 40px;
  background: var(--color-primary, #2563eb);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
}
.mobile-brand h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary, #2563eb);
  margin: 0;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-main, #1e293b);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--color-text-muted, #64748b);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main, #1e293b);
}

.form-control {
  width: 100%;
  height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-wrap {
  position: relative;
  width: 100%;
}

.input-wrap .form-control {
  padding-right: 2.75rem;
}

.remember-me-group {
  margin-top: 0.75rem;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted, #64748b);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  accent-color: var(--color-primary, #2563eb);
  cursor: pointer;
}

.eye-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--color-text-main, #1e293b);
}

/* === CAPTCHA STYLES === */
.captcha-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.captcha-box {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.captcha-canvas {
  height: 42px;
  width: 130px;
  cursor: pointer;
}

.btn-refresh {
  background: transparent;
  border: none;
  border-left: 1px solid #cbd5e1;
  height: 42px;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.captcha-input {
  flex: 1;
  text-transform: uppercase; 
  letter-spacing: 2px;
  height: 42px; 
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
  background-color: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.login-btn {
  width: 100%;
  height: 3rem;
  font-size: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 8px;
  background-color: var(--color-primary, #2563eb);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* =========================================
   MOBILE RESPONSIVENESS (MEDIA QUERIES)
   ========================================= */

/* Tablet & Mobile (Sembunyikan Panel Kiri) */
@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    background-color: #f1f5f9; /* Memberi warna abu agar card login menonjol */
    padding: 1.5rem;
  }
  
  .login-card {
    padding: 2.5rem 2rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  .mobile-brand {
    display: flex; /* Munculkan logo di HP */
  }
}

/* Mobile Kecil (Penyesuaian Padding & Captcha) */
@media (max-width: 480px) {
  .login-right {
    padding: 1rem;
  }
  
  .login-card {
    padding: 2rem 1.25rem;
  }
  
  .login-header h2 {
    font-size: 1.5rem;
  }
  
  /* Supaya Captcha tidak terhimpit di layar sangat kecil */
  .captcha-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-box {
    justify-content: center;
  }
}
</style>