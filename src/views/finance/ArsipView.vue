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
    <div class="page-header">
      <h1 class="page-title">Arsip Reimbursement</h1>
    </div>

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
.finance-arsip { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 220px; }
.btn-filter { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }

.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.font-bold { font-weight: 700; }
.text-primary { color: #3b82f6; }
.text-muted { color: #94a3b8; }

.user-info { display: flex; align-items: center; gap: 0.625rem; }
.avatar-sm { width: 24px; height: 24px; border-radius: 50%; background: #f1f5f9; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; border: 1px solid #e2e8f0; }
.user-name { font-weight: 600; color: #1e293b; font-size: 0.75rem; }

.item-title { font-weight: 600; color: #1e293b; font-size: 0.75rem; margin-bottom: 0.1rem; }
.item-cat { font-size: 0.65rem; color: #94a3b8; font-weight: 500; }

.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; display: inline-block; }
.status-pill.dibayar { background: #f0fdf4; color: #16a34a; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; }

.action-row { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.detail { background: #f1f5f9; color: #64748b; }
.btn-icon.restore { background: #eff6ff; color: #3b82f6; }

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
