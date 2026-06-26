<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Printer, 
  Wifi, 
  Bluetooth, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UploadCloud,
  File as FileIcon,
  Image as ImageIcon,
  Trash2
} from 'lucide-vue-next'

// State UI & Konfigurasi Koneksi
const connectionType = ref('wifi') 
const isConnected = ref(false)
const paperSize = ref('58mm')
const btDeviceName = ref('Belum ada perangkat')

// State untuk File PDF / Gambar
const uploadedFileUrl = ref(null)
const uploadedFileName = ref('')
const uploadedFileType = ref(null) // 'pdf' atau 'image'
const fileInputRef = ref(null)

// --- FITUR DETEKSI JARINGAN REAL-TIME ---
const updateNetworkStatus = () => {
  if (connectionType.value === 'wifi') {
    isConnected.value = navigator.onLine
  }
}

// Pasang event listener saat komponen dimuat
onMounted(() => {
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
})

// Bersihkan event listener saat komponen dihancurkan
onUnmounted(() => {
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
})
// ----------------------------------------

// Fungsi Hubungkan Perangkat
const toggleConnection = async () => {
  if (isConnected.value) {
    isConnected.value = false
    if (connectionType.value === 'bluetooth') {
      btDeviceName.value = 'Belum ada perangkat'
    }
    return
  }

  if (connectionType.value === 'bluetooth') {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      })
      btDeviceName.value = device.name || 'Printer Bluetooth (Tidak bernama)'
      isConnected.value = true
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      alert('Koneksi Bluetooth dibatalkan atau tidak didukung di browser ini.')
    }
  } else {
    // Mode WiFi (Jaringan)
    if (navigator.onLine) {
      isConnected.value = true
    } else {
      alert('Jaringan terputus. Pastikan WiFi Anda menyala dan terhubung ke jaringan.')
    }
  }
}

// Fungsi Menangani Upload File PDF & Gambar
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const isPdf = file.type === 'application/pdf'
  const isImage = file.type.startsWith('image/')

  if (!isPdf && !isImage) {
    alert('Harap unggah dokumen dengan format PDF atau Gambar (JPG/PNG).')
    event.target.value = ''
    return
  }

  uploadedFileType.value = isPdf ? 'pdf' : 'image'
  uploadedFileName.value = file.name
  uploadedFileUrl.value = URL.createObjectURL(file)
}

const triggerFileInput = () => {
  fileInputRef.value.click()
}

