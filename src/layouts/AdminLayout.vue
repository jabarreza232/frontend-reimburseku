<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, Users, Tag, CreditCard, ShieldCheck, Wallet, LogOut, Menu
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || 'ReimburseKu')

const navItems = [
  { to: '/admin/dasbor',        label: 'Beranda',            icon: LayoutDashboard },
  { to: '/admin/karyawan',      label: 'Karyawan',           icon: Users           },
  { to: '/admin/kategori',      label: 'Kategori',           icon: Tag             },
  { to: '/admin/deposit',       label: 'Deposit',            icon: Wallet          },
  { to: '/admin/metode-bayar',  label: 'Kelola Metode Bayar', icon: CreditCard      },
  { to: '/admin/hak-akses',     label: 'Hak Akses',          icon: ShieldCheck     },
]

// === STATE & FUNGSI SIDEBAR MOBILE ===
const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

// Tutup sidebar otomatis saat rute berubah di mobile
router.afterEach(() => {
  if (window.innerWidth <= 768) {
    closeSidebar()
  }
})

function logout() {
  authStore.clearAuth()
  router.push('/masuk')
}
</script>

<template>
  <div class="layout-container">
    
    <!-- Overlay Mobile Sidebar -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-top">
        <RouterLink to="/admin/dasbor" class="logo">
          <div class="logo-icon">RK</div>
          <span class="logo-text">reimburseKu</span>
        </RouterLink>
        <p class="role-label">Administrator</p>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-active"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="logout">
          <LogOut :size="18" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" @click="toggleSidebar">
            <Menu :size="24" />
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <div class="user-profile-top">
            <div class="avatar-circle">{{ authStore.user?.name?.[0]?.toUpperCase() || 'A' }}</div>
            <span class="user-name-top">{{ authStore.user?.name || 'Administrator' }}</span>
          </div>
        </div>
      </div>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
  overflow-x: hidden;
}

.sidebar {
  width: 250px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-top {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background-color: white;
  color: var(--color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 700;
  white-space: nowrap;
}

.role-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: 0.25rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background-color: rgba(255,255,255,0.15);
  color: white;
}

.nav-active {
  background-color: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  background-color: transparent;
  color: rgba(255,255,255,0.7);
}

.logout-btn:hover {
  background-color: #dc2626 !important;
  color: white !important;
}

/* Overlay untuk Mobile */
.sidebar-overlay {
  display: none;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.topbar {
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
  height: 64px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 0.25rem;
}

.page-title {
  font-size: 1.25rem; 
  font-weight: 700; 
  color: #1e293b; 
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.user-name-top {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.page-content {
  padding: 1.5rem 2rem;
  flex: 1;
  display: block; /* Diubah dari flex agar natural scroll pada content */
  width: 100%;
}

/* =========================================
   RESPONSIVITAS MOBILE & TABLET
   ========================================= */
@media (max-width: 768px) {
  /* Hilangkan margin main content */
  .main-content {
    margin-left: 0;
  }

  /* Tampilkan tombol menu (hamburger) */
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Sembunyikan nama user, sisakan avatar */
  .user-name-top {
    display: none;
  }

  /* Penyesuaian padding topbar dan content */
  .topbar {
    padding: 0 1rem;
  }
  .page-title {
    font-size: 1.125rem;
  }
  .page-content {
    padding: 1rem;
  }

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
</style>