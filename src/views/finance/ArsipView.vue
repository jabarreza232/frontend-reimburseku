<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, RotateCcw, Eye, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const archives = ref([])

onMounted(async () => {
  try {
    const [reimbRes, empRes] = await Promise.all([
      ApiService.getReimbursements(),
      ApiService.getEmployees()
    ])
    
    const listData = reimbRes.data?.data?.data || reimbRes.data?.data || []
    const employees = empRes.data?.data?.data || empRes.data?.data || []
    
    const empMap = employees.reduce((acc, curr) => { acc[curr.id_employees] = curr; return acc }, {})

    const allItems = listData.map(item => {
      const emp = empMap[item.employees_id] || {}
      return {
        id: `RMB-${item.id_request}`,
        name: emp.name || 'Unknown',
        date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        category: emp.position || 'Employee',
        title: item.description || 'Pengajuan',
        amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.amount),
        status: (item.last_status || item.status || 'menunggu').toLowerCase(),
        rawStatus: item.last_status?.toUpperCase()
      }
    })
    
    // Only show paid or rejected in arsip
    archives.value = allItems.filter(i => i.status === 'dibayar' || i.status === 'ditolak' || i.rawStatus === 'PAID' || i.rawStatus === 'REJECTED').map(i => ({
      ...i,
      status: i.rawStatus === 'PAID' ? 'dibayar' : (i.rawStatus === 'REJECTED' ? 'ditolak' : i.status)
    }))
  } catch (error) {
    console.error('Failed to load arsip data', error)
  }
})

const searchQuery = ref('')
const filterStatus = ref('Semua Status')

const filtered = computed(() => {
  return archives.value.filter(item => {
    const matchSearch = !searchQuery.value || item.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = filterStatus.value === 'Semua Status' || item.status === filterStatus.value.toLowerCase()
    return matchSearch && matchStatus
  })
})

const getStatusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<template>
  <div class="finance-arsip">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Riwayat Arsip</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari Arsip..." class="search-input" />
          </div>
          <div class="filter-dropdown">
            <button class="btn btn-outline btn-filter">
              {{ filterStatus }} <ChevronDown :size="12" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TANGGAL</th>
              <th>KARYAWAN</th>
              <th>JUDUL PENGAJUAN</th>
              <th>JUMLAH</th>
              <th>STATUS AKHIR</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id">
              <td class="font-bold text-primary">{{ item.id }}</td>
              <td class="text-muted">{{ item.date }}</td>
              <td>
                <div class="user-info">
                  <div class="avatar-sm">{{ item.name[0] }}</div>
                  <span class="user-name">{{ item.name }}</span>
                </div>
              </td>
              <td>
                <p class="item-title">{{ item.title }}</p>
                <p class="item-cat">{{ item.category }}</p>
              </td>
              <td class="font-bold">{{ item.amount }}</td>
              <td>
                <span class="status-pill" :class="item.status">{{ getStatusLabel(item.status) }}</span>
              </td>
              <td class="text-center">
                <div class="action-row">
                  <button class="btn-icon detail" title="Detail"><Eye :size="12" /></button>
                  <button class="btn-icon restore" title="Pulihkan"><RotateCcw :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filtered.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filtered.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filtered.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-arsip { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.avatar-sm { width: 24px; height: 24px; font-size: 0.65rem; }
.item-title { font-weight: 600; color: #1e293b; font-size: 0.75rem; margin-bottom: 0.1rem; }
.item-cat { font-size: 0.65rem; color: #94a3b8; font-weight: 500; }
.action-row { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon.detail { background: #f1f5f9; color: #64748b; }
.btn-icon.restore { background: #eff6ff; color: #3b82f6; }
</style>
