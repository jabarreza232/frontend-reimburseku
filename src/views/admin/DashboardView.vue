<script setup>
import { ref, onMounted, defineAsyncComponent, computed, watch } from 'vue'
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

// === STATE MENUNGGU PERSETUJUAN ===
const pendingReimbursements = ref([])
const waitingList = ref([])
const pendingCategoryFilter = ref('Semua')

// Hitung kategori apa saja yang tersedia di list yang pending
const availablePendingCategories = computed(() => {
  const cats = new Set(pendingReimbursements.value.map(item => item.category))
  return ['Semua', ...Array.from(cats)]
})

// Filter data pending berdasarkan kategori
const filteredPendingList = computed(() => {
  if (pendingCategoryFilter.value === 'Semua') return pendingReimbursements.value
  return pendingReimbursements.value.filter(item => item.category === pendingCategoryFilter.value)
})

const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0
})

// Watcher agar setiap kali list berubah (karena filter/data baru), paginasi reset & update
watch(filteredPendingList, (newList) => {
  pagination.value.total = newList.length
  pagination.value.lastPage = Math.ceil(newList.length / 5) || 1
  pagination.value.currentPage = 1
  updateWaitingList()
})

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    pagination.value.currentPage = page
    updateWaitingList()
  }
}

const updateWaitingList = () => {
  const start = (pagination.value.currentPage - 1) * 5
  waitingList.value = filteredPendingList.value.slice(start, start + 5)
}

const logs = ref([])
const isLoading = ref(true)
const financeUsers = ref([]) // State untuk menyimpan user Finance

const populateDonutData = (reimbursements) => {
  const catTotals = {}
  let totalAll = 0

  reimbursements.forEach(item => {
    // Memakai category_name dari response
    const catName = item.category_name || 'Lain-lain'
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
      let color = '#3b82f6'; // Default Blue
      if (labelLower.includes('transport')) color = '#10b981'; // Green
      else if (labelLower.includes('makan') || labelLower.includes('minum')) color = '#ef4444'; // Red
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
    const [empRes, reimbRes, logAppRes, logDepRes] = await Promise.allSettled([
      ApiService.getEmployees(),
      ApiService.getReimbursements(),
      ApiService.getLogApprovals(),      
      ApiService.getLogCompanyDeposits() 
    ])

    // --- DATA KARYAWAN & FINANCE USERS ---
    const employees = empRes.status === 'fulfilled' && empRes.value.data?.data ? (empRes.value.data.data.data || empRes.value.data.data) : []
    stats.value[0].value = employees.length.toString()

    // Ekstrak karyawan yang merupakan Tim Finance
    financeUsers.value = employees.filter(emp => {
      const role = emp.role || {}
      return emp.role_id === 2 || role.id_role === 2 || role.slug === 'finance-staff'
    })

    // --- DATA REIMBURSEMENT ---
    const reimbPayload = reimbRes.status === 'fulfilled' ? reimbRes.value.data : null
    const reimbursements = reimbPayload?.data || [] 

    const pending = reimbursements.filter(r => {
      const status = r.latest_approval?.status || 'PENDING'
      return status.toLowerCase() === 'pending' || status.toLowerCase() === 'menunggu'
    })

    stats.value[1].value = pending.length.toString()

    if (reimbursements.length > 0) {
      populateDonutData(reimbursements)
    }

    pendingReimbursements.value = pending.map(item => {
      let parseableDate = item.expense_date;
      if (typeof parseableDate === 'string' && parseableDate.includes(' ') && !parseableDate.includes('T')) {
        parseableDate = parseableDate.replace(' ', 'T') + 'Z';
      }

      return {
        id: item.id_request,
        employees_id: item.employees_id,
        name: item.employees_name || `ID: ${item.employees_id}`, 
        category: item.category_name || `Kategori ${item.category_id}`, 
        date: new Date(parseableDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: `-${formatRupiah(item.amount)}`
      }
    })

    // ----------------------------------------------------------------
    // PROCESS LOGS: Menggabungkan Log Approval & Log Company Deposit
    // ----------------------------------------------------------------
    let combinedLogs = []

    if (logAppRes.status === 'fulfilled') {
      const appData = logAppRes.value.data?.data || []
      appData.forEach(item => {
        combinedLogs.push({
          id: `app_${item.id_log}`, 
          timestamp: new Date(item.created_at).getTime(),
          time: new Date(item.created_at).toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          }),
          text: item.comments,
          target: `(Approval ID #${item.approval_id})`,
          color: '#3b82f6', 
          category: 'Approval'
        })
      })
    }

    if (logDepRes.status === 'fulfilled') {
      const depData = logDepRes.value.data?.data || []
      depData.forEach(item => {
        combinedLogs.push({
          id: `dep_${item.id_log_company_deposit}`, 
          timestamp: new Date(item.created_at).getTime(),
          time: new Date(item.created_at).toLocaleDateString('id-ID', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
          }),
          text: item.comments,
          target: `(Deposit ID #${item.deposit_id})`,
          color: '#10b981', 
          category: 'Deposit'
        })
      })
    }

    combinedLogs.sort((a, b) => b.timestamp - a.timestamp)
    logs.value = combinedLogs

  } catch (err) {
    console.error('Failed to load dashboard data', err)
  } finally {
    isLoading.value = false
  }
})

