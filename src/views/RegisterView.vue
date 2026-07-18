<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, BarChart3, ShieldCheck, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-vue-next'
import AuthService from '@/api/ApiService'
import Swal from 'sweetalert2'

const router = useRouter()
const isLoading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

// DATA DUMMY: Menggantikan fungsi API (1 = true, 0 = false)
const providers = ref([
  { id_provider: 1, provider_name: 'Gopay', provider_type: 'e-wallet', provider_code: 'gopay', is_active: true },
  { id_provider: 2, provider_name: 'Bank Central Asia (BCA)', provider_type: 'bank-transfer', provider_code: 'bca', is_active: true },
  { id_provider: 4, provider_name: 'Bank Permata', provider_type: 'bank-transfer', provider_code: 'permata', is_active: true },
  { id_provider: 5, provider_name: 'Bank Mandiri', provider_type: 'bank-transfer', provider_code: 'mandiri', is_active: true },
  { id_provider: 6, provider_name: 'Bank Rakyat Indonesia (BRI)', provider_type: 'bank-transfer', provider_code: 'bri', is_active: true },
  { id_provider: 7, provider_name: 'Bank Negara Indonesia (BNI)', provider_type: 'bank-transfer', provider_code: 'bni', is_active: true },
  { id_provider: 8, provider_name: 'Bank Syariah Indonesia (BSI)', provider_type: 'bank-transfer', provider_code: 'bsi', is_active: true },
  { id_provider: 10, provider_name: 'ShopeePay', provider_type: 'e-wallet', provider_code: 'shopeepay', is_active: true },
  { id_provider: 11, provider_name: 'DANA', provider_type: 'e-wallet', provider_code: 'dana', is_active: true },
  { id_provider: 12, provider_name: 'OVO', provider_type: 'e-wallet', provider_code: 'ovo', is_active: true },
  { id_provider: 13, provider_name: 'Flip', provider_type: 'e-wallet', provider_code: 'flip', is_active: false },
  { id_provider: 14, provider_name: 'LinkAja', provider_type: 'e-wallet', provider_code: 'linkaja', is_active: false }
])

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  birth_date: '',
  address: '',
  position: '',
  provider_id: '',
  account_number: '',
  role_id:1,
  account_holder_name: ''
})

// --- LOGIKA PENGELOMPOKAN & LABEL DINAMIS ---
const bankProviders = computed(() => {
  return providers.value.filter(p => p.provider_type === 'bank-transfer' && p.is_active)
})

const ewalletProviders = computed(() => {
  return providers.value.filter(p => p.provider_type === 'e-wallet' && p.is_active)
})

const accountLabel = computed(() => {
  if (!form.value.provider_id) return 'Nomor Rekening / HP'

  const found = providers.value.find(p => p.id_provider === form.value.provider_id)
  if (found) {
    return found.provider_type === 'e-wallet' ? 'Nomor Telepon (E-Wallet)' : 'Nomor Rekening Bank'
  }

  return 'Nomor Rekening / HP'
})
// ------------------------------------------

const preventLetters = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault(); 
  }
}

