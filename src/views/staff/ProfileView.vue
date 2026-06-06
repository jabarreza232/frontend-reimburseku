<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft } from 'lucide-vue-next'

const isLoadingProviders = ref(true)
const authStore = useAuthStore()
const router = useRouter()

// State untuk menyimpan daftar provider dari API
const providers = ref([])

const user = ref({
  nama: '',
  email: '',
  telepon: '',
  posisi: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  alamat: '',
  bank: '', // Menyimpan id_provider
  rekening: '',
  nama_pemilik: ''
})

const isSaving = ref(false)

onMounted(async () => {
  isLoadingProviders.value = true // Nyalakan loading

  // 1. Inisialisasi data user dari state Pinia
  const data = authStore.user || {}
  const accountData = authStore.accountPayout || {}

  user.value = {
    nama: data.name || '',
    email: data.email || '',
    telepon: data.phone || '',
    posisi: data.position || '',
    tanggal_lahir: data.birth_date || '',
    jenis_kelamin: data.gender || '',
    alamat: data.address || '',
    bank: '',
    rekening: accountData.account_number || '',
    nama_pemilik: accountData.account_holder_name || ''
  }

  // 2. Fetch data provider dari API
  try {
    const res = await ApiService.getProviders()
    providers.value = res.data?.data || []
    
    // 3. AUTO-SELECT METODE PEMBAYARAN BERDASARKAN provider_code
    if (accountData.provider_code) {
      // Cari provider yang kodenya sama dengan yang ada di store ('gopay' == 'gopay')
      const matchedProvider = providers.value.find(p => p.code_provider === accountData.provider_code)
      
      // Jika ketemu, masukkan id_provider-nya ke form agar dropdown otomatis terpilih
      if (matchedProvider) {
        user.value.bank = matchedProvider.id_provider
      }
    }
  } catch (error) {
    console.error('Gagal mengambil data provider', error)
  } finally {
    isLoadingProviders.value = false // Matikan loading
  }
})

// MENGELOMPOKKAN PROVIDER
const bankProviders = computed(() => {
  return providers.value.filter(p => p.provider_type === 'bank-transfer' && p.is_active)
})
const accountLabel = computed(() => {
  if (!user.value.bank) return 'Nomor Rekening / HP' // Label default jika belum memilih

  const found = providers.value.find(p => p.id_provider === user.value.bank)
  if (found) {
    return found.provider_type === 'e-wallet' ? 'Nomor Telepon' : 'Nomor Rekening'
  }

  return 'Nomor Rekening / HP'
})
const ewalletProviders = computed(() => {
  return providers.value.filter(p => p.provider_type === 'e-wallet' && p.is_active)
})

// Fungsi mencari nama provider berdasarkan kode (untuk ditampilkan di Preview Profile)
const getProviderName = computed(() => {
  if (!user.value.bank) return '-'
  const found = providers.value.find(p => p.id_provider === user.value.bank)
  return found ? found.provider_name : '-'
})

