

=== FILE: \api\apiClient.js ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
  baseURL:  'https://backend-api-reimburseku.vercel.app/api',

[f7da682 / User]
// baseURL: 'https://backend-api-reimburseku.vercel.app/api',
  baseURL: 'http://localhost:8000/api', // Kembalikan ke /api setelah app.php diperbaiki



=== FILE: \assets\main.css ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
/* Global Mobile Responsiveness for Dashboards */
@media (max-width: 768px) {
  .page-header {
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
  }
  .card-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 1rem !important;
  }
  .header-actions {
    flex-wrap: wrap !important;
    width: 100% !important;
    justify-content: flex-start !important;
  }
  .search-box {
    width: 100% !important;
  }
  .search-input {
    width: 100% !important;
  }
  .btn-add, .btn-sort, .btn-filter, .btn-archive {
    flex-grow: 1 !important;
    justify-content: center !important;
  }
}

[f7da682 / User]
/* Global Loading Animation */
.global-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spinner-spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spinner-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
}

/* Status Pills Global */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* Menunggu / Pending */
.status-pill.menunggu,
.status-pill.pending { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

/* Disetujui / Approved / Diterima */
.status-pill.disetujui,
.status-pill.diterima,
.status-pill.approved { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

/* Selesai / Dibayar / Paid */
.status-pill.selesai,
.status-pill.dibayar,
.status-pill.paid { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

/* Ditolak / Rejected */
.status-pill.ditolak,
.status-pill.rejected { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }



=== FILE: \layouts\StaffLayout.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
import { RouterView, useRouter } from 'vue-router'
import { 
  Edit2, 
  LogOut, 
  LayoutDashboard, 
  Printer, 
  Wifi, 
  Bluetooth 
} from 'lucide-vue-next'

[f7da682 / User]
import { RouterView, useRouter, useRoute } from 'vue-router'
import { Edit2, LogOut } from 'lucide-vue-next' // Tambahkan import LogOut di sini


--- CONFLICT 2 ---
[HEAD / Jabbar]
  color: rgba(255, 255, 255, 0.75);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;

[f7da682 / User]
  color: rgba(255,255,255,0.7);
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #dc2626 !important;
  color: #ffffff !important;



=== FILE: \views\admin\DashboardView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]

[f7da682 / User]
  flex: 1;
  overflow-y: auto;



=== FILE: \views\admin\DepositView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
      await ApiService.deleteDeposit(id) // Memanggil endpoint deleteDeposit dari ApiService

[f7da682 / User]
      await ApiService.deleteDeposit(id)



=== FILE: \views\finance\DashboardView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
    const statsData = statsRes.data?.data || {}
    stats.value[0].value = formatRupiah(statsData.saldo_kas || 0)
    stats.value[1].value = formatRupiah(statsData.telah_dibayarkan || 0)

[f7da682 / User]
    const data = statsRes.data?.data || {}
    stats.value[0].value = formatRupiah(data.remaining_balance || 0)
    stats.value[1].value = formatRupiah(data.total_expense || 0)


--- CONFLICT 2 ---
[HEAD / Jabbar]
    const catCounts = {}

    history.value = listData.map(item => {
      const latestApp = item.latest_approval || {}
      const rawStatus = latestApp.status || 'PENDING'

      const catName = item.category_name || 'Lain-lain'
      catCounts[catName] = (catCounts[catName] || 0) + 1

      return {
        id: item.id_request,
        approvalId: latestApp.id_approval || item.id_request, 
        receiptUrl: latestApp.transfer_receipt || null,
        rejectionReason: latestApp.rejection_reason || 'Tidak ada alasan spesifik yang diberikan.',
        name: item.employees_name || 'Unknown',
        category: catName,
        amount: formatRupiah(item.amount),
        rawAmount: item.amount,
        date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: translateStatus(rawStatus)
      }
    })

    const categories = Object.keys(catCounts)
    if (categories.length > 0) {
      pieOptions.value = { ...pieOptions.value, labels: categories }
      pieSeries.value = Object.values(catCounts)
    } else {
      pieOptions.value = { ...pieOptions.value, labels: ['Belum Ada Data'] }
      pieSeries.value = [100]
    }


[f7da682 / User]
    history.value = listData.slice(0, 6).map(item => ({
      id: item.id_request,
      name: item.employees_name || item.employee_name || item.employees?.name || 'Unknown',
      category: item.category_name || item.category?.category_name || 'Lain-lain',
      amount: formatRupiah(item.amount),
      date: new Date(item.expense_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      status: mapStatusToFrontend(item.last_status)
    }))


--- CONFLICT 3 ---
[HEAD / Jabbar]
    <div class="page-header">
      <h1 class="page-title">Beranda Finance</h1>
      
      <div class="quick-actions">
        <button class="qa-btn qa-outline" @click="showExportModal = true">
          <Download :size="16" />
          <span>Ekspor Rekap</span>
        </button>
        <button class="qa-btn qa-primary" @click="router.push('/finance/deposit/tambah')">
          <PlusCircle :size="16" />
          <span>Top Up Saldo</span>
        </button>
      </div>
    </div>

[f7da682 / User]
    


--- CONFLICT 4 ---
[HEAD / Jabbar]
      <div class="left-column">
        <div class="card chart-card">
          <div class="card-head">
            <h3 class="card-title">Grafik Pengeluaran</h3>
            <div class="chart-header-actions">
              <select v-model="chartMode" @change="fetchChartData" class="custom-input">
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>

              <div v-if="chartMode === 'weekly'" class="date-range-wrap">
                <input type="date" v-model="chartStartDate" @change="fetchChartData" class="custom-input" />
                <span class="range-divider">-</span>
                <input type="date" v-model="chartEndDate" @change="fetchChartData" class="custom-input" />
              </div>

              <div v-else class="month-wrap relative">
                <div class="month-selector custom-input" @click="toggleChartMonthPicker">
                  {{ displayMonth }} <ChevronDown :size="14" style="margin-left: 4px;" />
                </div>
                
                <div v-if="showChartMonthPicker" class="chart-month-dropdown">
                  <div class="chart-month-overlay" @click="showChartMonthPicker = false"></div>
                  <div class="custom-month-picker dropdown-content">
                    <div class="year-selector">
                      <button class="year-btn" @click="chartTempYear--"><ChevronLeft :size="16"/></button>
                      <span class="year-display">{{ chartTempYear }}</span>
                      <button class="year-btn" @click="chartTempYear++"><ChevronRight :size="16"/></button>
                    </div>
                    <div class="month-grid">
                      <button 
                        v-for="m in monthList" :key="m.val" class="month-btn"
                        :class="{ 'active': isChartMonthActive(m.val) }"
                        @click="selectChartMonth(m.val)"
                      >
                        {{ m.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="chart-content">
            <VueApexCharts :key="chartMode" type="area" height="100%" :options="chartOptions" :series="series" />
          </div>

[f7da682 / User]
      <!-- Left: Area Chart -->
      <div class="card chart-card">
        <div class="card-head">
          <h3 class="card-title">Pengeluaran Seminggu terakhir</h3>


--- CONFLICT 5 ---
[HEAD / Jabbar]
        <div class="pagination" v-if="lastPage > 1">
          <button class="p-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)"><ChevronLeft :size="14" /></button>
          <span v-for="page in lastPage" :key="page" class="p-num" :class="{ active: currentPage === page }" @click="changePage(page)">{{ page }}</span>
          <button class="p-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)"><ChevronRight :size="14" /></button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-backdrop" @click.self="showConfirmModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isMandatory ? 'Proses Pembayaran?' : 'Setujui Pengajuan?' }}</h3>
          <button class="close-btn" @click="showConfirmModal = false">
            <X :size="18" />
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menyetujui pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{ selectedItem?.name }}</strong>.
          </p>

          <div class="upload-section" v-if="isMandatory">
            <label class="upload-label">
              Wajib Sertakan Bukti Transfer <span class="text-red">*</span>
            </label>
            <div class="upload-field" :class="{ 'has-file': proofName, 'shake': uploadShake }">
              <input type="text" :value="proofName || 'Pilih file (JPG/PNG/PDF)...'" readonly class="upload-input-mock" />
              <label class="upload-btn-inner">
                <FileText :size="16" />
                <input type="file" @change="handleFileUpload" class="hidden-input" accept=".jpg,.jpeg,.png,.pdf" />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal batal" @click="showConfirmModal = false">Batal</button>
          <button class="btn-modal main-btn"
            :class="{ 'pay': isMandatory, 'approve': !isMandatory }"
            :disabled="isMandatory && !proofFile" @click="confirmAction">
            {{ isMandatory ? 'Bayar' : 'Setujui' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReceiptModal" class="modal-backdrop" @click.self="closeReceipt">
      <div class="modal receipt-modal">
        <div class="modal-header">
          <h3 class="modal-title">Bukti Transfer</h3>
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Zoom Out"><ZoomOut :size="14" /></button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button class="zoom-btn" @click="zoomIn" title="Zoom In"><ZoomIn :size="14" /></button>
            <div class="divider-vertical"></div>
            <button class="zoom-btn reset" @click="resetZoom" title="Reset Zoom"><RotateCcw :size="14" /></button>
          </div>
          <button class="close-btn" @click="closeReceipt"><X :size="18" /></button>
        </div>
        <div class="modal-body image-viewer-body">
          <div class="image-container">
            <img :src="selectedReceiptUrl" alt="Bukti Transfer" class="zoomable-image" :style="{ transform: `scale(${zoomLevel})` }" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="modal-backdrop" @click.self="showRejectModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Tolak Pengajuan?</h3>
          <button class="close-btn" @click="showRejectModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Anda akan menolak pengajuan sebesar <strong>{{ selectedItem?.amount }}</strong> dari <strong>{{ selectedItem?.name }}</strong>.
          </p>
          <div class="upload-section">
            <label class="upload-label">
              Alasan Penolakan <span class="text-red">*</span>
            </label>
            <textarea v-model="rejectReason" class="reject-textarea" :class="{ 'shake error-border': rejectError }"
              placeholder="Contoh: Nota tidak jelas / nominal tidak sesuai..." rows="3"></textarea>
            <span v-if="rejectError" class="error-text">Alasan penolakan wajib diisi!</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal batal-outline" @click="showRejectModal = false">Batal</button>
          <button class="btn-modal tolak-btn" @click="confirmTolak">Tolak Pengajuan</button>
        </div>
      </div>
    </div>

    <div v-if="showReasonModal" class="modal-backdrop" @click.self="showReasonModal = false">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3 class="modal-title text-red">Alasan Penolakan</h3>
          <button class="close-btn" @click="showReasonModal = false"><X :size="18" /></button>
        </div>
        <div class="modal-body">
          <p class="confirm-msg">
            Pengajuan dari <strong>{{ selectedItem?.name }}</strong> ditolak dengan alasan:
          </p>
          <div class="upload-section">
            <textarea class="reject-textarea" rows="4" readonly :value="selectedItem?.rejectionReason"
              style="background-color: #f8fafc; cursor: not-allowed; color: #475569;"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn-modal batal-outline" @click="showReasonModal = false" style="width: 100%;">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="showSuccessModal" class="modal-backdrop" @click.self="closeSuccess">
      <div class="modal success-modal">
        <div class="modal-body success-body">
          <div class="success-icon-wrap">
            <CheckCircle :size="56" class="success-icon" />
          </div>
          <h2 class="success-title">Operasi Berhasil</h2>
          <button class="btn-back-success" @click="closeSuccess">Kembali</button>
        </div>
      </div>
    </div>

    <div v-if="showExportModal" class="modal-backdrop" @click.self="showExportModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Konfigurasi Ekspor Laporan</h3>
          <button class="close-btn" @click="showExportModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Metode Ekspor Tanggal</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="exportFilterMode" value="month" />
                <span>Bulan Tertentu</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="exportFilterMode" value="range" />
                <span>Rentang Tanggal</span>
              </label>
            </div>
          </div>

          <div v-if="exportFilterMode === 'month'" class="form-group">
            <label class="form-label">Pilih Bulan</label>
            <div class="custom-month-picker">
              <div class="year-selector">
                <button class="year-btn" @click="exportTempYear--"><ChevronLeft :size="16"/></button>
                <span class="year-display">{{ exportTempYear }}</span>
                <button class="year-btn" @click="exportTempYear++"><ChevronRight :size="16"/></button>
              </div>
              <div class="month-grid">
                <button v-for="m in monthList" :key="m.val" class="month-btn" :class="{ 'active': isExportMonthActive(m.val) }" @click="setExportMonth(m.val)">
                  {{ m.label }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="exportFilterMode === 'range'" class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Dari Tanggal</label>
              <input type="date" v-model="exportInputStart" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Sampai Tanggal</label>
              <input type="date" v-model="exportInputEnd" class="form-input" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showExportModal = false">Batal</button>
          <div class="export-actions">
            <button class="btn-download btn-pdf" :disabled="isExporting" @click="exportFilterMode === 'month' ? exportByMonth('pdf') : exportByDateRange('pdf')">
              <FileText :size="16" />
              <span>{{ isExporting ? 'Memproses...' : 'PDF' }}</span>
            </button>
            <button class="btn-download btn-excel" :disabled="isExporting" @click="exportFilterMode === 'month' ? exportByMonth('excel') : exportByDateRange('excel')">
              <Table :size="16" />
              <span>{{ isExporting ? 'Memproses...' : 'Excel' }}</span>
            </button>
          </div>

[f7da682 / User]
        <div class="pagination" v-if="Math.ceil(history.length / 10) > 1">
          <button class="p-btn" aria-label="Halaman Sebelumnya" disabled><ChevronLeft :size="14" /></button>
          <span class="p-num active">1</span>
          <span class="p-num" v-for="p in Math.ceil(history.length / 10) - 1" :key="p">{{ p + 1 }}</span>
          <button class="p-btn" aria-label="Halaman Selanjutnya"><ChevronRight :size="14" /></button>


--- CONFLICT 6 ---
[HEAD / Jabbar]
.finance-dasbor { display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; height: calc(100vh - 64px - 3rem); overflow: hidden; padding-bottom: 0.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; margin: 0; }
.quick-actions { display: flex; gap: 0.75rem; align-items: center; }
.qa-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
.qa-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.qa-outline:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }
.qa-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; color: white; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); }
.qa-primary:hover { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3); transform: translateY(-1px); }

/* --- STATS CARD --- */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; max-width: 600px; }
.stat-card { background: white; border-radius: 16px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }

