<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ChevronDown, Wallet } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'

const router = useRouter()

const stats = ref([
  { label: 'SALDO KAS', value: 'Rp 0', progress: 100, color: '#3b82f6', sub: 'Total Budget' },
  { label: 'TELAH DIBAYARKAN', value: 'Rp 0', progress: 0, color: '#22c55e', sub: 'Pengeluaran' },
  { label: 'MENUNGGU', value: 'Rp 0', progress: 0, color: '#f59e0b', sub: 'Estimasi tanggungan' },
])

const transactions = ref([])
const isLoading = ref(true)

// State Sorting
const searchQuery = ref('')
const sortOption = ref('terbaru') // Pilihan: terbaru, terlama, tertinggi, terendah
const isSortDropdownOpen = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const [statsRes, depositRes, reimbRes] = await Promise.all([
      ApiService.getBalanceStats(),
      ApiService.getDeposits(),
      ApiService.getReimbursements()
    ])

    const statsData = statsRes.data?.data || {}
    const saldoKas = statsData.saldo_kas || 0
    const telahDibayarkan = statsData.telah_dibayarkan || 0
    const menunggu = statsData.menunggu || 0
    const totalBudget = saldoKas + telahDibayarkan

    stats.value[0].value = formatRupiah(saldoKas)
    stats.value[1].value = formatRupiah(telahDibayarkan)
    stats.value[1].progress = totalBudget > 0 ? (telahDibayarkan / totalBudget) * 100 : 0
    stats.value[2].value = formatRupiah(menunggu)
    stats.value[2].progress = totalBudget > 0 ? (menunggu / totalBudget) * 100 : 0

    let allTx = []
    
    // 1. Deposits (Dana Masuk)
    const deposits = depositRes.data?.data?.data || depositRes.data?.data || []
    deposits.forEach(d => {
      allTx.push({
        id: `DEP-${d.id_company_deposit || d.id_deposit}`,
        type: 'Dana Masuk',
        source: d.bank_ref_number || 'Deposit Kas',
        amount: `+${formatRupiah(d.amount)}`,
        rawAmount: parseFloat(d.amount),
        rawDate: new Date(d.date_deposit || d.transaction_date || d.created_at),
        date: new Date(d.date_deposit || d.transaction_date || d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        note: d.description || d.notes || 'Penambahan Saldo Kas'
      })
    })

    // 2. Reimbursements Paid (Dana Keluar)
    const reimbursements = reimbRes.data?.data?.data || reimbRes.data?.data || []
    reimbursements.forEach(r => {
      if (r.last_status === 'PAID') {
        allTx.push({
          id: `RMB-${r.id_request}`,
          type: 'Dana Keluar',
          source: `Reimburse: ${r.employees_name || r.employee_name || 'Karyawan'}`,
          amount: `-${formatRupiah(r.amount)}`,
          rawAmount: -parseFloat(r.amount), // Jadikan negatif untuk kalkulasi saldo
          rawDate: new Date(r.expense_date || r.created_at),
          date: new Date(r.expense_date || r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          note: r.description || r.category_name || 'Pembayaran Reimbursement'
        })
      }
    })

    // Sort awal berdasarkan tanggal terlama untuk menghitung Saldo Berjalan (Running Balance)
    allTx.sort((a, b) => a.rawDate - b.rawDate)
    
    let currentBalance = 0;
    allTx = allTx.map(tx => {
      currentBalance += tx.rawAmount
      return { ...tx, rawBalance: currentBalance, balance: formatRupiah(currentBalance) }
    })

    transactions.value = allTx
  } catch (error) {
    console.error('Failed to load deposit data', error)
  } finally {
    isLoading.value = false
  }
})

