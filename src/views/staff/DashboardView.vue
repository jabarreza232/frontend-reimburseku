<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, ChevronLeft, ChevronRight, Calendar, Check, X, Clock, CheckCircle2, Zap, XCircle, ChevronDown, Download, Wallet, FileText, Table } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()
const authStore = useAuthStore()

// 1. Set Default Filter ke Bulan & Tahun Saat Ini
const dateNow = new Date()
const currentYear = dateNow.getFullYear()
const currentMonth = dateNow.getMonth() + 1

const filterAktif = ref('semua')
const filterBulan = ref(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`)
const showModalBulan = ref(false)
const tempBulan = ref(currentMonth)
const tempTahun = ref(currentYear)
const isLoading = ref(true)

const filterList = [
  { key: 'semua',    label: 'Semua',   warna: '' },
  { key: 'menunggu', label: 'Menunggu', warna: '#f59e0b' },
  { key: 'diterima', label: 'Diterima', warna: '#3b82f6' },
  { key: 'ditolak',  label: 'Tolak',   warna: '#ef4444' },
  { key: 'dibayar',  label: 'Dibayar', warna: '#22c55e' },
]

// Data State
const semuaData = ref([])
const halamanAktif = ref(1)
const totalHalaman = ref(1)

// === STATE & FUNGSI MENU EKSPOR ===
const showExportMenu = ref(false)

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const exportToExcel = () => {
  showExportMenu.value = false 
  if (semuaData.value.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.')

  const exportData = semuaData.value.map((item, index) => ({
    'No': index + 1,
    'Tanggal': item.tanggal,
    'Kategori': item.kategori,
    'Judul Pengajuan': item.judul,
    'Status': item.status,
    'Catatan': item.catatan,
    'Jumlah (Rp)': item.jumlahAsli
  }))

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Reimbursement")

  const fileName = `Laporan_Reimbursement_${labelBulanTampil.value.replace(' ', '_')}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

const exportToPDF = () => {
  showExportMenu.value = false 
  if (semuaData.value.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.')

  const doc = new jsPDF('p', 'mm', 'a4')
  doc.setFontSize(16)
  doc.text(`Laporan Reimbursement`, 14, 20)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Periode: ${labelBulanTampil.value} | Karyawan: Staff`, 14, 28)

  const tableColumn = ["No", "Tanggal", "Kategori", "Judul", "Status", "Jumlah"]
  const tableRows = []

  semuaData.value.forEach((item, index) => {
    tableRows.push([index + 1, item.tanggal, item.kategori, item.judul, item.status, item.jumlah])
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  })

  const fileName = `Laporan_Reimbursement_${labelBulanTampil.value.replace(' ', '_')}.pdf`
  doc.save(fileName)
}

// Notifikasi telah dipindah ke StaffLayout.vue

// Fetch Data API Reimbursement
const fetchReimbursements = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await ApiService.getMyReimbursementsByMonth(page, filterBulan.value)
    
    const responseData = res.data?.data || [] 
    const metaData = res.data?.meta || {}

    semuaData.value = responseData.map(item => ({
      id: item.id_request,
      kategori: item.category_name || 'Lain-lain',
      judul: item.description || item.category_name || 'Pengajuan Reimburse',
      status: mapStatusToFrontend(item.last_status),
      catatan: item.rejection_reason || item.description || '',
      jumlahAsli: item.amount, 
      jumlah: formatRupiah(item.amount),
      tanggal: new Date(item.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      tanggalIso: item.expense_date

    }))

    halamanAktif.value = metaData.current_page || 1
    totalHalaman.value = metaData.last_page || 1

  } catch (err) {
    console.error('Failed to fetch reimbursements:', err)
  } finally {
    isLoading.value = false 
  }
}

const pengajuanTerakhir = computed(() => {
  if (semuaData.value.length === 0) return null

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const tanggalHariIni = `${yyyy}-${mm}-${dd}`

  const dataHariIni = semuaData.value.find(item => item.tanggalIso === tanggalHariIni)

  return dataHariIni || null
})

const timelineSteps = computed(() => {
  if (!pengajuanTerakhir.value) return []
  
  const status = pengajuanTerakhir.value.status.toLowerCase()
  
  return [
    { 
      label: 'Diajukan', 
      desc: 'Berhasil dikirim ke sistem', 
      isComplete: true, 
      isCurrent: status === 'menunggu', 
      isRejected: false 
    },
    { 
      label: 'Menunggu Persetujuan', 
      desc: status === 'ditolak' ? 'Pengajuan ditolak' : ['diterima', 'disetujui', 'dibayar'].includes(status) ? 'Telah disetujui' : 'Menunggu antrean', 
      isComplete: ['diterima', 'disetujui', 'dibayar'].includes(status) || status === 'ditolak', 
      isCurrent: status === 'menunggu', 
      isRejected: status === 'ditolak' 
    },
    { 
      label: 'Proses Keuangan', 
      desc: status === 'dibayar' ? 'Selesai diverifikasi' : status === 'ditolak' ? 'Dibatalkan' : ['diterima', 'disetujui'].includes(status) ? 'Sedang diproses Finance' : 'Menunggu tahap sebelumnya', 
      isComplete: status === 'dibayar', 
      isCurrent: ['diterima', 'disetujui'].includes(status), 
      isRejected: status === 'ditolak'
    },
    { 
      label: 'Dana Cair', 
      desc: status === 'dibayar' ? 'Transfer berhasil dilakukan' : status === 'ditolak' ? 'Gagal' : 'Menunggu pencairan', 
      isComplete: status === 'dibayar', 
      isCurrent: status === 'dibayar', 
      isRejected: status === 'ditolak'
    }
  ]
})

onMounted(() => {
  fetchReimbursements(halamanAktif.value)
})

const dataFiltered = computed(() => {
  if (filterAktif.value === 'semua') return semuaData.value
  return semuaData.value.filter(d => d.status === filterAktif.value)
})

const ringkasanBulanIni = computed(() => {
  let pengajuan = 0, disetujui = 0, ditolak = 0
  semuaData.value.forEach(item => {
    pengajuan += item.jumlahAsli
    const s = item.status.toLowerCase()
    if (s === 'diterima' || s === 'disetujui' || s === 'dibayar') disetujui += item.jumlahAsli
    else if (s === 'ditolak') ditolak += item.jumlahAsli
  })
  return { pengajuan: formatRupiah(pengajuan), disetujui: formatRupiah(disetujui), ditolak: formatRupiah(ditolak) }
})

const kategoriStats = computed(() => {
  const stats = {
    'Transportasi': { label: 'Transportasi', total: 0, ikon: Car, bg: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)' },
    'Makanan': { label: 'Makanan', total: 0, ikon: UtensilsCrossed, bg: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' },
    'Parkir': { label: 'Parkir', total: 0, ikon: ParkingMeter, bg: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)' },
    'Lain-lain': { label: 'Dan lain-lain', total: 0, ikon: MoreHorizontal, bg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)' }
  }
  dataFiltered.value.forEach(item => {
    const namaKategori = item.kategori.toLowerCase()
    if (namaKategori.includes('transport')) stats['Transportasi'].total += item.jumlahAsli
    else if (namaKategori.includes('makan') || namaKategori.includes('minum')) stats['Makanan'].total += item.jumlahAsli
    else if (namaKategori.includes('parkir')) stats['Parkir'].total += item.jumlahAsli
    else stats['Lain-lain'].total += item.jumlahAsli
  })
  return Object.values(stats).map(s => ({ label: s.label, jumlah: formatRupiah(s.total), ikon: s.ikon, bg: s.bg }))
})

function gantiHalaman(h) { if (h >= 1 && h <= totalHalaman.value) fetchReimbursements(h) }

const namaBulanLengkap = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const labelBulanTampil = computed(() => {
  const [thn, bln] = filterBulan.value.split('-')
  return `${namaBulanLengkap[parseInt(bln) - 1]} ${thn}`
})
const bulanModalList = [
  { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' }, { val: 4, label: 'Apr' },
  { val: 5, label: 'Mei' }, { val: 6, label: 'Jun' }, { val: 7, label: 'Jul' }, { val: 8, label: 'Agt' },
  { val: 9, label: 'Sep' }, { val: 10, label: 'Okt' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Des' }
]

function bukaModalBulan() {
  const [thn, bln] = filterBulan.value.split('-')
  tempTahun.value = parseInt(thn); tempBulan.value = parseInt(bln)
  showModalBulan.value = true
}

function terapkanFilterBulan() {
  filterBulan.value = `${tempTahun.value}-${tempBulan.value.toString().padStart(2, '0')}`
  showModalBulan.value = false; fetchReimbursements(1)
}

function getLabelStatus(status) {
  const map = { dibayar: 'Dibayar', ditolak: 'Ditolak', menunggu: 'Menunggu', diterima: 'Diterima' }
  return map[status.toLowerCase()] || status
}

const getStatusIcon = (status) => {
  const s = status.toLowerCase()
  if (s === 'menunggu') return Clock
  if (s === 'diterima' || s === 'disetujui') return CheckCircle2
  if (s === 'dibayar') return Zap
  if (s === 'ditolak') return X
  return Clock
}

const getStatusPillClass = (status) => {
  const s = status.toLowerCase()
  if (s === 'menunggu') return 'menunggu'
  if (s === 'diterima' || s === 'disetujui') return 'diterima'
  if (s === 'dibayar') return 'dibayar'
  if (s === 'ditolak') return 'ditolak'
  return ''
}

const getBorderColor = (kategori) => {
  if (!kategori) return '#3B82F6'
  const name = kategori.toLowerCase()
  if (name.includes('transport')) return '#22c55e'
  if (name.includes('makan') || name.includes('minum')) return '#ec4899'
  if (name.includes('parkir')) return '#a855f7'
  return '#3B82F6'
}
</script>

<template>
  <div class="dasbor-staf">
    
        <div class="header-utama">

      <div class="greetings">
        <h2 class="teks-sapaan">Halo, {{ authStore.user?.name || 'Staf' }}! 👋</h2>
        <p class="teks-sapaan-sub">Selamat datang di dashboard Reimburseku.</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
          <Plus :size="16" /> 
          <span class="text-tombol">Tambah Reimbursement</span> 
        </button>



      </div>
    </div>

    
    <div class="ringkasan-finansial">
      <div class="rf-card primary-card">
        <div class="rf-icon-wrapper"><Wallet :size="20" /></div>
        <p class="rf-label">Total Pengajuan Bulan Ini</p>
        <h3 class="rf-value">{{ ringkasanBulanIni.pengajuan }}</h3>
      </div>
      <div class="rf-card">
        <div class="rf-icon-wrapper success"><CheckCircle2 :size="20" /></div>
        <p class="rf-label">Disetujui / Dibayar</p>
        <h3 class="rf-value text-success">{{ ringkasanBulanIni.disetujui }}</h3>
      </div>
      <div class="rf-card">
        <div class="rf-icon-wrapper danger"><XCircle :size="20" /></div>
        <p class="rf-label">Total Ditolak</p>
        <h3 class="rf-value text-danger">{{ ringkasanBulanIni.ditolak }}</h3>
      </div>
    </div>

    <div class="grid-dasbor">
      <div class="kolom-kiri">
        <div class="section-title-row title-with-filters">
          <h3 class="judul-seksi">Riwayat Reimbursement</h3>

          <div class="kontrol-aksi-row">
            <div class="select-wrapper">
              <select v-model="filterAktif" class="header-select">
                <option v-for="f in filterList" :key="f.key" :value="f.key">
                  {{ f.label }}
                </option>
              </select>
              <ChevronDown :size="14" class="select-icon" />
            </div>

            <button class="btn-tanggal-full" @click="bukaModalBulan">
              <span>{{ labelBulanTampil }}</span>
              <Calendar :size="18" class="ikon-kalender" />
            </button>

            <div class="dropdown-wrapper">
              <button class="btn-ekspor" @click="toggleExportMenu">
                <Download :size="18" class="ikon-ekspor" />
                <span>Ekspor</span>
                <ChevronDown :size="14" style="margin-left: 2px; color: #64748b;" />
              </button>

              <div v-if="showExportMenu" class="dropdown-menu">
                <button class="dropdown-item" @click="exportToPDF">
                  <FileText :size="16" class="text-danger" />
                  <span>Unduh PDF</span>
                </button>
                <button class="dropdown-item" @click="exportToExcel">
                  <Table :size="16" class="text-success" />
                  <span>Unduh Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="daftar-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-container">
            <div class="global-spinner"></div>
            <p>Memuat riwayat...</p>
          </div>
          </div>

          <div v-else-if="dataFiltered.length === 0" class="kosong-teks">
            Tidak ada data untuk filter ini.
          </div>

          <template v-else>
            <div class="daftar-list reimbursement-cards">
              <div
                v-for="item in dataFiltered"
                :key="item.id"
                class="reimbursement-card"
                :style="{ borderRightColor: getBorderColor(item.kategori) }"
                @click="router.push('/staf/reimbursement/' + item.id)"
              >
                <div class="card-content">
                  <div class="card-info">
                    <h3 class="card-title">{{ item.judul }}</h3>
                    
                    <div class="status-badge-container">
                      <span class="status-pill" :class="getStatusPillClass(item.status)">
                        <component :is="getStatusIcon(item.status)" :size="12" class="status-icon" />
                        {{ getLabelStatus(item.status) }}
                      </span>
                      <span v-if="item.catatan && item.status.toLowerCase() === 'ditolak'" class="status-reason">{{ item.catatan }}</span>
                    </div>
                    
                    <div class="amount">{{ item.jumlah }}</div>
                  </div>
                  <div class="date">{{ item.tanggal }}</div>
                </div>
              </div>
            </div>

            <div class="paginasi">
              <button class="btn-paging" @click="gantiHalaman(halamanAktif - 1)" :disabled="halamanAktif === 1">
                <ChevronLeft :size="16" />
              </button>
              <button
                v-for="h in totalHalaman"
                :key="h"
                class="btn-paging"
                :class="{ 'paging-aktif': halamanAktif === h }"
                @click="gantiHalaman(h)"
              >{{ h }}</button>
              <button class="btn-paging" @click="gantiHalaman(halamanAktif + 1)" :disabled="halamanAktif === totalHalaman">
                <ChevronRight :size="16" />
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="kolom-kanan">
        <h2 class="judul-seksi">Statistik dan Laporan</h2>
     <div class="grid-statistik">
  <div v-for="s in kategoriStats" :key="s.label" class="kartu-stat" :style="{ background: s.bg }">
    <div class="stat-ikon">
      <component :is="s.ikon" :size="28" />
    </div>
    <div class="stat-info">
      <p class="stat-label">{{ s.label }}</p>
      <p class="stat-jumlah">{{ s.jumlah }}</p>
    </div>
  </div>
      </div>

        <div v-if="pengajuanTerakhir" class="tracker-section">
          <h2 class="judul-seksi judul-tracker">Pelacakan Pengajuan Terakhir</h2>
          <div class="tracker-card">
            <div class="tracker-header-info">
              <h4 class="tracker-judul-klaim">{{ pengajuanTerakhir.judul }}</h4>
              <p class="tracker-harga-klaim">{{ pengajuanTerakhir.jumlah }}</p>
            </div>

            <div class="timeline">
              <div 
                v-for="(step, idx) in timelineSteps" 
                :key="idx" 
                class="timeline-item"
                :class="{ 
                  'complete': step.isComplete, 
                  'current': step.isCurrent, 
                  'rejected': step.isRejected 
                }"
              >
                <div class="timeline-badge-wrap">
                  <div class="timeline-badge">
                    <Check v-if="step.isComplete && !step.isRejected" :size="12" />
                    <X v-else-if="step.isRejected" :size="12" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                </div>
                <div class="timeline-content">
                  <h5>{{ step.label }}</h5>
                  <p>{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showModalBulan" class="modal-backdrop" @click.self="showModalBulan = false">
      <div class="modal month-modal">
        <h3 class="modal-judul">Pilih Bulan</h3>
        <div class="modal-tahun-kontrol">
          <button class="btn-kontrol-tahun" @click="tempTahun--"><ChevronLeft :size="18"/></button>
          <span class="label-tahun">{{ tempTahun }}</span>
          <button class="btn-kontrol-tahun" @click="tempTahun++"><ChevronRight :size="18"/></button>
        </div>
        <div class="grid-bulan">
          <button
            v-for="b in bulanModalList"
            :key="b.val"
            class="btn-bulan-item"
            :class="{ 'aktif': tempBulan === b.val }"
            @click="tempBulan = b.val"
          >
            {{ b.label }}
          </button>
        </div>
        <div class="modal-aksi">
          <button class="btn-batal" @click="showModalBulan = false">Batal</button>
          <button class="btn-terapkan" @click="terapkanFilterBulan">Terapkan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header Layout with Filters */
.title-with-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.title-with-filters .judul-seksi { margin-bottom: 0; }

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.header-select {
  appearance: none;
  background-color: white;
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-main, #1e293b);
  padding: 0.625rem 2rem 0.625rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  height: 100%;
}
.header-select:hover, .header-select:focus {
  border-color: var(--color-primary, #3b82f6);
}

.select-icon {
  position: absolute;
  right: 0.5rem;
  pointer-events: none;
  color: #64748b;
}

.header-btn-tanggal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-main, #1e293b);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.header-btn-tanggal:hover {
  border-color: var(--color-primary, #3b82f6);
}

.ikon-kalender { color: #64748b; }

/* --- KONTROL AKSI (Kalender & Ekspor) --- */
.kontrol-aksi-row { display: flex; gap: 0.75rem; }
.btn-tanggal-full {
  flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
  background-color: white; border: 1.5px solid #60a5fa; color: #3b82f6; padding: 0.75rem 1.25rem;
  border-radius: 8px; font-size: 0.9375rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease;
}
.btn-tanggal-full:hover { background-color: #eff6ff; }
.btn-tanggal-full .ikon-kalender { color: #60a5fa; flex-shrink: 0; }

.btn-ekspor {
  display: flex; align-items: center; gap: 0.5rem; background-color: white; border: 1px solid #cbd5e1;
  color: #475569; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9375rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease; height: 100%;
}
.btn-ekspor:hover { background-color: #f1f5f9; color: #0f172a; }
.ikon-ekspor { color: #64748b; }

/* --- MODAL BULAN --- */
.month-modal { max-width: 340px; padding: 1.5rem; }
.modal-judul {
  font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; text-align: center;
  color: var(--color-text-main, #1e293b);
}
.modal-tahun-kontrol {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem; padding: 0.5rem; background: #f8fafc; border-radius: 8px;
}
.btn-kontrol-tahun {
  background: none; border: none; cursor: pointer; padding: 0.25rem;
  color: var(--color-text-muted, #64748b); display: flex; align-items: center; justify-content: center;
}
.btn-kontrol-tahun:hover { color: var(--color-primary, #3b82f6); }
.label-tahun { font-weight: 700; font-size: 1.0625rem; color: var(--color-text-main, #1e293b); }
.grid-bulan { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1.5rem; }
.btn-bulan-item {
  background: white; border: 1px solid var(--color-border, #e2e8f0); border-radius: 8px;
  padding: 0.5rem; font-size: 0.875rem; color: var(--color-text-muted, #64748b); font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.btn-bulan-item:hover { background: #f1f5f9; color: #0f172a; }
.btn-bulan-item.aktif { background: var(--color-primary, #3b82f6); color: white; border-color: var(--color-primary, #3b82f6); }
.modal-aksi { display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-batal {
  background: none; border: none; font-size: 0.875rem; font-weight: 500;
  color: var(--color-text-muted, #64748b); cursor: pointer; padding: 0.5rem 1rem;
}
.btn-batal:hover { color: #1e293b; }
.btn-terapkan {
  background: var(--color-primary, #3b82f6); border: none; font-size: 0.875rem; font-weight: 500;
  color: white; cursor: pointer; padding: 0.5rem 1.25rem; border-radius: 8px;
}
.btn-terapkan:hover { background: #2563eb; }

/* --- Main Layout --- */
.dasbor-staf {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  gap: 1.25rem;
}

/* --- HEADER UTAMA & NOTIFIKASI --- */
.header-utama {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.greetings {
  display: flex;
  flex-direction: column;
}
.teks-sapaan {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-main, #1e293b);
  margin: 0 0 0.15rem 0;
}
.teks-sapaan-sub {
  font-size: 0.9375rem;
  color: var(--color-text-muted, #64748b);
  margin: 0;
}
.judul-halaman {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main, #1e293b);
}
.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main, #1e293b);
  margin-top: 0;
  margin-bottom: 1rem;
}
.tombol-tambah {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.tombol-tambah:hover { opacity: 0.9; }



/* --- RINGKASAN FINANSIAL (HIGHLIGHT CARDS) --- */
.ringkasan-finansial {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}
.rf-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.primary-card { background-color: #3b82f6; color: white; border-color: #3b82f6; }
.rf-icon-wrapper { margin-bottom: 0.75rem; opacity: 0.8; }
.rf-icon-wrapper.success { color: #10B981; }
.rf-icon-wrapper.danger { color: #EF4444; }
.rf-label { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; opacity: 0.9; }
.rf-card:not(.primary-card) .rf-label { color: #64748b; }
.rf-value { font-size: 1.5rem; font-weight: 700; margin: 0; }

/* Grid utama */
.grid-dasbor {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

/* ─── Kolom kiri ─── */
.kolom-kiri { display: flex; flex-direction: column; gap: 0; min-height: 0; overflow: hidden; }
.filter-chip-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3rem 0.875rem;
  border-radius: 999px; border: 1px solid var(--color-border, #e2e8f0); background: white;
  font-size: 0.8125rem; font-weight: 500; color: var(--color-text-muted, #64748b);
  cursor: pointer; transition: all 0.15s;
}
.filter-chip:hover { border-color: #3b82f6; color: #3b82f6; }
.filter-chip-aktif { background: #3b82f6; border-color: #3b82f6; color: white; }
.titik-warna { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.pilih-bulan { margin-bottom: 0; }

/* --- DAFTAR REIMBURSEMENT --- */
.daftar-container {
  background: white; border: 1px solid var(--color-border, #e2e8f0); border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); position: relative;
  display: flex; flex-direction: column; flex: 1; min-height: 300px;
}
.daftar-list { flex: 1; display: flex; flex-direction: column; }
.loading-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px); display: flex; flex-direction: column; justify-content: center;
  align-items: center; z-index: 10;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid var(--color-primary, #3b82f6);
  border-radius: 50%; animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite; margin-bottom: 1rem;
}
.loading-teks { font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted, #64748b); }

.reimbursement-cards {
  display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem;
  flex: 1; min-height: 0; overflow-y: auto;
}
.reimbursement-cards::-webkit-scrollbar { width: 6px; }
.reimbursement-cards::-webkit-scrollbar-track { background: transparent; }
.reimbursement-cards::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.reimbursement-cards::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

.reimbursement-card {
  display: flex; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6; border-right-width: 6px; border-right-style: solid;
  text-decoration: none; color: inherit; transition: all 0.2s ease; cursor: pointer;
}
.reimbursement-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.card-content { padding: 1.25rem 1.5rem; flex: 1; display: flex; justify-content: space-between; align-items: flex-end; }
.card-info { display: flex; flex-direction: column; gap: 0.6rem; }
.card-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #111827; }
.status-badge-container { display: flex; align-items: center; gap: 0.75rem; }
.status-reason { font-size: 0.8rem; color: #9CA3AF; }
.amount { font-size: 1rem; font-weight: 700; color: #111827; }
.date { font-size: 0.75rem; color: #9CA3AF; white-space: nowrap; }

/* Paginasi */
.paginasi {
  display: flex; justify-content: center; align-items: center; gap: 0.375rem; padding: 1rem;
  border-top: 1px solid #f1f5f9; margin-top: auto; background: white;
}
.btn-paging {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 500; background: white; border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-muted, #64748b); cursor: pointer; transition: background-color 0.2s ease;
}
.btn-paging:hover:not(:disabled):not(.paging-aktif) { background: #f1f5f9; }
.btn-paging:disabled { opacity: 0.4; cursor: not-allowed; }
.paging-aktif { background: var(--color-primary, #3b82f6); border-color: var(--color-primary, #3b82f6); color: white; }
.kosong-teks {
  padding: 2.5rem; text-align: center; color: var(--color-text-muted, #64748b);
  font-size: 0.875rem; margin: auto;
}

/* ─── Kolom kanan: Statistik ─── */
.kolom-kanan {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-right: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 0.25rem;
}
.grid-statistik {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding-top: 2rem;
}
.kartu-stat {
  border-radius: 10px;
  padding: 0.625rem 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}
.kartu-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%);
  pointer-events: none;
}
.kartu-stat:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04), inset 0 2px 0 rgba(255,255,255,0.4);
}
.stat-ikon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
  margin-bottom: 0.5rem;
}
.stat-label {
  font-size: 0.8125rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.1rem;
}
.stat-jumlah {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* ─── TRACKER SECTION ─── */
.tracker-section {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  overflow: hidden;
}
.judul-tracker { margin-top: 1rem; }
.tracker-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.tracker-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 1.25rem;
}
.tracker-judul-klaim {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tracker-harga-klaim {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Timeline */
.timeline {
  box-shadow: var(--shadow-sm);
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 13px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background-color: #f1f5f9;
  z-index: 1;
}
.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 2;
  margin-bottom: 0.5rem;
}
.timeline-badge-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.timeline-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #cbd5e1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.timeline-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.timeline-content h5 {
  font-size: 0.85rem;
  margin-bottom: 0.15rem;
  color: #1e293b;
}
.timeline-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}
.timeline-item.complete .timeline-content h5 { color: #3b82f6; }
.timeline-item.rejected .timeline-content h5 { color: #ef4444; }
.timeline-item.complete .timeline-badge { background-color: #3b82f6; border-color: #3b82f6; color: white; }
.timeline-item.current .timeline-badge { border-color: #3b82f6; color: #3b82f6; background-color: #eff6ff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
.timeline-item.rejected .timeline-badge { background-color: #ef4444; border-color: #ef4444; color: white; }

/* Dropdown Export */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
  height: 100%;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 180px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.5rem 0;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
}
.dropdown-item:hover { background-color: #f1f5f9; color: #0f172a; }

/* Responsivitas Mobile */
@media (max-width: 640px) {
  .header-utama {
    align-items: center;
  }
  .tombol-tambah {
    padding: 0.5rem;
  }
  .tombol-tambah .text-tombol {
    display: none;
  }
}

@media (max-width: 1100px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
  .grid-statistik {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .grid-statistik {
    grid-template-columns: 1fr;
  }
}
</style>