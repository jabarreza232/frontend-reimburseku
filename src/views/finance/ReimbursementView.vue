<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Search, X, CheckCircle, XCircle, FileText, 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
  Filter
} from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================

const reimbursements = ref([])
const pendingCount = ref(0)
const isLoading = ref(true)
const searchQuery = ref('')

const currentPage = ref(1)
const lastPage = ref(1)
const totalItems = ref(0)
const fromItem = ref(0)

const showConfirmModal = ref(false)
const showRejectModal = ref(false)
const showSuccessModal = ref(false)
const showReasonModal = ref(false)
const showReceiptModal = ref(false)

// --- STATE FILTER ---
const showFilterModal = ref(false)
const filterMode = ref('month') 
const filterInputMonth = ref('')
const filterInputStart = ref('')
const filterInputEnd = ref('')

// State untuk melacak filter yang dikirim ke API
const activeFilterType = ref('all') 
const activePeriod = ref('')
const activeStartDate = ref('')
const activeEndDate = ref('')
const activeFilterLabel = ref('Semua Waktu')

// --- STATE CUSTOM MONTH PICKER ---
const filterTempYear = ref(new Date().getFullYear())

const monthList = [
  { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' }, { val: 4, label: 'Apr' },
  { val: 5, label: 'Mei' }, { val: 6, label: 'Jun' }, { val: 7, label: 'Jul' }, { val: 8, label: 'Agt' },
  { val: 9, label: 'Sep' }, { val: 10, label: 'Okt' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Des' }
]

const setFilterMonth = (val) => {
  // Format menjadi YYYY-MM
  filterInputMonth.value = `${filterTempYear.value}-${String(val).padStart(2, '0')}`
}

const isMonthActive = (val) => {
  if (!filterInputMonth.value) return false
  const [y, m] = filterInputMonth.value.split('-')
  return parseInt(y) === filterTempYear.value && parseInt(m) === val
}
// ---------------------------------

const selectedItem = ref(null)
const proofFile = ref(null)
const proofName = ref('')
const isMandatory = ref(false)
const rejectReason = ref('')
const rejectError = ref(false)
const uploadShake = ref(false)
const selectedReceiptUrl = ref('')
const zoomLevel = ref(1)


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
  }).format(amount || 0)
}

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-'
  
  const normalized = (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T'))
    ? dateString.replace(' ', 'T')
    : dateString

  const dateObj = new Date(normalized)
  if (isNaN(dateObj)) return '-'

  const datePart = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  
  if (includeTime) {
    const timePart = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    return `${datePart} - ${timePart}`
  }
  
  return datePart
}


