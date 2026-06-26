<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, FileText, Wallet, Users, LogOut
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

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

function logout() {
  authStore.clearAuth()
  router.push('/masuk')
}
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="sidebar">
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
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
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
.layout-container { display: flex; min-height: 100vh; background: var(--color-background); }

/* Sidebar Styles */
.sidebar {
  width: 250px; background: var(--color-primary); color: white; display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.sidebar-nav { flex: 1; padding: 1.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.375rem; }
.nav-item {
  display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 10px;
  color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.875rem; font-weight: 600; transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.2); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); }
.logout-btn { background-color: transparent; color: rgba(255,255,255,0.7); border: none; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: flex-start; text-align: left; }
.logout-btn:hover { background-color: #dc2626 !important; color: white !important; }

/* Main Content Styles */
.main-content { flex: 1; margin-left: 250px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.topbar {
  height: 64px; background: white; border-bottom: 1px solid #f1f5f9; padding: 0 1.5rem;
  display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40;
}
.page-title {
  font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0;
}

.topbar-right { display: flex; align-items: center; gap: 1.5rem; }
.user-profile-top {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0.75rem;
  background: #f8fafc; border-radius: 999px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
}
.user-profile-top:hover { background: #f1f5f9; }
.avatar {
  width: 28px; height: 28px; background: #e2e8f0; color: #64748b; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;
}
.user-name { font-size: 0.8125rem; font-weight: 600; color: #475569; }

.page-content { padding: 1.5rem 2rem; flex: 1; display: flex; flex-direction: column; overflow: hidden; }

@media (max-width: 768px) {
  .sidebar { width: 70px; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .sidebar .logo-text, .sidebar span { display: none; }
  .main-content { margin-left: 70px; }
  .page-content { padding: 1rem; }
}
</style>
