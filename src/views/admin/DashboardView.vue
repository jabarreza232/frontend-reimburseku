<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { User, FileText, Bell, ChevronLeft, ChevronRight, X, Send } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
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

    const colorPalette = ['#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6']

    categories.value = sortedCats.map((cat, index) => ({
      label: cat[0],
      color: colorPalette[index % colorPalette.length],
      dash: '0 100', offset: '0'
    }))

    donutOptions.value.labels = categories.value.map(c => c.label)
    donutOptions.value.colors = categories.value.map(c => c.color)

    donutSeries.value = sortedCats.map(cat => Math.round((cat[1] / totalAll) * 100))
  }
}

onMounted(async () => {
  try {
    const [empRes, reimbRes, msgRes] = await Promise.allSettled([
      ApiService.getEmployees(),
      ApiService.getReimbursements(),
      ApiService.getReimbursementMessages()
    ])

    const employees = empRes.status === 'fulfilled' && empRes.value.data?.data ? (empRes.value.data.data.data || empRes.value.data.data) : []
    stats.value[0].value = employees.length.toString()

    // 1. Ekstrak data dan metadata pagination dari JSON baru
    const reimbPayload = reimbRes.status === 'fulfilled' ? reimbRes.value.data : null
    const reimbursements = reimbPayload?.data || [] // Mengambil array dari "data"
    const meta = reimbPayload?.meta || {}

    // Set data pagination
    pagination.value = {
      currentPage: meta.current_page || 1,
      lastPage: meta.last_page || 1,
      total: meta.total || 0
    }

    // 2. Filter Status (Fallback ke 'menunggu' karena JSON tidak punya field status)
    const pending = reimbursements.filter(r => {
      const status = r.last_status || r.status || 'menunggu'
      return status.toLowerCase() === 'menunggu'
    })

    stats.value[1].value = pending.length.toString()

    if (reimbursements.length > 0) {
      populateDonutData(reimbursements)
    }

    const empMap = employees.reduce((acc, curr) => { acc[curr.id_employees] = curr; return acc }, {})

    // 3. Mapping data waiting list
    waitingList.value = pending.slice(0, 5).map(item => {
      const emp = empMap[item.employees_id] || {}
      let parseableDate = item.expense_date;

      if (typeof parseableDate === 'string' && parseableDate.includes(' ') && !parseableDate.includes('T')) {
        parseableDate = parseableDate.replace(' ', 'T') + 'Z';
      }

      return {
        id: item.id_request,
        name: emp.name || `Karyawan ID: ${item.employees_id}`, // Fallback jika API employee gagal
        category: categoryMap[item.category_id] || `Kategori ${item.category_id}`,
        date: new Date(parseableDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: `-${formatRupiah(item.amount)}`
      }
    })

    const messages = msgRes.status === 'fulfilled' && msgRes.value.data?.data ? (msgRes.value.data.data.data || msgRes.value.data.data) : []
    logs.value = messages.slice(0, 5).map((m, i) => {
      let parseableDate = m.created_at;
      if (typeof parseableDate === 'string' && parseableDate.includes(' ') && !parseableDate.includes('T')) {
        parseableDate = parseableDate.replace(' ', 'T') + 'Z';
      }
      return {
        id: m.id_message || i,
        time: new Date(parseableDate).toLocaleString('id-ID'),
        text: m.message || 'Notifikasi',
        target: m.user_id ? 'Pesan Sistem' : '',
        color: '#3b82f6'
      }
    })

  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    isLoading.value = false
  }
})

// Modal State & Functions (Tidak ada perubahan)
const showNotifModal = ref(false)
const selectedUser = ref('')
const message = ref('')

function openNotif(name) {
  selectedUser.value = name
  message.value = `Halo tim Finance, mohon segera proses pengajuan reimbursement dari ${name}. Terima kasih.`
  showNotifModal.value = true
}

async function sendNotif() {
  try {
    await ApiService.saveReimbursementMessage({ message: message.value })
    alert('Notifikasi berhasil dikirim')
    showNotifModal.value = false

    const msgRes = await ApiService.getReimbursementMessages()
    const messages = msgRes.data?.data?.data || msgRes.data?.data || []
    logs.value = messages.slice(0, 3).map((m, i) => ({
      id: m.id_message || i,
      time: new Date(m.created_at).toLocaleString('id-ID'),
      text: m.message || 'Notifikasi',
      target: m.user_id ? 'Pesan Sistem' : '',
      color: '#3b82f6'
    }))
  } catch (err) {
    alert('Gagal mengirim notifikasi')
    console.error(err)
  }
}
</script>
<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1 class="page-title">Beranda</h1>
    </div>

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
              <VueApexCharts type="donut" width="100%" height="200" :options="donutOptions" :series="donutSeries" />
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
          <div class="card-header">
            <span>Log Aktivitas Sistem</span>
            <button class="btn-link">Lihat Semua</button>
          </div>
          <div class="log-list">
            <div v-for="log in logs" :key="log.id" class="log-item">
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
        <div class="card list-card">
          <div class="card-header">
            <span>Menunggu Persetujuan</span>
            <span class="header-badge">18</span>
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
                  <button class="btn-notif" @click="openNotif(item.name)">
                    <Bell :size="12" /> Kirim Notif
                  </button>
                </div>
              </div>
            </template>
          </div>
          <div class="pagination" v-if="pagination.lastPage > 1">
            <button class="p-arrow" :disabled="pagination.currentPage === 1">
              <ChevronLeft :size="14" />
            </button>
            <button class="p-num active">{{ pagination.currentPage }}</button>
            <span style="font-size: 0.75rem; color: #94a3b8; margin: 0 0.25rem;">
              dari {{ pagination.lastPage }}
            </span>
            <button class="p-arrow" :disabled="pagination.currentPage === pagination.lastPage">
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Notifikasi -->
    <div v-if="showNotifModal" class="modal-overlay" @click.self="showNotifModal = false">
      <div class="modal notif-modal">
        <div class="modal-header-notif">
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
        <div class="modal-body-notif">
          <div class="notif-target">Penerima: <strong>Tim Finance</strong></div>
          <div class="form-group-notif">
            <label>Pesan Notifikasi</label>
            <textarea v-model="message" rows="3" placeholder="Tulis pesan..."></textarea>
          </div>
        </div>
        <div class="modal-footer-notif">
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
  background-color: #f8fafc;
  height: 100%;
  overflow: hidden;
}

.page-header {
  margin-bottom: 0.25rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.card-header {
  padding: 1rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f8fafc;
}

/* Chart */
.chart-container {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1.5rem;
}

.donut-box {
  width: 120px;
  height: 120px;
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
.log-list {
  padding: 0.75rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

/* Right Column */
.right-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  overflow: hidden;
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
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}

.approval-item {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f8fafc;
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

/* Pagination */
.pagination {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid #f8fafc;
}

.p-arrow,
.p-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.p-num.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.notif-modal {
  background: white;
  width: 100%;
  max-width: 360px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header-notif {
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  position: relative;
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

.modal-body-notif {
  padding: 1.25rem;
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

.modal-footer-notif {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
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
</style>
