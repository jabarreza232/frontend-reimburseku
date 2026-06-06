<script setup>
import { ref, onMounted } from 'vue'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import { Filter, Search, Plus, FileText, Check, X, Clock, CheckCircle2, ChevronLeft, ChevronRight, Zap } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

const reimbursements = ref([])

onMounted(async () => {
  try {
    const res = await ApiService.getMyReimbursements()
    const responseData = res.data?.data?.data || res.data?.data || []
    reimbursements.value = responseData.map(item => ({
      id: `RMB-${item.id_request}`,
      rawId: item.id_request,
      date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }),
      category: item.category_name,
      title: item.description || 'Pengajuan Reimbursement',
      amount: formatRupiah(item.amount),
      status: mapStatusToFrontend(item.last_status),
      reason: item.reject_reason || null
    }))
  } catch (error) {
    console.error('Failed to load reimbursements', error)
  }
})

const getDisplayStatus = (status) => {
  switch(status) {
    case 'menunggu': return 'Menunggu'
    case 'disetujui': return 'Diterima'
    case 'dibayar': return 'Bayar'
    case 'ditolak': return 'Tolak'
    default: return status
  }
}

const getStatusPillClass = (status) => {
  switch(status) {
    case 'menunggu': return 'pill-warning'
    case 'disetujui': return 'pill-info'
    case 'dibayar': return 'pill-success'
    case 'ditolak': return 'pill-danger'
    default: return ''
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'menunggu': return Clock
    case 'disetujui': return CheckCircle2
    case 'dibayar': return Zap
    case 'ditolak': return X
    default: return Clock
  }
}

const getBorderColor = (category) => {
  if (!category) return '#3B82F6' // Default Lain-lain
  const name = category.toLowerCase()
  if (name.includes('transport')) return '#22c55e' // Hijau
  if (name.includes('makan') || name.includes('minum')) return '#ec4899' // Pink
  if (name.includes('parkir')) return '#a855f7' // Ungu
  return '#3B82F6' // Biru untuk Lain-lain
}
</script>

<template>
  <div class="reimbursement-list">
    <div class="page-header">
      <div>
        <h1 class="page-title">Daftar Reimbursement</h1>
        <p class="text-muted mt-1">Kelola semua pengajuan reimbursement Anda</p>
      </div>
      <router-link to="/staf/reimbursement/tambah" class="btn btn-primary">
        <Plus :size="18" />
        Pengajuan Baru
      </router-link>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input type="text" class="form-control" placeholder="Cari ID atau judul..." />
      </div>
      <div class="filter-actions">
        <button class="btn btn-outline">
          <Filter :size="18" />
          Filter
        </button>
        <select class="form-control" style="width: auto;">
          <option>Semua Status</option>
          <option>Menunggu</option>
          <option>Disetujui</option>
          <option>Dibayar</option>
          <option>Ditolak</option>
        </select>
      </div>
    </div>

    <!-- Cards List -->
    <div class="reimbursement-cards">
      <router-link 
        v-for="item in reimbursements" 
        :key="item.id"
        :to="'/staf/reimbursement/' + item.rawId" 
        class="reimbursement-card"
        :style="{ borderRightColor: getBorderColor(item.category) }"
      >
        <div class="card-content">
          <div class="card-info">
            <h3 class="card-title">{{ item.title }}</h3>
            
            <div class="status-badge-container">
              <span class="status-pill" :class="getStatusPillClass(item.status)">
                <component :is="getStatusIcon(item.status)" :size="12" class="status-icon" />
                {{ getDisplayStatus(item.status) }}
              </span>
              <span v-if="item.status === 'ditolak' && item.reason" class="status-reason">{{ item.reason }}</span>
              <span v-if="item.status === 'ditolak' && !item.reason" class="status-reason text-muted">Nomor Rekening tidak valid</span>
            </div>
            
            <div class="amount">{{ item.amount }}</div>
          </div>
          <div class="date">{{ item.date }}</div>
        </div>
      </router-link>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper">
      <div class="pagination-numbers">
        <button class="page-btn page-arrow"><ChevronLeft :size="18" /></button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn">4</button>
        <button class="page-btn">5</button>
        <button class="page-btn page-arrow"><ChevronRight :size="18" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 0 0 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  width: 300px;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-box .form-control {
  padding-left: 2.75rem;
  border-radius: 8px;
}

.filter-actions {
  display: flex;
  gap: 1rem;
}

.filter-actions .btn-outline {
  border-radius: 8px;
}

.filter-actions .form-control {
  border-radius: 8px;
}

/* Cards layout */
.reimbursement-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reimbursement-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  border-right-width: 6px;
  border-right-style: solid;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.reimbursement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-content {
  padding: 1.25rem 1.5rem;
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.status-badge-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.pill-success {
  background-color: #ECFDF5;
  color: #10B981;
  border-color: #A7F3D0;
}

.pill-danger {
  background-color: #FEF2F2;
  color: #EF4444;
  border-color: #FECACA;
}

.pill-warning {
  background-color: #FFFBEB;
  color: #F59E0B;
  border-color: #FDE68A;
}

.pill-info {
  background-color: #EFF6FF;
  color: #3B82F6;
  border-color: #BFDBFE;
}

.status-reason {
  font-size: 0.8rem;
  color: #9CA3AF;
}

.amount {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.date {
  font-size: 0.75rem;
  color: #9CA3AF;
  white-space: nowrap;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(.active) {
  background-color: #F3F4F6;
  color: #111827;
}

.page-btn.active {
  background-color: #3B82F6;
  color: white;
  font-weight: 500;
}

.page-arrow {
  color: #9CA3AF;
}

.page-arrow:hover {
  color: #111827;
}
</style>
