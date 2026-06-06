<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Image as ImageIcon, X, ZoomIn, ZoomOut, User, FileText, History, CheckCircle, XCircle, Clock, BadgeDollarSign } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import { formatRupiah } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State Modal Preview Gambar
const isModalOpen = ref(false)
const zoomLevel = ref(1)

const data = ref({
  rekening: '-',
  nama: '-',
  posisi: '-',
  kategori: '-',
  tanggal: '-',
  total: '-',
  catatan: '-',
  bukti: '-',
  buktiUrl: ''
})

// State untuk menyimpan data Log Approval
const approvalLogs = ref([])

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const [resDetail, resLogs] = await Promise.all([
        ApiService.getReimbursementDetail(id),
        ApiService.getLogApprovalReimbursement(id)
      ])
      
      // Parse Detail
      const detail = resDetail.data?.data || resDetail.data
      const user = authStore.user || {}
      const accountPayout = authStore.accountPayout || {}
      
      data.value = {
        rekening: accountPayout?.account_holder_name ? `${accountPayout?.provider_name} ${accountPayout?.account_number} A/N ${accountPayout?.account_holder_name || ''}` : '-',
        nama: user.name || '-',
        posisi: user.position || '-',
        kategori:  detail.category_name || 'Kategori',
        tanggal: new Date(detail.expense_date).toLocaleDateString('id-ID'),
        total: formatRupiah(detail.amount),
        catatan: detail.description || '-',
        bukti: detail.attachment_url ? 'Lihat Bukti' : 'Tidak ada lampiran',
        buktiUrl: detail.attachment_url || ''
      }

      // Parse Logs
      const rawLogs = resLogs.data?.data || []
      approvalLogs.value = rawLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    } catch (err) {
      console.error('Gagal mengambil data detail atau log:', err)
    }
  }
})

// --- HELPER UNTUK TIMELINE ---
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const getLogStyle = (action) => {
  switch(action?.toUpperCase()) {
    case 'SUBMIT': 
      return { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: Clock, label: 'Diajukan' }
    case 'APPROVED': 
      return { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle, label: 'Disetujui' }
    case 'REJECTED': 
      return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: XCircle, label: 'Ditolak' }
    case 'PAID': 
      return { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: BadgeDollarSign, label: 'Dibayar' }
    default: 
      return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: Clock, label: action || 'UNKNOWN' }
  }
}

// --- FUNGSI MODAL & ZOOM ---
const openModal = () => {
  if (!data.value.buktiUrl) return
  if (data.value.buktiUrl.toLowerCase().endsWith('.pdf')) {
    window.open(data.value.buktiUrl, '_blank')
    return
  }
  zoomLevel.value = 1 
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const zoomIn = () => {
  if (zoomLevel.value < 3) zoomLevel.value += 0.25
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) zoomLevel.value -= 0.25 
}
</script>

