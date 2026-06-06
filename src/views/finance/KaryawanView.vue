<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Eye, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const karyawan = ref([])

onMounted(async () => {
  try {
    const res = await ApiService.getEmployees()
    const listData = res.data?.data?.data || res.data?.data || []
    
    karyawan.value = listData
      .filter(emp => emp.role_id === 1) // Hanya tampilkan data Staff
      .map(emp => ({
      id: emp.id_employees,
      nama: emp.name || '-',
      email: emp.email || '-',
      jabatan: emp.position || '-',
      departemen: emp.position || '-', // fallback since backend might not have separate department field
      totalPengajuan: emp.reimbursement_requests_count || 0,
      totalAmount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(emp.reimbursement_requests_sum_amount || 0)
    }))
  } catch (error) {
    console.error('Failed to load employees', error)
  }
})

const searchQuery = ref('')
const filtered = computed(() => {
  return karyawan.value.filter(k => 
    k.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    k.departemen.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="finance-karyawan">
    <div class="page-header">
      <h1 class="page-title">Karyawan</h1>
    </div>

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Data Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Karyawan..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Departemen <ChevronDown :size="12" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>NAMA KARYAWAN</th>
              <th>JABATAN</th>
              <th>DEPARTEMEN</th>
              <th class="text-center">TOTAL PENGAJUAN</th>
              <th>TOTAL NILAI</th>
              <th width="100" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="k in filtered" :key="k.id">
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ k.nama[0] }}</div>
                  <div class="user-meta">
                    <p class="user-name">{{ k.nama }}</p>
                    <p class="user-email">{{ k.email }}</p>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ k.jabatan }}</td>
              <td>
                <span class="dept-badge">{{ k.departemen }}</span>
              </td>
              <td class="text-center font-semibold">{{ k.totalPengajuan }}</td>
              <td class="font-bold text-success">{{ k.totalAmount }}</td>
              <td class="text-center">
                <button class="btn-icon detail" title="Lihat Detail"><Eye :size="12" /></button>
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
.finance-karyawan { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.user-info { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; border: 1px solid #e2e8f0; }
.user-meta { display: flex; flex-direction: column; }
.user-name { font-weight: 700; color: #1e293b; font-size: 0.75rem; }
.user-email { font-size: 0.65rem; color: #94a3b8; }

.dept-badge { display: inline-block; background: #eff6ff; color: #3b82f6; font-size: 0.65rem; font-weight: 700; padding: 0.125rem 0.5rem; border-radius: 6px; }

.text-center { text-align: center; }
.text-success { color: #16a34a; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.detail { background: #f1f5f9; color: #64748b; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
