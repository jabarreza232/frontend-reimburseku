<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { 
  ChevronLeft, ChevronRight, TrendingUp, Calendar, ChevronDown, 
  Download, PlusCircle, X, FileText, Table, PieChart,
  CheckCircle, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2' 
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
import { formatRupiah } from '@/utils/format'
import { useRouter } from 'vue-router'

// Import Library Laporan
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()

// --- Helper Status Manual Khusus Finance ---
// Anda tidak perlu menggunakan mapStatusToFrontend dari utils jika logic finance berbeda
const translateStatus = (rawStatus) => {
  const s = (rawStatus || 'PENDING').toUpperCase()
  if (s === 'PENDING') return 'Menunggu'
  if (s === 'APPROVED') return 'Disetujui'
  if (s === 'PAID') return 'Dibayar'
  if (s === 'REJECTED') return 'Ditolak'
  return 'Menunggu'
}

// --- State Dasbor Dasar ---
const stats = ref([
  { label: 'Saldo Kas', value: 'Rp 0', isBlue: true },
  { label: 'Telah Dibayarkan', value: 'Rp 0', isBlue: false }
])

const history = ref([])
const isLoading = ref(true)

// State Pagination Tabel
const currentPage = ref(1)
const lastPage = ref(1)

// --- Helper Data Tanggal ---
const monthList = [
  { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' }, { val: 4, label: 'Apr' },
  { val: 5, label: 'Mei' }, { val: 6, label: 'Jun' }, { val: 7, label: 'Jul' }, { val: 8, label: 'Agt' },
  { val: 9, label: 'Sep' }, { val: 10, label: 'Okt' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Des' }
]

const today = new Date()
const lastWeek = new Date(today)
lastWeek.setDate(today.getDate() - 6)

const formatDate = (date) => date.toISOString().split('T')[0] 
const formatMonth = (date) => date.toISOString().slice(0, 7)  

// --- State Modal Ekspor ---
const showExportModal = ref(false)
const exportFilterMode = ref('month') 
const isExporting = ref(false)

const exportInputMonth = ref(formatMonth(today))
const exportInputStart = ref(formatDate(lastWeek))
const exportInputEnd = ref(formatDate(today))

const exportTempYear = ref(new Date().getFullYear())

const setExportMonth = (val) => {
  exportInputMonth.value = `${exportTempYear.value}-${String(val).padStart(2, '0')}`
}
const isExportMonthActive = (val) => {
  if (!exportInputMonth.value) return false
  const [y, m] = exportInputMonth.value.split('-')
  return parseInt(y) === exportTempYear.value && parseInt(m) === val
}

// --- State Filter Chart Area ---
const chartMode = ref('weekly')
const chartStartDate = ref(formatDate(lastWeek))
const chartEndDate = ref(formatDate(today))
const chartSelectedMonth = ref(formatMonth(today))

const showChartMonthPicker = ref(false)
const chartTempYear = ref(new Date().getFullYear())

const toggleChartMonthPicker = () => {
  showChartMonthPicker.value = !showChartMonthPicker.value
  if (showChartMonthPicker.value && chartSelectedMonth.value) {
    chartTempYear.value = parseInt(chartSelectedMonth.value.split('-')[0])
  }
}
const selectChartMonth = (val) => {
  chartSelectedMonth.value = `${chartTempYear.value}-${String(val).padStart(2, '0')}`
  showChartMonthPicker.value = false
  fetchChartData() 
}
const isChartMonthActive = (val) => {
  if (!chartSelectedMonth.value) return false
  const [y, m] = chartSelectedMonth.value.split('-')
  return parseInt(y) === chartTempYear.value && parseInt(m) === val
}

const displayMonth = computed(() => {
  if (!chartSelectedMonth.value) return 'Pilih Bulan'
  const [year, month] = chartSelectedMonth.value.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

// --- Konfigurasi Chart Area ---
const chartOptions = ref({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: true } },
  colors: ['#3b82f6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2.5 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.0 } },
  xaxis: { categories: [], labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } } },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 }, formatter: (value) => { if(value >= 1000000) return (value / 1000000).toFixed(1) + " Jt"; if(value >= 1000) return (value / 1000).toFixed(0) + " Rb"; return value } } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})
const series = ref([{ name: 'Pengeluaran', data: [] }]) 

