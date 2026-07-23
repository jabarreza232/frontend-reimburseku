<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight, Check, Download, FileText, FileSpreadsheet } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

// Import jsPDF dan autoTable
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const employees = ref([])
const availableAccounts = ref([])
const availableRoles = ref([])

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

// Menutup dropdown jika klik di luar area
const handleClickOutside = (event) => {
  if (!event.target.closest('.sort-dropdown')) {
    showSortMenu.value = false
  }
  if (!event.target.closest('.export-dropdown')) {
    showExportMenu.value = false
  }
}

onMounted(async () => {
  await fetchRoles()
  await fetchAccounts()
  await fetchEmployees()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// === FUNGSI EXPORT ===

// 1. Export ke Excel (CSV)
const exportToExcel = () => {
  showExportMenu.value = false
  
  const headers = ['NO', 'NO REKENING', 'NAMA', 'EMAIL', 'NO HP', 'JENIS KELAMIN', 'TANGGAL LAHIR', 'ALAMAT', 'JABATAN', 'HAK AKSES']
  
  const rows = filteredEmployees.value.map((emp, index) => [
    index + 1,
    `"${emp.account_id}"`,
    `"${emp.name}"`,
    `"${emp.email}"`,
    `"${emp.phone}"`,
    `"${emp.gender}"`,
    `"${emp.dob}"`,
    `"${emp.address.replace(/"/g, '""')}"`,
    `"${emp.position}"`,
    `"${emp.role}"`
  ])

  const csvContent = headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'Data_Karyawan.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 2. Export ke PDF (Menggunakan jsPDF)
const exportToPDF = () => {
  showExportMenu.value = false
  
  // Menggunakan orientasi Landscape ('l') karena kolom karyawan cukup banyak
  const doc = new jsPDF('l', 'mm', 'a4')

  // Tambahkan Judul PDF
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Data Karyawan', 14, 20)

  // Siapkan kolom header (tanpa kolom AKSI)
  const tableColumn = ["NO", "REKENING / ID", "NAMA", "EMAIL & HP", "L/P", "TGL LAHIR", "ALAMAT", "JABATAN", "ROLE"]
  const tableRows = []

  filteredEmployees.value.forEach((emp, index) => {
    const empData = [
      index + 1,
      emp.account_id,
      emp.name,
      `${emp.email}\n${emp.phone}`, // Gabungkan Email & HP agar menghemat kolom
      emp.gender,
      emp.dob,
      emp.address,
      emp.position,
      emp.role
    ]
    tableRows.push(empData)
  })

  // Render tabel
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28, // Jarak dari atas
    theme: 'grid', // Tema bergaris
    styles: {
      fontSize: 8, // Ukuran font lebih kecil agar muat
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Warna biru untuk header
      textColor: 255,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, // Kolom NO
      1: { cellWidth: 28 }, // Rekening
      2: { cellWidth: 35 }, // Nama
      3: { cellWidth: 40 }, // Email & HP
      4: { cellWidth: 20 }, // L/P
      5: { cellWidth: 25 }, // TGL Lahir
      6: { cellWidth: 'auto' }, // Alamat (sisanya)
      7: { cellWidth: 30 }, // Jabatan
      8: { cellWidth: 25 }  // Role
    }
  })

  // Unduh otomatis file PDF
  doc.save('Data_Karyawan.pdf')
}

// ==========================================
// API & LOGIC UTAMA
// ==========================================

async function fetchRoles() {
  try {
    const res = await ApiService.getRoles() 
    availableRoles.value = res.data?.data || [] 
  } catch (error) {
    console.error('Failed to load roles', error)
  }
}

async function fetchAccounts() {
  try {
    const res = await ApiService.getAccountPayouts() 
    availableAccounts.value = res.data?.data || [] 
  } catch (error) {
    console.error('Failed to load accounts', error)
  }
}

function handleAccountSelection(event) {
  const selectedId = parseInt(event.target.value)
  const selectedAcc = availableAccounts.value.find(acc => acc.id_account_payout === selectedId)
  
  if (selectedAcc) {
    formData.value.account_number = selectedAcc.account_number
    formData.value.account_holder_name = selectedAcc.account_holder_name
    formData.value.provider_id = selectedAcc.provider_id
  }
}

async function fetchEmployees() {
  try {
    const res = await ApiService.getEmployees()
    const listData = res.data?.data || []

    employees.value = listData.map((emp) => {
      let genderFormatted = '-'
      if (emp.gender === 'L') genderFormatted = 'Laki-laki'
      else if (emp.gender === 'P') genderFormatted = 'Perempuan'

      let dobFormatted = '-'
      if (emp.birth_date) {
        dobFormatted = new Date(emp.birth_date).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      }

      return {
        id: emp.id_employees,
        account_id: emp.account_payout?.account_number || '-',
        account_payout_id: emp.account_payout?.id_account_payout || '',
        name: emp.name || '-',
        email: emp.email || '-',
        phone: emp.phone || '-',
        address: emp.address || '-',
        position: emp.position || '-',
        gender: genderFormatted,
        dob: dobFormatted,
        raw_gender: emp.gender || 'L', 
        raw_birth_date: emp.birth_date || '',
        role: emp.role?.role_name || 'Staff',
        role_id: emp.role?.id_role || '',
        raw_account_number: emp.account_payout?.account_number || '',
        raw_account_holder_name: emp.account_payout?.account_holder_name || '',
        raw_provider_id: emp.account_payout?.provider_id || ''
      }
    })
  } catch (error) {
    console.error('Failed to load employees', error)
  }
}

const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const formData = ref({
  name: '', email: '', password: '', phone: '', address: '', position: '', gender: 'L', birth_date: '', role_id: '', account_payout_id: '',
  account_number: '', account_holder_name: '', provider_id: ''
})

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { 
    name: '', email: '', password: '', phone: '', address: '', position: '', gender: 'L', birth_date: '', role_id: '', account_payout_id: '',
    account_number: '', account_holder_name: '', provider_id: ''
  }
  showModal.value = true
}

