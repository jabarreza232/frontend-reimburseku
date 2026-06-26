<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Briefcase, CreditCard } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)

const selectedEmployee = ref({
  nama: '-', email: '-', jabatan: '-', phone: '-', address: '-',
  gender: '-', birth_date: '-', totalPengajuan: 0, totalAmount: 'Rp 0',
  atasNama: '-', nomorRekening: '-', provider: '-'
})

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const res = await ApiService.getEmployeeDetail(id)
      
      // Axios menyimpan json response di dalam properti 'data'
      const responseData = res.data || {} 
      
      // Mengambil objek employee dari properti 'data' milik JSON
      const emp = responseData.data || {} 
      
      // Mengambil objek account_payout yang sejajar dengan 'data'
      const payout = responseData.account_payout || {} 
      
      selectedEmployee.value = {
        // Data Pribadi
        nama: emp.name || '-',
        email: emp.email || '-',
        jabatan: emp.position || '-',
        phone: emp.phone || '-',
        address: emp.address || '-',
        gender: emp.gender || '-',
        birth_date: emp.birth_date || '-',
        
        // Data Statistik (Sejajar di root JSON)
        totalPengajuan: responseData.total_pengajuan || 0,
        totalAmount: new Intl.NumberFormat('id-ID', {
          style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(responseData.total_nominal || 0),
        
        // Data Pembayaran
        atasNama: payout.account_holder_name || 'Belum diatur',
        nomorRekening: payout.account_number || '-',
        provider: payout.provider_name || '-' // Langsung ambil dari payout
      }
    } catch (error) {
      console.error('Failed to load employee detail', error)
    } finally {
      isLoading.value = false
    }
  }
})
</script>
<template>
  <div class="detail-page">
    <div class="layout-wrapper">
