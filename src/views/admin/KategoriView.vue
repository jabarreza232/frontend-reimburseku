<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight, Check, Download, FileText, FileSpreadsheet } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

// Import jsPDF dan autoTable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const categories = ref([])

// === STATE UNTUK CUSTOM SORT & EXPORT ===
const showSortMenu = ref(false)
const showExportMenu = ref(false)
const sortOption = ref('terbaru')

const sortOptions = [
  { label: 'Terbaru', value: 'terbaru' },
  { label: 'Terlama', value: 'terlama' },
  { label: 'Nama (A - Z)', value: 'nama_asc' },
  { label: 'Nama (Z - A)', value: 'nama_desc' },
]

const handleClickOutside = (event) => {
  if (!event.target.closest('.sort-dropdown')) showSortMenu.value = false
  if (!event.target.closest('.export-dropdown')) showExportMenu.value = false
}

const fetchCategories = async () => {
  try {
    const res = await ApiService.getCategories()
    const listData = res.data?.data?.data || res.data?.data || []
    
    categories.value = listData.map(c => ({
      id: c.id_category,
      name: c.category_name || '-',
      description: c.description || '-'
    }))
  } catch (err) {
    console.error('Failed to load categories', err)
  }
}

onMounted(() => {
  fetchCategories()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// === FUNGSI EXPORT ===

// 1. Export ke Excel (CSV)
const exportToExcel = () => {
  showExportMenu.value = false
  const headers = ['NO', 'NAMA KATEGORI', 'DESKRIPSI']
  const rows = filteredCategories.value.map((cat, index) => [
    index + 1,
    `"${cat.name}"`,
    `"${cat.description.replace(/"/g, '""')}"`
  ])
  const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Data_Kategori.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 2. Export langsung ke PDF (Tanpa Print)
const exportToPDF = () => {
  showExportMenu.value = false // Tutup menu dropdown
  
  // Buat instance dokumen PDF baru
  const doc = new jsPDF()

  // Tambahkan Judul ke dalam PDF
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Data Kategori', 14, 20) // (Teks, X, Y)

  // Siapkan data Header dan Rows untuk tabel
  const tableColumn = ["NO", "NAMA KATEGORI", "DESKRIPSI"]
  const tableRows = []

  filteredCategories.value.forEach((cat, index) => {
    const catData = [
      index + 1,
      cat.name,
      cat.description
    ]
    tableRows.push(catData)
  })

  // Generate tabel dengan autoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28, // Mulai tabel di bawah judul
    theme: 'grid', // Tema tabel bersisi
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Warna biru primary
      textColor: 255,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // Lebar kolom NO
      1: { cellWidth: 50 } // Lebar kolom Nama Kategori
    }
  })

  // Unduh otomatis file PDF-nya
  doc.save('Data_Kategori.pdf')
}

// ==========================================
// API & LOGIC MODAL
// ==========================================

const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({ category_name: '', description: '' })

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { category_name: '', description: '' }
  showModal.value = true
}

