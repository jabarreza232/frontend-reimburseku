<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Search, ChevronDown, RotateCcw, Info, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'
import Swal from 'sweetalert2'

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
  return archivedDeposits.value.filter(d => 
    d.source.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    d.ref_bank.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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
        <div style="display: flex; align-items: center; gap: 1rem;">
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
.arsip-deposit-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.info-alert { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 0.75rem 1rem; display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.5rem; }
.info-icon { color: #3b82f6; flex-shrink: 0; }
.info-text { font-size: 0.75rem; color: #1e40af; line-height: 1.4; font-weight: 500; }
.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }
.btn-restore { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 0.7rem; font-weight: 700; padding: 0.3rem 0.625rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; }
</style>
