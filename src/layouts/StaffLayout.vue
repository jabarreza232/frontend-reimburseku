<script setup>
import { RouterView, useRouter } from 'vue-router'
import { Edit2, LogOut } from 'lucide-vue-next' // Tambahkan import LogOut di sini
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// Tambahkan fungsi logout dasar agar tidak error saat diklik
const logout = () => {
  authStore.clearAuth() // Pastikan ini membersihkan data auth dengan benar
  router.push('/masuk')
}
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
      <div class="page-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Struktur Layout */
.layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #f4f6f9;
}

.sidebar {
  width: 250px;
  background-color: var(--color-primary, #1e293b);
  /* Fallback color jika variabel kosong */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* Sekarang hanya membagi jarak antara Top dan Bottom */
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 10;
}

.sidebar-top {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Bagian Bawah Sidebar (Footer & Decor) */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
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

/* Nav Item Standar */
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Styling Khusus Tombol Logout */
.sidebar-footer {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  position: relative;
  z-index: 2;
  /* Memastikan tombol bisa diklik di atas dekorasi */
}

.logout-btn {
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: #ffffff;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.logout-btn:active {
  transform: scale(0.97);
}

.logout-icon {
  transition: transform 0.3s ease;
}

.logout-btn:hover .logout-icon {
  transform: translateX(3px);
}

/* Dekorasi Bawah */
.sidebar-bg-decor {
  display: flex;
  align-items: flex-end;
  height: 60px;
  /* Diperkecil sedikit agar tidak menabrak tombol */
  opacity: 0.15;
  padding: 0 1rem;
  gap: 4px;
}

.bar {
  flex: 1;
  background-color: white;
  border-radius: 4px 4px 0 0;
}

.bar-1 {
  height: 40%;
}

.bar-2 {
  height: 70%;
}

.bar-3 {
  height: 100%;
}

.bar-4 {
  height: 60%;
}

.bar-5 {
  height: 80%;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-container {
  padding: 2.5rem 4%;
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .main-content {
    margin-left: 200px;
  }

  .page-container {
    padding: 1.5rem;
  }
}
</style>