// --- Konfigurasi Chart Donut ---
const pieOptions = ref({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: ['Belum Ada Data'],
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
  plotOptions: { pie: { donut: { size: '75%' } } },
  dataLabels: { enabled: false },
  legend: { position: 'right', offsetY: 0, fontSize: '11px', fontWeight: 600, labels: { colors: '#475569' } },
  stroke: { show: false },
  tooltip: { theme: 'light', y: { formatter: (val) => val + " Pengajuan" } }
})
const pieSeries = ref([100])

// --- Fungsi Fetch API Dashboard ---
const fetchChartData = async () => {
  try {
    let res;
    if (chartMode.value === 'weekly') {
      res = await ApiService.getChartWeekly(chartStartDate.value, chartEndDate.value)
    } else {
      const [year, month] = chartSelectedMonth.value.split('-') 
      res = await ApiService.getChartMonthly(month, year)
    }
    const data = res.data?.data || {}
    series.value = [{ name: 'Pengeluaran', data: data.series || [] }]
    chartOptions.value = { ...chartOptions.value, xaxis: { ...chartOptions.value.xaxis, categories: data.categories || [] } }
  } catch (error) {
    console.error('Failed to load chart data', error)
  }
}

const fetchDashboardData = async (page = 1) => {
  isLoading.value = true
  try {
    const [statsRes, reimburseRes] = await Promise.all([
      ApiService.getBalanceStats(),
      ApiService.getReimbursements(page)
    ])
    
    const statsData = statsRes.data?.data || {}
    stats.value[0].value = formatRupiah(statsData.saldo_kas || 0)
    stats.value[1].value = formatRupiah(statsData.telah_dibayarkan || 0)

    const metaData = reimburseRes.data?.meta || {}
    currentPage.value = metaData.current_page || 1
    lastPage.value = metaData.last_page || 1

    const listData = reimburseRes.data?.data || []
    
    const catCounts = {}

    history.value = listData.map(item => {
      const latestApp = item.latest_approval || {}
      const rawStatus = latestApp.status || 'PENDING'

      const catName = item.category_name || 'Lain-lain'
      catCounts[catName] = (catCounts[catName] || 0) + 1

      return {
        id: item.id_request,
        approvalId: latestApp.id_approval || item.id_request, 
        receiptUrl: latestApp.transfer_receipt || null,
        rejectionReason: latestApp.rejection_reason || 'Tidak ada alasan spesifik yang diberikan.',
        name: item.employees_name || 'Unknown',
        category: catName,
        amount: formatRupiah(item.amount),
        rawAmount: item.amount,
        date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: translateStatus(rawStatus)
      }
    })

    const categories = Object.keys(catCounts)
    if (categories.length > 0) {
      const mappedColors = categories.map(cat => {
        const lower = cat.toLowerCase()
        if (lower.includes('transport')) return '#10b981' // Green
        if (lower.includes('makan') || lower.includes('minum')) return '#ef4444' // Red
        if (lower.includes('parkir')) return '#8b5cf6' // Purple
        return '#3b82f6' // Blue (Lain-lain)
      })
      pieOptions.value = { ...pieOptions.value, labels: categories, colors: mappedColors }
      pieSeries.value = Object.values(catCounts)
    } else {
      pieOptions.value = { ...pieOptions.value, labels: ['Belum Ada Data'], colors: ['#e2e8f0'] }
      pieSeries.value = [100]
    }

  } catch (error) {
    console.error('Failed to load dashboard table', error)
  } finally {
    isLoading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) fetchDashboardData(page)
}

onMounted(() => {
  fetchDashboardData(1)
  fetchChartData() 
})

// --- Tab Status Filter ---
const filters = ['Semua', 'Menunggu', 'Disetujui', 'Dibayar', 'Ditolak']
const activeStatusFilter = ref('Semua')

const filteredHistory = computed(() => {
  if (activeStatusFilter.value === 'Semua') return history.value
  return history.value.filter(item => item.status === activeStatusFilter.value)
})

// ==========================================
// STATE & FUNGSI AKSI REIMBURSE (Proses, Bayar, Tolak)
// ==========================================
const showConfirmModal = ref(false)
const showRejectModal = ref(false)
const showSuccessModal = ref(false)
const showReasonModal = ref(false)
const showReceiptModal = ref(false)

