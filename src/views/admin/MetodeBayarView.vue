<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const methods = ref([])

const fetchProviders = async () => {
  try {
    const res = await ApiService.getProviders()
    const listData = res.data?.data?.data || res.data?.data || []
    
    methods.value = listData.map(m => ({
      id: m.id_provider,
      type: m.provider_name.toLowerCase().includes('bank') ? 'BANK TRANSFER' : 'E-WALLET', // Based on name logic or if backend has a type field
      name: m.provider_name || '-',
      code: m.provider_code || '-',
      status: m.status || 'Aktif' // Assuming backend returns 'Aktif' or 'Tidak Aktif' or boolean
    }))
  } catch (err) {
    console.error('Failed to load providers', err)
  }
}

onMounted(fetchProviders)

const searchQuery = ref('')


function openAdd() {
  // TODO: Implementasi modal tambah metode bayar
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
    <div class="page-header">
      <h1 class="page-title">Metode Bayar</h1>
    </div>

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
                >
                  {{ m.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktivasi' }}
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
.metode-bayar-page { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; color: #64748b; font-size: 0.7rem; }

.status-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
.status-badge.active { background: #dcfce7; color: #15803d; }
.status-badge.inactive { background: #fee2e2; color: #b91c1c; }

.btn-xs { padding: 0.3rem 0.75rem; font-size: 0.7rem; font-weight: 700; border-radius: 6px; cursor: pointer; }
.btn-success { background: #22c55e; color: white; border: none; }
.btn-danger-outline { background: white; color: #ef4444; border: 1px solid #fecaca; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
