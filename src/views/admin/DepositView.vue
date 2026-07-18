<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, ChevronDown, Archive, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ApiService from '@/api/ApiService'
import { formatRupiah } from '@/utils/format'
import Swal from 'sweetalert2'

const router = useRouter()

const deposits = ref([])
const previewImageUrl = ref(null)

const openPreview = (url) => {
  previewImageUrl.value = url
}

const closePreview = () => {
  previewImageUrl.value = null
}
const fetchDeposits = async () => {
  try {
    const res = await ApiService.getDeposits()
    const listData = res.data?.data?.data || res.data?.data || []
    
    deposits.value = listData.map(d => ({
      id: d.id_company_deposit || d.id_deposit,
      source: 'Deposit Kas',
      target: 'Reimbursement', // Berdasarkan target pada mockup
      amount: formatRupiah(d.amount),
      ref_bank: d.bank_ref_number || '-',
      date: new Date(d.date_deposit || d.transaction_date || d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      proof: d.transfer_receipt ? 'Lihat Bukti' : '-',
      proofUrl: d.transfer_receipt,
      note: d.description || d.notes || '-'
    }))
  } catch (error) {
    console.error('Gagal memuat deposit', error)
  }
}

onMounted(fetchDeposits)

const searchQuery = ref('')
const selectedMonth = ref('Januari 2026')
const sortOption = ref('Sort By')


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
      await ApiService.deleteDeposit(id) // Memanggil endpoint deleteDeposit dari ApiService
      fetchDeposits()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Deposit berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus deposit' })
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
                <button class="btn-icon delete-row" title="Hapus" @click="deleteDeposit(d.id)"><Trash2 :size="12" /></button>
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
  </div>
</template>

<style scoped>
.deposit-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.note-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }
.btn-text-sm { background: none; border: none; color: #3b82f6; font-size: 0.7rem; font-weight: 700; cursor: pointer; padding: 0; }
.btn-icon.archive-row { background: #f1f5f9; color: #3b82f6; width: 24px; height: 24px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

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
</style>