async function handleRegister() {
  // --- LOGIKA VALIDASI REGEX ---
  let errorMessages = []

  const cleanTelepon = form.value.phone ? form.value.phone.replace(/\s|-/g, '') : ''
  const cleanRekening = form.value.account_number ? form.value.account_number.replace(/\s|-/g, '') : ''

  const phoneRegex = /^(08|62|\+62)[0-9]{8,12}$/
  const bankRegex = /^[0-9]{9,18}$/

  if (cleanTelepon && !phoneRegex.test(cleanTelepon)) {
    errorMessages.push('Format Nomor Telepon utama tidak valid (Gunakan awalan 08 / 62, 10-14 digit).')
  }

  if (form.value.provider_id && cleanRekening) {
    const selectedProvider = providers.value.find(p => p.id_provider === form.value.provider_id)
    const isEwallet = selectedProvider?.provider_type === 'e-wallet'

    if (isEwallet) {
      if (!phoneRegex.test(cleanRekening)) {
        errorMessages.push('Format Nomor E-Wallet tidak valid (Harus berupa nomor HP yang benar).')
      }
    } else {
      if (!bankRegex.test(cleanRekening)) {
        errorMessages.push('Format Nomor Rekening Bank tidak valid (Harus berupa 9-18 digit angka).')
      }
    }
  }

  if (errorMessages.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      html: `Mohon perbaiki data berikut:<br><br>- ` + errorMessages.join('<br>- ')
    })
    return // Hentikan fungsi jika validasi gagal
  }
  // -----------------------------

  errorMsg.value = ''
  isLoading.value = true

  try {
    // Pastikan data yang dikirim sudah dibersihkan dari spasi/strip
    const payload = {
      ...form.value,
      phone: cleanTelepon,
      account_number: cleanRekening
    }

    await AuthService.register(payload)

    Swal.fire({
      icon: 'success',
      title: 'Registrasi Berhasil!',
      text: 'Akun Anda telah berhasil dibuat. Silakan login.',
      timer: 2000,
      showConfirmButton: false
    })

    router.push('/login')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Terjadi kesalahan saat mendaftar. Silakan periksa kembali data Anda.'
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
        <h2>Bergabung Bersama Kami</h2>
        <p>Daftarkan diri Anda untuk mulai mengelola proses reimbursement dengan mudah, cepat, dan transparan.</p>

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
          <h2>Buat Akun Baru</h2>
          <p>Lengkapi data diri Anda di bawah ini</p>
        </div>

        <form @submit.prevent="handleRegister">
          
          <div class="form-section-title">Informasi Pribadi</div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nama Lengkap <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" class="form-control" placeholder="Masukkan nama" required maxlength="255" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Email <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" class="form-control" placeholder="nama@email.com" required maxlength="255" />
            </div>

            <div class="form-group">
              <label class="form-label">Password <span class="text-red-500">*</span></label>
              <div class="input-wrap">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control" placeholder="Minimal 8 karakter" required minlength="8" />
                <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" :size="16" />
                  <Eye v-else :size="16" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">No. Telepon <span class="text-red-500">*</span></label>
              <input v-model="form.phone" type="text" class="form-control" placeholder="Contoh: 08123456789" required maxlength="20" @keypress="preventLetters" />
            </div>

            <div class="form-group">
              <label class="form-label">Jenis Kelamin</label>
              <select v-model="form.gender" class="form-control">
                <option value="" disabled>Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Lahir</label>
              <input v-model="form.birth_date" type="date" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Alamat Lengkap</label>
              <textarea v-model="form.address" class="form-control" placeholder="Alamat domisili" rows="2"></textarea>
            </div>
          </div>

         <div class="form-section-title">Pekerjaan & Rekening Pencairan</div>
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">Posisi / Jabatan <span class="text-red-500">*</span></label>
              <input v-model="form.position" type="text" class="form-control" placeholder="Contoh: Staff IT / Backend Developer" required />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Metode Pembayaran <span class="text-red-500">*</span></label>
              <select v-model="form.provider_id" class="form-control" required>
                <option value="" disabled>Pilih Metode Pembayaran</option>
                
                <optgroup label="Bank Transfer" v-if="bankProviders.length > 0">
                  <option v-for="bank in bankProviders" :key="bank.id_provider" :value="bank.id_provider">
                    {{ bank.provider_name }}
                  </option>
                </optgroup>

                <optgroup label="E-Wallet" v-if="ewalletProviders.length > 0">
                  <option v-for="ewallet in ewalletProviders" :key="ewallet.id_provider" :value="ewallet.id_provider">
                    {{ ewallet.provider_name }}
                  </option>
                </optgroup>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{{ accountLabel }} <span class="text-red-500">*</span></label>
              <input v-model="form.account_number" type="text" class="form-control" 
                :placeholder="accountLabel.includes('Telepon') ? 'Contoh: 0852xxxxxx' : 'Contoh: 8738722xxx'" required maxlength="50" @keypress="preventLetters" />
            </div>

            <div class="form-group">
              <label class="form-label">Atas Nama (A/N) <span class="text-red-500">*</span></label>
              <input v-model="form.account_holder_name" type="text" class="form-control" placeholder="Sesuai buku tabungan / e-wallet" required maxlength="255" />
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg" style="margin-top: 1rem;">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
            <span v-if="!isLoading">Daftar Akun
              <CheckCircle2 :size="16" />
            </span>
            <span v-else class="loader"></span>
          </button>

          <div class="register-link">
            Sudah punya akun? <router-link to="/login">Masuk di sini</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mewarisi CSS dari Login, ditambah spesifik untuk Register */
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

/* ... Class brand, logo, hero-content, features sama persis dengan halaman login ... */
.brand { display: flex; align-items: center; gap: 1rem; position: relative; z-index: 2; }
.logo { width: 48px; height: 48px; background: white; color: var(--color-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5rem; }
.brand h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }
.hero-content { margin-top: auto; margin-bottom: auto; max-width: 480px; z-index: 2; }
.hero-content h2 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 1rem; }
.hero-content p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 2.5rem; line-height: 1.6; }
.features { display: flex; flex-direction: column; gap: 1.25rem; }
.feature-item { display: flex; align-items: center; gap: 1rem; font-size: 1.1rem; font-weight: 500; }
.feature-icon { width: 32px; height: 32px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.abstract-shape { position: absolute; bottom: -10%; right: -10%; width: 500px; height: 500px; border-radius: 50%; background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%); z-index: 1; }

/* Modifikasi pada bagian kanan agar mendukung scroll */
.login-right {
  flex: 1.5; /* Diperbesar sedikit karena form lebih lebar */
  display: flex;
  align-items: flex-start; /* Ubah ke flex-start agar bisa discroll dari atas */
  justify-content: center;
  padding: 2rem;
  background-color: white;
  overflow-y: auto; /* Memungkinkan scrolling */
  max-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 600px; /* Diperbesar untuk menampung grid 2 kolom */
  background: white;
  padding: 2rem 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 { font-size: 1.875rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
.login-header p { color: #64748b; }

/* Grid layout untuk form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1rem;
  margin-bottom: 1.5rem;
}

.full-width {
  grid-column: span 2;
}

.form-section-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.5px;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.875rem; font-weight: 600; color: #475569; }

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f8fafc;
}
.form-control:focus { outline: none; border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
textarea.form-control { resize: vertical; }

.input-wrap { position: relative; width: 100%; display: flex; }
.input-wrap .form-control { width: 100%; padding-right: 2.75rem; }
.eye-btn { position: absolute; top: 50%; transform: translateY(-50%); right: 0.75rem; background: transparent; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; padding: 0; }
.eye-btn:hover { color: #333; }

.text-red-500 { color: #ef4444; }
.error-msg { color: #ef4444; font-size: 0.875rem; font-weight: 500; background: #fef2f2; padding: 0.75rem; border-radius: 8px; border: 1px solid #fecaca; }

.login-btn { width: 100%; height: 3rem; font-size: 1rem; margin-top: 1.5rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

.loader { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite; display: inline-block; }

.register-link { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: #64748b; }
.register-link a { color: #3b82f6; font-weight: 600; text-decoration: none; transition: color 0.2s; }
.register-link a:hover { color: #2563eb; text-decoration: underline; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .login-left { display: none; }
  .login-right { flex: 1; align-items: center; }
  .form-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
}
</style>