const selectedItem = ref(null)
const proofFile = ref(null)
const proofName = ref('')
const isMandatory = ref(false)
const rejectReason = ref('')
const rejectError = ref(false)
const uploadShake = ref(false)
const selectedReceiptUrl = ref('')
const zoomLevel = ref(1)

// Proses = Ubah PENDING -> APPROVED (Tanpa Bukti Transfer)
const openProses = (item) => {
  selectedItem.value = item
  proofFile.value = null
  proofName.value = ''
  isMandatory.value = false
  showConfirmModal.value = true
}

// Bayar = Ubah APPROVED -> PAID (Wajib Bukti Transfer)
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

const confirmAction = async () => {
  if (!selectedItem.value) return

  // Validasi: Jika aksi bayar (isMandatory), maka harus ada file
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
    
    // Logika pengiriman status ke API
    if (isMandatory.value) {
       // Aksi 'Bayar': status -> PAID
       formData.append('status', 'PAID') 
       if (proofFile.value) {
         formData.append('transfer_receipt', proofFile.value)
       }
    } else {
       // Aksi 'Proses': status -> APPROVED
       formData.append('status', 'APPROVED')
    }

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)

    showConfirmModal.value = false
    
    Swal.fire({
      icon: 'success',
      title: isMandatory.value ? 'Berhasil Dibayar' : 'Disetujui',
      text: isMandatory.value ? 'Reimbursement berhasil dibayar!' : 'Reimbursement telah disetujui (Menunggu Pembayaran).',
      showConfirmButton: false,
      timer: 1500
    })

    // Refresh Data & Chart
    fetchDashboardData(currentPage.value)
    fetchChartData()
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

    showRejectModal.value = false
    
    Swal.fire({
      icon: 'success',
      title: 'Ditolak',
      text: 'Reimbursement telah ditolak.',
      showConfirmButton: false,
      timer: 1500
    })
    
    // Refresh Data
    fetchDashboardData(currentPage.value)
  } catch (error) {
    console.error(error)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal menolak pengajuan'
    })
  }
}

// --- LOGIKA EKSPOR LAPORAN ---
const generateExportFile = (filteredData, titlePeriod, formatType) => {
  const exportData = filteredData.map((item, index) => {
    const rawStatus = item.latest_approval?.status || 'PENDING'
    return {
      'No': index + 1,
      'Nama Karyawan': item.employees_name || 'Tidak Diketahui',
      'Kategori': item.category_name || 'Lain-lain',
      'Tanggal': new Date(item.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      'Status': translateStatus(rawStatus),
      'Jumlah_Asli': item.amount,
      'Jumlah_Format': formatRupiah(item.amount)
    }
  })

  if (formatType === 'excel') {
    const excelData = exportData.map(d => ({
      'No': d.No, 'Nama Karyawan': d['Nama Karyawan'], 'Kategori': d.Kategori,
      'Tanggal': d.Tanggal, 'Status': d.Status, 'Jumlah (Rp)': d.Jumlah_Asli 
    }))
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Reimburse")
    XLSX.writeFile(workbook, `Laporan_Finance_${Date.now()}.xlsx`)
  } 
  else if (formatType === 'pdf') {
    const doc = new jsPDF('p', 'mm', 'a4')
    doc.setFontSize(14)
    doc.text(`Laporan Rekapitulasi Reimbursement Finance`, 14, 15)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(titlePeriod, 14, 22)

    const tableColumn = ["No", "Nama Karyawan", "Kategori", "Tanggal", "Status", "Jumlah"]
    const tableRows = exportData.map(d => [d.No, d['Nama Karyawan'], d.Kategori, d.Tanggal, d.Status, d.Jumlah_Format])

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 28, theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, styles: { fontSize: 9 }
    })
    doc.save(`Laporan_Finance_${Date.now()}.pdf`)
  }
}

const exportByMonth = async (formatType) => {
  if (!exportInputMonth.value) return alert('Harap pilih bulan terlebih dahulu.')
  isExporting.value = true
  try {
    const res = await ApiService.getReimbursementsByMonth(1, exportInputMonth.value)
    const data = res.data?.data || []
    if (data.length === 0) return alert('Tidak ada data pada bulan yang Anda pilih.')
    generateExportFile(data, `Bulan: ${exportInputMonth.value}`, formatType)
    showExportModal.value = false
  } catch (error) {
    console.error("Gagal mengekspor laporan:", error)
    alert("Terjadi kesalahan saat menarik data dari server.")
  } finally { isExporting.value = false }
}

