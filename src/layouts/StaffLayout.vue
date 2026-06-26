<script setup>
import { RouterView, useRouter, useRoute } from 'vue-router'
import { 
  Edit2, 
  LogOut, 
  LayoutDashboard, 
  Printer, 
  Wifi, 
  Bluetooth,
  Bell, 
  CheckCircle2, 
  Zap, 
  XCircle 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue'
import ApiService from '@/api/ApiService'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => route.meta.title || 'ReimburseKu')

const logout = () => {
  authStore.clearAuth()
  router.push('/masuk')
}

// === STATE & FUNGSI MENU NOTIFIKASI ===
const showNotifMenu = ref(false)
const notifications = ref([]) 
const hasUnread = ref(false) 

const toggleNotifMenu = () => {
  showNotifMenu.value = !showNotifMenu.value
}

const tandaiSemuaDibaca = () => {
  hasUnread.value = false 
  if (notifications.value.length > 0) {
    const latestId = notifications.value[0].id
    localStorage.setItem('last_read_notif_id', String(latestId))
  }
}

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return `Baru saja`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit yang lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari yang lalu`
}

const determineNotifType = (title, message) => {
  const text = `${title || ''} ${message || ''}`.toLowerCase()
  if (text.includes('transfer') || text.includes('dana') || text.includes('cair')) return 'dibayar'
  if (text.includes('setuju') || text.includes('terima')) return 'diterima'
  if (text.includes('tolak') || text.includes('gagal')) return 'ditolak'
  return 'info'
}

const fetchNotifications = async (page = 1) => {
  try {
    const res = await ApiService.getMyReimbursementsMessages(page)
    const responseBody = res.data

    if (responseBody.success && responseBody.data) {
      notifications.value = responseBody.data.map(item => ({
        id: item.id_message,
        title: item.title || 'Pemberitahuan',
        message: item.message_content,
        time: formatTimeAgo(item.created_at),
        type: determineNotifType(item.title, item.message_content)
      }))
      
      if (notifications.value.length > 0) {
        const latestIdFromApi = notifications.value[0].id 
        const storedLatestId = localStorage.getItem('last_read_notif_id') 
        
        if (String(latestIdFromApi) !== storedLatestId) {
          hasUnread.value = true
        } else {
          hasUnread.value = false 
        }
      } else {
        hasUnread.value = false
      }
    }
  } catch (err) {
    console.error('Gagal mengambil data notifikasi:', err)
  }
}

const getNotifIcon = (type) => {
  if (type === 'dibayar') return Zap
  if (type === 'diterima') return CheckCircle2
  if (type === 'ditolak') return XCircle
  return Bell
}

const getNotifIconBgClass = (type) => {
  if (type === 'dibayar') return 'bg-success-light text-success'
  if (type === 'diterima') return 'bg-primary-light text-primary'
  if (type === 'ditolak') return 'bg-danger-light text-danger'
  return 'bg-info-light text-info' 
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-top">
        <router-link to="/staf/dasbor" class="logo">
          <div class="logo-icon">RK</div>
          <span class="logo-text">reimburseKu</span>
        </router-link>

        <div class="user-profile">
          <div class="avatar-container">
            <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" class="avatar-img" />
            <div class="status-indicator"></div>
          </div>
          <h3 class="user-name">{{ authStore.user?.name || 'User' }}</h3>
          <p class="user-role">{{ authStore.user?.position || 'Staff' }}</p>

          <router-link to="/staf/profil" class="edit-profile-btn">
            <Edit2 :size="14" />
            <span>Edit Profile</span>
          </router-link>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/staf/dasbor" class="nav-item" active-class="active">
          <LayoutDashboard :size="20" class="nav-icon" />
          <span>Dasbor</span>
        </router-link>

        <router-link to="/staf/cetak-struk" class="nav-item print-menu" active-class="active">
          <Printer :size="20" class="nav-icon" />
          <div class="nav-text-group">
            <span class="nav-title">Cetak Struk PDF</span>
            <div class="nav-badges">
              <Wifi :size="10" />
              <Bluetooth :size="10" />
              <span>Koneksi Aktif</span>
            </div>
          </div>
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <div class="sidebar-footer">
          <button class="nav-item logout-btn" @click="logout">
            <LogOut :size="20" class="logout-icon" />
            <span>Keluar</span>
          </button>
        </div>

        <div class="sidebar-bg-decor">
          <div class="bar bar-1"></div>
          <div class="bar bar-2"></div>
          <div class="bar bar-3"></div>
          <div class="bar bar-4"></div>
          <div class="bar bar-5"></div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
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
      </header>
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Layout Structure */
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-background);
}

.sidebar {
  width: 250px;
  background-color: var(--color-primary, #1e293b);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
}

.sidebar::-webkit-scrollbar {
  width: 0px;
}

.sidebar-top {
  padding: 2rem 1.5rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Main Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  flex: 1;
}

/* Standard Nav Item */
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

/* Active Nav Item */
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.nav-icon {
  flex-shrink: 0;
}

/* Print Menu Special Styling */
.print-menu {
  align-items: flex-start;
}

.nav-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-title {
  line-height: 1;
}

.nav-badges {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.2rem;
  transition: all 0.2s;
}

/* Badge when menu is active */
.nav-item.active .nav-badges {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

/* Sidebar Bottom (Footer & Decor) */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  text-decoration: none;
  color: white;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background-color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-weight: 800;
  font-size: 0.8rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 14px;
  height: 14px;
  background-color: #22c55e;
  border: 2px solid var(--color-primary, #1e293b);
  border-radius: 50%;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: white; /* Perubahan: Menambahkan warna putih eksplisit pada nama staf */
}

.user-role {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: var(--color-primary, #1e293b);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.edit-profile-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}

/* Logout Button */
.sidebar-footer {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
  position: relative;
  z-index: 2;
}

.logout-btn {
  width: 100%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.75);
}

.logout-btn:hover {
  background-color: #dc2626 !important;
  color: white !important;
}

.logout-icon {
  transition: transform 0.3s ease;
}

.logout-btn:hover .logout-icon {
  transform: translateX(3px);
}

/* Bottom Decoration */
.sidebar-bg-decor {
  display: flex;
  align-items: flex-end;
  height: 50px;
  opacity: 0.1;
  padding: 0 1rem;
  gap: 4px;
}

.bar {
  flex: 1;
  background-color: white;
  border-radius: 4px 4px 0 0;
}

.bar-1 { height: 40%; }
.bar-2 { height: 70%; }
.bar-3 { height: 100%; }
.bar-4 { height: 60%; }
.bar-5 { height: 80%; }

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 250px;
  height: 100vh;
  /* 1. Ubah overflow menjadi auto agar sisi kanan bisa di-scroll secara keseluruhan */
  overflow-y: auto; 
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 1.5rem 2rem;
  flex: 1;
  width: 100%;
  /* 2. Hapus display: flex, flex-direction, dan overflow-y: auto di sini 
     agar komponen seperti Profile bisa merender tingginya secara alami 
     dan memicu scroll pada .main-content */
  display: block; 
}

.topbar {
  height: 64px; background: white; border-bottom: 1px solid #f1f5f9; padding: 0 2rem;
  display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; flex-shrink: 0;
}
.page-title {
  font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;
}

/* --- Notification Icon --- */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #64748b;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}
.header-icon-btn:hover {
  background-color: #f8fafc;
  color: #3b82f6;
  border-color: #cbd5e1;
}
.notification-dot {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 1.5px solid white;
}

/* --- NOTIFICATION DROPDOWN --- */
.notif-wrapper { position: relative; }
.notif-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.notif-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}
.btn-clear {
  background: transparent;
  border: none;
  font-size: 0.8125rem;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
}
.btn-clear:hover { text-decoration: underline; }
.notif-list {
  max-height: 380px;
  overflow-y: auto;
}
.notif-list::-webkit-scrollbar { width: 4px; }
.notif-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.notif-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background-color: #f8fafc; }
.notif-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bg-success-light { background-color: #dcfce7; }
.text-success { color: #16a34a; }
.bg-primary-light { background-color: #dbeafe; }
.text-primary { color: #2563eb; }
.bg-danger-light { background-color: #fee2e2; }
.text-danger { color: #dc2626; }
.bg-info-light { background-color: #f1f5f9; }
.text-info { color: #64748b; }
.notif-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.notif-content h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}
.notif-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.4;
}
.notif-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}
.notif-footer {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}
.notif-footer button {
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}
.notif-footer button:hover { color: #0f172a; }

@media (max-width: 640px) {
  .notif-menu {
    right: -10px;
    width: 320px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .main-content {
    margin-left: 70px;
  }

  .page-content {
    padding: 1rem 0.5rem;
  }

  .logo-text, 
  .user-name, 
  .user-role, 
  .edit-profile-btn span, 
  .nav-item span, 
  .nav-text-group {
    display: none;
  }

  .avatar-img {
    width: 40px;
    height: 40px;
    border-width: 2px;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    bottom: 0px;
    right: 0px;
  }

  .edit-profile-btn {
    padding: 0.5rem;
    border-radius: 50%;
  }

  .sidebar-top {
    padding: 1.5rem 0.5rem 1rem 0.5rem;
  }

  .nav-item {
    padding: 0.875rem 0;
    justify-content: center;
  }

  .logo {
    margin-bottom: 1.5rem;
  }
}
</style>