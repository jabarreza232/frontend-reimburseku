<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight, X, Check, Download, FileText, FileSpreadsheet } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

// Import jsPDF dan autoTable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const roles = ref([])

// === STATE UNTUK CUSTOM SORT & EXPORT ===
const showSortMenu = ref(false)
const showExportMenu = ref(false)
const currentSort = ref('name-asc') // Default urutan A-Z

const sortOptions = [
  { label: 'Nama Hak (A - Z)', value: 'name-asc' },
  { label: 'Nama Hak (Z - A)', value: 'name-desc' },
  { label: 'Slug (A - Z)', value: 'slug-asc' },
  { label: 'Slug (Z - A)', value: 'slug-desc' },
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

const fetchRoles = async () => {
  try {
    const res = await ApiService.getRoles()
    const listData = res.data?.data?.data || res.data?.data || []
    
    roles.value = listData.map(r => {
      const slug = (r.role_name || '').toLowerCase().replace(/ /g, '-')
      // Pastikan parse JSON permissions dari database
      const perms = typeof r.permissions === 'string' ? JSON.parse(r.permissions) : (r.permissions || null)
      
      let parsed = initPermissions()
      if (perms && typeof perms === 'object') {
        Object.keys(perms).forEach(mk => {
          if (parsed[mk]) {
            const pv = perms[mk]
            if (typeof pv === 'object') {
              Object.keys(pv).forEach(pk => { if (parsed[mk][pk] !== undefined) parsed[mk][pk] = !!pv[pk] })
            } else if (Array.isArray(pv)) {
              pv.forEach(pk => { if (parsed[mk][pk] !== undefined) parsed[mk][pk] = true })
            }
          }
        })
      }
      return { id: r.id_role, name: r.role_name || '-', description: r.description || '-', slug, permissions: parsed }
    })
  } catch (err) {
    console.error('Failed to load roles', err)
  }
}

onMounted(() => {
  fetchRoles()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// === FUNGSI EXPORT ===

const exportToExcel = () => {
  showExportMenu.value = false
  
  const headers = ['NO', 'NAMA HAK', 'SLUG', 'DESKRIPSI']
  
  const rows = filteredRoles.value.map((r, index) => [
    index + 1,
    `"${r.name}"`,
    `"${r.slug}"`,
    `"${r.description.replace(/"/g, '""')}"`
  ])

  const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Data_Hak_Akses.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportToPDF = () => {
  showExportMenu.value = false
  
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Data Hak Akses', 14, 20)

  const tableColumn = ["NO", "NAMA HAK", "SLUG", "DESKRIPSI"]
  const tableRows = []

  filteredRoles.value.forEach((r, index) => {
    tableRows.push([
      index + 1,
      r.name,
      r.slug,
      r.description
    ])
  })

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
      2: { cellWidth: 40 },
      3: { cellWidth: 'auto' }
    }
  })

  doc.save('Data_Hak_Akses.pdf')
}

// ==========================================
// API & LOGIC MODAL
// ==========================================

const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({ role_name: '', description: '', permissions: {} })

const permissionModules = [
  { key: 'dashboard', label: 'Dashboard', perms: ['Lihat'] },
  { key: 'reimbursement', label: 'Reimbursement', perms: ['Lihat', 'Buat', 'Setujui', 'Tolak'] },
  { key: 'deposit', label: 'Deposit', perms: ['Lihat', 'Buat', 'Setujui'] },
  { key: 'karyawan', label: 'Karyawan', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'kategori', label: 'Kategori', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'hak_akses', label: 'Hak Akses', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'metode_bayar', label: 'Metode Bayar', perms: ['Lihat', 'Tambah', 'Edit', 'Hapus'] },
  { key: 'profil', label: 'Profil', perms: ['Lihat', 'Edit'] }
]

function initPermissions() {
  const perms = {}
  permissionModules.forEach(m => {
    perms[m.key] = {}
    m.perms.forEach(p => { perms[m.key][p] = false })
  })
  return perms
}

// Fungsi memunculkan Toast "Dalam Pengembangan"
function showDevelopmentToast() {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: 'Fitur Tambah Akses sedang dalam tahap pengembangan',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })
}