// === MODAL STATE & FUNCTIONS ===
const showNotifModal = ref(false)
const selectedUser = ref('')
const selectedReceiverId = ref('')
const message = ref('')
const messageTitle = ref('Pesan Sistem')

function openNotif(item) {
  selectedUser.value = item.name
  selectedReceiverId.value = financeUsers.value.length > 0 ? financeUsers.value[0].id_employees : ''
  message.value = `Pemberitahuan: Mohon segera proses pengajuan reimbursement dari ${item.name} (${item.category}). Terima kasih.`
  showNotifModal.value = true
}

async function sendNotif() {
  if (!selectedReceiverId.value) {
    Swal.fire({ icon: 'warning', title: 'Pilih Penerima', text: 'Silakan pilih user Finance terlebih dahulu.' })
    return
  }

  if (!messageTitle.value || !message.value) {
    Swal.fire({ icon: 'warning', title: 'Data Tidak Lengkap', text: 'Judul dan Pesan wajib diisi.' })
    return
  }

  try {
    const notifFormData = new FormData()
    notifFormData.append('receiver_id', selectedReceiverId.value)
    notifFormData.append('title', messageTitle.value)
    notifFormData.append('message_content', message.value)

    await ApiService.saveReimbursementMessage(notifFormData)
    
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Notifikasi berhasil dikirim', showConfirmButton: false, timer: 1500 })
    showNotifModal.value = false
    
    message.value = '' 
    messageTitle.value = 'Pesan Sistem'
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
      
      <!-- === Left Column === -->
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
          <div class="card-header border-b">
            <span>Log Aktivitas Sistem</span>
            <select v-model="logFilter" class="log-filter-select">
              <option value="Semua">Semua</option>
              <option value="Approval">Approval</option>
              <option value="Deposit">Deposit</option>
            </select>
          </div>
          <div class="log-list">
            <div v-if="filteredLogs.length === 0" class="empty-state">
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

      <!-- === Right Column === -->
      <div class="right-column">
          <!-- Header dgn Filter -->
          <div class="card-header border-b header-right-col">
            <div class="title-with-badge">
              <span>Menunggu Persetujuan</span>
              <span class="header-badge">{{ filteredPendingList.length }}</span>
            </div>
            <select v-model="pendingCategoryFilter" class="log-filter-select">
              <option v-for="cat in availablePendingCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          
          <div class="approval-list">
            <div v-if="isLoading" class="empty-state">Memuat data...</div>
            <div v-else-if="waitingList.length === 0" class="empty-state">Tidak ada persetujuan yang menunggu.</div>
            
            <template v-else>
              <div v-for="item in waitingList" :key="item.id" class="approval-item">
                <div class="item-left">
                  <div class="avatar">
                    <img :src="`https://ui-avatars.com/api/?name=${item.name}&background=random&color=fff`" alt="user" />
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
          
          <!-- Paginasi Dinamis -->
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
            <h3>Kirim Notifikasi</h3>
            <p>Ingatkan tim Finance untuk memproses.</p>
          </div>
          <button @click="showNotifModal = false" class="notif-close"><X :size="18" /></button>
        </div>
        <div class="modal-panel-body">
          <div class="form-group-notif">
            <label>Pilih Penerima (Finance) <span class="text-red">*</span></label>
            <select v-model="selectedReceiverId" class="form-control notif-input">
              <option value="" disabled>-- Pilih Tim Finance --</option>
              <option v-for="user in financeUsers" :key="user.id_employees" :value="user.id_employees">
                {{ user.name }} ({{ user.role?.role_name || 'Finance Staff' }})
              </option>
            </select>
          </div>

          <div class="form-group-notif">
            <label>Judul Pesan <span class="text-red">*</span></label>
            <input type="text" v-model="messageTitle" class="form-control notif-input" />
          </div>
          <div class="form-group-notif">
            <label>Pesan Notifikasi</label>
            <textarea v-model="message" rows="3" placeholder="Tulis pesan..." class="notif-textarea"></textarea>
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
/* BASE STYLES */
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  height: calc(100vh - 64px - 3rem); /* Pengurangan Header & Margin */
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

/* CARDS & CONTAINERS */
.left-column { display: flex; flex-direction: column; gap: 1rem; height: 100%; min-height: 0; overflow: hidden; }
.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }

/* STATS */
.stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex-shrink: 0; }
.stat-card { background: white; padding: 1.25rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; }
.stat-icon-wrap { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 8px; flex-shrink: 0; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
.stat-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-top: 0.1rem; }

