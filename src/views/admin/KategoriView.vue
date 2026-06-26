<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, PencilLine, Trash2, Search, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import ApiService from '@/api/ApiService'
import Swal from 'sweetalert2'

const categories = ref([])

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

onMounted(fetchCategories)

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
  return categories.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="kategori-page">
    

    <div class="card main-card">
      <div class="card-header">
        <h2 class="card-header-title">Kategori</h2>
        <div class="header-actions">
          <div class="search-box">
            <Search :size="14" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Cari kategori..." class="search-input" />
          </div>
          <div class="sort-dropdown">
            <button class="btn btn-outline btn-sort">
              Urutkan <ChevronDown :size="12" />
            </button>
          </div>
          <button class="btn btn-primary btn-add" @click="openAdd">
            <Plus :size="14" /> Tambah Kategori
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="30%">NAMA</th>
              <th>DESKRIPSI</th>
              <th width="120" class="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in filteredCategories" :key="cat.id">
              <td class="font-semibold text-primary-dark">{{ cat.name }}</td>
              <td class="text-muted">{{ cat.description }}</td>
              <td class="text-center">
                <div class="action-btns">
                  <button class="btn-icon edit" @click="openEdit(cat)"><PencilLine :size="12" /></button>
                  <button class="btn-icon delete" @click="deleteCategory(cat.id)"><Trash2 :size="12" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p class="text-muted text-xs">Menampilkan {{ filteredCategories.length }} data</p>
        <div class="pagination" v-if="Math.ceil(filteredCategories.length / 10) > 1">
          <button class="page-btn"><ChevronLeft :size="12" /></button>
          <button class="page-btn active">1</button>
          <button class="page-btn" v-for="p in Math.ceil(filteredCategories.length / 10) - 1" :key="p">{{ p + 1 }}</button>
          <button class="page-btn"><ChevronRight :size="12" /></button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeAdd">
      <div class="modal-panel">
        <div class="modal-panel-header">
          <div class="modal-header-icon">
            <component :is="isEdit ? PencilLine : Plus" :size="18" />
          </div>
          <div>
            <h3>{{ isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
            <p class="modal-header-sub">{{ isEdit ? 'Perbarui informasi kategori' : 'Tambahkan kategori pengeluaran baru' }}</p>
          </div>
        </div>
        <div class="modal-panel-body" style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 0.875rem;">
          <div class="form-group">
            <label>Nama Kategori <span class="required">*</span></label>
            <input v-model="formData.category_name" type="text" class="form-control" placeholder="Contoh: Transport" />
            <p class="form-hint">Nama singkat jenis pengeluaran</p>
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea v-model="formData.description" class="form-control" rows="1" placeholder="Mencakup pengeluaran apa saja..."></textarea>
            <p class="form-hint">Penjelasan opsional</p>
          </div>
        </div>
        <div class="modal-panel-footer">
          <button class="btn btn-outline" @click="closeAdd">Batal</button>
          <button class="btn btn-primary btn-save" @click="submitAdd" :disabled="!formData.category_name.trim()">
            <component :is="isEdit ? PencilLine : Plus" :size="14" />
            {{ isEdit ? 'Simpan' : 'Tambah Kategori' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kategori-page { display: flex; flex-direction: column; gap: 1rem; flex: 1; height: 100%; overflow: hidden; }
.text-muted { font-size: 0.7rem; }
.form-hint { margin: 0.375rem 0 0; font-size: 0.6875rem; color: #94a3b8; line-height: 1.4; }
</style>
