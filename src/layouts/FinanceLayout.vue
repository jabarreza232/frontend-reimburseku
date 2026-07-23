<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, FileText, Wallet, Users, LogOut, Bell, Menu
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import ApiService from '@/api/ApiService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || 'ReimburseKu')

const menuItems = [
  { to: '/finance/dasbor', label: 'Beranda', icon: LayoutDashboard },
  { to: '/finance/reimbursement', label: 'Reimburse', icon: FileText },
  { to: '/finance/karyawan', label: 'Karyawan', icon: Users },
  { to: '/finance/deposit', label: 'Deposit', icon: Wallet },
]

// === STATE & FUNGSI SIDEBAR MOBILE ===
const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

// Tutup sidebar otomatis saat pindah rute di mobile
router.afterEach(() => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
})

// === STATE & FUNGSI NOTIFIKASI ===
const notifications = ref([])
const showNotifMenu = ref(false)

const fetchNotifications = async () => {
  try {
    const res = await ApiService.getMyReimbursementsMessages(1)
    notifications.value = res.data?.data || []
  } catch (error) {
    console.error('Gagal memuat notifikasi:', error)
  }
}

const handleOutsideClick = (event) => {
  if (!event.target.closest('.notif-wrapper')) {
    showNotifMenu.value = false
  }
}

onMounted(() => {
  fetchNotifications()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

// Fungsi ketika item notifikasi diklik
const handleNotifClick = (notif) => {
  showNotifMenu.value = false
  router.push('/finance/reimbursement')
}

// Helper format tanggal singkat
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })
}
// =================================

function logout() {
  authStore.clearAuth()
  router.push('/masuk')
}
</script>

<template>
  <div class="layout-container">
    
    <!-- Overlay Mobile Sidebar -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-top">
        <RouterLink to="/finance/dasbor" class="logo-area">
          <div class="logo-icon">RK</div>
          <div class="logo-text">
            <span class="brand">reimburseKu</span>
            <span class="role">FINANCE</span>
          </div>
        </RouterLink>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ 'active': route.path.startsWith(item.to) }"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="logout">
          <LogOut :size="20" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <Menu :size="24" />
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          
          <!-- TOMBOL & DROPDOWN NOTIFIKASI -->
          <div class="notif-wrapper">
            <button class="notif-btn" @click="showNotifMenu = !showNotifMenu">
              <Bell :size="20" />
              <span v-if="notifications.length > 0" class="notif-badge">
                {{ notifications.length > 9 ? '9+' : notifications.length }}
              </span>
            </button>

            <transition name="fade-down">
              <div v-if="showNotifMenu" class="notif-dropdown">
                <div class="notif-header">
                  <h3>Notifikasi</h3>
                </div>
                <div class="notif-body">
                  <div v-if="notifications.length === 0" class="notif-empty">
                    Tidak ada pemberitahuan baru
                  </div>
                  
                  <div 
                    v-else 
                    v-for="notif in notifications" 
                    :key="notif.id_message" 
                    class="notif-item"
                    @click="handleNotifClick(notif)"
                  >
                    <div class="notif-icon-circle">
                      <FileText :size="16" />
                    </div>
                    <div class="notif-content">
                      <h4 class="notif-title">{{ notif.title || 'Pesan Sistem' }}</h4>
                      
                      <!-- Pesan tetap dilimit agar dropdown tidak melebar terlalu panjang -->
                      <p class="notif-desc">{{ notif.message_content }}</p>
                      
                      <!-- Menambahkan area untuk Tanggal dan Tombol Detail -->
                      <div class="notif-meta">
                        <span class="notif-time">{{ formatDate(notif.created_at) }}</span>
                        <span class="notif-detail-link">Lihat Detail &rarr;</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="notif-footer">
                  <RouterLink to="/finance/reimbursement" @click="showNotifMenu = false">Lihat Semua Reimbursement</RouterLink>
                </div>
              </div>
            </transition>
          </div>
          <!-- END NOTIFIKASI -->

          <div class="user-profile-top">
            <div class="avatar">{{ authStore.user?.name?.[0]?.toUpperCase() || 'F' }}</div>
            <span class="user-name">{{ authStore.user?.name || 'Finance Staff' }}</span>
          </div>
        </div>
      </header>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-container { display: flex; min-height: 100vh; background: var(--color-background); overflow-x: hidden; }

