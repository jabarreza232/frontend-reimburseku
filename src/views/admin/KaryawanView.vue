<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const employees = ref([])
const rolesMap = { 1: 'Admin', 2: 'Finance', 3: 'Staff' }

onMounted(async () => {
  fetchEmployees()
})

async function fetchEmployees() {
  try {
    const res = await ApiService.getEmployees()
    const listData = res.data?.data?.data || res.data?.data || []
    
    employees.value = listData.map((emp, i) => ({
      id: emp.id_employees,
      account_id: emp.account_number || '-',
      name: emp.name || '-',
      email: emp.email || '-',
      gender: emp.gender || '-',
      dob: emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString('id-ID') : '-',
      address: emp.address || '-',
      position: emp.position || '-',
      role: rolesMap[emp.roles_id] || 'Staff'
    }))
  } catch (error) {
    console.error('Failed to load employees', error)
  }
}

const searchQuery = ref('')

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formData = ref({
  name: '', email: '', password: '', phone: '', address: '', position: '', roles_id: 3, account_payout_id: ''
})

function openAdd() {
  isEdit.value = false
  editId.value = null
  formData.value = { name: '', email: '', password: '', phone: '', address: '', position: '', roles_id: 3, account_payout_id: '' }
  showModal.value = true
}

function openEdit(emp) {
  isEdit.value = true
  editId.value = emp.id
  formData.value = { 
    name: emp.name, 
    email: emp.email, 
    password: '', 
    phone: emp.phone || '', 
    address: emp.address, 
    position: emp.position, 
    roles_id: Object.keys(rolesMap).find(key => rolesMap[key] === emp.role) || 3, 
    account_payout_id: emp.account_id !== '-' ? emp.account_id : ''
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
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan karyawan. Pastikan ID Rekening valid.' })
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
  return employees.value.filter(e => 
    e.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="karyawan-page">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Karyawan</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari karyawan..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Karyawan
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
              <th>EMAIL</th>
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
              <td class="font-semibold">{{ emp.name }}</td>
              <td class="text-muted">{{ emp.email }}</td>
              <td>{{ emp.gender }}</td>
              <td>{{ emp.dob }}</td>
              <td class="address-cell" :title="emp.address">{{ emp.address }}</td>
              <td>{{ emp.position }}</td>
              <td>
                <span class="role-badge" :class="emp.role.toLowerCase()">{{ emp.role }}</span>
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

    <!-- Modal Tambah Karyawan -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel modal-wide">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui data karyawan' : 'Isi data karyawan yang ingin ditambahkan' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;">
          <div class="form-group">
            <label>Nama Lengkap <span class="required">*</span></label>
            <input v-model="formData.name" type="text" class="form-control" placeholder="Nama lengkap karyawan" />
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input v-model="formData.email" type="email" class="form-control" placeholder="email@perusahaan.com" />
          </div>
          <div class="form-group">
            <label>Password <span class="required">*</span></label>
            <input v-model="formData.password" type="password" class="form-control" placeholder="Minimal 8 karakter" />
          </div>
          <div class="form-group">
            <label>Nomor HP</label>
            <input v-model="formData.phone" type="text" class="form-control" placeholder="08xxxxxxxxxx" />
          </div>
          <div class="form-group">
            <label>Jabatan</label>
            <input v-model="formData.position" type="text" class="form-control" placeholder="Contoh: Staff Marketing" />
          </div>
          <div class="form-group">
            <label>Hak Akses (Role) <span class="required">*</span></label>
            <select v-model="formData.roles_id" class="form-control">
              <option :value="1">Admin</option>
              <option :value="2">Finance</option>
              <option :value="3">Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label>ID Rekening</label>
            <input v-model="formData.account_payout_id" type="number" class="form-control" placeholder="ID tabel account_payout" />
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
.karyawan-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.address-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }
.role-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
.role-badge.staff { background: #f1f5f9; color: #475569; }
.role-badge.finance { background: #eff6ff; color: #2563eb; }
.role-badge.admin { background: #fef3c7; color: #92400e; }
</style>
