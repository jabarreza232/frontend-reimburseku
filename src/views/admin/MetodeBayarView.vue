<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, PencilLine, Check, Download, FileText, FileSpreadsheet } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

// Import jsPDF dan autoTable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const isSaving = ref(false)
const methods = ref([])
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  provider_type: '',
  provider_name: '',
  code_provider: ''
})

// === STATE UNTUK CUSTOM SORT & EXPORT ===
const showSortMenu = ref(false)
const showExportMenu = ref(false)
const currentSort = ref('name-asc') // Default urutan A-Z

const sortOptions = [
  { label: 'Nama (A - Z)', value: 'name-asc' },
  { label: 'Nama (Z - A)', value: 'name-desc' },
  { label: 'Status (Aktif di atas)', value: 'status-active' },
  { label: 'Status (Non-Aktif di atas)', value: 'status-inactive' },
]

// Fungsi tutup dropdown kalau klik di luar
const handleClickOutside = (event) => {
  if (!event.target.closest('.sort-dropdown')) {
    showSortMenu.value = false
  }
  if (!event.target.closest('.export-dropdown')) {
    showExportMenu.value = false
  }
}

const fetchProviders = async () => {
  try {
    const res = await ApiService.getProviders()
    const listData = res.data?.data?.data || res.data?.data || []

    methods.value = listData.map(m => ({
      id: m.id_provider,
      type: m.provider_name.toLowerCase().includes('bank') ? 'BANK TRANSFER' : 'E-WALLET',
      name: m.provider_name || '-',
      code: m.code_provider || '-',
      is_active: Boolean(m.is_active)
    }))
  } catch (err) {
    console.error('Failed to load providers', err)
  }
}

onMounted(() => {
  fetchProviders()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// === FUNGSI EXPORT ===

// 1. Export ke Excel (CSV)
const exportToExcel = () => {
  showExportMenu.value = false
  
  // Header kolom
  const headers = ['NO', 'BANK / E-WALLET', 'NAMA LAYANAN', 'KODE LAYANAN', 'STATUS']
  
  // Mapping data baris
  const rows = filteredMethods.value.map((m, index) => [
    index + 1,
    `"${m.type}"`,
    `"${m.name}"`,
    `"${m.code}"`,
    `"${m.is_active ? 'Aktif' : 'Tidak Aktif'}"`
  ])

  // Gabungkan jadi string CSV
  const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  
  // Download file
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Data_Metode_Bayar.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 2. Export ke PDF (jsPDF)
const exportToPDF = () => {
  showExportMenu.value = false
  
  const doc = new jsPDF()

  // Tambahkan Judul
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Data Metode Bayar', 14, 20)

  const tableColumn = ["NO", "BANK / E-WALLET", "NAMA LAYANAN", "KODE LAYANAN", "STATUS"]
  const tableRows = []

  filteredMethods.value.forEach((m, index) => {
    tableRows.push([
      index + 1,
      m.type,
      m.name,
      m.code,
      m.is_active ? 'Aktif' : 'Tidak Aktif'
    ])
  })

  // Generate tabel dengan autoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 60 },
      3: { cellWidth: 35 },
      4: { halign: 'center', cellWidth: 30 }
    }
  })

  // Unduh otomatis file PDF-nya
  doc.save('Data_Metode_Bayar.pdf')
}

// ==========================================
// API & LOGIC UTAMA
// ==========================================

const searchQuery = ref('')

function openAdd() {
  isEdit.value = false
  formData.value = { id: null, provider_type: '', provider_name: '', code_provider: '' }
  showModal.value = true
}

function openEdit(m) {
  isEdit.value = true
  formData.value = {
    id: m.id,
    provider_type: m.type === 'BANK TRANSFER' ? 'bank-transfer' : 'e-wallet',
    provider_name: m.name,
    code_provider: m.code
  }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  if (!formData.value.provider_type || !formData.value.provider_name || !formData.value.code_provider) {
    Swal.fire({
      icon: 'warning',
      title: 'Perhatian',
      text: 'Harap isi semua field yang wajib (*)'
    })
    return
  }

  isSaving.value = true
  try {
    const payload = {
      provider_name: formData.value.provider_name,
      provider_type: formData.value.provider_type,
      code_provider: formData.value.code_provider
    }

    if (isEdit.value && formData.value.id) {
      await ApiService.updateProviderDetail(formData.value.id, payload)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Metode bayar berhasil diperbarui', timer: 1500, showConfirmButton: false })
    } else {
      await ApiService.saveProvider(payload)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Metode bayar baru berhasil ditambahkan', timer: 1500, showConfirmButton: false })
    }

    closeAdd()
    fetchProviders()
  } catch (err) {
    console.error('Gagal menyimpan provider:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
    })
  } finally {
    isSaving.value = false
  }
}