const removeFile = () => {
  if (uploadedFileUrl.value) {
    URL.revokeObjectURL(uploadedFileUrl.value) 
  }
  uploadedFileUrl.value = null
  uploadedFileName.value = ''
  uploadedFileType.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// Fungsi Cetak (Menangani PDF dan Gambar)
const printDocument = () => {
  if (!isConnected.value) {
    alert('Harap hubungkan printer terlebih dahulu!')
    return
  }
  if (!uploadedFileUrl.value) {
    alert('Silakan unggah file PDF atau Gambar yang ingin dicetak.')
    return
  }

  const printFrame = document.createElement('iframe')
  printFrame.style.display = 'none'
  document.body.appendChild(printFrame)

  if (uploadedFileType.value === 'pdf') {
    printFrame.src = uploadedFileUrl.value
    printFrame.onload = () => {
      try {
        printFrame.contentWindow.focus()
        printFrame.contentWindow.print()
      } catch (e) {
        console.error("Gagal mencetak dokumen", e)
        alert("Browser memblokir aksi cetak. Pastikan dokumen PDF valid.")
      }
      setTimeout(() => document.body.removeChild(printFrame), 2000)
    }
  } else if (uploadedFileType.value === 'image') {
    const doc = printFrame.contentWindow.document
    doc.open()
    doc.write(`
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              padding: 0; 
              display: flex; 
              justify-content: center; 
              align-items: flex-start;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${uploadedFileUrl.value}" onload="window.print();" />
        </body>
      </html>
    `)
    doc.close()
    
    setTimeout(() => document.body.removeChild(printFrame), 2000)
  }
}
</script>
<template>
  <div class="print-page">


    <div class="content-grid">
      <div class="config-column">
        
        <div class="card">
          <div class="card-header">
            <Settings2 :size="20" class="text-blue" />
            <h2>Koneksi Printer</h2>
          </div>
          
          <div class="connection-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: connectionType === 'wifi' }"
              @click="connectionType = 'wifi'; isConnected = false"
            >
              <Wifi :size="18" />
              <span>Jaringan WiFi</span>
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: connectionType === 'bluetooth' }"
              @click="connectionType = 'bluetooth'; isConnected = false"
            >
              <Bluetooth :size="18" />
              <span>Bluetooth API</span>
            </button>
          </div>

          <div class="status-box" :class="isConnected ? 'status-connected' : 'status-disconnected'">
            <div class="status-info">
              <component :is="isConnected ? CheckCircle2 : AlertCircle" :size="24" />
              <div>
                <h4>{{ isConnected ? 'Printer Siap Digunakan' : 'Printer Terputus' }}</h4>
                <p v-if="connectionType === 'wifi'">Status: {{ isConnected ? 'Online (Akses OS)' : 'Offline' }}</p>
                <p v-else>Perangkat: {{ isConnected ? btDeviceName : 'Belum dipasangkan' }}</p>
              </div>
            </div>
            <button class="btn-outline-small" @click="toggleConnection">
              {{ isConnected ? 'Putuskan' : 'Hubungkan' }}
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <FileText :size="20" class="text-blue" />
            <h2>Pengaturan Kertas</h2>
          </div>
          <div class="form-group">
            <label>Pilih ukuran kertas yang sesuai pada printer thermal Anda</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" value="58mm" v-model="paperSize">
                <span class="radio-custom">58 mm</span>
              </label>
              <label class="radio-label">
                <input type="radio" value="80mm" v-model="paperSize">
                <span class="radio-custom">80 mm</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      <div class="preview-column">
        <div class="card preview-card">
          <div class="card-header border-bottom">
            <h2>Pratinjau Dokumen</h2>
            <span v-if="uploadedFileUrl" class="badge status-success">Siap Cetak</span>
            <span v-else class="badge">Belum Ada File</span>
          </div>

          <div class="pdf-container">
            
            <div v-if="!uploadedFileUrl" class="upload-zone" @click="triggerFileInput">
              <input 
                type="file" 
                ref="fileInputRef" 
                class="hidden-input" 
                accept="application/pdf, image/png, image/jpeg, image/jpg, image/webp"
                @change="handleFileUpload"
              />
              <div class="upload-content">
                <div class="icon-circle">
                  <UploadCloud :size="32" class="text-blue" />
                </div>
                <h3>Unggah File</h3>
                <p>Klik area ini atau seret file PDF / Gambar struk Anda kemari</p>
                <span class="upload-hint">Format didukung: PDF, JPG, PNG (Maks: 5MB)</span>
              </div>
            </div>

            <div v-else class="pdf-preview-wrapper" :class="paperSize">
              <div class="pdf-preview-header">
                <div class="file-info">
                  <component :is="uploadedFileType === 'pdf' ? FileIcon : ImageIcon" :size="16" class="text-blue" />
                  <span class="filename">{{ uploadedFileName }}</span>
                </div>
                <button class="btn-icon-danger" @click="removeFile" title="Hapus File">
                  <Trash2 :size="16" />
                </button>
              </div>
              
              <div class="viewer-area">
                <embed v-if="uploadedFileType === 'pdf'" :src="uploadedFileUrl" type="application/pdf" class="document-viewer" />
                <div v-else-if="uploadedFileType === 'image'" class="image-viewer-container">
                  <img :src="uploadedFileUrl" alt="Pratinjau Struk" class="image-viewer" />
                </div>
              </div>
            </div>

          </div>

          <div class="action-buttons">
            <button 
              class="btn-primary w-full" 
              @click="printDocument"
              :disabled="!isConnected || !uploadedFileUrl"
            >
              <Printer :size="20" />
              <span>Kirim ke Printer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Typography & Layout Dasar */
