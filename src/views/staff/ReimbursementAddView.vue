<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, UploadCloud } from 'lucide-vue-next'
import apiClient from '@/api/apiClient'
import { useAuthStore } from '@/stores/auth'
import apiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

const listKategori = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)
const isLoading = ref(false)
const isLoadingCategories = ref(true)

const data = ref({
  rekening: 'BCA 31234123 (Silviana Rodrigo)',
  nama: 'Silviana Rodrigo',
  posisi: 'Software Engineer',
  kategori: '',
  kategori_manual: '', // STATE BARU: Untuk menyimpan input kategori manual
  tanggal: '',
  total: '',
  catatan: ''
})

onMounted(async () => {
  isLoadingCategories.value = true
  try {
    const res = await apiService.getCategories()
    const apiData = res.data.data || res.data
    
    listKategori.value = [
      ...apiData,
      { id_category: 0, name: 'Dan lain-lain' }
    ]
  } catch (error) {
    console.error('Gagal mengambil kategori:', error)
    
    listKategori.value = [
      { id_category: 0, name: 'Dan lain-lain' }
    ]
  } finally {
    isLoadingCategories.value = false
  }
})

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file maksimal 5MB'
      })
      event.target.value = ''
      return
    }
    selectedFile.value = file
  }
}

// Fungsi Submit ke API Laravel
const submit = async () => {
  let errorMessages = [];

  // 1. Validasi Kategori Utama
  if (data.value.kategori === '' || data.value.kategori === null) {
    errorMessages.push('Silakan pilih Kategori reimbursement.');
  } 
  // 1b. Validasi Kategori Manual (Jika milih "Dan lain-lain")
  else if (data.value.kategori === 0 && !data.value.kategori_manual.trim()) {
    errorMessages.push('Silakan ketikkan nama kategori manual.');
  }

  // 2. Validasi Tanggal
  if (!data.value.tanggal) {
    errorMessages.push('Silakan isi Tanggal Tagihan.');
  }

  // 3. Validasi Total Tagihan
  if (data.value.total === '' || data.value.total === null) {
    errorMessages.push('Silakan isi Total Tagihan.');
  }

  // 4. Validasi File Struk
  if (!selectedFile.value) {
    errorMessages.push('Silakan upload Bukti Struk.');
  }

  if (errorMessages.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Belum Lengkap',
      html: `
        <p style="margin-bottom: 10px;">Harap lengkapi bidang-bidang berikut:</p>
        <ul style="text-align: left; list-style-position: inside;">
          ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
        </ul>
      `
    })
    return
  }

  isLoading.value = true
  const formData = new FormData()
  
  formData.append('category_id', data.value.kategori)
  
  // Jika kategori = 0, kirim juga teks manualnya
  // (Pastikan backend Laravel Anda menerima field 'custom_category' ini)
  if (data.value.kategori === 0) {
    formData.append('custom_category', data.value.kategori_manual)
  }

  formData.append('expense_date', data.value.tanggal)

  const cleanTotal = String(data.value.total).replace(/[^0-9]/g, '')
  formData.append('amount', cleanTotal)

  if (data.value.catatan && data.value.catatan.trim() !== '') {
    formData.append('description', data.value.catatan)
  }

  formData.append('attachment', selectedFile.value)

  try {
    await apiService.saveReimbursement(formData)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Reimbursement berhasil diajukan!',
      showConfirmButton: false,
      timer: 1500
    })
    
    router.push('/staf/dasbor')
    
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal mengirim pengajuan'
    })
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const displayTotal = computed({
  get: () => {
    if (!data.value.total) return '';
    const rupiah = data.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${rupiah}`;
  },
  set: (newValue) => {
    const rawNumber = String(newValue).replace(/[^0-9]/g, '');
    data.value.total = rawNumber ? parseInt(rawNumber, 10) : '';
  }
})

const preventLetters = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault(); 
  }
}
</script>
<template>
  <div class="add-page">
 <div class="page-header">
      <button class="back-btn" @click="router.push('/staf/dasbor')">
        <ArrowLeft :size="20" />
      </button>
      
      <div class="header-info">
        <h1 class="page-title">Tambah Reimbursement</h1>
        <p class="text-muted">Buat pengajuan reimburse baru anda</p>
      </div>
    </div>

    <div class="card detail-card">
      <div class="form-section">
        <div class="section-title-wrap">
          <div class="section-icon">
            <User :size="16" />
          </div>
          <h3 class="section-title">Informasi Karyawan</h3>
        </div>

<div class="grid-2-cols">
          <div class="form-group col-span-2">
            <label class="form-label">{{authStore.accountPayout?.provider_type ==='e-wallet' ? 'Nomor E-wallet' : 'Nomor Rekening'}}</label>
            <input type="text" class="form-control" disabled :value="authStore.accountPayout?.account_number ? authStore.accountPayout?.provider_name + ' ' + authStore.accountPayout?.account_number + ' A/N ' + authStore.accountPayout?.account_holder_name : 'N/A'" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Nama</label>
            <input type="text" class="form-control" disabled :value="authStore.user?.name || 'User'" />
          </div>
          <div class="form-group">
            <label class="form-label">Posisi</label>
            <input type="text" class="form-control" disabled :value="authStore.user?.position || 'N/A'" />
          </div>
        </div>
      </div>

      <div class="form-section mt-6">
        <div class="section-title-wrap">
          <div class="section-icon">
            <FileText :size="16" />
          </div>
          <h3 class="section-title">Informasi Pengajuan</h3>
        </div>

        <div class="grid-2-cols-uneven">
          <!-- Left fields -->
          <div class="left-fields">
      <div class="form-group">
              <label class="form-label">Kategori *</label>
              <select class="form-control" v-model="data.kategori" :disabled="isLoadingCategories">
                <option value="" disabled>
                  {{ isLoadingCategories ? 'Memuat Kategori...' : 'Pilih Kategori' }}
                </option>
                <option v-for="kat in listKategori" :key="kat.id_category" :value="kat.id_category">
                  {{ kat.name || kat.category_name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="data.kategori === 0">
              <input type="text" class="form-control" placeholder="Sebutkan kategori..." v-model="data.kategori_manual" />
            </div>

            <div class="form-group">
              <label class="form-label">Tanggal Tagihan *</label>
              <input type="date" class="form-control" v-model="data.tanggal" />
            </div>

            <div class="form-group">
              <label class="form-label">Total Tagihan *</label>
              <input type="text" class="form-control" placeholder="Rp 0" v-model="displayTotal" @keypress="preventLetters" />
            </div>
          </div>

          <!-- Right fields -->
          <div class="right-fields">
            <div class="form-group">
              <label class="form-label">Upload Bukti / Struk *</label>

              <input type="file" ref="fileInput" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png"
                style="display: none;" />

              <div class="upload-box" @click="triggerUpload">
                <UploadCloud :size="32" class="text-primary mb-2" />

                <p class="font-medium text-primary" v-if="selectedFile">
                  {{ selectedFile.name }}
                </p>
                <p class="font-medium" v-else>Pilih file untuk di upload</p>

                <p class="text-xs text-muted mt-1">PDF, JPG, PNG (Maks. 5MB)</p>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Keterangan / Catatan</label>
              <textarea class="form-control" rows="4" placeholder="Tuliskan keterangan..."
                v-model="data.catatan"></textarea>
            </div>
          </div>
        </div>

      </div>

      <div class="form-actions mt-6" style="display: flex; justify-content: flex-end;">
        <button class="btn btn-primary" @click="submit" :disabled="isLoading">
          {{ isLoading ? 'Mengirim...' : 'Buat Pengajuan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: row;
  align-items: center; /* Sejajar tengah antara tombol dan teks */
  justify-content: flex-start !important; /* KUNCI: Memaksa semua item rapat ke KIRI */
  gap: 1.25rem; /* Memberikan jarak yang pas antara tombol dan teks */
  margin-bottom: 2rem;
  width: 100%;
}

/* Pastikan div pembungkus teks (jika diberi class .header-info) rata kiri */
.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
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
}

.back-btn:hover {
  background: #f1f5f9;
  color: var(--color-primary);
}



.detail-card {
  padding: 2rem;
  max-width: 1000px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.grid-3-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.grid-2-cols-uneven {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.left-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.right-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-control:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.upload-box {
  padding: 2rem 1rem;
  background-color: #f8fafc;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-box:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.mt-6 {
  margin-top: 2rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.text-xs {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .grid-3-cols {
    grid-template-columns: 1fr;
  }

  .grid-2-cols-uneven {
    grid-template-columns: 1fr;
  }
}
.grid-2-cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Memaksa elemen mengambil lebar penuh (2 kolom) */
.col-span-2 {
  grid-column: span 2;
}

/* Responsif untuk layar HP */
@media (max-width: 768px) {
  .grid-2-cols {
    grid-template-columns: 1fr;
  }
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>