// Fungsi Filter & Sort
const filteredAndSortedTransactions = computed(() => {
  let result = transactions.value.filter(t => 
    t.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.note.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (sortOption.value === 'terbaru') {
    result.sort((a, b) => b.rawDate - a.rawDate)
  } else if (sortOption.value === 'terlama') {
    result.sort((a, b) => a.rawDate - b.rawDate)
  } else if (sortOption.value === 'tertinggi') {
    result.sort((a, b) => Math.abs(b.rawAmount) - Math.abs(a.rawAmount))
  } else if (sortOption.value === 'terendah') {
    result.sort((a, b) => Math.abs(a.rawAmount) - Math.abs(b.rawAmount))
  }

  return result
})

const selectSort = (option) => {
  sortOption.value = option
  isSortDropdownOpen.value = false
}

const goToTambah = () => router.push('/finance/deposit/tambah')
</script>

<template>
  <div class="finance-deposit">
    
    <div class="card tracker-card">
      <div class="card-head">
        <h3 class="card-title">Deposit Tracker</h3>
        <button class="btn-add-setoran" @click="goToTambah">
          <Plus :size="16" /> <span class="btn-text">Tambah Saldo Kas</span>
        </button>
      </div>

      <div class="stats-row-wrapper">
        <div v-if="isLoading" class="stats-row">
          <div v-for="i in 3" :key="i" class="tracker-stat">
            <div class="skeleton skeleton-text" style="width: 50%;"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 100%; height: 5px; margin-top: 10px;"></div>
          </div>
        </div>

        <div v-else class="stats-row">
          <div v-for="s in stats" :key="s.label" class="tracker-stat">
            <div class="stat-meta">
              <p class="stat-label">{{ s.label }}</p>
              <p class="stat-value">{{ s.value }}</p>
            </div>
            <div class="progress-wrapper">
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: s.progress + '%', backgroundColor: s.color }"></div>
              </div>
              <p class="stat-sub">{{ s.sub }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card table-card">
      <div class="table-header">
        <div class="search-box">
          <Search :size="14" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Cari Riwayat..." class="search-input" />
        </div>
        
        <div class="sort-dropdown">
          <button class="btn btn-outline btn-sort" @click="isSortDropdownOpen = !isSortDropdownOpen">
            Urutkan <ChevronDown :size="14" />
          </button>
          
          <div v-if="isSortDropdownOpen" class="dropdown-menu">
            <button class="dropdown-item" :class="{ active: sortOption === 'terbaru' }" @click="selectSort('terbaru')">Terbaru</button>
            <button class="dropdown-item" :class="{ active: sortOption === 'terlama' }" @click="selectSort('terlama')">Terlama</button>
            <button class="dropdown-item" :class="{ active: sortOption === 'tertinggi' }" @click="selectSort('tertinggi')">Nominal Tertinggi</button>
            <button class="dropdown-item" :class="{ active: sortOption === 'terendah' }" @click="selectSort('terendah')">Nominal Terendah</button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>JENIS TRANSAKSI</th>
              <th>SUMBER / TUJUAN</th>
              <th>NOMINAL</th>
              <th>SALDO AKHIR</th>
              <th>TANGGAL</th>
              <th>KETERANGAN</th>
            </tr>
          </thead>

          <tbody v-if="isLoading">
            <tr>
              <td colspan="6" class="text-center loading-state">
                <div class="loader-spinner"></div>
                <p class="loading-text">Memuat transaksi...</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="filteredAndSortedTransactions.length === 0">
            <tr>
              <td colspan="6" class="text-center empty-state">
                <p class="text-muted">Tidak ada data transaksi ditemukan.</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="t in filteredAndSortedTransactions" :key="t.id">
              <td>
                <span class="type-badge" :class="t.type.replace(' ', '-').toLowerCase()">
                  {{ t.type }}
                </span>
              </td>
              <td>
                <p class="t-source" :class="{ 'text-blue': t.type === 'Dana Keluar' }">{{ t.source }}</p>
              </td>
              <td class="font-bold" :class="t.type === 'Dana Masuk' ? 'text-green' : 'text-red'">
                {{ t.amount }}
              </td>
              <td class="font-bold">{{ t.balance }}</td>
              <td class="text-muted">{{ t.date }}</td>
              <td class="text-muted">{{ t.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES */
.finance-deposit { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem; 
  background: #f8fafc; 
  height: 100%; 
  overflow: hidden; 
}

.card { 
  background: white; 
  border-radius: 12px; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
  border: 1px solid #f1f5f9; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  min-height: 0; 
}
.table-card { flex: 1; }
.tracker-card { flex-shrink: 0; }
.card-head { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }

/* TRACKER */
.btn-add-setoran { 
  background: #3b82f6; color: white; border: none; font-size: 0.75rem; 
  font-weight: 700; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; 
  display: flex; align-items: center; gap: 0.375rem; transition: background 0.2s;
}
.btn-add-setoran:hover { background: #2563eb; }

/* Wrapper untuk mobile scroll */
.stats-row-wrapper {
  width: 100%;
}
.stats-row { 
  padding: 0 1.25rem 1rem; 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 1rem; 
}

.tracker-stat { 
  padding: 1rem; border: 1px solid #f1f5f9; border-radius: 12px; 
  display: flex; flex-direction: column; gap: 0.5rem; background: #fff;
}
.stat-meta { display: flex; flex-direction: column; gap: 0.125rem; }
.stat-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em;}
.stat-value { font-size: 1.125rem; font-weight: 800; color: #1e293b; }
.progress-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
.progress-container { width: 100%; height: 5px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.progress-bar { height: 100%; border-radius: 10px; }
.stat-sub { font-size: 0.6rem; color: #cbd5e1; font-weight: 700; }

/* TABLE SECTION */
.table-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.search-box { position: relative; flex: 1; max-width: 300px; }
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.8125rem; outline: none; }
.search-input:focus { border-color: #3b82f6; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.sort-dropdown { position: relative; }
.btn-sort { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
.dropdown-menu { position: absolute; top: calc(100% + 5px); right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 160px; z-index: 10; display: flex; flex-direction: column; padding: 0.25rem; }
.dropdown-item { padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 600; color: #475569; background: white; border: none; text-align: left; cursor: pointer; border-radius: 4px; }
.dropdown-item:hover { background: #f8fafc; color: #1e293b; }
.dropdown-item.active { background: #eff6ff; color: #3b82f6; }

.table-responsive { overflow-x: auto; flex: 1; -webkit-overflow-scrolling: touch; }
.type-badge { font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; white-space: nowrap;}
.type-badge.dana-masuk { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.type-badge.dana-keluar { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }

.t-source { font-weight: 700; color: #1e293b; }
.text-blue { color: #3b82f6; }
.text-green { color: #22c55e; }
.text-red { color: #ef4444; }

/* SKELETON LOADER */
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingSkeleton 1.5s infinite;
  border-radius: 4px;
}
.skeleton-title { height: 20px; width: 80%; margin-top: 5px; }
@keyframes loadingSkeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}


/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */

@media (max-width: 1024px) {
  .finance-deposit {
    height: auto;
    overflow-y: visible;
    padding-bottom: 2rem;
  }
  
  .table-card {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .card-head {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  /* Tombol tambah pada layar sempit cuma tampil icon atau text mengecil */
  .btn-text { display: none; }
  .btn-add-setoran { padding: 0.5rem; border-radius: 50%; width: 36px; height: 36px; justify-content: center; }

  /* Kartu Statistik jadi bisa discroll ke samping */
  .stats-row-wrapper {
    margin: 0 -1rem;
    padding: 0 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }
  .stats-row-wrapper::-webkit-scrollbar { display: none; /* Chrome & Safari */ }
  
  .stats-row {
    display: flex;
    width: max-content;
    gap: 1rem;
    padding-bottom: 1rem;
  }
  
  .tracker-stat {
    min-width: 220px; /* Ukuran minimum agar teks tidak gepeng */
  }

  /* Table Header (Filter & Search) disusun menyamping penuh atau vertikal */
  .table-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .search-box {
    max-width: 100%;
  }

  .sort-dropdown {
    width: 100%;
  }

  .btn-sort {
    width: 100%;
    justify-content: space-between;
  }

  .dropdown-menu {
    width: 100%;
  }
}
</style>