/* Sidebar Styles */
.sidebar {
  width: 250px; background: var(--color-primary); color: white; display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-top { padding: 1.5rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.logo-area { display: flex; align-items: center; gap: 0.875rem; text-decoration: none; color: white; }
.logo-icon {
  width: 36px; height: 36px; background: white; color: var(--color-primary); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0;
}
.logo-text { display: flex; flex-direction: column; }
.brand { font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.role { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.1em; margin-top: 2px; }

.sidebar-nav { flex: 1; padding: 1.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.375rem; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 10px;
  color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.2); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); }
.logout-btn { background-color: transparent; color: rgba(255,255,255,0.7); border: none; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: flex-start; text-align: left; }
.logout-btn:hover { background-color: #dc2626 !important; color: white !important; }

/* Overlay untuk Mobile */
.sidebar-overlay { display: none; }

/* Main Content Styles */
.main-content { flex: 1; margin-left: 250px; transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; min-height: 100vh; overflow: hidden; }

.topbar {
  height: 64px; background: white; border-bottom: 1px solid #f1f5f9; padding: 0 1.5rem;
  display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40;
}
.topbar-left { display: flex; align-items: center; gap: 1rem; }
.menu-toggle { display: none; background: transparent; border: none; color: #475569; cursor: pointer; padding: 0.25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }

.topbar-right { display: flex; align-items: center; gap: 1.25rem; }

/* === NOTIFIKASI CSS === */
.notif-wrapper { position: relative; display: flex; align-items: center; }
.notif-btn {
  background: none; border: none; padding: 0.5rem; cursor: pointer; color: #64748b;
  position: relative; border-radius: 50%; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.notif-btn:hover { background: #f1f5f9; color: #0f172a; }
.notif-badge {
  position: absolute; top: 4px; right: 4px; background: #ef4444; color: white;
  font-size: 0.6rem; font-weight: 700; height: 16px; min-width: 16px; padding: 0 4px;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

.notif-dropdown {
  position: absolute; top: calc(100% + 10px); right: -10px; width: 360px; 
  background: white; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0; z-index: 50; display: flex; flex-direction: column; overflow: hidden;
}
.notif-header { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.notif-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }

.notif-body { max-height: 380px; overflow-y: auto; }
.notif-empty { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.85rem; }

.notif-item {
  display: flex; gap: 1rem; padding: 1.25rem; border-bottom: 1px solid #f1f5f9;
  cursor: pointer; transition: background 0.2s;
}
.notif-item:hover { background: #f8fafc; }
.notif-item:last-child { border-bottom: none; }

.notif-icon-circle {
  width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; color: #3b82f6;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.notif-content { display: flex; flex-direction: column; gap: 0.35rem; width: 100%; }
.notif-title { margin: 0; font-size: 0.85rem; font-weight: 700; color: #1e293b; }

.notif-desc { 
  margin: 0; font-size: 0.8rem; color: #475569; line-height: 1.4; 
  word-wrap: break-word; 
}

.notif-meta {
  display: flex; align-items: center; justify-content: space-between; margin-top: 0.25rem;
}
.notif-time { font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
.notif-detail-link { font-size: 0.75rem; font-weight: 700; color: #3b82f6; transition: color 0.2s; }
.notif-item:hover .notif-detail-link { color: #1d4ed8; text-decoration: underline; }

.notif-footer {
  padding: 0.75rem; text-align: center; border-top: 1px solid #f1f5f9; background: #f8fafc;
}
.notif-footer a {
  font-size: 0.8rem; font-weight: 600; color: #3b82f6; text-decoration: none;
}
.notif-footer a:hover { text-decoration: underline; }

/* ANIMASI DROPDOWN */
.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-10px); }
/* ==================== */

.user-profile-top {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0.75rem;
  background: #f8fafc; border-radius: 999px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
}
.user-profile-top:hover { background: #f1f5f9; }
.avatar {
  width: 28px; height: 28px; background: #e2e8f0; color: #64748b; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem; flex-shrink: 0;
}
.user-name { font-size: 0.8125rem; font-weight: 600; color: #475569; white-space: nowrap; }

.page-content { padding: 1.5rem 2rem; flex: 1; display: flex; flex-direction: column; overflow-x: hidden; }

/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */
@media (max-width: 768px) {
  /* Ubah margin Main Content karena Sidebar akan di-hide */
  .main-content { margin-left: 0; }
  
  /* Sembunyikan Nama User, hanya Avatar */
  .user-name { display: none; }
  .user-profile-top { padding: 0.25rem; border-radius: 50%; }

  /* Topbar Penyesuaian */
  .topbar { padding: 0 1rem; }
  .menu-toggle { display: flex; align-items: center; justify-content: center; }
  .page-title { font-size: 1.125rem; }

  /* Kurangi padding Konten */
  .page-content { padding: 1rem; }

  /* Sidebar menjadi Laci (Drawer) Off-Canvas */
  .sidebar {
    transform: translateX(-100%);
    width: 260px;
  }
  .sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  }
  
  /* Latar belakang redup saat sidebar terbuka */
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    z-index: 45;
    backdrop-filter: blur(2px);
  }
}

@media (max-width: 480px) {
  /* Dropdown Notifikasi menyesuaikan layar penuh pada HP sempit */
  .notif-dropdown {
    position: fixed;
    top: 60px;
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: calc(100vw - 2rem);
  }
}
</style>