function openEdit(cat) {
  isEdit.value = true
  editId.value = cat.id
  formData.value = { category_name: cat.name, description: cat.description }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  try {
    if (isEdit.value) {
      await ApiService.updateCategory(editId.value, formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveCategory(formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    fetchCategories()
    closeAdd()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan kategori' })
    console.error(err)
  }
}

const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Kategori?',
    text: "Yakin ingin menghapus kategori ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })
  
  if (result.isConfirmed) {
    try {
      await ApiService.deleteCategory(id)
      fetchCategories()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Kategori berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus kategori' })
      console.error(err)
    }
  }
}

const filteredCategories = computed(() => {
  let result = categories.value.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (sortOption.value === 'terbaru') result.sort((a, b) => b.id - a.id)
  else if (sortOption.value === 'terlama') result.sort((a, b) => a.id - b.id)
  else if (sortOption.value === 'nama_asc') result.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortOption.value === 'nama_desc') result.sort((a, b) => b.name.localeCompare(a.name))

  return result
})
</script>

<template>
  <div class="kategori-page">
    <div class="card main-card printable-card">
      
      <div class="card-header">
        <!-- Judul ini akan tercetak di PDF saat Ctrl+P dipanggil -->
        <h2 class="card-header-title print-title">Data Kategori</h2>
        
        <div class="header-actions no-print">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari kategori..." class="search-input" />
          </div>
          
          <!-- CUSTOM SORT DROPDOWN -->
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort" @click="showSortMenu = !showSortMenu">
              Urutkan <ChevronDown :size="12" />
            </button>
            <transition name="fade-down">
              <div v-if="showSortMenu" class="custom-dropdown-menu">
                <div 
                  v-for="option in sortOptions" 
                  :key="option.value" 
                  class="dropdown-item"
                  :class="{ active: sortOption === option.value }"
                  @click="sortOption = option.value; showSortMenu = false"
                >
                  <span>{{ option.label }}</span>
                  <Check v-if="sortOption === option.value" :size="14" class="text-primary" />
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
            <Plus :size="14" /> Tambah Kategori
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table printable-table">
          <thead>
            <tr>
              <th width="5%" class="text-center">NO</th>
              <th width="30%">NAMA KATEGORI</th>
              <th>DESKRIPSI</th>
              <th width="120" class="text-center no-print">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, index) in filteredCategories" :key="cat.id">
              <td class="text-center text-muted">{{ index + 1 }}</td>
              <td class="font-semibold text-primary-dark">{{ cat.name }}</td>
              <td class="text-muted">{{ cat.description }}</td>
              <td class="text-center no-print">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(cat)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteCategory(cat.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="4" class="text-center text-muted py-4">Tidak ada data kategori.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer pagination -->
      <div class="table-footer no-print">
        <p class="text-muted text-xs">Menampilkan {{ filteredCategories.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredCategories.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredCategories.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Dilengkapi kembali) -->
    <div v-if="showModal" class="modal-overlay no-print" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon"><component :is="isEdit ? PencilLine : Plus" :size="18" /></div>
          <div>
            <h3>{{ isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui data kategori' : 'Isi form di bawah untuk menambah kategori' }}</p>
          </div>
        </div>
        
        <div class="modal-panel-body">
          <div class="form-group">
            <label>Nama Kategori <span class="required">*</span></label>
            <input v-model="formData.category_name" type="text" class="form-control" placeholder="Contoh: Transportasi" />
          </div>
          <div class="form-group mt-3">
            <label>Deskripsi</label>
            <textarea v-model="formData.description" class="form-control" rows="3" placeholder="Penjelasan singkat mengenai kategori ini..."></textarea>
          </div>
        </div>

        <div class="modal-panel-footer">
          <button class="btn btn-outline btn-cancel" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Kategori' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES */
.kategori-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

/* KARTU UTAMA */
.card { background: white; border-radius: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.main-card { flex: 1; }

.card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; gap: 1rem; flex-wrap: wrap;}
.card-header-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0;}

/* ACTION HEADER */
.header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.search-box { position: relative; min-width: 220px;}
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.8125rem; outline: none; transition: border-color 0.2s;}
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
.modern-table td { padding: 1rem 1.25rem; font-size: 0.875rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tbody tr:hover { background: #f8fafc; }

.text-muted { color: #64748b; font-size: 0.8125rem;}
.font-semibold { font-weight: 600; color: #1e293b; }
.text-center { text-align: center !important; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem;}

/* AKSI TABEL */
.action-btns { display: flex; align-items: center; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #eff6ff; color: #3b82f6; }
.btn-icon.edit:hover { background: #dbeafe; }
.btn-icon.delete { background: #fef2f2; color: #ef4444; }
.btn-icon.delete:hover { background: #fee2e2; }

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
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.75rem; font-weight: 700; color: #475569; }
.required { color: #ef4444; }
.form-control { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; font-family: inherit; box-sizing: border-box;}
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
textarea.form-control { resize: vertical; }
.mt-3 { margin-top: 1rem;}

.modal-panel-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc; border-radius: 0 0 12px 12px;}

/* CUSTOM DROPDOWN STYLE */
.sort-dropdown, .export-dropdown { position: relative; }
.btn-export { display: flex; align-items: center; gap: 0.35rem; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute; top: calc(100% + 0.5rem); right: 0; background-color: #ffffff;
  border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 160px; z-index: 50; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;
}
.export-menu { min-width: 200px; }
.dropdown-item {
  display: flex; align-items: center; justify-content: flex-start; gap: 0.5rem; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; color: #4b5563; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
}
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
  .kategori-page {
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
    gap: 0.5rem;
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

/* =========================================
   STYLE KHUSUS SAAT PRINT (PDF BROWSER)
   ========================================= */
@media print {
  body * { visibility: hidden; }
  .printable-card, .printable-card * { visibility: visible; }
  .printable-card {
    position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0;
    border: none !important; box-shadow: none !important; background: transparent !important;
  }
  .no-print, .action-btns, .table-footer, .header-actions { display: none !important; }
  .print-title { font-size: 18pt !important; font-weight: bold; text-align: center; margin-bottom: 20px !important; display: block; width: 100%; color: #000 !important; }
  table.modern-table { border-collapse: collapse !important; width: 100% !important; margin-top: 10px; }
  table.modern-table th, table.modern-table td { border: 1px solid #000 !important; padding: 10px !important; font-size: 11pt !important; color: #000 !important; }
  table.modern-table th {
    background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; color-adjust: exact;
    text-transform: uppercase; font-weight: bold;
  }
}
</style>