<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue' 
import { Search, Archive, Trash2, ChevronLeft, ChevronRight, History, X, Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'
import Swal from 'sweetalert2'

// Import jsPDF dan autoTable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()

const deposits = ref([])
const previewImageUrl = ref(null)

// --- STATE & FUNCTIONS UNTUK LOG DEPOSIT ---
const showLogModal = ref(false)
const currentLogs = ref([])
const isLoadingLogs = ref(false)

const openLogModal = async (id) => {
  showLogModal.value = true
  isLoadingLogs.value = true
  currentLogs.value = []
  
  try {
    const res = await ApiService.getLogCompanyDeposit(id)
    currentLogs.value = res.data?.data || []
  } catch (error) {
    console.error('Gagal memuat log deposit', error)
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat mengambil log deposit.' })
  } finally {
    isLoadingLogs.value = false
  }
}

const closeLogModal = () => {
  showLogModal.value = false
  currentLogs.value = []
}
// -------------------------------------------

const openPreview = (url) => {
  previewImageUrl.value = url
}

const closePreview = () => {
  previewImageUrl.value = null
}

// State untuk Filter & Sorting
const searchQuery = ref('')
const selectedMonth = ref('') 
const sortOption = ref('terbaru') 

// State Export
const showExportMenu = ref(false)

// Handle click outside untuk dropdown export
const handleClickOutside = (event) => {
  if (!event.target.closest('.export-dropdown')) {
    showExportMenu.value = false
  }
}

const monthOptions = [
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
]

// Fungsi fetch deposit
const fetchDeposits = async () => {
  try {
    let res
    if (selectedMonth.value !== '') {
      res = await ApiService.getDepositsByMonth(selectedMonth.value)
    } else {
      res = await ApiService.getDeposits()
    }

    const listData = res.data?.data?.data || res.data?.data || []
    
    deposits.value = listData.map(d => {
      const rawDateStr = d.date_deposit || d.transaction_date || d.created_at
      const rawDateObj = new Date(rawDateStr)
      
      return {
        id: d.id_company_deposit || d.id_deposit,
        source: 'Deposit Kas',
        target: 'Reimbursement', 
        amount: formatRupiah(d.amount),
        raw_amount: parseFloat(d.amount),
        ref_bank: d.bank_ref_number || '-',
        date: rawDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        raw_date: rawDateObj,
        proof: d.transfer_receipt ? 'Lihat Bukti' : '-',
        proofUrl: d.transfer_receipt,
        note: d.description || d.notes || '-'
      }
    })
  } catch (error) {
    console.error('Gagal memuat deposit', error)
  }
}

onMounted(() => {
  fetchDeposits()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(selectedMonth, () => {
  fetchDeposits()
})

const goToArchive = () => router.push('/admin/arsip-deposit')

const deleteDeposit = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Deposit?',
    text: "Yakin ingin menghapus deposit ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.deleteDeposit(id)
      fetchDeposits()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Deposit berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus deposit' })
      console.error(err)
    }
  }
}