[f7da682 / User]
.finance-dasbor { display: flex; flex-direction: column; gap: 1.5rem; flex: 1; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.stat-card {
  background: white; border-radius: 16px; padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); 
  border: 1px solid #f1f5f9;
}


--- CONFLICT 7 ---
[HEAD / Jabbar]
/* --- GRID LAYOUT --- */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); gap: 1.5rem; flex: 1; min-height: 0; }
@media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; overflow-y: auto; } }

.left-column { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
.card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.chart-card { flex: 1; min-height: 250px; }
.donut-card { min-height: 220px; flex-shrink: 0; }
.list-card { flex: 1; display: flex; flex-direction: column; }

.card-head { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; flex-wrap: wrap; gap: 0.75rem;}
.title-with-badge { display: flex; align-items: center; gap: 0.5rem; }
.card-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0;}
.filter-badge { font-size: 0.65rem; background: #f1f5f9; color: #64748b; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; border: 1px solid #e2e8f0; }

.chart-header-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.custom-input { font-family: inherit; font-size: 0.7rem; color: #475569; font-weight: 600; cursor: pointer; padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; outline: none; transition: border-color 0.2s; }
.custom-input:focus { border-color: #3b82f6; }
.date-range-wrap { display: flex; align-items: center; gap: 0.3rem; }
.range-divider { color: #94a3b8; font-weight: 600; font-size: 0.8rem; }
.chart-content { padding: 0.5rem 1.5rem 0 0.5rem; flex: 1; position: relative; }
.donut-content { padding: 1rem; display: flex; justify-content: center; align-items: center; }

.month-wrap.relative { position: relative; display: inline-block; }
.month-selector { display: flex; align-items: center; gap: 0.25rem; }
.chart-month-dropdown { position: absolute; top: calc(100% + 4px); right: 0; z-index: 50; }
.chart-month-overlay { position: fixed; inset: 0; z-index: 40; }
.dropdown-content { position: relative; z-index: 50; background: white; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; width: 240px; }

/* History List */
.filter-row { padding: 1rem 1.5rem; display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; border-bottom: 1px solid #f8fafc; }

[f7da682 / User]
/* Grid */
.dashboard-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); 
  gap: 1rem; 
  flex: 1; 
  min-height: 0; 
  overflow: hidden;
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
.chart-card .card-head { border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
.chart-content { padding: 1rem 1.5rem 0.5rem 0.5rem; flex: 1; min-height: 300px; width: 100%; position: relative; }

/* History */
.list-card { flex: 1; display: flex; flex-direction: column; }
.filter-row { padding: 0 1.5rem 1rem; display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 0.5rem; scrollbar-width: none; -ms-overflow-style: none; border-bottom: 1px solid #e2e8f0; }


--- CONFLICT 8 ---
[HEAD / Jabbar]
.history-row { padding: 0.75rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; transition: background 0.2s; cursor: default; }

[f7da682 / User]
.history-row { padding: 0.875rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; transition: background 0.2s; cursor: default; }


--- CONFLICT 9 ---
[HEAD / Jabbar]

/* ACTION BUTTONS & PILLS */
.mt-1 { margin-top: 0.25rem; }
.action-row { display: flex; justify-content: flex-end; gap: 0.375rem; }
.btn-action { border-radius: 6px; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.6rem; cursor: pointer; border: none; min-width: 60px; transition: all 0.2s; }
.btn-action.tolak { background: #ef4444; color: white; }
.btn-action.tolak-ghost { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.btn-action.tolak-ghost:hover { background: #fee2e2; }
.btn-action.proses { background: #3b82f6; color: white; }
.btn-action.bayar-green { background: #22c55e; color: white; }
.btn-action.bukti-ghost { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; letter-spacing: 0.02em; text-transform: uppercase; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }
.status-pill.disetujui { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
.status-pill.selesai { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
.status-pill.dibayar { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

[f7da682 / User]



=== FILE: \views\finance\DepositView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
          rawAmount: -parseFloat(r.amount), // Jadikan negatif untuk kalkulasi saldo

[f7da682 / User]
          rawAmount: -parseFloat(r.amount),


--- CONFLICT 2 ---
[HEAD / Jabbar]
    // Sort awal berdasarkan tanggal terlama untuk menghitung Saldo Berjalan (Running Balance)
    allTx.sort((a, b) => a.rawDate - b.rawDate)

[f7da682 / User]
    // Sort ascending to calculate running balance
    allTx.sort((a, b) => a.rawDate - b.rawDate)
    
    let currentBalance = 0
    allTx.forEach(t => {
      currentBalance += t.rawAmount
      t.balance = formatRupiah(currentBalance)
    })

    // Sort descending for display
    allTx.sort((a, b) => b.rawDate - a.rawDate)


--- CONFLICT 3 ---
[HEAD / Jabbar]

.sort-dropdown { position: relative; }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  width: 160px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
}
.dropdown-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
}
.dropdown-item:hover { background: #f8fafc; color: #1e293b; }
.dropdown-item.active { background: #eff6ff; color: #3b82f6; }

/* Tambahan Style untuk Loading (Skeleton & Spinner) */
.skeleton {
  background: #f1f5f9;
  background: linear-gradient(110deg, #f1f5f9 8%, #e2e8f0 18%, #f1f5f9 33%);
  border-radius: 8px;
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
@keyframes shimmer { to { background-position-x: -200%; } }
.skeleton-title { height: 24px; width: 60%; margin-top: 0.25rem; border-radius: 6px; }
.skeleton-text { height: 12px; border-radius: 4px; }

.loading-state, .empty-state { padding: 3rem 1rem !important; }
.loader-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #f1f5f9;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}
.loading-text { margin-top: 0.75rem; font-size: 0.7rem; color: #64748b; font-weight: 500; }
@keyframes spin { to { transform: rotate(360deg); } }
.finance-deposit { display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; height: 100%; overflow: hidden; }

[f7da682 / User]
.finance-deposit { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }



=== FILE: \views\finance\KaryawanView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
      .filter(emp => emp.role?.id_role === 1) 
      .map(emp => {
        const payout = emp.account_payout || {}
        const providerData = payout.provider || {}
        const roleData = emp.role || {}
        
        return {
          id: emp.id_employees || emp.id, 
          nama: emp.name || '-',
          email: emp.email || '-',
          jabatan: roleData.role_name || '-', 
          totalPengajuan: emp.total_pengajuan || 0,
          totalAmount: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(emp.total_nominal || 0),
          atasNama: payout.account_holder_name || 'Belum diatur',
          nomorRekening: payout.account_number || '-',
          provider: providerData.provider_name || '-'
        }
      })

[f7da682 / User]
      .filter(emp => emp.roles_id === 3) // Hanya tampilkan data Staff
      .map(emp => ({
      id: emp.id_employees,
      nama: emp.name || '-',
      email: emp.email || '-',
      jabatan: emp.position || '-',
      departemen: emp.position || '-', // fallback since backend might not have separate department field
      totalPengajuan: emp.reimbursement_requests_count || 0,
      totalAmount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(emp.reimbursement_requests_sum_amount || 0)
    }))


--- CONFLICT 2 ---
[HEAD / Jabbar]
const goToDetail = (id) => {
  if (id) {
    router.push(`/karyawan/${id}`)
  } else {
    console.warn('ID Karyawan tidak ditemukan')
  }
}

// --- FUNGSI EKSPOR DATA KARYAWAN ---
const processExport = async (formatType) => {
  isExporting.value = true
  
  try {
    let allData = []
    let currentFetchPage = 1
    let lastFetchPage = 1

    // 1. Loop ambil semua data dari API
    do {
      const res = await ApiService.getEmployees(currentFetchPage)
      const data = res.data?.data || []
      const meta = res.data?.meta || {}
      
      allData = [...allData, ...data]
      lastFetchPage = meta.last_page || 1
      currentFetchPage++
    } while (currentFetchPage <= lastFetchPage)

    // 2. Filter & Mapping Data
    const exportData = allData
      .filter(emp => emp.role?.id_role === 1)
      .map((emp, index) => {
        const payout = emp.account_payout || {}
        const providerData = payout.provider || {}
        const roleData = emp.role || {}
        
        return {
          'No': index + 1,
          'Nama Karyawan': emp.name || '-',
          'Email': emp.email || '-',
          'Jabatan': roleData.role_name || '-',
          'Bank / Provider': providerData.provider_name || '-',
          'Atas Nama': payout.account_holder_name || '-',
          'No. Rekening': payout.account_number || '-',
          'Total Pengajuan': emp.total_pengajuan || 0,
          'Total Nominal (Rp)': emp.total_nominal || 0,
          'Total_Format': new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
          }).format(emp.total_nominal || 0)
        }
      })

    if (exportData.length === 0) {
      alert('Tidak ada data karyawan aktif untuk diekspor.')
      isExporting.value = false
      return
    }

    // 3. Proses Excel
    if (formatType === 'excel') {
      const excelData = exportData.map(d => ({
        'No': d.No,
        'Nama Karyawan': d['Nama Karyawan'],
        'Email': d.Email,
        'Jabatan': d.Jabatan,
        'Bank / Provider': d['Bank / Provider'],
        'Atas Nama': d['Atas Nama'],
        'No. Rekening': d['No. Rekening'],
        'Total Pengajuan': d['Total Pengajuan'],
        'Total Nominal (Rp)': d['Total Nominal (Rp)']
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Karyawan")
      XLSX.writeFile(workbook, `Data_Karyawan_${Date.now()}.xlsx`)
    } 
    // 4. Proses PDF
    else if (formatType === 'pdf') {
      // Gunakan orientasi 'l' (landscape) agar tabel muat banyak kolom
      const doc = new jsPDF('l', 'mm', 'a4')
      doc.setFontSize(14)
      doc.text(`Laporan Data Karyawan Aktif`, 14, 15)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22)

      const tableColumn = ["No", "Nama Karyawan", "Jabatan", "Bank/E-Wallet", "No. Rekening", "Atas Nama", "Pengajuan", "Total Nilai"]
      const tableRows = exportData.map(d => [
        d.No, 
        d['Nama Karyawan'], 
        d.Jabatan, 
        d['Bank / Provider'], 
        d['No. Rekening'], 
        d['Atas Nama'], 
        d['Total Pengajuan'], 
        d['Total_Format']
      ])

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
      })

      doc.save(`Data_Karyawan_${Date.now()}.pdf`)
    }
    
    showExportModal.value = false
  } catch (error) {
    console.error("Gagal mengekspor laporan:", error)
    alert("Terjadi kesalahan saat menarik data dari server.")
  } finally {
    isExporting.value = false
  }

[f7da682 / User]
const showDetailModal = ref(false)
const selectedEmp = ref(null)

function openDetail(k) {
  selectedEmp.value = k
  showDetailModal.value = true
}

function closeDetail() {
  showDetailModal.value = false
  selectedEmp.value = null


--- CONFLICT 3 ---
[HEAD / Jabbar]
    <div class="page-header">
      <h1 class="page-title">Karyawan</h1>
      
      <!-- Tombol Ekspor -->
      <div class="quick-actions">
        <button class="qa-btn qa-outline" @click="showExportModal = true">
          <Download :size="16" />
          <span>Ekspor Data</span>
        </button>
      </div>
    </div>

[f7da682 / User]
    


--- CONFLICT 4 ---
[HEAD / Jabbar]
                <button class="btn-icon detail" title="Lihat Detail" @click="goToDetail(k.id)">
                  <Eye :size="12" />
                </button>

[f7da682 / User]
                <button class="btn-icon detail" title="Lihat Detail" @click="openDetail(k)"><Eye :size="12" /></button>


--- CONFLICT 5 ---
[HEAD / Jabbar]
        <p class="text-muted text-xs">
          menampilkan {{ fromItem }} dari {{ totalItems }} data
        </p>
        <div class="pagination" v-if="lastPage > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="12" />
          </button>
          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }" @click="changePage(page)">
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL EKSPOR (Simple) -->
    <div v-if="showExportModal" class="modal-backdrop" @click.self="showExportModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3 class="modal-title">Ekspor Data Karyawan</h3>
          <button class="close-btn" @click="showExportModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body text-center">
          <p class="export-desc">Pilih format file untuk mengunduh rekapitulasi seluruh data karyawan aktif beserta informasi pembayaran.</p>
          
          <div class="export-actions-centered">
            <button 
              class="btn-download btn-pdf" 
              :disabled="isExporting"
              @click="processExport('pdf')"
            >
              <FileText :size="18" />
              <span>{{ isExporting ? 'Memproses...' : 'Ekspor PDF' }}</span>
            </button>
            
            <button 
              class="btn-download btn-excel" 
              :disabled="isExporting"
              @click="processExport('excel')"
            >
              <Table :size="18" />
              <span>{{ isExporting ? 'Memproses...' : 'Ekspor Excel' }}</span>
            </button>
          </div>

[f7da682 / User]
        <p class="text-muted text-xs">Menampilkan {{ filtered.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filtered.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filtered.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>


--- CONFLICT 6 ---
[HEAD / Jabbar]
/* HEADER & QUICK ACTIONS */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.quick-actions { display: flex; gap: 0.75rem; align-items: center; }
.qa-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
.qa-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
.qa-outline:hover { background: #f1f5f9; color: #0f172a; border-color: #94a3b8; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }

[f7da682 / User]
.page-header { margin-bottom: 0; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; flex: 1; min-height: 0; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }


--- CONFLICT 7 ---
[HEAD / Jabbar]
.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

[f7da682 / User]
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }

.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }



--- CONFLICT 8 ---
[HEAD / Jabbar]
.btn-icon.detail:hover { background: #e2e8f0; color: #1e293b; }
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.text-xs { font-size: 0.65rem; }
.loading-state, .empty-state { padding: 3rem 1rem !important; }
.loader-spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.loading-text { margin-top: 0.75rem; font-size: 0.75rem; color: #64748b; font-weight: 500; }
@keyframes spin { to { transform: rotate(360deg); } }

/* MODAL EKSPOR */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-box { background: white; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
.modal-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.close-btn { background: transparent; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 1.5rem 1.5rem 2rem 1.5rem; }
.export-desc { font-size: 0.8125rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
.export-actions-centered { display: flex; gap: 1rem; justify-content: center; }
.btn-download { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border-radius: 12px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border: none; color: white; transition: all 0.2s; width: 120px;}
.btn-pdf { background: #ef4444; }
.btn-pdf:hover:not(:disabled) { background: #dc2626; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25); }
.btn-excel { background: #10b981; }
.btn-excel:hover:not(:disabled) { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; }
</style>

[f7da682 / User]

.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; border-top: 1px solid #f1f5f9; flex-shrink: 0; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }

/* Modal */
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1; margin-top: -4px; }
.modal-body { padding: 1.5rem 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 0.5rem; }
.detail-row:last-child { border-bottom: none; padding-bottom: 0; }
.detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
.detail-value { font-size: 0.8125rem; color: #1e293b; text-align: right; }
.modal-footer { padding: 1rem 1.25rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer; }
</style>



=== FILE: \views\finance\ReimbursementView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
        <p class="text-muted text-xs">
          menampilkan {{ fromItem }} dari {{ totalItems }} data
        </p>

        <div class="pagination" v-if="lastPage > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
            <ChevronLeft :size="12" />
          </button>

          <button v-for="page in lastPage" :key="page" class="page-btn" :class="{ active: currentPage === page }"
            @click="changePage(page)">
            {{ page }}
          </button>

          <button class="page-btn" :disabled="currentPage === lastPage" @click="changePage(currentPage + 1)">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showFilterModal" class="modal-overlay" @click.self="showFilterModal = false">
      <div class="modal filter-modal">
        <div class="modal-header">
          <h3 class="modal-title">Filter Data Reimbursement</h3>
          <button class="close-btn" @click="showFilterModal = false"><X :size="20" /></button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Metode Filter Tanggal</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="filterMode" value="month" />
                <span>Bulan Tertentu</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="filterMode" value="range" />
                <span>Rentang Tanggal</span>
              </label>
            </div>
          </div>

          <div v-if="filterMode === 'month'" class="form-group">
            <label class="form-label">Pilih Bulan</label>
            <div class="custom-month-picker">
              <div class="year-selector">
                <button class="year-btn" @click="filterTempYear--"><ChevronLeft :size="16"/></button>
                <span class="year-display">{{ filterTempYear }}</span>
                <button class="year-btn" @click="filterTempYear++"><ChevronRight :size="16"/></button>
              </div>
              <div class="month-grid">
                <button 
                  v-for="m in monthList" 
                  :key="m.val"
                  class="month-btn"
                  :class="{ 'active': isMonthActive(m.val) }"
                  @click="setFilterMonth(m.val)"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="filterMode === 'range'" class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Dari Tanggal</label>
              <input type="date" v-model="filterInputStart" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Sampai Tanggal</label>
              <input type="date" v-model="filterInputEnd" class="form-input" />
            </div>
          </div>
        </div>

        <div class="modal-footer footer-spaced">
          <button class="btn-cancel" @click="resetFilter">Hapus Filter</button>
          <button class="btn-primary-modal" @click="applyFilter">Terapkan Filter</button>

[f7da682 / User]
        <p class="text-muted text-xs">Menampilkan {{ filteredItems.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredItems.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredItems.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>


--- CONFLICT 2 ---
[HEAD / Jabbar]
.finance-reimburse {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
  height: 100%;
  overflow: hidden;
}

[f7da682 / User]
.finance-reimburse { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }


--- CONFLICT 3 ---
[HEAD / Jabbar]
.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }

.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }

[f7da682 / User]
.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }


--- CONFLICT 4 ---
[HEAD / Jabbar]
.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }


[f7da682 / User]
.table-responsive { overflow-x: auto; overflow-y: auto; flex: 1; }


--- CONFLICT 5 ---
[HEAD / Jabbar]
.status-pill { font-size: 0.6rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; display: inline-block; }
.status-pill.menunggu { background: #fffbeb; color: #f59e0b; }
.status-pill.dibayar { background: #f0fdf4; color: #22c55e; }
.status-pill.disetujui { background: white; color: #3b82f6; border: 1px solid #3b82f6; }
.status-pill.ditolak { background: #fef2f2; color: #ef4444; }

[f7da682 / User]


--- CONFLICT 6 ---
[HEAD / Jabbar]
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; }


[f7da682 / User]
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #fcfdfe; border-top: 1px solid #f1f5f9; flex-shrink: 0; }


--- CONFLICT 7 ---
[HEAD / Jabbar]
/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal { background: white; border-radius: 12px; width: 90%; max-width: 380px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); }
.filter-modal { max-width: 440px; }
.modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 12px 12px 0 0; }
.modal-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; margin: 0; }
.close-btn { color: #64748b; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
.close-btn:hover { color: #ef4444; }
.modal-body { padding: 1.25rem; }

[f7da682 / User]
/* Modal */
.modal-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
.close-btn { color: #94a3b8; background: none; border: none; cursor: pointer; margin-left: auto; }


--- CONFLICT 8 ---
[HEAD / Jabbar]
.modal-footer { padding: 0.875rem 1.25rem; display: flex; justify-content: flex-end; gap: 0.625rem; border-top: 1px solid #f1f5f9; background: #f8fafc; border-radius: 0 0 12px 12px; }
.footer-spaced { justify-content: space-between; }

[f7da682 / User]


--- CONFLICT 9 ---
[HEAD / Jabbar]
/* Filter Modal Inputs CSS */
.form-group { margin-bottom: 1.25rem; }
.form-label { display: block; font-size: 0.8125rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
.radio-group { display: flex; gap: 1.5rem; }
.radio-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: #1e293b; cursor: pointer; }
.radio-label input[type="radio"] { accent-color: #3b82f6; width: 16px; height: 16px; cursor: pointer; }
.form-input { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; color: #1e293b; outline: none; transition: border-color 0.2s; font-family: inherit; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-row { display: flex; gap: 1rem; }
.flex-1 { flex: 1; }
.btn-cancel { background: transparent; border: 1px solid transparent; color: #ef4444; font-weight: 600; font-size: 0.875rem; cursor: pointer; padding: 0.5rem 0; }
.btn-cancel:hover { color: #b91c1c; text-decoration: underline; }
.btn-primary-modal { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary-modal:hover { background: #2563eb; }

/* Custom Month Picker CSS */
.custom-month-picker { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; }
.year-selector { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; background: white; border-radius: 6px; padding: 0.25rem; border: 1px solid #e2e8f0; }
.year-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
.year-btn:hover { color: #3b82f6; }
.year-display { font-weight: 700; font-size: 0.875rem; color: #1e293b; }
.month-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.month-btn { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem 0; font-size: 0.75rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
.month-btn:hover { border-color: #3b82f6; color: #3b82f6; }
.month-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }

/* Other Modals */
.success-modal { text-align: center; max-width: 300px; }

[f7da682 / User]
.success-modal { text-align: center; max-width: 300px; border-radius: 16px; }



=== FILE: \views\finance\TambahDepositView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
.form-container { display: flex; justify-content: center; padding: 1rem 0; }
.form-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); width: 100%; overflow: hidden; }

[f7da682 / User]
.form-container { display: flex; justify-content: center; height: 100%; overflow: hidden; }
.form-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.03); width: 100%; max-width: none; margin: 0; display: flex; flex-direction: column; overflow: hidden; }



=== FILE: \views\staff\DashboardView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
import { 
  Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, 
  ChevronLeft, ChevronRight, Calendar, Check, X, Clock, 
  CheckCircle2, Zap, Bell, Download, Wallet, XCircle, FileText, Table
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import ApiService from '@/api/ApiService'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

[f7da682 / User]
import { Plus, Car, UtensilsCrossed, ParkingMeter, MoreHorizontal, ChevronLeft, ChevronRight, Calendar, Check, X, Clock, CheckCircle2, Zap, ChevronDown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { formatRupiah, mapStatusToFrontend } from '@/utils/format'
import ApiService from '@/api/ApiService'
import { useAuthStore } from '@/stores/auth'


--- CONFLICT 2 ---
[HEAD / Jabbar]
    const responseData = res.data?.data || [] 
    const metaData = res.data?.meta || {}

[f7da682 / User]
    
    const responseData = res.data?.data?.data || res.data?.data || [] 
    const metaData = res.data?.data?.meta || res.data?.meta || {}


--- CONFLICT 3 ---
[HEAD / Jabbar]
      <h2 class="judul-halaman">Beranda</h2>
      <div class="header-actions">
        
        <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
          <Plus :size="16" /> 
          <span class="text-tombol">Tambah Reimbursement</span> 
        </button>

        <div class="notif-wrapper">
          <button class="header-icon-btn" title="Notifikasi" @click="toggleNotifMenu">
            <Bell :size="20" />
            <span v-if="hasUnread" class="notification-dot"></span>
          </button>

          <div v-if="showNotifMenu" class="notif-menu">
            <div class="notif-header">
              <h4>Pemberitahuan</h4>
              <button class="btn-clear" @click="tandaiSemuaDibaca">Tandai dibaca</button>
            </div>
            
            <div class="notif-list">
              <div v-if="notifications.length === 0" class="notif-item justify-center text-gray-500 text-sm py-6" style="text-align: center;">
                Belum ada pemberitahuan baru
              </div>
              <div v-for="notif in notifications" :key="notif.id" class="notif-item">
                <div class="notif-icon-box" :class="getNotifIconBgClass(notif.type)">
                  <component :is="getNotifIcon(notif.type)" :size="18" />
                </div>
                <div class="notif-content">
                  <h5>{{ notif.title }}</h5>
                  <p>{{ notif.message }}</p>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
              </div>
            </div>

            <div class="notif-footer">
              <button @click="showNotifMenu = false">Tutup Notifikasi</button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="ringkasan-finansial">
      <div class="rf-card primary-card">
        <div class="rf-icon-wrapper"><Wallet :size="20" /></div>
        <p class="rf-label">Total Pengajuan Bulan Ini</p>
        <h3 class="rf-value">{{ ringkasanBulanIni.pengajuan }}</h3>
      </div>
      <div class="rf-card">
        <div class="rf-icon-wrapper success"><CheckCircle2 :size="20" /></div>
        <p class="rf-label">Disetujui / Dibayar</p>
        <h3 class="rf-value text-success">{{ ringkasanBulanIni.disetujui }}</h3>
      </div>
      <div class="rf-card">
        <div class="rf-icon-wrapper danger"><XCircle :size="20" /></div>
        <p class="rf-label">Total Ditolak</p>
        <h3 class="rf-value text-danger">{{ ringkasanBulanIni.ditolak }}</h3>
      </div>

[f7da682 / User]
      <div class="greetings">
        <h2 class="teks-sapaan">Halo, {{ authStore.user?.name || 'Staf' }}! 👋</h2>
        <p class="teks-sapaan-sub">Selamat datang di dashboard Reimburseku.</p>
      </div>
      <button class="btn btn-primary tombol-tambah" @click="router.push('/staf/reimbursement/tambah')">
        <Plus :size="16" /> Tambah Reimbursement
      </button>


--- CONFLICT 4 ---
[HEAD / Jabbar]
          
          <div class="kontrol-aksi-row">
            <button class="btn-tanggal-full" @click="bukaModalBulan">
              <span>{{ labelBulanTampil }}</span>
              <Calendar :size="18" class="ikon-kalender" />
            </button>
            
            <div class="dropdown-wrapper">
              <button class="btn-ekspor" @click="toggleExportMenu">
                <Download :size="18" class="ikon-ekspor" />
                <span>Ekspor</span>
              </button>

              <div v-if="showExportMenu" class="dropdown-menu">
                <button class="dropdown-item" @click="exportToPDF">
                  <FileText :size="16" class="text-danger" />
                  <span>Unduh PDF</span>
                </button>
                <button class="dropdown-item" @click="exportToExcel">
                  <Table :size="16" class="text-success" />
                  <span>Unduh Excel</span>
                </button>
              </div>
            </div>
          </div>

[f7da682 / User]


--- CONFLICT 5 ---
[HEAD / Jabbar]
        <h2 class="judul-seksi">Statistik Kategori</h2>
        <div class="grid-statistik">
          <div v-for="s in kategoriStats" :key="s.label" class="kartu-stat" :style="{ backgroundColor: s.bg }">
            <div class="stat-ikon">
              <component :is="s.ikon" :size="28" />
            </div>
            <div class="stat-info">
              <p class="stat-label">{{ s.label }}</p>
              <p class="stat-jumlah">{{ s.jumlah }}</p>
            </div>
          </div>
        </div>

        <div v-if="pengajuanTerakhir" class="tracker-section">
          <h2 class="judul-seksi judul-tracker">Pelacakan Pengajuan Terakhir</h2>
          <div class="tracker-card">
            <div class="tracker-header-info">
              <h4 class="tracker-judul-klaim">{{ pengajuanTerakhir.judul }}</h4>
              <p class="tracker-harga-klaim">{{ pengajuanTerakhir.jumlah }}</p>
            </div>

            <div class="timeline">
              <div 
                v-for="(step, idx) in timelineSteps" 
                :key="idx" 
                class="timeline-item"
                :class="{ 
                  'complete': step.isComplete, 
                  'current': step.isCurrent, 
                  'rejected': step.isRejected 
                }"
              >
                <div class="timeline-badge-wrap">
                  <div class="timeline-badge">
                    <Check v-if="step.isComplete && !step.isRejected" :size="12" />
                    <X v-else-if="step.isRejected" :size="12" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                </div>
                <div class="timeline-content">
                  <h5>{{ step.label }}</h5>
                  <p>{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        

[f7da682 / User]
        <div class="section-title-row title-with-filters">
          <h3 class="judul-seksi">Statistik dan Laporan</h3>
        </div>
     <div class="grid-statistik">
  <div v-for="s in kategoriStats" :key="s.label" class="kartu-stat" :style="{ background: s.bg }">
    <div class="stat-ikon">
      <component :is="s.ikon" :size="28" />
    </div>
    <div class="stat-info">
      <p class="stat-label">{{ s.label }}</p>
      <p class="stat-jumlah">{{ s.jumlah }}</p>
    </div>
  </div>
</div>


--- CONFLICT 6 ---
[HEAD / Jabbar]

[f7da682 / User]
/* Header Layout with Filters */
.title-with-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-with-filters .judul-seksi {
  margin-bottom: 0;
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.header-select {
  appearance: none;
  background-color: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 0.4rem 2rem 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.header-select:hover, .header-select:focus {
  border-color: var(--color-primary);
}

.select-icon {
  position: absolute;
  right: 0.5rem;
  pointer-events: none;
  color: #64748b;
}

.header-btn-tanggal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.header-btn-tanggal:hover {
  border-color: var(--color-primary);
}

.ikon-kalender {
  color: #64748b;
}

/* --- MODAL BULAN --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 340px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-judul {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  color: var(--color-text-main);
}

.modal-tahun-kontrol {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.btn-kontrol-tahun {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-kontrol-tahun:hover {
  color: var(--color-primary);
}

.label-tahun {
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--color-text-main);
}

.grid-bulan {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn-bulan-item {
  background: white;
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-main);
}

.btn-bulan-item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-bulan-item.aktif {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  font-weight: 600;
}

.modal-aksi {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-batal {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
}

.btn-terapkan {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--color-primary, #3b82f6);
  color: white;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}
.btn-terapkan:hover {
  opacity: 0.9;
}


--- CONFLICT 7 ---
[HEAD / Jabbar]
.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main, #1e293b);

[f7da682 / User]

.header-utama {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.greetings {
  display: flex;
  flex-direction: column;
}

.teks-sapaan {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.15rem 0;
}

.teks-sapaan-sub {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
}

.judul-halaman {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.judul-seksi {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-top: 0;


--- CONFLICT 8 ---
[HEAD / Jabbar]
}
.judul-tracker {
  margin-top: 1.75rem;
}
.tracker-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.tracker-header-info {

[f7da682 / User]
  gap: 0;
  min-height: 0;
  overflow: hidden;
}



/* Input bulan */
.pilih-bulan {
  margin-bottom: 0;
}

.filter-bulan-wrap {


--- CONFLICT 9 ---
[HEAD / Jabbar]
  text-overflow: ellipsis;
}
.tracker-harga-klaim {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Base Line Vertikal */
.timeline {

[f7da682 / User]
  box-shadow: var(--shadow-sm);
  position: relative;
  flex: 1;
  min-height: 0;


--- CONFLICT 10 ---
[HEAD / Jabbar]
.timeline-content h5 {

[f7da682 / User]

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0; /* Warna trek lingkaran abu-abu terang */
  border-top: 4px solid var(--color-primary, #3b82f6); /* Warna garis berputar */
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
  margin-bottom: 1rem;
}

.loading-teks {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

/* Animasi putaran 360 derajat */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* Cards layout */
.reimbursement-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  flex: 1;
  overflow-y: auto;
}

/* Custom Scrollbar */
.reimbursement-cards::-webkit-scrollbar {
  width: 6px;
}
.reimbursement-cards::-webkit-scrollbar-track {
  background: transparent;
}
.reimbursement-cards::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.reimbursement-cards::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
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
  cursor: pointer;
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


--- CONFLICT 11 ---
[HEAD / Jabbar]
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;

[f7da682 / User]
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

/* Paginasi */
.paginasi {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  margin-top: auto; 
  background: white;
}

.btn-paging {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);


--- CONFLICT 12 ---
[HEAD / Jabbar]
@media (max-width: 1200px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ringkasan-finansial, .grid-statistik, .grid-bulan {

[f7da682 / User]
.btn-paging:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.paging-aktif {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.kosong-teks {
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: auto;
}

/* ─── Kolom kanan: Statistik ─── */
.kolom-kanan {
  display: flex;
  flex-direction: column;
  padding-right: 0.75rem;
  padding-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.grid-statistik {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}



.kartu-stat {
  border-radius: 14px;
  padding: 1.25rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}

.kartu-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%);
  pointer-events: none;
}

.kartu-stat:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04), inset 0 2px 0 rgba(255,255,255,0.4);
}

.stat-ikon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  backdrop-filter: blur(4px);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 0.2rem;
}

.stat-jumlah {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Responsive */
@media (max-width: 1100px) {
  .grid-dasbor {
    grid-template-columns: 1fr;
  }
  .grid-statistik {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .grid-statistik {



=== FILE: \views\staff\ReimbursementAddView.vue ===

--- CONFLICT 1 ---
[HEAD / Jabbar]
  padding: 2rem;
  width: 100%;

[f7da682 / User]
  /* previously had padding and max-width, now handled by form-card */