/* CHARTS */
.chart-card { flex-shrink: 0; display: flex; flex-direction: column; }
.card-header { padding: 1rem 1.25rem; font-size: 0.875rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; }
.border-b { border-bottom: 1px solid #e2e8f0; }
.chart-container { padding: 1.25rem; display: flex; align-items: center; justify-content: space-around; gap: 1.5rem; flex-wrap: wrap;}
.donut-box { width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
.chart-legend { display: flex; flex-direction: column; gap: 0.5rem; }
.legend-item { display: flex; align-items: center; gap: 0.625rem; }
.legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.legend-text { font-size: 0.7rem; color: #64748b; font-weight: 600; }

/* LOGS */
.log-card { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.log-filter-select { font-size: 0.75rem; padding: 0.35rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; background-color: white; cursor: pointer; outline: none; }
.log-filter-select:focus { border-color: #3b82f6; }
.log-list { padding: 0.75rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;}
.log-list::-webkit-scrollbar { width: 4px; }
.log-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.log-item { display: grid; grid-template-columns: 8px 100px 1fr; align-items: flex-start; gap: 1rem; }
.log-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px;}
.log-time { font-size: 0.7rem; color: #94a3b8; font-weight: 600; margin-top: 2px;}
.log-text { font-size: 0.75rem; color: #475569; font-weight: 500; line-height: 1.4; }
.log-bold { font-weight: 700; color: #1e293b; }

/* RIGHT COLUMN (APPROVAL LIST) */
.right-column { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; overflow: hidden; display: flex; flex-direction: column; height: 100%; min-height: 0; }
.header-right-col { justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; }
.title-with-badge { display: flex; align-items: center; gap: 0.5rem; }
.header-badge { background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; }

.approval-list { display: flex; flex-direction: column; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.approval-item { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; gap: 0.5rem;}
.item-left { display: flex; align-items: center; gap: 0.875rem; }
.avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 1px solid #f1f5f9; flex-shrink: 0; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 0.1rem;}
.category-label { font-size: 0.75rem; color: #3b82f6; font-weight: 600; margin-bottom: 0.25rem; }
.meta-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.status-badge { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 6px; }
.date-text { font-size: 0.7rem; color: #94a3b8; font-weight: 500; }

.item-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.amount-text { font-size: 0.875rem; font-weight: 700; color: #ef4444; }
.btn-notif { background: #3b82f6; color: white; border: none; font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.375rem; cursor: pointer; transition: background 0.2s;}
.btn-notif:hover { background: #2563eb; }

/* PAGINATION */
.table-footer { padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; background-color: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; align-items: center; }
.page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem;}
.modal-panel { background: white; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;}
.modal-panel-header { padding: 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; position: relative; background: #f8fafc;}
.notif-icon-box { width: 36px; height: 36px; border-radius: 10px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-title-box h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 0.15rem 0; }
.notif-title-box p { font-size: 0.7rem; color: #64748b; margin: 0;}
.notif-close { position: absolute; top: 1.25rem; right: 1.25rem; color: #94a3b8; background: none; border: none; cursor: pointer; padding: 0;}

.modal-panel-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.form-group-notif label { font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 0.375rem; display: block; }
.text-red { color: #ef4444; }
.notif-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.8125rem; outline: none; font-family: inherit;}
.notif-input:focus { border-color: #3b82f6; }
.notif-textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 0.8125rem; outline: none; resize: none; font-family: inherit;}
.notif-textarea:focus { border-color: #3b82f6; }

.modal-panel-footer { padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc;}
.btn-cancel { background: transparent; border: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 0.8125rem; cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: background 0.2s;}
.btn-cancel:hover { background: #f1f5f9; color: #1e293b;}
.btn-send { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 0.375rem; cursor: pointer; transition: background 0.2s;}
.btn-send:hover { background: #2563eb; }

.empty-state { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.8125rem; font-weight: 500; }

/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */

/* Untuk Layar Medium (Tablet/Laptop Kecil) */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr; /* Tumpuk Kiri dan Kanan menjadi 1 Kolom */
  }
  
  .admin-dashboard {
    height: auto; /* Biarkan bisa discroll ke bawah jika ditumpuk */
    overflow-y: auto;
  }
  
  .left-column, .right-column {
    height: auto;
    overflow: visible;
  }
  
  /* Pastikan daftar log/approval tidak memakan terlalu banyak ruang */
  .log-list, .approval-list {
    max-height: 400px;
  }
}

/* Untuk Layar Kecil (Mobile) */
@media (max-width: 768px) {
  .admin-dashboard {
    padding-bottom: 2rem; /* Ruang untuk scroll di mobile */
  }
  
  /* Grid Kartu Statistik menjadi 1 baris 2 kolom (berdampingan) */
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column; /* Ikon dan Teks Atas-Bawah agar muat */
    align-items: flex-start;
    gap: 0.75rem;
  }

  /* Perbaikan Chart di HP */
  .chart-container {
    flex-direction: column; /* Chart di Atas, Legend di Bawah */
    padding: 1rem;
    gap: 1rem;
  }
  
  .donut-box {
    width: 180px;
    height: 180px;
  }
  
  .chart-legend {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap; /* Membungkus kategori jika panjang */
    justify-content: center;
  }

  /* Modifikasi Log List untuk HP */
  .log-item {
    grid-template-columns: 8px 70px 1fr; /* Waktu lebih sempit */
    gap: 0.5rem;
  }
  
  .log-time {
    font-size: 0.6rem;
  }

  /* Modifikasi Daftar Approval untuk HP */
  .approval-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .item-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between; /* Harga di kiri, Tombol di Kanan */
    align-items: center;
    border-top: 1px solid #f1f5f9;
    padding-top: 0.75rem;
  }

  .btn-notif {
    padding: 0.4rem 1rem;
  }

  /* Modals */
  .modal-panel-footer {
    flex-direction: column-reverse; /* Batal di Bawah, Kirim di Atas */
  }
  .btn-cancel, .btn-send {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }
}
</style>