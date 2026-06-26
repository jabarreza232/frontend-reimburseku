<script setup>
import { ref, onMounted, defineAsyncComponent, computed } from 'vue'
import { User, FileText, Bell, ChevronLeft, ChevronRight, X, Send } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'
import { formatRupiah } from '@/utils/format'

const stats = ref([
  { label: 'TOTAL KARYAWAN', value: '0', icon: User, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'TOTAL KLAIM MENUNGGU', value: '0', icon: FileText, color: '#ef4444', bg: '#fef2f2' },
])

const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))

const categories = ref([])

const donutOptions = ref({
  chart: {
    type: 'donut',
    fontFamily: 'inherit'
  },
  colors: [],
  labels: [],
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: { size: '80%' }
    }
  },
  stroke: { show: false },
  legend: { show: false },
  tooltip: {
    y: { formatter: (val) => val + "%" }
  }
})

const donutSeries = ref([])
const waitingList = ref([])
const logs = ref([])
const isLoading = ref(true)

// State baru untuk Paginasi dari JSON "meta"
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0
})

const pendingReimbursements = ref([])

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    pagination.value.currentPage = page
    updateWaitingList()
  }
}

const updateWaitingList = () => {
  const start = (pagination.value.currentPage - 1) * 5
  waitingList.value = pendingReimbursements.value.slice(start, start + 5)
}

// Mapping statis untuk category_id (karena JSON tidak memiliki category_name)
const categoryMap = {
  1: 'Transportasi',
  2: 'Makanan',
  4: 'Parkir',
  5: 'Dan-lain-lain'
}

// Menghitung total untuk donut chart menggunakan category_id
const populateDonutData = (reimbursements) => {
  const catTotals = {}
  let totalAll = 0

  reimbursements.forEach(item => {
    // Ambil nama kategori dari mapping ID
    const catName = categoryMap[item.category_id] || 'Lain-lain'
    if (!catTotals[catName]) catTotals[catName] = 0
    catTotals[catName] += item.amount
    totalAll += item.amount
  })

  if (totalAll > 0) {
    const sortedCats = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1]) // Sort desc
      .slice(0, 4) // Max 4 categories

    categories.value = sortedCats.map((cat, index) => {
      const labelLower = cat[0].toLowerCase();
      let color = '#3b82f6'; // Default Blue (Lain-lain)
      if (labelLower.includes('transport')) color = '#10b981'; // Green
      else if (labelLower.includes('makan') || labelLower.includes('minum')) color = '#ef4444'; // Red/Pink
      else if (labelLower.includes('parkir')) color = '#8b5cf6'; // Purple
      
      return {
        label: cat[0],
        color: color,
        dash: '0 100', offset: '0'
      }
    })

    donutOptions.value = {
      ...donutOptions.value,
      labels: categories.value.map(c => c.label),
      colors: categories.value.map(c => c.color)
    }

    donutSeries.value = sortedCats.map(cat => Math.round((cat[1] / totalAll) * 100))
  }
}

