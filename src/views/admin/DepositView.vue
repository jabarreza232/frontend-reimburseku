<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, ChevronDown, Archive, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'

const router = useRouter()

const deposits = ref([])



const fetchDeposits = async () => {
  try {
    const res = await ApiService.getDeposits()
    const listData = res.data?.data?.data || res.data?.data || []
    
    deposits.value = listData.map(d => ({
      id: d.id_deposit,
      source: 'Deposit Kas',
      target: 'Reimbursement', // Based on mockup target
      amount: formatRupiah(d.amount),
      ref_bank: d.bank_ref_number || '-',
      date: new Date(d.transaction_date || d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      proof: d.transfer_receipt ? 'Lihat Bukti' : '-',
      proofUrl: d.transfer_receipt,
      note: d.notes || '-'
    }))
  } catch (error) {
    console.error('Failed to load deposits', error)
  }
}

onMounted(fetchDeposits)

const searchQuery = ref('')
const selectedMonth = ref('Januari 2026')
const sortOption = ref('Sort By')


const goToArchive = () => router.push('/admin/deposit/arsip')

const deleteDeposit = async (id) => {
  if (confirm('Yakin ingin menghapus deposit ini?')) {
    try {
      await ApiService.deleteDeposit(id) // Assuming we add deleteDeposit to ApiService
      fetchDeposits()
    } catch (err) {
      alert('Gagal menghapus deposit')
      console.error(err)
    }
  }
}

const filteredDeposits = computed(() => {
  return deposits.value.filter(d => 
    d.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.ref_bank.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="deposit-page">
    <div class="page-header">
      <h1 class="page-title">Deposit</h1>
      <button class="btn btn-primary btn-archive" @click="goToArchive">
        <Archive :size="14" /> Arsip
      </button>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Deposit</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Deposit..." class="search-input" />
          </div>
          <div class="filter-dropdown">
            <button class="btn btn-outline btn-filter">
              {{ selectedMonth }} <ChevronDown :size="12" />
            </button>
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              {{ sortOption }} <ChevronDown :size="12" />
            </button>
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
              <th>BUKTI TRANSFER</th>
              <th>CATATAN</th>
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
                <a v-if="d.proofUrl" :href="d.proofUrl" target="_blank" class="btn-text-sm">Lihat Bukti</a>
                <span v-else>-</span>
              </td>
              <td class="note-cell" :title="d.note">{{ d.note }}</td>
              <td class="text-center">
                <button class="btn-icon delete-row" title="Hapus" @click="deleteDeposit(d.id)"><Trash2 :size="12" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="pagination">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deposit-page { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.btn-archive { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; background: #3b82f6; color: white; border: none; cursor: pointer; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }

.btn-filter, .btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.text-primary-dark { color: #2563eb; }
.text-success { color: #16a34a; }
.font-mono { font-family: monospace; font-size: 0.7rem; }
.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }

.btn-text-sm { background: none; border: none; color: #3b82f6; font-size: 0.7rem; font-weight: 700; cursor: pointer; padding: 0; }

.btn-icon.archive-row { background: #f1f5f9; color: #3b82f6; width: 24px; height: 24px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