// OpenAdd tidak digunakan di button, tapi biarkan fungsinya jika nanti dibutuhkan
function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { role_name: '', description: '', permissions: initPermissions() }
  showModal.value = true
}

function openEdit(r) {
  isEdit.value = true
  editId.value = r.id
  // Parse permissions agar terpisah dari reference aslinya
  formData.value = { 
    role_name: r.name, 
    description: r.description, 
    permissions: r.permissions ? JSON.parse(JSON.stringify(r.permissions)) : initPermissions() 
  }
  showModal.value = true
}

function togglePerm(moduleKey, perm) {
  if (isEdit.value) return // Cegah jika tembus event
  formData.value.permissions[moduleKey][perm] = !formData.value.permissions[moduleKey][perm]
}

function toggleAllModule(moduleKey, perms) {
  if (isEdit.value) return // Cegah jika tembus event
  const allChecked = perms.every(p => formData.value.permissions[moduleKey][p])
  perms.forEach(p => { formData.value.permissions[moduleKey][p] = !allChecked })
}

function closeAdd() {
  showModal.value = false
}

// === FUNGSI SUBMIT (API SAVE & UPDATE) ===
async function submitAdd() {
  try {
    const payload = {
      role_name: formData.value.role_name,
      description: formData.value.description,
      permissions: formData.value.permissions
    }

    if (isEdit.value) {
      await ApiService.updateRole(editId.value, payload)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Hak Akses berhasil diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveRole(payload)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Hak Akses berhasil ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    
    fetchRoles()
    closeAdd()
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Gagal menyimpan Hak Akses'
    Swal.fire({ icon: 'error', title: 'Gagal', text: errorMsg })
    console.error('Error Submit Role:', err)
  }
}

const deleteRole = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus Hak Akses?',
    text: "Yakin ingin menghapus hak akses ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.deleteRole(id)
      fetchRoles()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Hak akses berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus hak akses' })
      console.error(err)
    }
  }
}