function openEdit(emp) {
  isEdit.value = true
  editId.value = emp.id
  formData.value = { 
    name: emp.name, 
    email: emp.email, 
    password: '', 
    phone: emp.phone !== '-' ? emp.phone : '', 
    address: emp.address !== '-' ? emp.address : '', 
    position: emp.position !== '-' ? emp.position : '', 
    gender: emp.raw_gender, 
    birth_date: emp.raw_birth_date, 
    role_id: emp.role_id, 
    account_payout_id: emp.account_payout_id,
    account_number: emp.raw_account_number, 
    account_holder_name: emp.raw_account_holder_name, 
    provider_id: emp.raw_provider_id
  }
  showModal.value = true
}

function closeAdd() {
  showModal.value = false
}

async function submitAdd() {
  try {
    if (isEdit.value) {
      await ApiService.updateEmployee(editId.value, formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karyawan diupdate.', showConfirmButton: false, timer: 1500 })
    } else {
      await ApiService.saveEmployee(formData.value)
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karyawan ditambahkan.', showConfirmButton: false, timer: 1500 })
    }
    fetchEmployees()
    closeAdd()
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan karyawan. Pastikan input valid.' })
    console.error(err)
  }
}

async function deleteEmp(id) {
  const result = await Swal.fire({
    title: 'Hapus Karyawan?',
    text: "Yakin ingin menghapus karyawan ini?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await ApiService.deleteEmployee(id)
      fetchEmployees()
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Karyawan berhasil dihapus.', showConfirmButton: false, timer: 1500 })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus karyawan' })
      console.error(err)
    }
  }
}

const filteredEmployees = computed(() => {
  let result = employees.value.filter(e => 
    e.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (sortOption.value === 'terbaru') result.sort((a, b) => b.id - a.id) 
  else if (sortOption.value === 'terlama') result.sort((a, b) => a.id - b.id)
  else if (sortOption.value === 'nama_asc') result.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortOption.value === 'nama_desc') result.sort((a, b) => b.name.localeCompare(a.name))

  return result
})
</script>