.print-page { display: flex; flex-direction: column; gap: 2rem; color: #1e293b; }
.page-subtitle { color: #64748b; font-size: 0.95rem; }
.text-blue { color: #3b82f6; }

/* Grid System */
.content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; align-items: stretch; }

/* Cards */
.card { padding: 1.5rem; display: flex; flex-direction: column; }
.config-column { display: flex; flex-direction: column; gap: 1.5rem; height: 100%; }
.config-column .card:last-child { flex: 1; display: flex; flex-direction: column; }
.config-column .card:last-child .form-group { flex: 1; display: flex; flex-direction: column; }
.config-column .card:last-child .radio-group { flex: 1; }
.card-header { display: flex; align-items: center; justify-content: flex-start; gap: 0.75rem; margin-bottom: 1.5rem; }
.card-header h2 { font-size: 1.125rem; font-weight: 600; margin: 0; }
.border-bottom { border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; justify-content: space-between !important; }

/* Badges */
.status-success { background: #dcfce7; color: #166534; }

/* Tabs Koneksi */
.connection-tabs { display: flex; background: #f1f5f9; border-radius: 8px; padding: 0.25rem; margin-bottom: 1.5rem; }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; border: none; background: transparent; border-radius: 6px; font-weight: 600; font-size: 0.875rem; color: #64748b; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background: white; color: #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* Status Box */
.status-box { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-radius: 8px; border: 1px solid transparent; }
.status-info { display: flex; align-items: center; gap: 0.75rem; }
.status-info h4 { font-size: 0.875rem; font-weight: 600; margin: 0; }
.status-info p { font-size: 0.75rem; margin: 0; margin-top: 0.125rem; opacity: 0.8; }
.status-connected { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.status-disconnected { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

/* Form Settings */
.form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.75rem; }
.radio-group { display: flex; gap: 1rem; }
.radio-label { cursor: pointer; flex: 1; }
.radio-label input { display: none; }
.radio-custom { display: block; text-align: center; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
.radio-label input:checked + .radio-custom { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }

/* Area Container */
.preview-column { display: flex; flex-direction: column; height: 100%; }
.preview-card { display: flex; flex-direction: column; flex: 1; min-height: 550px; padding: 1.5rem; }
.pdf-container { flex: 1; display: flex; flex-direction: column; margin-bottom: 1.5rem; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; overflow: hidden; }

/* Upload Zone */
.hidden-input { display: none; }
.upload-zone { flex: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; min-height: 350px; }
.upload-zone:hover { background: #f1f5f9; border-color: #94a3b8; }
.upload-content { text-align: center; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
.icon-circle { width: 64px; height: 64px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
.upload-content h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem; }
.upload-content p { color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem; }
.upload-hint { font-size: 0.75rem; color: #94a3b8; }

/* Preview Area */
.pdf-preview-wrapper { flex: 1; display: flex; flex-direction: column; height: 100%; width: 100%; margin: 0 auto; background: #e2e8f0; transition: width 0.3s; }
.pdf-preview-wrapper[class~='58mm'] { max-width: 380px; }
.pdf-preview-wrapper[class~='80mm'] { max-width: 480px; }
.pdf-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: white; border-bottom: 1px solid #e2e8f0; }
.file-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #334155; }
.filename { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Viewers */
.viewer-area { flex: 1; display: flex; overflow: auto; background: #f1f5f9; }
.document-viewer { flex: 1; width: 100%; min-height: 400px; border: none; background: white; }
.image-viewer-container { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 1rem; overflow-y: auto; }
.image-viewer { max-width: 100%; height: auto; object-fit: contain; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 4px; }

/* Buttons */
.action-buttons { margin-top: auto; }
.btn-primary { display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; background: #3b82f6; color: white; padding: 0.875rem; font-size: 1rem; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; opacity: 0.7; }
.btn-outline-small { display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; border: 1px solid currentColor; padding: 0.4rem 0.75rem; font-size: 0.75rem; }
.btn-outline-small:hover { background: currentColor; color: white !important; }
.btn-icon-danger { background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-icon-danger:hover { background: #fee2e2; }

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>