async function toggleStatus(id) {
  const m = methods.value.find(x => x.id === id)
  if (m) {
    try {
      const newStatus = !m.is_active
      await ApiService.updateProvider(id, {
        provider_name: m.name,
        provider_code: m.code_provider,
        is_active: newStatus ? 1 : 0
      })
      m.is_active = newStatus
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status metode bayar berhasil diperbarui',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (err) {
      alert('Gagal mengubah status')
    }
  }
}

const filteredMethods = computed(() => {
  let result = methods.value.filter(m => 
    m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (currentSort.value === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (currentSort.value === 'name-desc') {
    result.sort((a, b) => b.name.localeCompare(a.name))
  } else if (currentSort.value === 'status-active') {
    result.sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1))
  } else if (currentSort.value === 'status-inactive') {
    result.sort((a, b) => (a.is_active === b.is_active ? 0 : a.is_active ? 1 : -1))
  }

  return result
})
</script>

<template>
  <div class="metode-bayar-page">
    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Daftar Metode Bayar</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari metode bayar..." class="search-input" />
          </div>
          
          <!-- CUSTOM SORT DROPDOWN -->
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort" @click="showSortMenu = !showSortMenu">
              Urutkan
              <ChevronDown :size="12" />
            </button>

            <!-- Menu Dropdown -->
            <transition name="fade-down">
              <div v-if="showSortMenu" class="custom-dropdown-menu">
                <div 
                  v-for="option in sortOptions" 
                  :key="option.value" 
                  class="dropdown-item"
                  :class="{ active: currentSort === option.value }"
                  @click="currentSort = option.value; showSortMenu = false"
                >
                  <span>{{ option.label }}</span>
                  <Check v-if="currentSort === option.value" :size="14" class="text-primary" />
                </div>
              </div>
            </transition>
          </div>

          <!-- EXPORT DROPDOWN -->
          <div class="export-dropdown">
            <button class="btn btn-outline btn-export" @click="showExportMenu = !showExportMenu">
              <Download :size="14" /> Export <ChevronDown :size="12" />
            </button>
            <transition name="fade-down">
              <div v-if="showExportMenu" class="custom-dropdown-menu export-menu">
                <div class="dropdown-item" @click="exportToPDF">
                  <FileText :size="14" class="text-danger" /> <span>Export to PDF</span>
                </div>
                <div class="dropdown-item" @click="exportToExcel">
                  <FileSpreadsheet :size="14" class="text-success" /> <span>Export to Excel (CSV)</span>
                </div>
              </div>
            </transition>
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
              <th class="text-center">STATUS</th>
              <th width="140" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredMethods" :key="m.id">
              <td class="text-muted font-bold">{{ m.type }}</td>
              <td class="font-semibold">{{ m.name }}</td>
              <td class="text-muted font-mono">{{ m.code }}</td>
              
              <td class="text-center">
                <span class="status-badge" :class="m.is_active ? 'active' : 'inactive'">
                  {{ m.is_active ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              
              <td class="text-center">
                <div class="action-btns">
                  <button 
                    class="btn btn-xs" 
                    :class="m.is_active ? 'btn-danger-outline' : 'btn-success'"
                    @click="toggleStatus(m.id)" 
                  >
                    {{ m.is_active ? 'Non-Aktifkan' : 'Aktivasi' }}
                  </button>
                  <button class="btn btn-xs btn-primary-outline" @click="openEdit(m)">Edit</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredMethods.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Tidak ada metode bayar ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredMethods.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredMethods.length / 10) > 1">
          <button class="page-btn">
            <ChevronLeft :size="12" />
          </button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredMethods.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn">
            <ChevronRight :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Metode Bayar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Metode Bayar' : 'Tambah Metode Bayar Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi metode pembayaran' : 'Tambahkan metode pembayaran baru' }}</p>
          </div>
        </div>
        
        <div class="modal-panel-body modal-grid">
          <div class="form-group">
            <label>Tipe Layanan <span class="required">*</span></label>
            <select v-model="formData.provider_type" class="form-control" :disabled="isSaving">
              <option value="">Pilih tipe layanan</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="e-wallet">E-Wallet</option>
            </select>
          </div>
          <div class="form-group">
            <label>Kode Layanan <span class="required">*</span></label>
            <input v-model="formData.code_provider" type="text" class="form-control"
              placeholder="Contoh: BCA / GOPAY" />
          </div>
          <div class="form-group col-span-2">
            <label>Nama Layanan Lengkap <span class="required">*</span></label>
            <input v-model="formData.provider_name" type="text" class="form-control"
              placeholder="Contoh: Bank Central Asia / GoPay Indonesia" />
          </div>
        </div>
        
        <div class="modal-panel-footer">
          <button class="btn btn-outline btn-cancel" @click="closeAdd" :disabled="isSaving">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd" :disabled="isSaving">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isSaving ? 'Memproses...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Metode Bayar') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES */
.metode-bayar-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

/* KARTU UTAMA */
.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.main-card { flex: 1; }

.card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; gap: 1rem; flex-wrap: wrap;}
.card-header-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0;}

