<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, ChevronLeft, ChevronRight, Calendar, Check, X, Clock, CheckCircle2, Zap } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import ApiService from '@/api/ApiService'

const router = useRouter()

// 1. Set Default Filter ke Bulan & Tahun Saat Ini (Otomatis)
const dateNow = new Date()
const currentYear = dateNow.getFullYear()
const currentMonth = dateNow.getMonth() + 1 // getMonth() dimulai dari 0

const filterAktif = ref('semua')
const filterBulan = ref(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`) // Format: YYYY-MM
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

// Helper Functions




// 2. Modifikasi Fungsi Fetch untuk menggunakan API By Month
const fetchReimbursements = async (page = 1) => {
  isLoading.value = true
  try {
    // Memanggil endpoint baru dengan mengirimkan parameter bulan
    const res = await ApiService.getMyReimbursementsByMonth(page, filterBulan.value)
    
    const responseData = res.data?.data || [] 
    const metaData = res.data?.meta || {}

    semuaData.value = responseData.map(item => ({
      id: item.id_request,
      kategori: item.category_name || 'Lain-lain',
      judul: item.category_name || 'Pengajuan Reimburse',
      status: mapStatusToFrontend(item.last_status),
      catatan: item.rejection_reason || item.description || '',
      jumlahAsli: item.amount, 
      jumlah: formatRupiah(item.amount),
      tanggal: new Date(item.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }))

    halamanAktif.value = metaData.current_page || 1
    totalHalaman.value = metaData.last_page || 1

  } catch (err) {
    console.error('Failed to fetch reimbursements:', err)
  } finally{
    isLoading.value = false 
  }
}

// Panggil API saat komponen pertama kali dimuat
onMounted(() => {
  fetchReimbursements(halamanAktif.value)
})

// Computed Filter Status
const dataFiltered = computed(() => {
  if (filterAktif.value === 'semua') return semuaData.value
  return semuaData.value.filter(d => d.status === filterAktif.value)
})

// Statistik Dinamis berdasarkan data yang di-fetch
const kategoriStats = computed(() => {
  const stats = {
    'Transportasi': { label: 'Transportasi', total: 0, ikon: Car, bg: '#22c55e' },
    'Makanan': { label: 'Makanan', total: 0, ikon: UtensilsCrossed, bg: '#ec4899' },
    'Parkir': { label: 'Parkir', total: 0, ikon: ParkingMeter, bg: '#a855f7' },
    'Lain-lain': { label: 'Dan lain-lain', total: 0, ikon: MoreHorizontal, bg: '#3b82f6' }
  }

  dataFiltered.value.forEach(item => {
    const namaKategori = item.kategori.toLowerCase()
    if (namaKategori.includes('transport')) stats['Transportasi'].total += item.jumlahAsli
    else if (namaKategori.includes('makan') || namaKategori.includes('minum')) stats['Makanan'].total += item.jumlahAsli
    else if (namaKategori.includes('parkir')) stats['Parkir'].total += item.jumlahAsli
    else stats['Lain-lain'].total += item.jumlahAsli
  })

  return Object.values(stats).map(s => ({
    label: s.label,
    jumlah: formatRupiah(s.total),
    ikon: s.ikon,
    bg: s.bg
  }))
})

// Fungsi Paginasi
function gantiHalaman(h) {
  if (h >= 1 && h <= totalHalaman.value) {
    fetchReimbursements(h)
  }
}

// Konfigurasi Bulan
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
  tempTahun.value = parseInt(thn)
  tempBulan.value = parseInt(bln)
  showModalBulan.value = true
}

// 3. Modifikasi Terapkan Filter
function terapkanFilterBulan() {
  const blnFormat = tempBulan.value.toString().padStart(2, '0')
  filterBulan.value = `${tempTahun.value}-${blnFormat}`
  showModalBulan.value = false
  
  // Panggil ulang API dari halaman 1 menggunakan bulan yang baru dipilih
  fetchReimbursements(1)
}

// UI Helpers
function getBadgeClass(status) {
  switch (status) {
    case 'dibayar':  return 'chip chip-bayar'
    case 'ditolak':  return 'chip chip-tolak'
    case 'menunggu': return 'chip chip-menunggu'
    case 'diterima': return 'chip chip-diterima'
    default: return 'chip'
  }
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
  if (s === 'menunggu') return 'pill-warning'
  if (s === 'diterima' || s === 'disetujui') return 'pill-info'
  if (s === 'dibayar') return 'pill-success'
  if (s === 'ditolak') return 'pill-danger'
  return ''
}

const getBorderColor = (kategori) => {
  if (!kategori) return '#3B82F6' // Default Lain-lain
  const name = kategori.toLowerCase()
  if (name.includes('transport')) return '#22c55e' // Hijau
  if (name.includes('makan') || name.includes('minum')) return '#ec4899' // Pink
  if (name.includes('parkir')) return '#a855f7' // Ungu
  return '#3B82F6' // Biru untuk Lain-lain
}
</script>
<template>
  <div class="dasbor-staf">
    <div class="header-utama">
      <h2 class="judul-halaman">Dashboard Staff</h2>
      <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
        <Plus :size="16" /> Tambah Reimbursement
      </button>
    </div>

    <div class="grid-dasbor">
      <div class="kolom-kiri">
        <div class="section-title-row">
          <h3 class="judul-seksi">Riwayat Reimbursement</h3>
        </div>

        <div class="filter-kiri-wrap">
          <div class="filter-chip-row">
            <button
              v-for="f in filterList"
              :key="f.key"
              class="filter-chip"
              :class="{ 'filter-chip-aktif': filterAktif === f.key }"
              @click="filterAktif = f.key"
            >
              <span v-if="f.warna" class="titik-warna" :style="{ background: f.warna }"></span>
              {{ f.label }}
            </button>
          </div>

          <button class="btn-tanggal-full" @click="bukaModalBulan">
            <span>{{ labelBulanTampil }}</span>
            <Calendar :size="18" class="ikon-kalender" />
          </button>
        </div>

   <div class="daftar-container">
          <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p class="loading-teks">Memuat riwayat...</p>
          </div>

          <div v-else-if="dataFiltered.length === 0" class="kosong-teks">
            Tidak ada data untuk filter ini.
          </div>

          <template v-else>
            <!-- 1. BUNGKUS DAFTAR ITEM DENGAN CLASS INI -->
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

            <!-- 2. PAGINASI AKAN MENGISI SISA BAGIAN BAWAH -->
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
  <div v-for="s in kategoriStats" :key="s.label" class="kartu-stat" :style="{ backgroundColor: s.bg }">
    <div class="stat-ikon">
      <component :is="s.ikon" :size="28" />
    </div>
    <div class="stat-info">
      <p class="stat-label">{{ s.label }}</p>
      <p class="stat-jumlah">{{ s.jumlah }}</p>
    </div>
  </div>
</div>
      </div>
    </div>

    <div v-if="showModalBulan" class="modal-backdrop" @click.self="showModalBulan = false">
      <div class="modal-box">
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
/* Struktur Baru Filter Kiri */
.filter-kiri-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

/* Tombol Tanggal Sesuai UI Foto */
.btn-tanggal-full {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border: 1.5px solid #60a5fa; /* Biru terang sesuai foto */
  color: #3b82f6;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-tanggal-full:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

.ikon-kalender {
  color: #60a5fa;
}

/* --- MODAL BULAN --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 340px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-judul {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--color-text-main);
}

.modal-tahun-kontrol {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.btn-kontrol-tahun {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-kontrol-tahun:hover {
  color: var(--color-primary);
}

.label-tahun {
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--color-text-main);
}

.grid-bulan {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn-bulan-item {
  background: white;
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-main);
}

.btn-bulan-item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-bulan-item.aktif {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  font-weight: 600;
}

.modal-aksi {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-batal {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
}

.btn-terapkan {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--color-primary, #3b82f6);
  color: white;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}
.btn-terapkan:hover {
  opacity: 0.9;
}
.dasbor-staf {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Baris atas */


.tombol-tambah {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* Grid utama */
.grid-dasbor {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 2rem;
  align-items: start;
}

.header-utama {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.judul-halaman {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1rem;
}

/* ─── Kolom kiri ─── */
.kolom-kiri {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Filter chip */
.filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.875rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-chip-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.titik-warna {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* Input bulan */
.pilih-bulan {
  margin-bottom: 0;
}

.filter-bulan-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-bulan {
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--color-text-main);
  background: white;
  outline: none;
  width: 100%;
  max-width: 220px;
  cursor: pointer;
}

.input-bulan:focus {
  border-color: var(--color-primary);
}

.daftar-container {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative; 
  min-height: 300px; /* Menjaga tinggi kotak agar tidak menyusut saat loading */
  display: flex;
  flex-direction: column;
}
.daftar-list {
  flex: 1; /* Memaksa elemen ini mendorong paginasi ke paling bawah */
  display: flex;
  flex-direction: column;
}
/* --- CSS LOADING SPINNER --- */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8); /* Semi transparan putih */
  backdrop-filter: blur(2px); /* Efek blur pada background di belakangnya */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0; /* Warna trek lingkaran abu-abu terang */
  border-top: 4px solid var(--color-primary, #3b82f6); /* Warna garis berputar */
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
  margin-bottom: 1rem;
}

.loading-teks {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

/* Animasi putaran 360 derajat */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* Cards layout */
.reimbursement-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  max-height: 550px;
  overflow-y: auto;
}

/* Custom Scrollbar */
.reimbursement-cards::-webkit-scrollbar {
  width: 6px;
}
.reimbursement-cards::-webkit-scrollbar-track {
  background: transparent;
}
.reimbursement-cards::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.reimbursement-cards::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.reimbursement-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  border-right-width: 6px;
  border-right-style: solid;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  cursor: pointer;
}

.reimbursement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-content {
  padding: 1.25rem 1.5rem;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.status-badge-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.pill-success {
  background-color: #ECFDF5;
  color: #10B981;
  border-color: #A7F3D0;
}

.pill-danger {
  background-color: #FEF2F2;
  color: #EF4444;
  border-color: #FECACA;
}

.pill-warning {
  background-color: #FFFBEB;
  color: #F59E0B;
  border-color: #FDE68A;
}

.pill-info {
  background-color: #EFF6FF;
  color: #3B82F6;
  border-color: #BFDBFE;
}

.status-reason {
  font-size: 0.8rem;
  color: #9CA3AF;
}

.amount {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.date {
  font-size: 0.75rem;
  color: #9CA3AF;
  white-space: nowrap;
}

/* Paginasi */
.paginasi {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  margin-top: auto; 
  background: white;
}

.btn-paging {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-paging:hover:not(:disabled):not(.paging-aktif) {
  background: #f1f5f9;
}

.btn-paging:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paging-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.kosong-teks {
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: auto;
}

/* ─── Kolom kanan: Statistik ─── */
.kolom-kanan {
  display: flex;
  flex-direction: column;
}

.grid-statistik {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.kartu-stat {
  border-radius: 14px;
  padding: 1rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  transition: all 0.25s ease;
  position: relative;
}

.kartu-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.stat-ikon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.22);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.stat-jumlah {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1100px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
  .grid-statistik {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-statistik {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
