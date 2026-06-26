<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, PencilLine } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const methods = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  provider_type: '',
  provider_name: '',
  code_provider: ''
})

const fetchProviders = async () => {
  try {
    const res = await ApiService.getProviders()
    const listData = res.data?.data?.data || res.data?.data || []
    
    methods.value = listData.map(m => ({
      id: m.id_provider,
      type: m.provider_name.toLowerCase().includes('bank') ? 'BANK TRANSFER' : 'E-WALLET',
      name: m.provider_name || '-',
      code: m.provider_code || '-',
      status: m.status || 'Aktif'
    }))
  } catch (err) {
    console.error('Failed to load providers', err)
  }
}

onMounted(fetchProviders)

const searchQuery = ref('')

function openAdd() {
  isEdit.value = false
  formData.value = { id: null, provider_type: '', provider_name: '', code_provider: '' }
  showModal.value = true
}

function openEdit(m) {
  isEdit.value = true
  formData.value = {
    id: m.id,
    provider_type: m.type,
    provider_name: m.name,
    code_provider: m.code
  }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

function submitAdd() {
  closeAdd()
}

async function toggleStatus(id) {
  const m = methods.value.find(x => x.id === id)
  if (m) {
    // Assuming backend endpoint /provider/{id} handles partial updates or status toggles
    try {
      const newStatus = m.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
      await ApiService.updateProvider(id, {
        provider_name: m.name,
        provider_code: m.code,
        status: newStatus
      })
      m.status = newStatus
    } catch (err) {
      alert('Gagal mengubah status')
    }
  }
}

const filteredMethods = computed(() => {
  return methods.value.filter(m => m.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="metode-bayar-page">


    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Daftar Metode Bayar</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari metode bayar..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Metode
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>BANK / E-WALLET</th>
              <th>NAMA LAYANAN</th>
              <th>KODE LAYANAN</th>
              <th>STATUS</th>
              <th width="140" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredMethods" :key="m.id">
              <td class="text-muted font-bold">{{ m.type }}</td>
              <td class="font-semibold">{{ m.name }}</td>
              <td class="text-muted font-mono">{{ m.code }}</td>
              <td>
                <span class="status-badge" :class="m.status === 'Aktif' ? 'active' : 'inactive'">
                  {{ m.status }}
                </span>
              </td>
              <td class="text-center">
                <button 
                  class="btn btn-xs" 
                  :class="m.status === 'Aktif' ? 'btn-danger-outline' : 'btn-success'"
                  @click="toggleStatus(m.id)"
                  style="margin-right: 0.25rem;"
                >
                  {{ m.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktivasi' }}
                </button>
                <button class="btn btn-xs btn-primary-outline" @click="openEdit(m)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredMethods.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredMethods.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredMethods.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Metode Bayar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Metode Bayar' : 'Tambah Metode Bayar Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi metode pembayaran' : 'Tambahkan metode pembayaran baru' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
          <div class="form-group">
            <label>Tipe Layanan <span class="required">*</span></label>
            <select v-model="formData.provider_type" class="form-control">
              <option value="">Pilih tipe layanan</option>
              <option value="BANK TRANSFER">Bank Transfer</option>
              <option value="E-WALLET">E-Wallet</option>
            </select>
          </div>
          <div class="form-group">
            <label>Kode Layanan <span class="required">*</span></label>
            <input v-model="formData.code_provider" type="text" class="form-control" placeholder="Contoh: BCA / GOPAY" />
          </div>
          <div class="form-group col-span-2">
            <label>Nama Layanan Lengkap <span class="required">*</span></label>
            <input v-model="formData.provider_name" type="text" class="form-control" placeholder="Contoh: Bank Central Asia / GoPay Indonesia" />
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Metode Bayar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metode-bayar-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.btn-xs { padding: 0.3rem 0.75rem; font-size: 0.7rem; font-weight: 700; border-radius: 6px; cursor: pointer; }
.btn-success { background: #22c55e; color: white; border: none; }
.btn-danger-outline { background: white; color: #ef4444; border: 1px solid #fecaca; }
</style>
