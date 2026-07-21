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
    theme: 'grid', // Tema tabel bersisi (bisa juga 'striped' atau 'plain')
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Warna biru primary (sesuai tema UI Anda)
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
// API & LOGIC MODAL (Sesuai Asli)
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
      
      <!-- HAPUS 'no-print' DARI SINI -->
      <div class="card-header">
        <!-- Judul ini akan tercetak di PDF -->
        <h2 class="card-header-title print-title">Data Kategori</h2>
        
        <!-- TAMBAHKAN 'no-print' DI SINI (Agar form search & tombol export/add hilang saat print) -->
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
          <div class="export-dropdown" style="position: relative;">
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
              <!-- Kolom aksi disembunyikan saat print -->
              <td class="text-center no-print">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(cat)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteCategory(cat.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer pagination disembunyikan saat print -->
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

    <!-- Modal juga sudah ada class no-print -->
    <div v-if="showModal" class="modal-overlay no-print" @click.self="closeAdd">
       <!-- Konten modal tetap sama... -->
    </div>
  </div>
</template>
<style scoped>
.kategori-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.text-muted { font-size: 0.7rem; }
.form-hint { margin: 0.375rem 0 0; font-size: 0.6875rem; color: #94a3b8; line-height: 1.4; }

/* CUSTOM DROPDOWN STYLE */
.sort-dropdown, .export-dropdown { position: relative; }

.btn-export { display: flex; align-items: center; gap: 0.35rem; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 160px;
  z-index: 50;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.export-menu {
  min-width: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.dropdown-item:hover { background-color: #f3f4f6; color: #111827; }
.dropdown-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 500; }
.text-primary { color: #2563eb; }

/* TRANSISI DROPDOWN */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* STYLE KHUSUS SAAT PRINT (PDF) */
/* STYLE KHUSUS SAAT PRINT (PDF) */
@media print {
  /* 1. Sembunyikan semua elemen bawaan layout (Sidebar, Navbar, dll) */
  body * {
    visibility: hidden;
  }
  
  /* 2. Tampilkan HANYA elemen di dalam .printable-card */
  .printable-card, .printable-card * {
    visibility: visible;
  }
  
  /* 3. Posisikan Card utama ke paling atas halaman */
  .printable-card {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  
  /* 4. Sembunyikan semua elemen pencarian, tombol, aksi, dan pagination */
  .no-print, .action-btns, .table-footer, .header-actions {
    display: none !important;
  }
  
  /* 5. Styling untuk Judul Laporan (Title) */
  .print-title {
    font-size: 18pt !important;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px !important;
    display: block;
    width: 100%;
    color: #000 !important;
  }
  
  /* 6. Styling untuk Tabel PDF agar terlihat rapi dan formal */
  table.modern-table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin-top: 10px;
  }
  
  table.modern-table th, 
  table.modern-table td {
    border: 1px solid #000 !important; /* Border hitam tegas */
    padding: 10px !important;
    font-size: 11pt !important;
    color: #000 !important;
  }
  
  table.modern-table th {
    background-color: #f3f4f6 !important; 
    -webkit-print-color-adjust: exact; /* Paksa warna background tercetak di browser berbasis webkit */
    color-adjust: exact;
    text-transform: uppercase;
    font-weight: bold;
  }
}
</style>