<template>
  <div class="karyawan-page">
    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Data Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari karyawan..." class="search-input" />
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
            <Plus :size="14" /> Tambah
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>NO</th>
              <th>NO REKENING / ID</th>
              <th>NAMA</th>
              <th>EMAIL / NO HP</th>
              <th>JENIS KELAMIN</th>
              <th>TANGGAL LAHIR</th>
              <th>ALAMAT</th>
              <th>JABATAN</th>
              <th>HAK AKSES</th>
              <th class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, i) in filteredEmployees" :key="emp.id">
              <td>{{ i + 1 }}</td>
              <td class="text-muted font-mono">{{ emp.account_id }}</td>
              <td>
                <div class="font-semibold">{{ emp.name }}</div>
              </td>
              <td>
                <div class="text-sm">{{ emp.email }}</div>
                <div class="text-xs text-muted">{{ emp.phone }}</div>
              </td>
              <td>{{ emp.gender }}</td>
              <td>{{ emp.dob }}</td>
              <td class="address-cell" :title="emp.address">{{ emp.address }}</td>
              <td>{{ emp.position }}</td>
              <td>
                <span class="role-badge" :class="emp.role.toLowerCase().replace(' ', '-')">{{ emp.role }}</span>
              </td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(emp)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteEmp(emp.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredEmployees.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredEmployees.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredEmployees.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Karyawan -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel modal-wide">
        <div class="modal-panel-header">
          <div class="modal-header-icon"><component :is="isEdit ? PencilLine : Plus" :size="18" /></div>
          <div>
            <h3>{{ isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui data karyawan' : 'Isi data karyawan yang ingin ditambahkan' }}</p>
          </div>
        </div>
        
        <div class="modal-panel-body modal-grid">
          <div class="form-group">
            <label>Nama Lengkap <span class="required">*</span></label>
            <input v-model="formData.name" type="text" class="form-control" placeholder="Nama lengkap karyawan" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input v-model="formData.email" type="email" class="form-control" placeholder="email@perusahaan.com" />
          </div>
          <div class="form-group">
            <label>Password <span class="required" v-if="!isEdit">*</span></label>
            <input v-model="formData.password" type="password" class="form-control" placeholder="Minimal 8 karakter" />
          </div>
          <div class="form-group">
            <label>Nomor HP</label>
            <input v-model="formData.phone" type="text" class="form-control" placeholder="08xxxxxxxxxx" />
          </div>
          <div class="form-group">
            <label>Jenis Kelamin</label>
            <select v-model="formData.gender" class="form-control">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tanggal Lahir</label>
            <input v-model="formData.birth_date" type="date" class="form-control" />
          </div>
          <div class="form-group">
            <label>Jabatan</label>
            <input v-model="formData.position" type="text" class="form-control" placeholder="Contoh: Staff Marketing" />
          </div>
          <div class="form-group">
            <label>Hak Akses (Role) <span class="required">*</span></label>
            <select v-model="formData.role_id" class="form-control">
              <option value="" disabled>-- Pilih Hak Akses --</option>
              <option v-for="role in availableRoles" :key="role.id_role" :value="role.id_role">{{ role.role_name }}</option>
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>Rekening Payout</label>
            <select v-model="formData.account_payout_id" class="form-control" @change="handleAccountSelection">
              <option value="" disabled>-- Pilih Rekening Pembayaran --</option>
              <option v-for="acc in availableAccounts" :key="acc.id_account_payout" :value="acc.id_account_payout">
                {{ acc.account_holder_name }} - {{ acc.provider?.provider_name }} ({{ acc.account_number }})
              </option>
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>Alamat Domisili</label>
            <textarea v-model="formData.address" class="form-control" rows="2" placeholder="Alamat lengkap karyawan"></textarea>
          </div>
        </div>

        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BASE STYLES */
.karyawan-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }

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

.btn { padding: 0.5rem 0.875rem; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; transition: all 0.2s; border: 1px solid transparent; }
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

.text-muted { color: #64748b; }
.font-mono { font-family: monospace; font-size: 0.8125rem;}
.font-semibold { font-weight: 600; color: #1e293b; }
.text-sm { font-size: 0.8125rem; }
.text-xs { font-size: 0.7rem; }
.text-center { text-align: center !important; }
.address-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.75rem; }

.role-badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; white-space: nowrap;}
.role-badge.staff { background: #f1f5f9; color: #475569; }
.role-badge.finance-staff { background: #eff6ff; color: #2563eb; } 
.role-badge.admin { background: #fef3c7; color: #92400e; }

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
.modal-panel { background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-wide { max-width: 650px; }

.modal-panel-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 1rem; background: #f8fafc; }
.modal-header-icon { width: 40px; height: 40px; border-radius: 10px; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
.modal-panel-header h3 { margin: 0; font-size: 1.125rem; font-weight: 700; color: #1e293b; }
.modal-header-sub { margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #64748b; }

.modal-panel-body { padding: 1.5rem; overflow-y: auto; }
.modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.col-span-2 { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.75rem; font-weight: 700; color: #475569; }
.required { color: #ef4444; }
.form-control { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
textarea.form-control { resize: vertical; }

.modal-panel-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc; }

/* CUSTOM DROPDOWN STYLE */
.sort-dropdown, .export-dropdown { position: relative; }
.btn-export { display: flex; align-items: center; gap: 0.35rem; }
.text-danger { color: #ef4444; }
.text-success { color: #10b981; }

.custom-dropdown-menu {
  position: absolute; top: calc(100% + 0.5rem); right: 0; background-color: #ffffff;
  border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 180px; z-index: 50; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;
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
  /* Hapus limit height di page agar bisa di scroll native */
  .karyawan-page {
    height: auto;
    overflow: visible;
    padding-bottom: 2rem;
  }

  .main-card {
    min-height: 400px;
  }

  /* Header Stacking */
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
    justify-content: center; /* Tombol teks ke tengah */
  }

  /* Dropdown agar lebar penuh di HP */
  .custom-dropdown-menu {
    width: 100%;
    min-width: 100%;
  }

  /* Modals */
  .modal-panel {
    max-height: 95vh;
  }
  
  .modal-grid {
    grid-template-columns: 1fr; /* Jadi 1 kolom */
    gap: 1rem;
  }

  .col-span-2 {
    grid-column: span 1;
  }

  .modal-panel-footer {
    flex-direction: column-reverse; /* Batal dibawah, Simpan di atas */
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem;
  }

  /* Table Footer (Pagination) */
  .table-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1rem;
  }
}
</style>