const filteredDeposits = computed(() => {
  let result = deposits.value.filter(d => 
    d.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.ref_bank.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (sortOption.value === 'terbaru') result.sort((a, b) => b.raw_date - a.raw_date)
  else if (sortOption.value === 'terlama') result.sort((a, b) => a.raw_date - b.raw_date)
  else if (sortOption.value === 'terbesar') result.sort((a, b) => b.raw_amount - a.raw_amount)
  else if (sortOption.value === 'terkecil') result.sort((a, b) => a.raw_amount - b.raw_amount)

  return result
})

// === FUNGSI EXPORT ===

// 1. Export ke Excel (CSV)
const exportToExcel = () => {
  showExportMenu.value = false
  
  const headers = ['NO', 'SUMBER DANA', 'TUJUAN ALOKASI', 'NOMINAL', 'NO. REF BANK', 'TANGGAL', 'CATATAN']
  
  const rows = filteredDeposits.value.map((d, index) => [
    index + 1,
    `"${d.source}"`,
    `"${d.target}"`,
    `"${d.amount}"`,
    `"${d.ref_bank}"`,
    `"${d.date}"`,
    `"${d.note.replace(/"/g, '""')}"`
  ])

  const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Data_Deposit.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 2. Export ke PDF (jsPDF)
const exportToPDF = () => {
  showExportMenu.value = false
  
  // Landscape
  const doc = new jsPDF('l', 'mm', 'a4')

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Data Deposit', 14, 20)

  const tableColumn = ["NO", "SUMBER DANA", "TUJUAN ALOKASI", "NOMINAL", "NO. REF BANK", "TANGGAL", "CATATAN"]
  const tableRows = []

  filteredDeposits.value.forEach((d, index) => {
    tableRows.push([
      index + 1,
      d.source,
      d.target,
      d.amount,
      d.ref_bank,
      d.date,
      d.note
    ])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, 
      1: { cellWidth: 35 }, 
      2: { cellWidth: 40 },
      3: { cellWidth: 35, halign: 'right' }, 
      4: { cellWidth: 45 },
      5: { cellWidth: 30 },
      6: { cellWidth: 'auto' } 
    }
  })

  doc.save('Data_Deposit.pdf')
}
</script>

<template>
  <div class="deposit-page">
    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Deposit</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Deposit..." class="search-input" />
          </div>
          
          <div class="filter-dropdown">
            <select v-model="selectedMonth" class="custom-select">
              <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>

          <div class="sort-dropdown">
            <select v-model="sortOption" class="custom-select">
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="terbesar">Nominal Terbesar</option>
              <option value="terkecil">Nominal Terkecil</option>
            </select>
          </div>

          <!-- EXPORT DROPDOWN -->
          <div class="export-dropdown" style="position: relative;">
            <button class="btn btn-outline btn-export" @click="showExportMenu = !showExportMenu">
              <Download :size="14" /> Export <ChevronDown :size="12" />
            </button>
            <transition name="fade-down">
              <div v-if="showExportMenu" class="custom-dropdown-menu export-menu">
                <div class="dropdown-item" @click="exportToPDF">
                  <FileText :size="14" class="text-danger" /> <span>Export to PDF</span>
                </div>
                <div class="dropdown-item" @click="exportToExcel">
                  <FileSpreadsheet :size="14" class="text-success" /> <span>Export to Excel (CSV)</span>
                </div>
              </div>
            </transition>
          </div>

          <button class="btn btn-primary btn-archive" @click="goToArchive">
            <Archive :size="14" /> Arsip
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>SUMBER DANA</th>
              <th>TUJUAN ALOKASI</th>
              <th>NOMINAL</th>
              <th>NO. REF BANK</th>
              <th>TANGGAL</th>
              <th>BUKTI TRANSFER</th>
              <th>CATATAN</th>
              <th class="text-center">LOG DEPOSIT</th>
              <th width="80" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredDeposits" :key="d.id">
              <td class="font-semibold">{{ d.source }}</td>
              <td class="text-primary-dark font-medium">{{ d.target }}</td>
              <td class="font-bold text-success">{{ d.amount }}</td>
              <td class="text-muted font-mono">{{ d.ref_bank }}</td>
              <td class="text-muted">{{ d.date }}</td>
              <td>
                <button v-if="d.proofUrl" @click.prevent="openPreview(d.proofUrl)" class="btn-text-sm">Lihat Bukti</button>
                <span v-else>-</span>
              </td>
              <td class="note-cell" :title="d.note">{{ d.note }}</td>
              
              <td class="text-center">
                <button class="btn-log" @click="openLogModal(d.id)">
                  <History :size="12" /> Lihat Log
                </button>
              </td>

              <td class="text-center">
                <button class="btn-icon delete-row" title="Hapus" @click="deleteDeposit(d.id)"><Trash2 :size="12" /></button>
              </td>
            </tr>
            <tr v-if="filteredDeposits.length === 0">
              <td colspan="9" class="text-center" style="padding: 2rem; color: #94a3b8;">
                Tidak ada data deposit yang cocok.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredDeposits.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredDeposits.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredDeposits.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImageUrl" class="modal-overlay" @click="closePreview">
      <div class="modal-preview-content" @click.stop>
        <button class="btn-close-modal" @click="closePreview">×</button>
        <img :src="previewImageUrl" alt="Preview Bukti" class="preview-image" />
      </div>
    </div>

    <!-- Modal Log Deposit -->
    <div v-if="showLogModal" class="modal-overlay" @click.self="closeLogModal">
      <div class="modal-panel modal-wide" style="max-width: 500px;">
        <div class="modal-panel-header" style="justify-content: space-between; align-items: flex-start;">
          <div style="display: flex; gap: 1rem;">
            <div class="modal-header-icon" style="background: #eff6ff; color: #3b82f6;">
              <History :size="18" />
            </div>
            <div>
              <h3>Riwayat Log Deposit</h3>
              <p class="modal-header-sub">Catatan aktivitas untuk deposit ini</p>
            </div>
          </div>
          <button @click="closeLogModal" style="background: none; border: none; cursor: pointer; color: #94a3b8;">
            <X :size="18" />
          </button>
        </div>
        
        <div class="modal-panel-body" style="min-height: 200px; max-height: 60vh; overflow-y: auto; padding: 1.5rem;">
          <div v-if="isLoadingLogs" class="state-message">
            Memuat data log...
          </div>
          
          <div v-else-if="currentLogs.length === 0" class="state-message">
            Belum ada aktivitas log untuk deposit ini.
          </div>
          
          <div v-else class="timeline-container">
            <div v-for="log in currentLogs" :key="log.id_log_company_deposit" class="timeline-item">
              <div class="timeline-indicator"></div>
              <div class="timeline-content">
                <div class="timeline-date">
                  {{ new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                </div>
                <div class="timeline-action">
                  Status Aksi: <span class="badge-action">{{ log.action }}</span>
                </div>
                <div class="timeline-comment">{{ log.comments }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deposit-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }
.btn-text-sm { background: none; border: none; color: #3b82f6; font-size: 0.7rem; font-weight: 700; cursor: pointer; padding: 0; }

.btn-log {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-log:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Style Select Custom (Milik Filter/Sort asli) */
.custom-select {
  padding: 0.4rem 2rem 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  transition: all 0.2s;
}
.custom-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* CUSTOM EXPORT DROPDOWN UI */
.export-dropdown { position: relative; }
.btn-export { display: flex; align-items: center; gap: 0.35rem; font-weight: 600; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  z-index: 50;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.dropdown-item:hover { background-color: #f3f4f6; color: #111827; }

/* Transisi Dropdown */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }


/* Image Preview Modal CSS */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-preview-content {
  position: relative; max-width: 90vw; max-height: 90vh; background: #fff; padding: 10px; border-radius: 8px;
}
.preview-image {
  max-width: 100%; max-height: calc(90vh - 40px); object-fit: contain; display: block;
}
.btn-close-modal {
  position: absolute; top: -15px; right: -15px; background: #ef4444; color: white; border: none;
  width: 30px; height: 30px; border-radius: 50%; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Modal Custom Log Component */
.modal-panel { background: #fff; border-radius: 12px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-panel-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1rem; }
.modal-header-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.modal-panel-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-header-sub { font-size: 0.75rem; color: #64748b; margin: 0; margin-top: 0.25rem; }

/* Timeline UI untuk Log */
.state-message { text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 2rem 0; }
.timeline-container { position: relative; padding-left: 0.5rem; }
.timeline-item { position: relative; padding-left: 1.5rem; padding-bottom: 1.5rem; border-left: 2px solid #e2e8f0; }
.timeline-item:last-child { border-left-color: transparent; padding-bottom: 0; }
.timeline-indicator { position: absolute; left: -6px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; border: 2px solid #fff; box-shadow: 0 0 0 2px #eff6ff; }
.timeline-date { font-size: 0.65rem; color: #94a3b8; font-weight: 600; margin-bottom: 0.25rem; }
.timeline-action { font-size: 0.75rem; color: #475569; margin-bottom: 0.25rem; }
.badge-action { background: #f1f5f9; color: #1e293b; font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; margin-left: 0.25rem; }
.timeline-comment { font-size: 0.8rem; color: #1e293b; line-height: 1.4; background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; border: 1px solid #f1f5f9; }
</style>