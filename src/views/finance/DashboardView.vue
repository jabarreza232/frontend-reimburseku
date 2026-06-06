<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, ChevronDown } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
const VueApexCharts = defineAsyncComponent(() => import('vue3-apexcharts'))
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'

const stats = ref([
  { label: 'Saldo Kas', value: 'Rp 0', isBlue: true },
  { label: 'Telah Dibayarkan', value: 'Rp 0', isBlue: false },
])



const chartOptions = ref({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
    parentHeightOffset: 0,
    sparkline: { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: ['#3b82f6'],
  dataLabels: { enabled: false },
  stroke: {
    curve: 'smooth',
    width: 2.5
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.0,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 },
      offsetY: 4
    },
    crosshairs: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 },
      formatter: (value) => {
        if(value >= 1000000) return (value / 1000000).toFixed(1) + " Jt";
        return value;
      },
      offsetX: -10
    }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    padding: { top: 0, right: 0, bottom: 0, left: 10 }
  }
})

const series = ref([{
  name: 'Pengeluaran',
  data: [1500000, 2200000, 1800000, 2500000, 3200000, 2800000, 3500000]
}])

const history = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [statsRes, reimburseRes] = await Promise.all([
      ApiService.getBalanceStats(),
      ApiService.getReimbursements()
    ])
    
    const data = statsRes.data?.data || {}
    stats.value[0].value = formatRupiah(data.saldo_kas || 0)
    stats.value[1].value = formatRupiah(data.telah_dibayarkan || 0)

    const listData = reimburseRes.data?.data?.data || reimburseRes.data?.data || []
    
    history.value = listData.slice(0, 6).map(item => ({
      id: item.id_request,
      name: item.employee_name || item.employees?.name || 'Unknown',
      category: item.category_name || item.category?.category_name || 'Lain-lain',
      amount: formatRupiah(item.amount),
      date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      status: mapStatusToFrontend(item.last_status)
    }))
  } catch (error) {
    console.error('Failed to load dashboard data', error)
  } finally {
    isLoading.value = false
  }
})

const filters = ['Semua', 'Menunggu', 'Selesai', 'Pembayaran', 'Ditolak']
const activeFilter = ref('Semua')
</script>

<template>
  <div class="finance-dasbor">
    <div class="page-header">
      <h1 class="page-title">Beranda</h1>
    </div>

    <!-- Top Stats -->
    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card" :class="{ 'card-blue': s.isBlue }">
        <div class="stat-icon-box">
          <Calendar v-if="s.isBlue" :size="20" />
          <TrendingUp v-else :size="20" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Left: Area Chart -->
      <div class="card chart-card">
        <div class="card-head">
          <h3 class="card-title">Pengeluaran Seminggu terakhir</h3>
          <div class="month-selector">Januari 2026 <ChevronDown :size="14" style="margin-left: 4px;" /></div>
        </div>
        <div class="chart-content">
          <VueApexCharts type="area" height="100%" :options="chartOptions" :series="series" />
        </div>
      </div>

      <!-- Right: History -->
      <div class="card list-card">
        <div class="card-head">
          <h3 class="card-title">Riwayat Reimbursement Hari ini</h3>
        </div>
        <div class="filter-row">
          <button v-for="f in filters" :key="f" class="filter-btn" :class="{ active: activeFilter === f }" @click="activeFilter = f">{{ f }}</button>
        </div>
        
        <div class="history-list">
          <div v-if="isLoading" class="empty-state">
            Memuat riwayat...
          </div>
          <div v-else-if="history.length === 0" class="empty-state">
            Belum ada riwayat hari ini.
          </div>
          <template v-else>
            <div v-for="item in history" :key="item.id" class="history-row">
            <div class="h-left">
              <div class="avatar-circle">{{ item.name[0] }}</div>
              <div class="h-info">
                <p class="h-name">{{ item.name }}</p>
                <p class="h-meta">{{ item.category }} &bull; {{ item.date }}</p>
              </div>
            </div>
            <div class="h-right">
              <p class="h-amount">{{ item.amount }}</p>
              <span class="status-pill" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </div>
            </div>
          </template>
        </div>
        
        <div class="pagination">
          <button class="p-btn" aria-label="Halaman Sebelumnya" disabled><ChevronLeft :size="14" /></button>
          <span class="p-num active">1</span>
          <span class="p-num">2</span>
          <span class="p-num">3</span>
          <button class="p-btn" aria-label="Halaman Selanjutnya"><ChevronRight :size="14" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-dasbor { display: flex; flex-direction: column; gap: 1.5rem; background: #f8fafc; height: calc(100vh - 64px - 3rem); overflow: hidden; padding-bottom: 0.5rem; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; max-width: 600px; }
.stat-card {
  background: white; border-radius: 16px; padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); 
  border: 1px solid #f1f5f9;
}
.card-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2); }
.stat-icon-box { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.card-blue .stat-icon-box { background: rgba(255,255,255,0.2); color: white; }
.stat-card:not(.card-blue) .stat-icon-box { background: #fef3c7; color: #f59e0b; }

.stat-label { font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }
.card-blue .stat-label { color: rgba(255,255,255,0.9); }
.stat-card:not(.card-blue) .stat-label { color: #64748b; }
.stat-card:not(.card-blue) .stat-value { color: #0f172a; }

/* Grid */
.dashboard-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); 
  gap: 1.5rem; 
  flex: 1; 
  min-height: 0; 
}

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; overflow-y: auto; }
  .chart-card { min-height: 400px; }
  .list-card { min-height: 500px; }
}