// ==========================================
// 3. FETCH & MAP DATA
// ==========================================
const fetchReimbursements = async (page = 1) => {
  isLoading.value = true
  try {
    let reimbursePromise
    if (activeFilterType.value === 'month') {
      reimbursePromise = ApiService.getReimbursementsByMonth(page, activePeriod.value)
    } else if (activeFilterType.value === 'range') {
      reimbursePromise = ApiService.getReimbursementsByDateRange(page, activeStartDate.value, activeEndDate.value)
    } else {
      reimbursePromise = ApiService.getReimbursements(page) 
    }

    const [reimbRes, empRes, catRes] = await Promise.all([
      reimbursePromise,
      ApiService.getEmployees(),
      ApiService.getCategories()
    ])

    const metaData = reimbRes.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1
    totalItems.value = metaData.total || 0
    fromItem.value = metaData.from || 0

    const employees = empRes.data?.data || [] 
    const categories = catRes.data?.data?.data || catRes.data?.data || []
    
    const empMap = employees.reduce((acc, curr) => ({ ...acc, [curr.id_employees]: curr }), {})
    const catMap = categories.reduce((acc, curr) => ({ ...acc, [curr.id_category]: curr }), {})

    const listData = reimbRes.data?.data || []

    reimbursements.value = listData.map(item => {
      const emp = empMap[item.employees_id] || {}
      const cat = catMap[item.category_id] || {}

      const latestApp = item.latest_approval || {}
      const rawBackendStatus = (latestApp.status || 'PENDING').toUpperCase()

      const statusMap = {
        'APPROVED': 'disetujui',
        'PAID': 'dibayar',
        'REJECTED': 'ditolak'
      }

      return {
        id: item.id_request,
        approvalId: latestApp.id_approval || item.id_request,
        name: emp.name || 'Unknown',
        date: formatDate(latestApp.date_approved),
        submitTime: formatDate(latestApp.date_submitted || item.expense_date, true),
        category: emp.role?.role_name || 'Employee', 
        title: item.description || cat.category_name || 'Reimbursement',
        amount: formatCurrency(item.amount),
        rawAmount: item.amount,
        file: item.attachment_url ? 'Lihat File' : '-',
        fileUrl: item.attachment_url,
        receiptUrl: latestApp.transfer_receipt || null,
        rejectionReason: latestApp.rejection_reason || 'Tidak ada alasan spesifik yang diberikan.',
        status: statusMap[rawBackendStatus] || 'menunggu',
      }
    })

    pendingCount.value = reimbursements.value.filter(i => i.status === 'menunggu').length

  } catch (error) {
    console.error('Failed to fetch data', error)
  } finally {
    isLoading.value = false 
  }
}

// ==========================================
// 4. FILTER DATE LOGIC
// ==========================================
const applyFilter = () => {
  if (filterMode.value === 'month') {
    if (!filterInputMonth.value) {
      return Swal.fire({ icon: 'warning', title: 'Oops', text: 'Harap klik salah satu bulan terlebih dahulu!', confirmButtonColor: '#3b82f6' })
    }
    activeFilterType.value = 'month'
    activePeriod.value = filterInputMonth.value
    activeFilterLabel.value = `Bulan: ${filterInputMonth.value}`
  } else {
    if (!filterInputStart.value || !filterInputEnd.value) {
      return Swal.fire({ icon: 'warning', title: 'Oops', text: 'Harap isi rentang tanggal dengan lengkap!', confirmButtonColor: '#3b82f6' })
    }
    activeFilterType.value = 'range'
    activeStartDate.value = filterInputStart.value
    activeEndDate.value = filterInputEnd.value
    activeFilterLabel.value = `${filterInputStart.value} s/d ${filterInputEnd.value}`
  }
  
  showFilterModal.value = false
  fetchReimbursements(1)
}

const resetFilter = () => {
  activeFilterType.value = 'all'
  activePeriod.value = ''
  activeStartDate.value = ''
  activeEndDate.value = ''
  activeFilterLabel.value = 'Semua Waktu'
  
  filterInputMonth.value = ''
  filterInputStart.value = ''
  filterInputEnd.value = ''
  filterTempYear.value = new Date().getFullYear() // Reset tahun
  
  showFilterModal.value = false
  fetchReimbursements(1)
}


// ==========================================
// 5. COMPUTED & WATCHERS
// ==========================================

const filteredItems = computed(() => {
  if (!searchQuery.value) return reimbursements.value
  const query = searchQuery.value.toLowerCase()
  return reimbursements.value.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.title.toLowerCase().includes(query)
  )
})


// ==========================================
// 6. MODAL & ACTION HANDLERS
// ==========================================

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    fetchReimbursements(page)
  }
}

const openProses = (item) => {
  selectedItem.value = item
  proofFile.value = null
  proofName.value = ''
  isMandatory.value = false
  showConfirmModal.value = true
}

const openBayar = (item) => {
  selectedItem.value = item
  proofFile.value = null
  proofName.value = ''
  isMandatory.value = true
  showConfirmModal.value = true
}

const openTolak = (item) => {
  selectedItem.value = item
  rejectReason.value = ''
  rejectError.value = false
  showRejectModal.value = true
}