const exportByDateRange = async (formatType) => {
  if (!exportInputStart.value || !exportInputEnd.value) return alert('Harap tentukan tanggal mulai dan sampai tanggal.')
  isExporting.value = true
  try {
    const res = await ApiService.getReimbursementsByDateRange(1, exportInputStart.value, exportInputEnd.value)
    const data = res.data?.data || []
    if (data.length === 0) return alert('Tidak ada data pada rentang tanggal yang Anda pilih.')
    generateExportFile(data, `Periode: ${exportInputStart.value} s/d ${exportInputEnd.value}`, formatType)
    showExportModal.value = false
  } catch (error) {
    console.error("Gagal mengekspor laporan:", error)
    alert("Terjadi kesalahan saat menarik data dari server.")
  } finally { isExporting.value = false }
}
</script>

<template>
  <div class="finance-dasbor">
    <div class="page-header" style="justify-content: flex-end;">
      <div class="quick-actions">
        <button class="qa-btn qa-outline" @click="showExportModal = true">
          <Download :size="16" />
          <span>Ekspor Rekap</span>
        </button>
        <button class="qa-btn qa-primary" @click="router.push('/finance/deposit/tambah')">
          <PlusCircle :size="16" />
          <span>Top Up Saldo</span>
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card" :class="{ 'card-blue': s.isBlue }">
        <div class="stat-icon-box">
          <Calendar v-if="s.isBlue" :size="20" />
          <TrendingUp v-else :size="20" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="left-column">
        <div class="card chart-card">
          <div class="card-head">
            <h3 class="card-title">Grafik Pengeluaran</h3>
            <div class="chart-header-actions">
              <select v-model="chartMode" @change="fetchChartData" class="custom-input">
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>

              <div v-if="chartMode === 'weekly'" class="date-range-wrap">
                <input type="date" v-model="chartStartDate" @change="fetchChartData" class="custom-input" />
                <span class="range-divider">-</span>
                <input type="date" v-model="chartEndDate" @change="fetchChartData" class="custom-input" />
              </div>

              <div v-else class="month-wrap relative">
                <div class="month-selector custom-input" @click="toggleChartMonthPicker">
                  {{ displayMonth }} <ChevronDown :size="14" style="margin-left: 4px;" />
                </div>
                
                <div v-if="showChartMonthPicker" class="chart-month-dropdown">
                  <div class="chart-month-overlay" @click="showChartMonthPicker = false"></div>
                  <div class="custom-month-picker dropdown-content">
                    <div class="year-selector">
                      <button class="year-btn" @click="chartTempYear--"><ChevronLeft :size="16"/></button>
                      <span class="year-display">{{ chartTempYear }}</span>
                      <button class="year-btn" @click="chartTempYear++"><ChevronRight :size="16"/></button>
                    </div>
                    <div class="month-grid">
                      <button 
                        v-for="m in monthList" :key="m.val" class="month-btn"
                        :class="{ 'active': isChartMonthActive(m.val) }"
                        @click="selectChartMonth(m.val)"
                      >
                        {{ m.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="chart-content">
            <VueApexCharts :key="chartMode" type="area" height="100%" :options="chartOptions" :series="series" />
          </div>
        </div>

        <div class="card donut-card">
          <div class="card-head">
            <h3 class="card-title" style="display: flex; align-items: center; gap: 0.5rem;">
              <PieChart :size="16" color="#3b82f6"/> Distribusi Kategori
            </h3>
            <span class="filter-badge">Halaman {{ currentPage }}</span>
          </div>
          <div class="donut-content">
            <VueApexCharts type="donut" height="230" :options="pieOptions" :series="pieSeries" />
          </div>
        </div>
      </div>

      <div class="card list-card">
        <div class="card-head">
          <div class="title-with-badge">
            <h3 class="card-title">Riwayat Reimbursement Terkini</h3>
          </div>
        </div>
        <div class="filter-row">
          <button v-for="f in filters" :key="f" class="filter-btn" :class="{ active: activeStatusFilter === f }" @click="activeStatusFilter = f">{{ f }}</button>
        </div>
        
        <div class="history-list">
          <div v-if="isLoading" class="loading-container">
            <div class="global-spinner"></div>
            <p>Memuat riwayat...</p>
          </div>
          <div v-else-if="filteredHistory.length === 0" class="empty-state">
            Tidak ada riwayat pada status yang dipilih.
          </div>
          <template v-else>
            <div v-for="item in filteredHistory" :key="item.id" class="history-row">
              <div class="h-left">
                <div class="avatar-circle">{{ item.name[0] }}</div>
                <div class="h-info">
                  <p class="h-name">{{ item.name }}</p>
                  <p class="h-meta">{{ item.category }} &bull; {{ item.date }}</p>
                </div>
              </div>
              <div class="h-right">
                <p class="h-amount">{{ item.amount }}</p>
                
                <div class="action-row mt-1">
                  <template v-if="item.status === 'Menunggu'">
                    <button class="btn-action tolak" @click="openTolak(item)">Tolak</button>
                    <button class="btn-action proses" @click="openProses(item)">Proses</button>
                  </template>
                  
                  <template v-else-if="item.status === 'Disetujui'">
                    <button class="btn-action bayar-green" @click="openBayar(item)">Bayar</button>
                  </template>
                  
                  <template v-else-if="item.status === 'Dibayar'">
                    <button class="btn-action bukti-ghost" @click="openReceipt(item)">Bukti</button>
                  </template>
                  
                  <template v-else-if="item.status === 'Ditolak'">
                    <button class="btn-action tolak-ghost" @click="openReason(item)">Alasan</button>
                  </template>
                  
                  <template v-else>
                    <span class="status-pill" :class="item.status.toLowerCase()">{{ item.status }}</span>
                  </template>
                </div>

              </div>
            </div>
          </template>
        </div>
        
        <div class="table-footer" v-if="lastPage > 1">
          <div class="pagination">
            <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><ChevronLeft :size="12" /></button>
            <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }" @click="changePage(page)">{{ page }}</button>
            <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)"><ChevronRight :size="12" /></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-backdrop" @click.self="showConfirmModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isMandatory ? 'Proses Pembayaran?' : 'Setujui Pengajuan?' }}</h3>
          <button class="close-btn" @click="showConfirmModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menyetujui pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{ selectedItem?.name }}</strong>.
          </p>

          <div class="upload-section" v-if="isMandatory">
            <label class="upload-label">
              Wajib Sertakan Bukti Transfer <span class="text-red">*</span>
            </label>
            <div class="upload-field" :class="{ 'has-file': proofName, 'shake': uploadShake }">
              <input type="text" :value="proofName || 'Pilih file (JPG/PNG/PDF)...'" readonly class="upload-input-mock" />
              <label class="upload-btn-inner">
                <FileText :size="16" />
                <input type="file" @change="handleFileUpload" class="hidden-input" accept=".jpg,.jpeg,.png,.pdf" />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal batal" @click="showConfirmModal = false">Batal</button>
          <button class="btn-modal main-btn"
            :class="{ 'pay': isMandatory, 'approve': !isMandatory }"
            :disabled="isMandatory && !proofFile" @click="confirmAction">
            {{ isMandatory ? 'Bayar' : 'Setujui' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReceiptModal" class="modal-backdrop" @click.self="closeReceipt">
      <div class="modal receipt-modal">
        <div class="modal-header">
          <h3 class="modal-title">Bukti Transfer</h3>
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Zoom Out"><ZoomOut :size="14" /></button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="zoom-btn" @click="zoomIn" title="Zoom In"><ZoomIn :size="14" /></button>
            <div class="divider-vertical"></div>
            <button class="zoom-btn reset" @click="resetZoom" title="Reset Zoom"><RotateCcw :size="14" /></button>
          </div>
          <button class="close-btn" @click="closeReceipt"><X :size="18" /></button>
        </div>
        <div class="modal-body image-viewer-body">
          <div class="image-container">
            <img :src="selectedReceiptUrl" alt="Bukti Transfer" class="zoomable-image" :style="{ transform: `scale(${zoomLevel})` }" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal-backdrop" @click.self="showRejectModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Tolak Pengajuan?</h3>
          <button class="close-btn" @click="showRejectModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menolak pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{ selectedItem?.name }}</strong>.
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
        <div class="modal-footer">
          <button class="btn-modal batal-outline" @click="showRejectModal = false">Batal</button>
          <button class="btn-modal tolak-btn" @click="confirmTolak">Tolak Pengajuan</button>
        </div>
      </div>
    </div>

    <div v-if="showReasonModal" class="modal-backdrop" @click.self="showReasonModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Alasan Penolakan</h3>
          <button class="close-btn" @click="showReasonModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Pengajuan dari <strong>{{ selectedItem?.name }}</strong> ditolak dengan alasan:
          </p>
          <div class="upload-section">
            <textarea class="reject-textarea" rows="4" readonly :value="selectedItem?.rejectionReason"
              style="background-color: #f8fafc; cursor: not-allowed; color: #475569;"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn-modal batal-outline" @click="showReasonModal = false" style="width: 100%;">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="modal-backdrop" @click.self="closeSuccess">
      <div class="modal success-modal">
        <div class="modal-body success-body">
          <div class="success-icon-wrap">
            <CheckCircle :size="56" class="success-icon" />
          </div>
          <h2 class="success-title">Operasi Berhasil</h2>
          <button class="btn-back-success" @click="closeSuccess">Kembali</button>
        </div>
      </div>
    </div>

    <div v-if="showExportModal" class="modal-backdrop" @click.self="showExportModal = false">
      <div class="modal export-modal">
        <div class="modal-header">
          <h3 class="modal-title">Konfigurasi Ekspor Laporan</h3>
          <button class="close-btn" @click="showExportModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Metode Ekspor Tanggal</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="exportFilterMode" value="month" />
                <span>Bulan Tertentu</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="exportFilterMode" value="range" />
                <span>Rentang Tanggal</span>
              </label>
            </div>
          </div>

          <div v-if="exportFilterMode === 'month'" class="form-group">
            <label class="form-label">Pilih Bulan</label>
            <div class="custom-month-picker">
              <div class="year-selector">
                <button class="year-btn" @click="exportTempYear--"><ChevronLeft :size="16"/></button>
                <span class="year-display">{{ exportTempYear }}</span>
                <button class="year-btn" @click="exportTempYear++"><ChevronRight :size="16"/></button>
              </div>
              <div class="month-grid">
                <button v-for="m in monthList" :key="m.val" class="month-btn" :class="{ 'active': isExportMonthActive(m.val) }" @click="setExportMonth(m.val)">
                  {{ m.label }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="exportFilterMode === 'range'" class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Dari Tanggal</label>
              <input type="date" v-model="exportInputStart" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Sampai Tanggal</label>
              <input type="date" v-model="exportInputEnd" class="form-input" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showExportModal = false">Batal</button>
          <div class="export-actions">
            <button class="btn-download btn-pdf" :disabled="isExporting" @click="exportFilterMode === 'month' ? exportByMonth('pdf') : exportByDateRange('pdf')">
              <FileText :size="16" />
              <span>{{ isExporting ? 'Memproses...' : 'PDF' }}</span>
            </button>
            <button class="btn-download btn-excel" :disabled="isExporting" @click="exportFilterMode === 'month' ? exportByMonth('excel') : exportByDateRange('excel')">
              <Table :size="16" />
              <span>{{ isExporting ? 'Memproses...' : 'Excel' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-dasbor { display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; height: calc(100vh - 64px - 3rem); overflow: hidden; padding-bottom: 0.5rem; }

.quick-actions { display: flex; gap: 0.75rem; align-items: center; }
.qa-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
.qa-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.qa-outline:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.qa-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; color: white; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); }
.qa-primary:hover { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3); transform: translateY(-1px); }

/* --- STATS CARD --- */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; max-width: 600px; }
.stat-card { background: white; border-radius: 16px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
.card-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2); }
.stat-icon-box { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.card-blue .stat-icon-box { background: rgba(255,255,255,0.2); color: white; }
.stat-card:not(.card-blue) .stat-icon-box { background: #fef3c7; color: #f59e0b; }
.stat-label { font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }
.card-blue .stat-label { color: rgba(255,255,255,0.9); }
.stat-card:not(.card-blue) .stat-label { color: #64748b; }
.stat-card:not(.card-blue) .stat-value { color: #0f172a; }

/* --- GRID LAYOUT --- */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); gap: 1.5rem; flex: 1; min-height: 0; }
@media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; overflow-y: auto; } }