const filteredRoles = computed(() => {
  let result = roles.value.filter(r => 
    r.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (currentSort.value === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  } else if (currentSort.value === 'name-desc') {
    result.sort((a, b) => b.name.localeCompare(a.name))
  } else if (currentSort.value === 'slug-asc') {
    result.sort((a, b) => a.slug.localeCompare(b.slug))
  } else if (currentSort.value === 'slug-desc') {
    result.sort((a, b) => b.slug.localeCompare(a.slug))
  }

  return result
})
</script>

<template>
  <div class="hak-akses-page">
    
    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Hak Akses</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari hak akses..." class="search-input" />
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

          <!-- TOMBOL TAMBAH HAK AKSES (Disabled Visual + Memanggil Toast) -->
          <button class="btn btn-primary btn-add" @click="showDevelopmentToast" style="opacity: 0.6; cursor: not-allowed;">
            <Plus :size="14" /> Tamb Hak Akses
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="20%">NAMA HAK</th>
              <th width="20%">SLUG</th>
              <th>DESKRIPSI</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in filteredRoles" :key="role.id">
              <td class="font-semibold text-primary-dark">{{ role.name }}</td>
              <td class="text-muted font-mono">{{ role.slug }}</td>
              <td class="text-muted">{{ role.description }}</td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(role)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteRole(role.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredRoles.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredRoles.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredRoles.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Hak Akses -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel modal-wide">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Hak Akses' : 'Tambah Hak Akses Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi dan hak akses role' : 'Tentukan nama role dan hak akses yang diperlukan' }}</p>
          </div>
        </div>
        <div class="modal-panel-body">
          <div class="form-grid" style="margin-bottom: 1.5rem;">
            <div class="form-group">
              <label>Nama Hak Akses <span class="required">*</span></label>
              <input v-model="formData.role_name" type="text" class="form-control" placeholder="Contoh: Admin / Finance / Staff" />
            </div>
            <div class="form-group">
              <label>Deskripsi</label>
              <input v-model="formData.description" type="text" class="form-control" placeholder="Singkatnya tentang role ini" />
            </div>
          </div>

          <!-- Access Permissions Section -->
          <div class="perm-section">
            <div class="perm-section-header">
              <div class="perm-section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <span class="perm-section-title">Hak Akses</span>
                <span class="perm-section-sub">Pilih modul dan izin yang dapat diakses role ini</span>
              </div>
            </div>

            <div class="perm-grid">
              <div v-for="mod in permissionModules" :key="mod.key" class="perm-card">
                <div class="perm-card-header">
                  <!-- Checkbox Modul Utama dengan atribut :disabled="isEdit" -->
                  <label class="perm-check perm-check-all" :class="{ 'disabled-check': isEdit }">
                    <input 
                      type="checkbox" 
                      :checked="mod.perms.every(p => formData.permissions[mod.key]?.[p])" 
                      @change="toggleAllModule(mod.key, mod.perms)" 
                      :disabled="isEdit"
                    />
                    <span class="perm-module-name">{{ mod.label }}</span>
                  </label>
                </div>
                <div class="perm-card-body">
                  <!-- Checkbox Sub Modul dengan atribut :disabled="isEdit" -->
                  <label v-for="perm in mod.perms" :key="perm" class="perm-check" :class="{ 'disabled-check': isEdit }">
                    <input 
                      type="checkbox" 
                      :checked="formData.permissions[mod.key]?.[perm]" 
                      @change="togglePerm(mod.key, perm)" 
                      :disabled="isEdit"
                    />
                    <span>{{ perm }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd" :disabled="!formData.role_name.trim()">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Hak Akses' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CUSTOM DROPDOWN STYLE */
.sort-dropdown, .export-dropdown { position: relative; }
.btn-export { display: flex; align-items: center; gap: 0.35rem; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute; top: calc(100% + 0.5rem); right: 0; background-color: #ffffff;
  border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px; z-index: 50; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;
}
.export-menu { min-width: 200px; }
.dropdown-item {
  display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem;
  font-size: 0.875rem; color: #4b5563; cursor: pointer; border-radius: 6px; transition: all 0.2s ease;
}
.export-menu .dropdown-item { justify-content: flex-start; gap: 0.5rem; }
.dropdown-item:hover { background-color: #f3f4f6; color: #111827; }
.dropdown-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 500; }
.text-primary { color: #2563eb; }

/* Transisi Halus untuk Dropdown */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* CSS Bawaan */
.hak-akses-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
textarea.form-control { resize: vertical; min-height: 80px; }
.perm-section { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.perm-section-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.perm-section-icon { width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.perm-section-title { font-size: 0.8125rem; font-weight: 700; color: #1e293b; display: block; }
.perm-section-sub { font-size: 0.6875rem; color: #94a3b8; display: block; margin-top: 0.0625rem; }
.perm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0; }
.perm-card { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; }
.perm-card:nth-child(odd) { border-right: 1px solid #f1f5f9; }
.perm-card:nth-last-child(-n+2) { border-bottom: none; }
.perm-card-header { margin-bottom: 0.5rem; }
.perm-card-body { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; }
.perm-check { display: inline-flex; align-items: center; gap: 0.375rem; cursor: pointer; font-size: 0.75rem; color: #475569; user-select: none; }

/* Menangani styling jika checkbox disabled */
.perm-check input[type="checkbox"] { width: 14px; height: 14px; accent-color: #3b82f6; cursor: pointer; border-radius: 3px; }
.perm-check input[type="checkbox"]:disabled { cursor: not-allowed; opacity: 0.6; }
.disabled-check { cursor: not-allowed !important; opacity: 0.7; }

.perm-check-all { font-weight: 600; color: #1e293b; }
.perm-module-name { font-size: 0.8125rem; }
</style>