const saveProfile = async () => {

  let errorMessages = []

  const cleanTelepon = user.value.telepon ? user.value.telepon.replace(/\s|-/g, '') : ''
  const cleanRekening = user.value.rekening ? user.value.rekening.replace(/\s|-/g, '') : ''

  const phoneRegex = /^(08|62|\+62)[0-9]{8,12}$/
  const bankRegex = /^[0-9]{9,18}$/

  if (cleanTelepon && !phoneRegex.test(cleanTelepon)) {
    errorMessages.push('Format Nomor Telepon utama tidak valid (Gunakan awalan 08 / 62, 10-14 digit).')
  }

  if (user.value.bank && cleanRekening) {
    const selectedProvider = providers.value.find(p => p.id_provider === user.value.bank)
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
    alert("Mohon perbaiki data berikut:\n\n- " + errorMessages.join('\n- '))
    return // Hentikan fungsi di sini, jangan lanjut ke API
  }

  isSaving.value = true
  try {
    const payload = {
      role_id: authStore.user?.role_id || 1,
      name: user.value.nama,
      email: user.value.email,
      phone: user.value.telepon,
      position: user.value.posisi,
      birth_date: user.value.tanggal_lahir,
      gender: user.value.jenis_kelamin,
      address: user.value.alamat,
      provider_id: user.value.bank,
      account_number: user.value.rekening,
      account_holder_name: user.value.nama_pemilik
    }

    const res = await ApiService.updateProfile(payload)
    const responseData = res

    if (responseData.data) {
      authStore.updateUserData({
        ...authStore.user,
        ...responseData.data
      })
    }

    if (responseData.account_payout) {
      authStore.updateAccountPayoutData({
        ...authStore.accountPayout,
        ...responseData.account_payout
      })
    }

    alert('Profil berhasil diperbarui')
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal memperbarui profil')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="profile-page">

    <div class="profile-header-wrapper">
      <button class="back-btn" @click="router.push('/staf/dasbor')">
        <ArrowLeft :size="20" />
      </button>
      <div class="profile-title-wrapper">
        <h1 class="page-title">Akun Profil</h1>
        <p class="text-muted">Manage profile accounts</p>
      </div>
    </div>

    <div class="profile-layout">
      <div class="form-card card">
        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 class="section-title">Informasi Akun</h3>
        </div>

        <div class="form-grid mb-6">
          <div class="form-group">
            <label class="form-label">Nama</label>
            <input v-model="user.nama" type="text" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="user.email" type="email" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Telepon</label>
            <input v-model="user.telepon" type="text" class="form-control" placeholder="Contoh: 08521387" />
          </div>

          <div class="form-group">
            <label class="form-label">Posisi Jabatan</label>
            <input disabled :value="user.posisi" type="text" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Tanggal Lahir</label>
            <input v-model="user.tanggal_lahir" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label class="form-label">Jenis Kelamin</label>
            <select v-model="user.jenis_kelamin" class="form-control">
              <option value="" disabled>Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Alamat Tinggal</label>
            <textarea v-model="user.alamat" class="form-control" rows="3"
              placeholder="Tuliskan alamat lengkap tinggal Anda..."></textarea>
          </div>
        </div>

        <div class="section-title-wrap">
          <div class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <h3 class="section-title">Informasi Penarikan Dana</h3>
        </div>

        <div class="form-grid mb-6">
          <div class="form-group">
            <label class="form-label">Metode Pembayaran</label>

            <select v-model="user.bank" class="form-control" :disabled="isLoadingProviders">

              <option :value="user.bank" disabled v-if="isLoadingProviders">
                Memuat Metode...
              </option>

              <option value="" disabled v-else>
                Pilih Metode Pembayaran
              </option>

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
            <label class="form-label">{{ accountLabel }}</label>
            <input v-model="user.rekening" type="text" class="form-control"
              :placeholder="accountLabel === 'Nomor Telepon' ? 'Contoh: 0852xxxxxx' : 'Contoh: 8738722xxx'" />
          </div>

          <div class="form-group col-span-2">
            <label class="form-label">Atas Nama (A/N)</label>
            <input v-model="user.nama_pemilik" type="text" class="form-control"
              placeholder="Nama pemilik rekening/e-wallet" />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="saveProfile" :disabled="isSaving">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>

      <div class="preview-card card">
        <h3 class="preview-title">Preview Profile</h3>
        <div class="preview-content">
          <div class="preview-avatar">
            <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
          </div>
          <h4 class="preview-name">{{ user.nama || '-' }}</h4>
          <span class="badge badge-success">Aktif</span>

          <div class="preview-details mt-6">
            <div class="preview-item">
              <span class="preview-label">Email</span>
              <span class="preview-val">{{ user.email || '-' }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Nomor Telepon</span>
              <span class="preview-val">{{ user.telepon || '-' }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Posisi</span>
              <span class="preview-val">{{ user.posisi || '-' }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Jenis Kelamin / Tgl Lahir</span>
              <span class="preview-val">
                {{ user.jenis_kelamin === 'L' ? 'Laki-laki' : user.jenis_kelamin === 'P' ? 'Perempuan' : '-' }}
                <span v-if="user.tanggal_lahir">({{ user.tanggal_lahir }})</span>
              </span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Alamat Tinggal</span>
              <span class="preview-val alamat-preview-text">{{ user.alamat || '-' }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">{{ accountLabel }} / E-Wallet</span>
              <span class="preview-val">
                {{ getProviderName }} - {{ user.rekening || '-' }}
                <span v-if="user.nama_pemilik">
                  <br>
                  <span style="font-size: 0.8rem; color: #64748b;">A/N {{ user.nama_pemilik }}</span>
                </span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-header-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.profile-title-wrapper {
  display: flex;
  flex-direction: column;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f1f5f9;
  color: var(--color-primary);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.2;
}

.text-muted {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  margin-top: 0.25rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.form-card {
  padding: 2rem;
}

.preview-card {
  padding: 2rem;
  height: fit-content;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: var(--color-primary);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Kunci utama agar Textarea Alamat melebar penuh ke kanan */
.col-span-2 {
  grid-column: span 2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Preview Card */
.preview-title {
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.preview-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.preview-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.preview-val {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Memastikan teks alamat panjang di-wrap dengan rapi di kartu preview */
.alamat-preview-text {
  word-break: break-word;
  white-space: pre-line;
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1;
  }
}
</style>