/* ACTION HEADER */
.header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.search-box { position: relative; min-width: 220px;}
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.8125rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;}
.search-input:focus { border-color: #3b82f6; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

.btn { padding: 0.5rem 0.875rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; transition: all 0.2s; border: 1px solid transparent; font-family: inherit;}
.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-outline { background: white; border-color: #cbd5e1; color: #475569; }
.btn-outline:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }

/* TABLE */
.table-responsive { overflow-y: auto; overflow-x: auto; flex: 1; -webkit-overflow-scrolling: touch;}
.modern-table { width: 100%; border-collapse: collapse; text-align: left; }
.modern-table th { padding: 0.875rem 1.25rem; background: #f8fafc; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.modern-table td { padding: 1rem 1.25rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap;}
.modern-table tbody tr:hover { background: #f8fafc; }

.text-muted { color: #64748b; }
.text-xs { font-size: 0.7rem; }
.font-semibold { font-weight: 600; color: #1e293b; }
.font-bold { font-weight: 700; }
.font-mono { font-family: monospace; font-size: 0.8125rem;}
.text-center { text-align: center !important; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem;}

.status-badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; white-space: nowrap;}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }

/* AKSI TABEL (Buttons inside table) */
.action-btns { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap;}
.btn-xs { padding: 0.35rem 0.75rem; font-size: 0.7rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: all 0.2s; white-space: nowrap;}
.btn-success { background: #22c55e; color: white; border: 1px solid #22c55e; }
.btn-success:hover { background: #16a34a; }
.btn-danger-outline { background: white; color: #ef4444; border: 1px solid #fecaca; }
.btn-danger-outline:hover { background: #fef2f2; }
.btn-primary-outline { background: white; color: #3b82f6; border: 1px solid #bfdbfe; }
.btn-primary-outline:hover { background: #eff6ff; border-color: #93c5fd; }

/* PAGINASI & FOOTER */
.table-footer { padding: 1rem 1.25rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fff; }
.pagination { display: flex; gap: 0.25rem; align-items: center; }
.page-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s;}
.page-btn.active { background: #3b82f6; color: white; border-color: #3b82f6; }
.page-btn:hover:not(.active) { background: #f8fafc; color: #0f172a;}

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(2px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-panel { background: white; border-radius: 12px; width: 100%; max-width: 500px; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-panel-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1rem; background: #f8fafc; border-radius: 12px 12px 0 0;}
.modal-header-icon { width: 40px; height: 40px; border-radius: 10px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
.modal-panel-header h3 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #1e293b; }
.modal-header-sub { margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #64748b; }

.modal-panel-body { padding: 1.5rem; overflow-y: auto; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.col-span-2 { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.75rem; font-weight: 700; color: #475569; }
.required { color: #ef4444; }
.form-control { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; font-family: inherit; box-sizing: border-box;}
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.modal-panel-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc; border-radius: 0 0 12px 12px;}

/* CUSTOM DROPDOWN STYLE */
.sort-dropdown, .export-dropdown { position: relative; }
.btn-export { display: flex; align-items: center; gap: 0.35rem; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute; top: calc(100% + 0.5rem); right: 0; background-color: #ffffff;
  border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 220px; z-index: 50; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;
}
.export-menu { min-width: 200px; }
.dropdown-item {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; color: #4b5563; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
}
.export-menu .dropdown-item { justify-content: flex-start; }
.dropdown-item:hover { background-color: #f3f4f6; color: #111827; }
.dropdown-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 500; }
.text-primary { color: #2563eb; }

/* TRANSISI DROPDOWN */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }


/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */

@media (max-width: 768px) {
  /* Hapus limit height agar native body scroll bisa berfungsi di mobile */
  .metode-bayar-page {
    height: auto;
    overflow: visible;
    padding-bottom: 2rem;
  }

  .main-card {
    min-height: 400px;
  }

  /* Header Stacking: Semua tombol, search, dropdow, memanjang ke bawah */
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.625rem;
  }

  .search-box, .sort-dropdown, .export-dropdown, .btn-sort, .btn-export, .btn-add {
    width: 100%;
    justify-content: center; /* Label ke tengah pada mobile */
  }

  /* Dropdown agar mengambil lebar penuh saat diklik di HP */
  .custom-dropdown-menu {
    width: 100%;
    min-width: 100%;
  }

  /* Modal Form */
  .modal-panel {
    max-height: 95vh;
  }

  /* Ubah Form di dalam Modal menjadi 1 kolom (atas-bawah) */
  .modal-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .col-span-2 {
    grid-column: span 1;
  }

  /* Modal Footer: Batal diletakkan di bawah Simpan */
  .modal-panel-footer {
    flex-direction: column-reverse;
  }
  
  .btn-cancel, .btn-save {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }

  /* Table Footer (Pagination) jadi di tengah / tumpuk vertikal */
  .table-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
}
</style>