.card { 
  background: white; 
  border-radius: 16px; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); 
  border: 1px solid #f1f5f9; 
  display: flex; 
  flex-direction: column; 
  min-height: 0; 
  overflow: hidden; 
}
.card-head { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid transparent; }
.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; }

/* Chart */
.chart-card { flex: 1; }
.chart-card .card-head { border-bottom: 1px solid #f8fafc; padding-bottom: 1rem; }
.month-selector { font-size: 0.75rem; color: #475569; font-weight: 600; cursor: pointer; display: flex; align-items: center; padding: 0.4rem 0.75rem; border-radius: 8px; background: #f8fafc; transition: background 0.2s; }
.month-selector:hover { background: #f1f5f9; color: #0f172a; }
.chart-content { padding: 1rem 1.5rem 0.5rem 0.5rem; flex: 1; min-height: 300px; width: 100%; position: relative; }

/* History */
.list-card { flex: 1; display: flex; flex-direction: column; }
.filter-row { padding: 0 1.5rem 1rem; display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; -ms-overflow-style: none; border-bottom: 1px solid #f8fafc; }
.filter-row::-webkit-scrollbar { display: none; }
.filter-btn { background: #f8fafc; border: 1px solid #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 600; padding: 0.4rem 0.875rem; border-radius: 20px; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
.filter-btn:hover { background: #f1f5f9; color: #334155; }
.filter-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }

.history-list { flex: 1; overflow-y: auto; padding: 0.5rem 0; }
.history-list::-webkit-scrollbar { width: 6px; }
.history-list::-webkit-scrollbar-track { background: transparent; }
.history-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.history-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.empty-state { padding: 2rem; text-align: center; color: #64748b; font-size: 0.8rem; font-weight: 500; }
.history-row { padding: 0.875rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: default; }
.history-row:hover { background: #fcfdfe; }
.history-row:last-child { border-bottom: none; }

.h-left { display: flex; align-items: center; gap: 0.875rem; }
.avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; border: 1px solid #dbeafe; }
.h-info { display: flex; flex-direction: column; gap: 0.125rem; }
.h-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.h-meta { font-size: 0.7rem; color: #64748b; font-weight: 500; }

.h-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.h-amount { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; letter-spacing: 0.02em; text-transform: uppercase; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }
.status-pill.disetujui { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
.status-pill.selesai { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

.pagination { padding: 1rem 1.5rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem; border-top: 1px solid #f1f5f9; background: #fcfdfe; }
.p-btn, .p-num { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
.p-btn:hover:not(:disabled), .p-num:hover:not(.active) { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.p-num.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2); }
</style>