const openReason = (item) => {
  selectedItem.value = item
  showReasonModal.value = true
}

const closeSuccess = () => {
  showSuccessModal.value = false
  selectedItem.value = null
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    proofFile.value = file
    proofName.value = file.name
  }
}

const openReceipt = (item) => {
  if (item.receiptUrl) {
    selectedReceiptUrl.value = item.receiptUrl
    zoomLevel.value = 1 
    showReceiptModal.value = true
  } else {
    Swal.fire({
      icon: 'info',
      title: 'Tidak Ada Bukti',
      text: 'Bukti transfer belum diunggah atau tidak ditemukan.',
      confirmButtonColor: '#3b82f6'
    })
  }
}

const closeReceipt = () => {
  showReceiptModal.value = false
  selectedReceiptUrl.value = ''
  zoomLevel.value = 1
}

const zoomIn = () => { if (zoomLevel.value < 3) zoomLevel.value += 0.25 }
const zoomOut = () => { if (zoomLevel.value > 0.5) zoomLevel.value -= 0.25 }
const resetZoom = () => { zoomLevel.value = 1 }

// ==========================================
// 7. API SUBMIT HANDLERS
// ==========================================

const confirmAction = async () => {
  if (!selectedItem.value) return

  if (isMandatory.value && !proofFile.value) {
    uploadShake.value = true
    setTimeout(() => uploadShake.value = false, 500)
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      text: 'Mohon unggah bukti transfer (PNG/JPG/PDF) terlebih dahulu!',
      confirmButtonColor: '#3b82f6'
    })
    return
  }

  try {
    const formData = new FormData()
    formData.append('status', 'APPROVED')
    if (proofFile.value) {
      formData.append('transfer_receipt', proofFile.value)
    }

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

    const isPaid = !!proofFile.value
    selectedItem.value.status = isPaid ? 'dibayar' : 'disetujui'
    showConfirmModal.value = false
    
    Swal.fire({
      icon: 'success',
      title: isPaid ? 'Berhasil' : 'Disetujui',
      text: isPaid ? 'Reimbursement berhasil dibayar!' : 'Reimbursement berhasil disetujui.',
      showConfirmButton: false,
      timer: 1500
    })

    fetchReimbursements(currentPage.value)
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal memproses pengajuan'
    })
  }
}

const confirmTolak = async () => {
  if (!selectedItem.value) return

  if (!rejectReason.value.trim()) {
    rejectError.value = true
    setTimeout(() => rejectError.value = false, 500)
    return
  }

  try {
    const formData = new FormData()
    formData.append('status', 'REJECTED')
    formData.append('rejection_reason', rejectReason.value)

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

    selectedItem.value.status = 'ditolak'
    showRejectModal.value = false
    
    Swal.fire({
      icon: 'success',
      title: 'Ditolak',
      text: 'Reimbursement telah ditolak.',
      showConfirmButton: false,
      timer: 1500
    })
    
    fetchReimbursements(currentPage.value)
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal menolak pengajuan'
    })
  }
}

// ==========================================
// 8. LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
  fetchReimbursements(1)
})
</script>

