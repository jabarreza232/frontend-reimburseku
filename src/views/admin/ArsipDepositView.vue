<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, Search, ChevronDown, RotateCcw, Info, ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'
import Swal from 'sweetalert2'

const router = useRouter()

const archivedDeposits = ref([])

// === STATE & FUNGSI UNTUK SORTING ===
const showSortMenu = ref(false)
const sortOption = ref('terbaru')

const sortOptions = [
  { label: 'Terbaru', value: 'terbaru' },
  { label: 'Terlama', value: 'terlama' },
  { label: 'Sumber (A - Z)', value: 'sumber_asc' },
  { label: 'Sumber (Z - A)', value: 'sumber_desc' },
]

const handleClickOutside = (event) => {
  if (!event.target.closest('.sort-dropdown')) {
    showSortMenu.value = false
  }
}

const fetchArchives = async () => {
  try {
    const res = await ApiService.getDepositDrafts()
    const listData = res.data?.data || []
    
    archivedDeposits.value = (Array.isArray(listData) ? listData : []).map(d => ({
      id: d.id_deposit,
      source: 'Deposit Kas',
      target: 'Reimbursement',
      amount: formatRupiah(d.amount),
      ref_bank: d.bank_ref_number || '-',
      date: new Date(d.deleted_at || d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      note: d.notes || '-'
    }))
  } catch (error) {
    console.error('Failed to load archives', error)
  }
}

onMounted(() => {
  fetchArchives()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const recoverDeposit = async (id) => {
  const result = await Swal.fire({
    title: 'Pulihkan Deposit?',
    text: "Yakin ingin memulihkan deposit ini?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, pulihkan!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.recoveryDeposit(id)
      fetchArchives()
      Swal.fire({ icon: 'success', title: 'Dipulihkan!', text: 'Deposit berhasil dipulihkan.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal memulihkan deposit' })
      console.error(err)
    }
  }
}

const searchQuery = ref('')

const filteredDeposits = computed(() => {
  let result = archivedDeposits.value.filter(d => 
    d.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.ref_bank.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  // Terapkan Sorting
  if (sortOption.value === 'terbaru') result.sort((a, b) => b.id - a.id)
  else if (sortOption.value === 'terlama') result.sort((a, b) => a.id - b.id)
  else if (sortOption.value === 'sumber_asc') result.sort((a, b) => a.source.localeCompare(b.source))
  else if (sortOption.value === 'sumber_desc') result.sort((a, b) => b.source.localeCompare(a.source))

  return result
})
</script>

<template>
  <div class="arsip-deposit-page">
    <!-- Info Alert -->
    <div class="info-alert">
      <div class="info-icon"><Info :size="14" /></div>
      <p class="info-text">Halaman ini menampilkan data deposit yang telah diarsipkan. Anda dapat memulihkan data ini kembali ke daftar utama jika diperlukan.</p>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <div class="header-title-wrapper">
          <button class="btn-back" @click="router.back()">
            <ArrowLeft :size="16" />
          </button>
          <h2 class="card-header-title">Arsip Deposit</h2>
        </div>
        
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari arsip deposit..." class="search-input" />
          </div>
          
          <!-- CUSTOM SORT DROPDOWN -->
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort" @click="showSortMenu = !showSortMenu">
              Urutkan <ChevronDown :size="12" />
            </button>
            <transition name="fade-down">
              <div v-if="showSortMenu" class="custom-dropdown-menu">
                <div 
                  v-for="option in sortOptions" 
                  :key="option.value" 
                  class="dropdown-item"
                  :class="{ active: sortOption === option.value }"
                  @click="sortOption = option.value; showSortMenu = false"
                >
                  <span>{{ option.label }}</span>
                  <Check v-if="sortOption === option.value" :size="14" class="text-primary" />
                </div>
              </div>
            </transition>
          </div>

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
              <th>CATATAN</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in filteredDeposits" :key="d.id">
              <td class="font-semibold">{{ d.source }}</td>
              <td class="text-primary-dark font-medium">{{ d.target }}</td>
              <td class="font-bold text-success">{{ d.amount }}</td>
              <td class="text-muted font-mono">{{ d.ref_bank }}</td>
              <td class="text-muted">{{ d.date }}</td>
              <td class="note-cell" :title="d.note">{{ d.note }}</td>
              <td class="text-center">
                <button class="btn-restore" title="Pulihkan Data" @click="recoverDeposit(d.id)">
                  <RotateCcw :size="12" /> Pulihkan
                </button>
              </td>
            </tr>
            <tr v-if="filteredDeposits.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Tidak ada data arsip deposit.</td>
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
  </div>
</template>

<style scoped>
/* BASE STYLES */
.arsip-deposit-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

/* INFO ALERT */
.info-alert { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 0.75rem 1rem; display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem; }
.info-icon { color: #3b82f6; flex-shrink: 0; }
.info-text { font-size: 0.75rem; color: #1e40af; line-height: 1.4; font-weight: 500; margin: 0;}

/* KARTU UTAMA */
.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.main-card { flex: 1; }

.card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; gap: 1rem; flex-wrap: wrap;}
.header-title-wrapper { display: flex; align-items: center; gap: 1rem; }
.card-header-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0;}

/* TOMBOL BACK */
.btn-back { width: 32px; height: 32px; border-radius: 8px; background: white; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; color: #475569; cursor: pointer; transition: all 0.2s;}
.btn-back:hover { background: #f1f5f9; color: #0f172a;}

/* ACTION HEADER */
.header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.search-box { position: relative; min-width: 220px;}
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.8125rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;}
.search-input:focus { border-color: #3b82f6; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.btn { padding: 0.5rem 0.875rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; transition: all 0.2s; border: 1px solid transparent; font-family: inherit;}
.btn-outline { background: white; border-color: #cbd5e1; color: #475569; }
.btn-outline:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }

/* TABLE */
.table-responsive { overflow-y: auto; overflow-x: auto; flex: 1; -webkit-overflow-scrolling: touch;}
.modern-table { width: 100%; border-collapse: collapse; text-align: left; }
.modern-table th { padding: 0.875rem 1.25rem; background: #f8fafc; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.modern-table td { padding: 1rem 1.25rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap;}
.modern-table tbody tr:hover { background: #f8fafc; }

.font-semibold { font-weight: 600; color: #1e293b; }
.text-primary-dark { color: #1e40af; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-success { color: #16a34a; }
.text-muted { color: #64748b; font-size: 0.8125rem;}
.font-mono { font-family: monospace; font-size: 0.8125rem;}
.text-center { text-align: center !important; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem;}

.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }

/* TOMBOL RESTORE DI TABEL */
.btn-restore { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.625rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.375rem; transition: all 0.2s; margin: 0 auto;}
.btn-restore:hover { background: #dcfce7; border-color: #86efac; }

/* PAGINASI & FOOTER */
.table-footer { padding: 1rem 1.25rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; }
.pagination { display: flex; gap: 0.25rem; align-items: center; }
.page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s;}
.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.page-btn:hover:not(.active) { background: #f8fafc; color: #0f172a;}

/* CUSTOM DROPDOWN STYLE */
.sort-dropdown { position: relative; }

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 160px;
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
.dropdown-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 500; }
.text-primary { color: #2563eb; }

/* TRANSISI DROPDOWN */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */

@media (max-width: 768px) {
  /* Hapus limit height agar native body scroll bisa berfungsi di mobile */
  .arsip-deposit-page {
    height: auto;
    overflow: visible;
    padding-bottom: 2rem;
  }

  .main-card {
    min-height: 400px;
  }

  /* Header Stacking: Semua tombol, search, dropdow, memanjang ke bawah */
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .search-box, .sort-dropdown, .btn-sort {
    width: 100%;
    justify-content: center; /* Label ke tengah pada mobile */
  }

  /* Dropdown agar mengambil lebar penuh saat diklik di HP */
  .custom-dropdown-menu {
    width: 100%;
    min-width: 100%;
  }

  /* Table Footer (Pagination) jadi di tengah / tumpuk vertikal */
  .table-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
}
</style>