<div v-if="isLoading" class="layout-grid">
        
        <div class="left-column">
          <div class="card detail-card">
            <div class="skeleton skeleton-title" style="width: 40%; margin-bottom: 1.5rem;"></div>
            
            <div class="grid-2-cols">
              <div class="skeleton skeleton-input col-span-2"></div> <div class="skeleton skeleton-input"></div> <div class="skeleton skeleton-input"></div> <div class="skeleton skeleton-input"></div> <div class="skeleton skeleton-input"></div> <div class="skeleton skeleton-input col-span-2" style="height: 80px;"></div> </div>
          </div>
        </div>

        <div class="right-column">
          
          <div class="card detail-card mb-4">
            <div class="skeleton skeleton-title" style="width: 50%; margin-bottom: 1.5rem;"></div>
            <div class="skeleton skeleton-input mb-4"></div> <div class="grid-2-cols">
              <div class="skeleton skeleton-input"></div> <div class="skeleton skeleton-input"></div> </div>
          </div>

          <div class="card detail-card">
            <div class="skeleton skeleton-title" style="width: 50%; margin-bottom: 1.5rem;"></div>
            <div class="skeleton skeleton-input mb-4"></div> <div class="skeleton skeleton-input mb-4"></div> <div class="skeleton skeleton-input"></div> </div>

        </div>
      </div>
      <div v-else class="layout-grid">
        
        <div class="left-column">
          <div class="card detail-card">
            <div class="form-section">
              <div class="section-title-wrap">
                <button class="back-btn-inline" @click="router.back()" title="Kembali">
                  <ArrowLeft :size="18" />
                </button>
                <div class="section-icon"><User :size="18" /></div>
                <h3 class="section-title">Informasi Pribadi</h3>
              </div>
              
              <div class="grid-2-cols">
                <div class="form-group col-span-2">
                  <label class="form-label">Nama Lengkap</label>
                  <div class="readonly-field">{{ selectedEmployee.nama }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <div class="readonly-field">{{ selectedEmployee.email }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Nomor Telepon</label>
                  <div class="readonly-field">{{ selectedEmployee.phone }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Jenis Kelamin</label>
                  <div class="readonly-field">
                    {{ selectedEmployee.gender === 'L' ? 'Laki-laki' : (selectedEmployee.gender === 'P' ? 'Perempuan' : '-') }}
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Tanggal Lahir</label>
                  <div class="readonly-field">{{ selectedEmployee.birth_date }}</div>
                </div>
                <div class="form-group col-span-2">
                  <label class="form-label">Alamat Domisili</label>
                  <textarea class="form-control text-dark" rows="3" disabled :value="selectedEmployee.address"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          
          <div class="card detail-card mb-4">
            <div class="section-title-wrap">
              <div class="section-icon"><Briefcase :size="18" /></div>
              <h3 class="section-title">Informasi Pekerjaan</h3>
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Jabatan / Posisi</label>
              <div class="readonly-field">{{ selectedEmployee.jabatan }}</div>
            </div>
            <div class="grid-2-cols">
              <div class="form-group">
                <label class="form-label">Total Pengajuan</label>
                <div class="readonly-field font-semibold text-center">{{ selectedEmployee.totalPengajuan }}</div>
              </div>
              <div class="form-group">
                <label class="form-label">Total Nilai</label>
                <div class="readonly-field font-bold text-success">{{ selectedEmployee.totalAmount }}</div>
              </div>
            </div>
          </div>

          <div class="card detail-card">
            <div class="section-title-wrap">
              <div class="section-icon"><CreditCard :size="18" /></div>
              <h3 class="section-title">Metode Pembayaran</h3>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Provider (Bank / E-Wallet)</label>
              <div class="readonly-field">{{ selectedEmployee.provider }}</div>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Nomor Rekening</label>
              <div class="readonly-field font-semibold">{{ selectedEmployee.nomorRekening }}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Atas Nama</label>
              <div class="readonly-field">{{ selectedEmployee.atasNama }}</div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.detail-page {
  --color-primary: #3b82f6;
  --color-text-main: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-bg-light: #f8fafc;
  --color-bg-disabled: #f1f5f9;
  min-height: 100vh;
  background-color: var(--color-bg-light);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start !important;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.back-btn-inline {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: white;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-btn-inline:hover {
  background: var(--color-bg-light);
  color: var(--color-primary);
  border-color: #cbd5e1;
}

.header-info { display: flex; flex-direction: column; align-items: flex-start; text-align: left; flex-grow: 1; }

.layout-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: stretch; }
.left-column { display: flex; flex-direction: column; }
.left-column .detail-card { flex: 1; display: flex; flex-direction: column; }
.right-column { display: flex; flex-direction: column; }
.card { background: white; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.detail-card { padding: 1.5rem 2rem; }

.section-title-wrap { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.section-icon { width: 32px; height: 32px; border-radius: 8px; background-color: #eff6ff; color: var(--color-primary); display: flex; align-items: center; justify-content: center; }
.section-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text-main); margin: 0; }

.grid-2-cols { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.col-span-2 { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.8rem; font-weight: 600; color: #475569; }

.readonly-field, .form-control {
  padding: 0.6rem 1rem; border: 1px solid var(--color-border); border-radius: 10px; font-size: 0.875rem;
  color: var(--color-text-main); background-color: white; width: 100%; box-sizing: border-box;
}
.readonly-field { background-color: var(--color-bg-light); min-height: 42px; display: flex; align-items: center; }
textarea.form-control { resize: vertical; background-color: var(--color-bg-light); border: 1px solid var(--color-border); color: var(--color-text-main); }

.loading-state { padding: 4rem; text-align: center; }
.text-center { text-align: center; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.text-success { color: #16a34a; }
.mb-4 { margin-bottom: 1rem; }

@media (max-width: 1024px) { .layout-grid { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .detail-card { padding: 1.5rem; }
  .grid-2-cols { grid-template-columns: 1fr; gap: 1rem; }
  .col-span-2 { grid-column: span 1; }
}
.skeleton {
  background: #f1f5f9;
  background: linear-gradient(110deg, #f1f5f9 8%, #e2e8f0 18%, #f1f5f9 33%);
  border-radius: 8px;
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}

@keyframes shimmer {
  to {
    background-position-x: -200%;
  }
}

.skeleton-title {
  height: 28px;
  border-radius: 6px;
}

.skeleton-input {
  width: 100%;
  height: 42px; /* Disesuaikan dengan tinggi readonly-field */
  border-radius: 10px;
}
</style>