onMounted(async () => {
  try {
    const [empRes, reimbRes] = await Promise.allSettled([
      ApiService.getEmployees(),
      ApiService.getReimbursements()
    ])

    const employees = empRes.status === 'fulfilled' && empRes.value.data?.data ? (empRes.value.data.data.data || empRes.value.data.data) : []
    stats.value[0].value = employees.length.toString()

    // 1. Ekstrak data dan metadata pagination dari JSON baru
    const reimbPayload = reimbRes.status === 'fulfilled' ? reimbRes.value.data : null
    const reimbursements = reimbPayload?.data?.data || reimbPayload?.data || [] // Mengambil array dari "data"
    const meta = reimbPayload?.data?.meta || reimbPayload?.meta || {}

    // Set data pagination
    pagination.value = {
      currentPage: meta.current_page || 1,
      lastPage: meta.last_page || 1,
      total: meta.total || 0
    }

    // 2. Filter Status
    const pending = reimbursements.filter(r => {
      const status = r.last_status || r.status || 'PENDING'
      return status.toLowerCase() === 'pending' || status.toLowerCase() === 'menunggu'
    })

    stats.value[1].value = pending.length.toString()

    if (reimbursements.length > 0) {
      populateDonutData(reimbursements)
    }

    const empMap = employees.reduce((acc, curr) => { acc[curr.id_employees] = curr; return acc }, {})

    // 3. Mapping data waiting list
    pendingReimbursements.value = pending.map(item => {
      const emp = empMap[item.employees_id] || {}
      let parseableDate = item.expense_date;

      if (typeof parseableDate === 'string' && parseableDate.includes(' ') && !parseableDate.includes('T')) {
        parseableDate = parseableDate.replace(' ', 'T') + 'Z';
      }

      return {
        id: item.id_request,
        employees_id: item.employees_id,
        name: emp.name || `Karyawan ID: ${item.employees_id}`,
        category: categoryMap[item.category_id] || `Kategori ${item.category_id}`,
        date: new Date(parseableDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: `-${formatRupiah(item.amount)}`
      }
    })

    // Set client-side pagination for the dashboard widget
    pagination.value = {
      currentPage: 1,
      lastPage: Math.ceil(pendingReimbursements.value.length / 5) || 1,
      total: pendingReimbursements.value.length
    }
    
    updateWaitingList()

    // Log data unavailable (API not implemented), using dummy data
    logs.value = [
      { id: 1, time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Login berhasil', target: 'System', color: '#3b82f6', category: 'System' },
      { id: 2, time: new Date(Date.now() - 15 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Menyetujui reimbursement #RM-8123', target: 'Reimbursement', color: '#10b981', category: 'Reimbursement' },
      { id: 3, time: new Date(Date.now() - 45 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Menambahkan karyawan baru', target: 'Karyawan', color: '#f59e0b', category: 'Karyawan' },
      { id: 4, time: new Date(Date.now() - 120 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Menolak reimbursement #RM-8122', target: 'Reimbursement', color: '#ef4444', category: 'Reimbursement' },
      { id: 5, time: new Date(Date.now() - 200 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Update profil sistem', target: 'System', color: '#3b82f6', category: 'System' },
      { id: 6, time: new Date(Date.now() - 360 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Top up deposit kas Rp 10.000.000', target: 'Keuangan', color: '#10b981', category: 'Keuangan' },
      { id: 7, time: new Date(Date.now() - 480 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Menghapus karyawan (Resign)', target: 'Karyawan', color: '#f59e0b', category: 'Karyawan' },
      { id: 8, time: new Date(Date.now() - 1440 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Login dari IP 192.168.1.5', target: 'System', color: '#3b82f6', category: 'System' },
      { id: 9, time: new Date(Date.now() - 2880 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Menyetujui reimbursement #RM-8001', target: 'Reimbursement', color: '#10b981', category: 'Reimbursement' },
      { id: 10, time: new Date(Date.now() - 3000 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Edit kategori reimbursement', target: 'Master Data', color: '#8b5cf6', category: 'System' },
      { id: 11, time: new Date(Date.now() - 4320 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Pencairan dana ke bank BCA', target: 'Keuangan', color: '#10b981', category: 'Keuangan' },
      { id: 12, time: new Date(Date.now() - 5000 * 60000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), text: 'Update data karyawan ID 24', target: 'Karyawan', color: '#f59e0b', category: 'Karyawan' }
    ]

  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    isLoading.value = false
  }
})

// Modal State & Functions (Tidak ada perubahan)
const showNotifModal = ref(false)
const selectedUser = ref('')
const selectedReceiverId = ref(null)
const message = ref('')
const messageTitle = ref('Pesan Sistem')

function openNotif(item) {
  selectedUser.value = item.name
  selectedReceiverId.value = item.employees_id || 1
  message.value = `Pemberitahuan: Mohon segera proses pengajuan reimbursement dari ${item.name}. Terima kasih.`
  showNotifModal.value = true
}

async function sendNotif() {
  try {
    await ApiService.saveReimbursementMessage({ 
      receiver_id: selectedReceiverId.value,
      message_content: message.value,
      title: messageTitle.value
    })
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Notifikasi berhasil dikirim', showConfirmButton: false, timer: 1500 })
    showNotifModal.value = false

    const logRes = await ApiService.getSystemLogs()
    const logsData = logRes.data?.data || []
    logs.value = logsData.slice(0, 3).map((l, i) => ({
      id: l.id_log || l.id || i,
      time: new Date(l.created_at || l.time).toLocaleString('id-ID'),
      text: l.comments || l.text || l.action,
      target: l.source || '',
      color: l.source === 'Deposit' ? '#10b981' : '#3b82f6'
    }))
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengirim notifikasi' })
    console.error(err)
  }
}

const logFilter = ref('Semua')

const filteredLogs = computed(() => {
  if (logFilter.value === 'Semua') return logs.value
  return logs.value.filter(log => log.category === logFilter.value)
})
</script>
<template>
  <div class="admin-dashboard">
    

    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Top Stats -->
        <div class="stats-row">
          <div v-for="s in stats" :key="s.label" class="stat-card">
            <div class="stat-icon-wrap" :style="{ color: s.color }">
              <component :is="s.icon" :size="18" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- Chart Card -->
        <div class="card chart-card">
          <div class="card-header">Reimburse berdasarkan Kategori</div>
          <div class="chart-container">
            <div class="donut-box">
              <VueApexCharts type="donut" width="100%" height="100%" :options="donutOptions" :series="donutSeries" />
            </div>
            <div class="chart-legend">
              <div v-for="c in categories" :key="c.label" class="legend-item">
                <span class="legend-dot" :style="{ background: c.color }"></span>
                <span class="legend-text">{{ c.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Logs Card -->
        <div class="card log-card">
          <div class="card-header" style="justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0;">
            <span>Log Aktivitas Sistem</span>
            <select v-model="logFilter" class="log-filter-select">
              <option value="Semua">Semua</option>
              <option value="System">Sistem</option>
              <option value="Reimbursement">Reimburse</option>
              <option value="Karyawan">Karyawan</option>
              <option value="Keuangan">Keuangan</option>
            </select>
          </div>
          <div class="log-list">
            <div v-if="filteredLogs.length === 0" style="text-align: center; color: #94a3b8; font-size: 0.75rem; padding: 1rem;">
              Tidak ada log untuk kategori ini.
            </div>
            <div v-for="log in filteredLogs" :key="log.id" class="log-item">
              <div class="log-dot" :style="{ background: log.color }"></div>
              <div class="log-time">{{ log.time }}</div>
              <div class="log-text">
                {{ log.text }} <span class="log-bold">{{ log.target }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
          <div class="card-header">
            <span>Menunggu Persetujuan</span>
            <span class="header-badge">{{ stats[1].value }}</span>
          </div>
          <div class="approval-list">
            <div v-if="isLoading"
              style="padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 500;">
              Memuat data...
            </div>
            <div v-else-if="waitingList.length === 0"
              style="padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 500;">
              Tidak ada persetujuan yang menunggu.
            </div>
            <template v-else>
              <div v-for="item in waitingList" :key="item.id" class="approval-item">
                <div class="item-left">
                  <div class="avatar">
                    <img :src="`https://ui-avatars.com/api/?name=${item.name}&background=random&color=fff`"
                      alt="user" />
                  </div>
                  <div class="item-info">
                    <div class="user-name">{{ item.name }}</div>
                    <div class="category-label">{{ item.category }}</div>
                    <div class="meta-row">
                      <span class="status-badge">Menunggu</span>
                      <span class="date-text">{{ item.date }}</span>
                    </div>
                  </div>
                </div>
                <div class="item-right">
                  <div class="amount-text">{{ item.amount }}</div>
                  <button class="btn-notif" @click="openNotif(item)">
                    <Bell :size="12" /> Kirim Notif
                  </button>
                </div>
              </div>
            </template>
          </div>
          <div class="table-footer" v-if="pagination.lastPage > 1">
            <div class="pagination">
              <button class="page-btn" :disabled="pagination.currentPage === 1" @click="changePage(pagination.currentPage - 1)">
                <ChevronLeft :size="12" />
              </button>
              <button v-for="page in pagination.lastPage" :key="page" class="page-btn" :class="{ active: pagination.currentPage === page }" @click="changePage(page)">
                {{ page }}
              </button>
              <button class="page-btn" :disabled="pagination.currentPage === pagination.lastPage" @click="changePage(pagination.currentPage + 1)">
                <ChevronRight :size="12" />
              </button>
            </div>
          </div>
      </div>
    </div>

    <!-- Modal Notifikasi -->
    <div v-if="showNotifModal" class="modal-overlay" @click.self="showNotifModal = false">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="notif-icon-box">
            <Bell :size="18" />
          </div>
          <div class="notif-title-box">
            <h3>Kirim Notifikasi Pengingat</h3>
            <p>Ingatkan tim Finance untuk memproses klaim ini.</p>
          </div>
          <button @click="showNotifModal = false" class="notif-close">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-panel-body">
          <div class="notif-target">Penerima ID: <strong>{{ selectedReceiverId }}</strong></div>
          <div class="form-group-notif">
            <label>Judul Pesan</label>
            <input type="text" v-model="messageTitle" class="form-control" style="margin-bottom: 10px; width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem;" />
          </div>
          <div class="form-group-notif">
            <label>Pesan Notifikasi</label>
            <textarea v-model="message" rows="3" placeholder="Tulis pesan..."></textarea>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button @click="showNotifModal = false" class="btn-cancel">Batal</button>
          <button @click="sendNotif" class="btn-send">
            <Send :size="12" /> Kirim Notif
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1.25rem;
  align-items: start;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex-shrink: 0;
}

.stat-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-top: 0.1rem;
}

/* Chart */
.chart-card {
  flex-shrink: 0;
}

.chart-container {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1.5rem;
}

.donut-box {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-text {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
}

/* Logs */
.log-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.log-list {
  padding: 0.75rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
}

.log-item {
  display: grid;
  grid-template-columns: 8px 90px 1fr;
  align-items: center;
  gap: 1rem;
}

.log-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.log-time {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 600;
}

.log-text {
  font-size: 0.7rem;
  color: #475569;
  font-weight: 500;
}

.log-bold {
  font-weight: 700;
  color: #1e293b;
}

.btn-link {
  color: #3b82f6;
  font-size: 0.7rem;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
}

.log-filter-select {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  background-color: white;
  cursor: pointer;
  outline: none;
}
.log-filter-select:focus {
  border-color: #3b82f6;
}

/* Right Column */
.right-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.header-badge {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

.approval-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.approval-item {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1e293b;
}

.category-label {
  font-size: 0.7rem;
  color: #3b82f6;
  font-weight: 600;
  margin: 0.1rem 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  background: #fffbeb;
  color: #f59e0b;
  border: 1px solid #fef3c7;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
}

.date-text {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 500;
}

.item-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.amount-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #ef4444;
}

.table-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  background-color: #f8fafc;
}

.pagination {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.page-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}
.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-notif {
  background: #3b82f6;
  color: white;
  border: none;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
}

.notif-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-title-box h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.125rem;
}

.notif-title-box p {
  font-size: 0.65rem;
  color: #64748b;
}

.notif-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
}

.notif-target {
  font-size: 0.75rem;
  color: #475569;
  margin-bottom: 1rem;
}

.form-group-notif label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.375rem;
  display: block;
}

.form-group-notif textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8125rem;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
  box-sizing: border-box;
}

.btn-send {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