<template>
  <div class="finance-reimburse">
    

    <div class="card main-card">
      <div class="card-header">
        <div class="header-left">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <h2 class="card-header-title">Daftar Reimburse</h2>
            <span v-if="activeFilterLabel !== 'Semua Waktu'" class="filter-badge">{{ activeFilterLabel }}</span>
          </div>
          <p class="card-header-sub">Periksa dan setujui pengajuan karyawan</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari nama / keterangan..." class="search-input" />
          </div>
          
          <button class="btn-filter-icon" @click="showFilterModal = true" title="Filter Data">
            <Filter :size="16" />
          </button>
          
          <div class="count-badge">{{ pendingCount }} Menunggu</div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>KARYAWAN</th>
              <th>KETERANGAN</th>
              <th>TGL TRANSAKSI</th>
              <th>DIAJUKAN PADA</th>
              <th>FILE PENDUKUNG</th>
              <th>JUMLAH</th>
              <th>STATUS</th>
              <th width="180" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody v-if="isLoading">
            <tr>
              <td colspan="8" class="text-center loading-state">
                <div class="loader-spinner"></div>
                <p class="loading-text">Memuat data pengajuan...</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="filteredItems.length === 0">
            <tr>
              <td colspan="8" class="text-center empty-state">
                <p class="text-muted">Tidak ada data reimburse yang ditemukan pada filter ini.</p>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ item.name[0] }}</div>
                  <div class="user-meta">
                    <p class="user-name">{{ item.name }}</p>
                    <p class="user-email">{{ item.category }}</p>
                  </div>
                </div>
              </td>
              <td class="text-dark">{{ item.title }}</td>
              <td class="text-muted">{{ item.date }}</td>
              <td class="text-muted" style="font-size: 0.85rem;">{{ item.submitTime }}</td>
              <td>
                <a v-if="item.fileUrl" :href="item.fileUrl" target="_blank" class="btn-file">
                  <FileText :size="12" /> Lihat File
                </a>
                <span v-else>-</span>
              </td>
              <td class="font-bold">{{ item.amount }}</td>
              <td>
                <span class="status-pill" :class="item.status">
                  {{ item.status === 'disetujui' ? 'Disetujui' : item.status.charAt(0).toUpperCase() +
                    item.status.slice(1) }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-row">
                  <template v-if="item.status === 'menunggu'">
                    <button class="btn-action tolak" @click="openTolak(item)">Tolak</button>
                    <button class="btn-action proses" @click="openProses(item)">Proses</button>
                  </template>
                  <template v-else-if="item.status === 'disetujui'">
                    <button class="btn-action bayar-green" @click="openBayar(item)">Bayar</button>
                  </template>
                  <template v-else-if="item.status === 'dibayar'">
                    <button class="btn-action bukti-ghost" @click="openReceipt(item)">Bukti Transfer</button>
                  </template>
                  <template v-else-if="item.status === 'ditolak'">
                    <button class="btn-action tolak-ghost" @click="openReason(item)">Lihat Alasan</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">
          menampilkan {{ fromItem }} dari {{ totalItems }} data
        </p>

        <div class="pagination" v-if="lastPage > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="12" />
          </button>

          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }"
            @click="changePage(page)">
            {{ page }}
          </button>

          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showFilterModal" class="modal-overlay" @click.self="showFilterModal = false">
      <div class="modal-panel filter-modal">
        <div class="modal-panel-header">
          <h3 class="modal-title">Filter Data Reimbursement</h3>
          <button class="close-btn" @click="showFilterModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-panel-body">
          <div class="form-group">
            <label class="form-label">Metode Filter Tanggal</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="filterMode" value="month" />
                <span>Bulan Tertentu</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="filterMode" value="range" />
                <span>Rentang Tanggal</span>
              </label>
            </div>
          </div>

          <div v-if="filterMode === 'month'" class="form-group">
            <label class="form-label">Pilih Bulan</label>
            <div class="custom-month-picker">
              <div class="year-selector">
                <button class="year-btn" @click="filterTempYear--"><ChevronLeft :size="16"/></button>
                <span class="year-display">{{ filterTempYear }}</span>
                <button class="year-btn" @click="filterTempYear++"><ChevronRight :size="16"/></button>
              </div>
              <div class="month-grid">
                <button 
                  v-for="m in monthList" 
                  :key="m.val"
                  class="month-btn"
                  :class="{ 'active': isMonthActive(m.val) }"
                  @click="setFilterMonth(m.val)"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="filterMode === 'range'" class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Dari Tanggal</label>
              <input type="date" v-model="filterInputStart" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Sampai Tanggal</label>
              <input type="date" v-model="filterInputEnd" class="form-input" />
            </div>
          </div>
        </div>

        <div class="modal-panel-footer footer-spaced">
          <button class="btn-cancel" @click="resetFilter">Hapus Filter</button>
          <button class="btn-modal main-btn approve" @click="applyFilter">Terapkan Filter</button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
      <div class="modal-panel confirm-modal">
        <div class="modal-panel-header">
          <h3 class="modal-title">Proses Pembayaran?</h3>
          <button class="close-btn" @click="showConfirmModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-panel-body">
          <p class="confirm-msg">
            Anda akan menyetujui pembayaran sebesar <strong>{{ selectedItem?.amount }}</strong> kepada <strong>{{
              selectedItem?.name }}</strong>.
          </p>

          <div class="upload-section">
            <label class="upload-label">
              {{ isMandatory ? 'Wajib Sertakan Bukti Transfer' : 'Mohon Sertakan Bukti Transfer' }}
              <span v-if="isMandatory" class="text-red">*</span>
            </label>
            <div class="upload-field" :class="{ 'has-file': proofName }">
              <input type="text" :value="proofName || 'Pilih file...'" readonly class="upload-input-mock" />
              <label class="upload-btn-inner">
                <FileText :size="16" />
                <input type="file" @change="handleFileUpload" class="hidden-input" />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn-modal batal" @click="showConfirmModal = false">Batal</button>
          <button class="btn-modal main-btn"
            :class="{ 'pay': proofFile || isMandatory, 'approve': !proofFile && !isMandatory }"
            :disabled="isMandatory && !proofFile" @click="confirmAction">
            {{ (proofFile || isMandatory) ? 'Bayar' : 'Setujui' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReceiptModal" class="modal-overlay" @click.self="closeReceipt">
      <div class="modal receipt-modal">
        <div class="modal-header">
          <h3 class="modal-title">Bukti Transfer</h3>

          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Zoom Out">
              <ZoomOut :size="14" />
            </button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="zoom-btn" @click="zoomIn" title="Zoom In">
              <ZoomIn :size="14" />
            </button>
            <div class="divider-vertical"></div>
            <button class="zoom-btn reset" @click="resetZoom" title="Reset Zoom">
              <RotateCcw :size="14" />
            </button>
          </div>

          <button class="close-btn" @click="closeReceipt">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body image-viewer-body">
          <div class="image-container">
            <img :src="selectedReceiptUrl" alt="Bukti Transfer" class="zoomable-image"
              :style="{ transform: `scale(${zoomLevel})` }" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-panel confirm-modal">
        <div class="modal-panel-header">
          <h3 class="modal-title text-red">Tolak Pengajuan?</h3>
          <button class="close-btn" @click="showRejectModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-panel-body">
          <p class="confirm-msg">
            Anda akan menolak pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{
              selectedItem?.name }}</strong>.
          </p>

          <div class="upload-section">
            <label class="upload-label">
              Alasan Penolakan <span class="text-red">*</span>
            </label>
            <textarea v-model="rejectReason" class="reject-textarea" :class="{ 'shake error-border': rejectError }"
              placeholder="Contoh: Nota tidak jelas / nominal tidak sesuai..." rows="3"></textarea>
            <span v-if="rejectError" class="error-text">Alasan penolakan wajib diisi!</span>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn-modal batal-outline" @click="showRejectModal = false">Batal</button>
          <button class="btn-modal tolak-btn" @click="confirmTolak">Tolak Pengajuan</button>
        </div>
      </div>
    </div>

    <div v-if="showReasonModal" class="modal-overlay" @click.self="showReasonModal = false">
      <div class="modal-panel confirm-modal">
        <div class="modal-panel-header">
          <h3 class="modal-title text-red">Alasan Penolakan</h3>
          <button class="close-btn" @click="showReasonModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-panel-body">
          <p class="confirm-msg">
            Pengajuan dari <strong>{{ selectedItem?.name }}</strong> sebesar <strong>{{ selectedItem?.amount }}</strong> ditolak dengan alasan:
          </p>
          <div class="upload-section">
            <textarea 
              class="reject-textarea" 
              rows="4" 
              readonly
              :value="selectedItem?.rejectionReason"
              style="background-color: #f8fafc; cursor: not-allowed; color: #475569;"
            ></textarea>
          </div>
        </div>
        <div class="modal-panel-footer" style="justify-content: center;">
          <button class="btn-modal batal-outline" @click="showReasonModal = false" style="width: 100%;">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccess">
      <div class="modal-panel success-modal">
        <div class="modal-panel-body success-body">
          <div class="success-icon-wrap">
            <CheckCircle :size="56" class="success-icon" />
          </div>
          <h2 class="success-title">Pembayaran Berhasil</h2>
          <button class="btn-back-success" @click="closeSuccess">Kembali</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-reimburse {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
  height: 100%;
  overflow: hidden;
}

.card.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.card-header-sub { font-size: 0.65rem; color: #94a3b8; margin-top: 0.125rem; font-weight: 500; }

.btn-filter-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; cursor: pointer; transition: all 0.2s;
}
.btn-filter-icon:hover { background: #f1f5f9; color: #3b82f6; border-color: #cbd5e1; }

.filter-badge { font-size: 0.65rem; background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; border: 1px solid #dbeafe; }
.count-badge { background: #fffbeb; color: #f59e0b; font-size: 0.65rem; font-weight: 700; padding: 0.4rem 0.875rem; border-radius: 8px; border: 1px solid #fef3c7; }

.table-responsive { overflow-y: auto; overflow-x: auto; flex: 1; }

.text-dark { color: #1e293b; font-weight: 500; }

.btn-file { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem; cursor: pointer; text-decoration: none; }

.action-row { display: flex; justify-content: center; gap: 0.5rem; }
.btn-action { border-radius: 6px; font-size: 0.7rem; font-weight: 700; padding: 0.375rem 0.75rem; cursor: pointer; border: none; min-width: 64px; transition: all 0.2s; }
.btn-action.tolak { background: #ef4444; color: white; }
.btn-action.tolak-ghost { background: #fef2f2; color: #ef4444; font-weight: 600; border: 1px solid #fecaca; }
.btn-action.tolak-ghost:hover { background: #fee2e2; }
.btn-action.proses { background: #3b82f6; color: white; }
.btn-action.bayar-green { background: #22c55e; color: white; }
.btn-action.bukti-ghost { background: #f1f5f9; color: #64748b; font-weight: 600; border: 1px solid #e2e8f0; }

/* MODALS */
.modal { max-width: 380px; }
.filter-modal { max-width: 440px; }
.modal-header { border-radius: 12px 12px 0 0; }
.confirm-msg { font-size: 0.75rem; margin-bottom: 1rem; }
.footer-spaced { justify-content: space-between; }

/* Filter Modal Inputs */
.form-group { margin-bottom: 1.25rem; }
.form-label { font-size: 0.8125rem; font-weight: 600; color: #475569; }
.radio-group { display: flex; gap: 1.5rem; }
.radio-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: #1e293b; cursor: pointer; }
.radio-label input[type="radio"] { accent-color: #3b82f6; width: 16px; height: 16px; cursor: pointer; }
.form-input { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #1e293b; outline: none; transition: border-color 0.2s; font-family: inherit; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-row { display: flex; gap: 1rem; }
.btn-cancel { background: transparent; border: 1px solid transparent; color: #ef4444; font-weight: 600; font-size: 0.875rem; cursor: pointer; padding: 0.5rem 0; }
.btn-cancel:hover { color: #b91c1c; text-decoration: underline; }
.btn-primary-modal { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary-modal:hover { background: #2563eb; }


</style>