.left-column { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.chart-card { flex: 1; min-height: 250px; }
.donut-card { min-height: 220px; flex-shrink: 0; }
.list-card { flex: 1; display: flex; flex-direction: column; }

.card-head { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; flex-wrap: wrap; gap: 0.75rem;}
.title-with-badge { display: flex; align-items: center; gap: 0.5rem; }
.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0;}

.chart-header-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.custom-input { font-family: inherit; font-size: 0.7rem; color: #475569; font-weight: 600; cursor: pointer; padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; outline: none; transition: border-color 0.2s; }
.custom-input:focus { border-color: #3b82f6; }
.date-range-wrap { display: flex; align-items: center; gap: 0.3rem; }
.range-divider { color: #94a3b8; font-weight: 600; font-size: 0.8rem; }
.chart-content { padding: 0.5rem 1.5rem 0 0.5rem; flex: 1; position: relative; }
.donut-content { padding: 1rem; display: flex; justify-content: center; align-items: center; }

.month-wrap.relative { position: relative; display: inline-block; }
.month-selector { display: flex; align-items: center; gap: 0.25rem; }
.chart-month-dropdown { position: absolute; top: calc(100% + 4px); right: 0; z-index: 50; }
.chart-month-overlay { position: fixed; inset: 0; z-index: 40; }
.dropdown-content { position: relative; z-index: 50; background: white; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; width: 240px; }

/* History List */
.filter-row { padding: 1rem 1.5rem; display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; border-bottom: 1px solid #f8fafc; }
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn { background: #f8fafc; border: 1px solid #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 600; padding: 0.4rem 0.875rem; border-radius: 20px; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
.filter-btn:hover { background: #f1f5f9; color: #334155; }
.filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }
.history-list { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
.history-list::-webkit-scrollbar { width: 6px; }
.history-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.empty-state { padding: 2rem; text-align: center; color: #64748b; font-size: 0.8rem; font-weight: 500; }
.history-row { padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: default; }
.history-row:hover { background: #fcfdfe; }
.h-left { display: flex; align-items: center; gap: 0.875rem; }
.avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; border: 1px solid #dbeafe; }
.h-info { display: flex; flex-direction: column; gap: 0.125rem; }
.h-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.h-meta { font-size: 0.7rem; color: #64748b; font-weight: 500; }
.h-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.h-amount { font-size: 0.85rem; font-weight: 700; color: #0f172a; }

/* ACTION BUTTONS & PILLS */
.btn-action { border-radius: 6px; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.6rem; cursor: pointer; border: none; min-width: 60px; transition: all 0.2s; }
.btn-action.tolak { background: #ef4444; color: white; }
.btn-action.tolak-ghost { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.btn-action.tolak-ghost:hover { background: #fee2e2; }
.btn-action.proses { background: #3b82f6; color: white; }
.btn-action.bayar-green { background: #22c55e; color: white; }
.btn-action.bukti-ghost { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.p-btn, .p-num { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.p-btn:hover:not(:disabled), .p-num:hover:not(.active) { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.p-num.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }

/* --- MODAL VARIANTS --- */
.modal { max-width: 440px; }
.export-modal { max-width: 500px; }
.export-modal .modal-header { justify-content: space-between; }
.export-modal .close-btn { order: 1; margin-right: 0; }
.confirm-modal { max-width: 380px; }

/* Radio Buttons for Export Modal */
.radio-group { display: flex; gap: 1.5rem; margin-top: 0.5rem; margin-bottom: 1rem; }
.radio-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #1e293b; cursor: pointer; }
.radio-label input[type="radio"] { cursor: pointer; accent-color: #3b82f6; }

.export-actions { display: flex; gap: 0.75rem; align-items: center; }
.btn-cancel { background: transparent; border: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 0.8125rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s; }
.btn-cancel:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }

/* Export Download Buttons */
.btn-download { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border: none; color: white; transition: all 0.2s; }
.btn-pdf { background: #ef4444; }
.btn-pdf:hover:not(:disabled) { background: #dc2626; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25); }
.btn-excel { background: #10b981; }
.btn-excel:hover:not(:disabled) { background: #059669; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
</style>