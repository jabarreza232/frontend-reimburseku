<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import {
  LayoutDashboard, Users, Tag, CreditCard, ShieldCheck, Wallet, LogOut
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

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

function logout() {
  authStore.clearAuth()
  router.push('/masuk')
}
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar">
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
  z-index: 20;
  overflow: hidden;
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

.logout-btn {
  background-color: transparent;
  color: rgba(255,255,255,0.7);
}

.logout-btn:hover {
  background-color: #dc2626 !important;
  color: white !important;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  z-index: 10;
  height: 64px;
}

.page-title {
  font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;
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
}

.user-name-top {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.page-content {
  padding: 1.5rem 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }
  .sidebar span, .sidebar .logo-text, .sidebar .role-label {
    display: none;
  }
  .main-content {
    margin-left: 70px;
  }
  .page-content {
    padding: 1rem;
  }
}
</style>