<template>
  <div class="detail-page">
    <div class="page-container">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/staf/dasbor')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-info">
          <h1 class="page-title">Detail Reimbursement</h1>
          <p class="text-muted">Informasi lengkap reimburse anda</p>
        </div>
      </div>

      <div class="layout-grid">
        <div class="left-column">
          <div class="card detail-card">
            <div class="form-section">
              <div class="section-title-wrap">
                <div class="section-icon">
                  <User :size="18" />
                </div>
                <h3 class="section-title">Informasi Karyawan</h3>
              </div>
              
              <div class="grid-2-cols">
                <div class="form-group col-span-2">
                  <label class="form-label">Nomor Rekening</label>
                  <div class="readonly-field">{{ data.rekening }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Nama</label>
                  <div class="readonly-field">{{ data.nama }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Posisi</label>
                  <div class="readonly-field">{{ data.posisi }}</div>
                </div>
              </div>
            </div>

            <hr class="section-divider" />

            <div class="form-section">
              <div class="section-title-wrap">
                <div class="section-icon">
                  <FileText :size="18" />
                </div>
                <h3 class="section-title">Informasi Pengajuan</h3>
              </div>

              <div class="grid-2-cols-uneven">
                <div class="left-fields">
                  <div class="form-group">
                    <label class="form-label">Kategori</label>
                    <select class="form-control" disabled>
                      <option>{{ data.kategori }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tanggal di Kirim</label>
                    <input type="text" class="form-control" :value="data.tanggal" disabled />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Total Tagihan</label>
                    <input type="text" class="form-control font-bold text-primary" :value="data.total" disabled />
                  </div>
                </div>

                <div class="right-fields">
                  <div class="form-group">
                    <label class="form-label">Upload Bukti / Struk</label>
                    <div 
                      class="file-preview-box" 
                      :class="{ 'is-clickable': data.buktiUrl }"
                      @click="openModal"
                    >
                      <ImageIcon :size="20" :class="data.buktiUrl ? 'text-primary' : 'text-muted'" />
                      <span :class="data.buktiUrl ? 'text-primary font-medium' : 'text-muted'">{{ data.bukti }}</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Keterangan / Catatan</label>
                    <textarea class="form-control" rows="5" disabled :value="data.catatan"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="card log-card">
            <div class="section-title-wrap log-header">
              <div class="section-icon">
                <History :size="18" />
              </div>
              <h3 class="section-title">Riwayat Status</h3>
            </div>

            <div class="log-scroll-area">
              <div v-if="approvalLogs.length === 0" class="empty-log">
                Belum ada riwayat aktivitas.
              </div>

              <div v-else class="timeline-container">
                <div 
                  v-for="(log, index) in approvalLogs" 
                  :key="log.id_log" 
                  class="timeline-item"
                >
                  <div class="timeline-line" v-if="index !== approvalLogs.length - 1"></div>
                  
                  <div 
                    class="timeline-icon-wrap" 
                    :style="{ backgroundColor: getLogStyle(log.action).bg, borderColor: getLogStyle(log.action).border, color: getLogStyle(log.action).color }"
                  >
                    <component :is="getLogStyle(log.action).icon" :size="16" />
                  </div>
                  
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span 
                        class="timeline-status-badge"
                        :style="{ color: getLogStyle(log.action).color, backgroundColor: getLogStyle(log.action).bg }"
                      >
                        {{ getLogStyle(log.action).label }}
                      </span>
                      <span class="timeline-time">{{ formatDateTime(log.created_at) }}</span>
                    </div>
                    <div class="timeline-body">
                      {{ log.comments }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="image-modal-backdrop" @click.self="closeModal">
      <div class="image-modal-content">
        <div class="modal-top-bar">
          <button class="close-modal-btn" @click="closeModal" title="Tutup">
            <X :size="24" />
          </button>
        </div>
        <div class="image-scroll-container">
          <img 
            :src="data.buktiUrl" 
            alt="Bukti" 
            class="zoomable-image"
            :style="{ transform: `scale(${zoomLevel})` }" 
          />
        </div>
        <div class="zoom-controls">
          <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5" title="Zoom Out">
            <ZoomOut :size="20" />
          </button>
          <span class="zoom-indicator">{{ Math.round(zoomLevel * 100) }}%</span>
          <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 3" title="Zoom In">
            <ZoomIn :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Variabel Warna Global Component */
.detail-page {
  --color-primary: #3b82f6;
  --color-text-main: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-bg-light: #f8fafc;
  --color-bg-disabled: #f1f5f9;
  
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* --- HEADER --- */
.page-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: white;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.back-btn:hover {
  background: var(--color-bg-light);
  color: var(--color-primary);
  border-color: #cbd5e1;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.text-muted {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0 0;
}

/* --- LAYOUT GRID (2 Kolom) --- */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr 380px; /* Kolom kiri fleksibel, Kolom kanan fix 380px */
  gap: 1.5rem;
  align-items: start;
}

/* --- CARD & SECTIONS --- */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--color-border);
}

.detail-card {
  padding: 2rem;
}

.log-card {
  position: sticky;
  top: 1.5rem; /* Memberikan efek lengket saat di-scroll */
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
}

.section-divider {
  border: 0;
  height: 1px;
  background-color: var(--color-border);
  margin: 2rem 0;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.log-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  margin-bottom: 1rem;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #eff6ff;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

/* --- FORM GRIDS --- */
.grid-2-cols {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.grid-2-cols-uneven {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.left-fields, .right-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.col-span-2 {
  grid-column: span 2;
}

/* --- INPUTS & FIELDS --- */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.readonly-field, .form-control {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.9375rem;
  color: var(--color-text-main);
  background-color: white;
  width: 100%;
  box-sizing: border-box;
}

.readonly-field {
  background-color: var(--color-bg-light);
  min-height: 46px;
  display: flex;
  align-items: center;
}

.form-control:disabled {
  background-color: var(--color-bg-disabled);
  color: #475569;
  cursor: not-allowed;
  opacity: 1; 
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.font-bold { font-weight: 700 !important; }
.text-primary { color: var(--color-primary) !important; }
.font-medium { font-weight: 500; }

/* --- FILE PREVIEW --- */
.file-preview-box {
  padding: 0.875rem 1rem;
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

.file-preview-box.is-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-color: #bfdbfe;
  background-color: #eff6ff;
}

.file-preview-box.is-clickable:hover {
  border-color: var(--color-primary);
  background-color: #dbeafe;
}

/* --- TIMELINE (LOG APPROVAL) --- */
.log-scroll-area {
  padding: 0 1.5rem 1.5rem 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

/* Kustomisasi scrollbar untuk area log */
.log-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.log-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}
.log-scroll-area::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.empty-log {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  background-color: var(--color-bg-light);
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  padding-left: 0.25rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.timeline-line {
  position: absolute;
  left: 0.875rem; /* Setengah dari 28px */
  top: 28px;
  bottom: -1.25rem;
  width: 2px;
  background-color: var(--color-border);
  z-index: -1;
}

.timeline-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  flex-shrink: 0;
  background-color: white;
  margin-top: 0.25rem;
}

.timeline-content {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem;
  flex-grow: 1;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.timeline-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.timeline-status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.timeline-body {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

/* --- MODAL IMAGE VIEWER --- */
.image-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.image-modal-content {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modal-top-bar {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-btn:hover {
  background: #ef4444;
  transform: scale(1.05);
}

.image-scroll-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
}

.zoomable-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
  transform-origin: center center;
}

.zoom-controls {
  position: absolute;
  bottom: 2.5rem;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.zoom-btn {
  background: transparent;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-indicator {
  color: white;
  font-size: 0.9375rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr; /* Kembali ke 1 kolom pada layar kecil */
  }
  
  .log-card {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .detail-card {
    padding: 1.5rem;
  }
  
  .grid-2-cols, .grid-2-cols-uneven {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .col-span-2 {
    grid-column: span 1;
  }
}
</style>