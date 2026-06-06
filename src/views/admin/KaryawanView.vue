<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'

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
      role: rolesMap[emp.role_id] || 'Staff'
    }))
  } catch (error) {
    console.error('Failed to load employees', error)
  }
}

const searchQuery = ref('')

function openAdd() {
  // TODO: Implementasi modal tambah karyawan
}

async function deleteEmp(id) {
  if (confirm('Yakin ingin menghapus karyawan ini?')) {
    try {
      await ApiService.deleteEmployee(id)
      fetchEmployees()
    } catch (err) {
      console.error(err)
      alert('Gagal menghapus karyawan')
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
    <div class="page-header">
      <h1 class="page-title">Karyawan</h1>
    </div>

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
                  <button class="btn-icon edit"><Pencil :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteEmp(emp.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="pagination">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.karyawan-page { display: flex; flex-direction: column; gap: 1rem; background-color: #f8fafc; height: 100%; overflow: hidden; }

.page-header { margin-bottom: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.main-card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; }
.card-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; }
.card-header-title { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

.header-actions { display: flex; gap: 0.625rem; align-items: center; }
.search-box { position: relative; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { padding: 0.4rem 0.75rem 0.4rem 2.125rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.75rem; outline: none; width: 200px; }
.btn-sort { display: flex; align-items: center; gap: 0.375rem; padding: 0.4rem 0.875rem; font-size: 0.75rem; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; }
.btn-add { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; padding: 0.4rem 0.875rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

/* Table */
.table-responsive { overflow-x: auto; max-height: calc(100vh - 220px); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; padding: 0.75rem 1.25rem; font-size: 0.6rem; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.modern-table td { padding: 0.75rem 1.25rem; font-size: 0.75rem; color: #475569; border-bottom: 1px solid #f8fafc; vertical-align: middle; }

.font-mono { font-family: monospace; font-size: 0.7rem; }
.address-cell { max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem; }

.role-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.65rem; font-weight: 700; }
.role-badge.staff { background: #f1f5f9; color: #475569; }
.role-badge.finance { background: #eff6ff; color: #2563eb; }

.action-btns { display: flex; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s; }
.btn-icon.edit { background: #f59e0b; color: white; }
.btn-icon.delete { background: #ef4444; color: white; }

/* Footer / Pagination */
.table-footer { padding: 0.75rem 1.25rem; display: flex; justify-content: center; background: #f8fafc; }
.pagination { display: flex; gap: 0.25rem; }
.page-btn { width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; color: #64748b; cursor: pointer; }
.page-btn.active { background: #3b82f6; border-color: #3b82f6; color: white; }
</style>
