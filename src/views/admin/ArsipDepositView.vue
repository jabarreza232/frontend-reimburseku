<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Search, ChevronDown, RotateCcw, Info, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'

const router = useRouter()

const archivedDeposits = ref([])



const fetchArchives = async () => {
  try {
    const res = await ApiService.getDepositDrafts()
    const listData = res.data?.data || [] // The API might just return an array here based on Controller structure
    
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

onMounted(fetchArchives)

const recoverDeposit = async (id) => {
  if (confirm('Yakin ingin memulihkan deposit ini?')) {
    try {
      await ApiService.recoveryDeposit(id)
      fetchArchives()
    } catch (err) {
      alert('Gagal memulihkan deposit')
      console.error(err)
    }
  }
}

const searchQuery = ref('')
const filteredDeposits = computed(() => {
  return archivedDeposits.value.filter(d => 
    d.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.ref_bank.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="arsip-deposit-page">
    <div class="page-header">
      <div class="title-with-back">
        <button class="btn-back" @click="router.back()">
          <ArrowLeft :size="16" />
        </button>
        <h1 class="page-title">Arsip Deposit</h1>
      </div>
    </div>

    <!-- Info Alert -->
    <div class="info-alert">
      <div class="info-icon"><Info :size="14" /></div>
      <p class="info-text">Halaman ini menampilkan data deposit yang telah diarsipkan. Anda dapat memulihkan data ini kembali ke daftar utama jika diperlukan.</p>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Arsip Deposit</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari arsip deposit..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
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
.arsip-deposit-page { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fafc; height: 100%; overflow: hidden; }

.page-header { display: flex; align-items: center; margin-bottom: 0.25rem; }
.title-with-back { display: flex; align-items: center; gap: 0.75rem; }
.btn-back { background: white; border: 1px solid #e2e8f0; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.info-alert { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 0.75rem 1rem; display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem; }
.info-icon { color: #3b82f6; flex-shrink: 0; }
.info-text { font-size: 0.75rem; color: #1e40af; line-height: 1.4; font-weight: 500; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 280px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.text-primary-dark { color: #2563eb; }
.text-success { color: #16a34a; }
.font-mono { font-family: monospace; font-size: 0.7rem; }
.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }

.btn-restore { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.625rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
