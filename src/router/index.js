import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/masuk'
    },
    
    // ─── Single Entry Point (Login) ────────────────────────────────
    {
      path: '/masuk',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },

    // ─── Rute Staf ───────────────────────────────────────────────
    {
      path: '/staf',
      component: () => import('../layouts/StaffLayout.vue'),
      children: [
        {
          path: 'dasbor',
          name: 'staf-dasbor',
          component: () => import('../views/staff/DashboardView.vue')
        },
        {
          path: 'reimbursement',
          name: 'staf-reimbursement',
          component: () => import('../views/staff/ReimbursementView.vue')
        },
        {
          path: 'reimbursement/tambah',
          name: 'staf-reimbursement-tambah',
          component: () => import('../views/staff/ReimbursementAddView.vue')
        },
        {
          path: 'reimbursement/:id',
          name: 'staf-reimbursement-detail',
          component: () => import('../views/staff/ReimbursementDetailView.vue')
        },
        {
          path: 'profil',
          name: 'staf-profil',
          component: () => import('../views/staff/ProfileView.vue')
        }
      ]
    },

    // ─── Rute Admin ───────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        {
          path: 'dasbor',
          name: 'admin-dasbor',
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'karyawan',
          name: 'admin-karyawan',
          component: () => import('../views/admin/KaryawanView.vue')
        },
        {
          path: 'kategori',
          name: 'admin-kategori',
          component: () => import('../views/admin/KategoriView.vue')
        },
        {
          path: 'metode-bayar',
          name: 'admin-metode-bayar',
          component: () => import('../views/admin/MetodeBayarView.vue')
        },
        {
          path: 'hak-akses',
          name: 'admin-hak-akses',
          component: () => import('../views/admin/HakAksesView.vue')
        },
        {
          path: 'deposit',
          name: 'admin-deposit',
          component: () => import('../views/admin/DepositView.vue')
        },
        {
          path: 'arsip-deposit',
          name: 'admin-arsip-deposit',
          component: () => import('../views/admin/ArsipDepositView.vue')
        }
      ]
    },

    // ─── Rute Finance ─────────────────────────────────────────────
    {
      path: '/finance',
      component: () => import('../layouts/FinanceLayout.vue'),
      children: [
        {
          path: 'dasbor',
          name: 'finance-dasbor',
          component: () => import('../views/finance/DashboardView.vue')
        },
        {
          path: 'reimbursement',
          name: 'finance-reimbursement',
          component: () => import('../views/finance/ReimbursementView.vue')
        },
        {
          path: 'deposit',
          name: 'finance-deposit',
          component: () => import('../views/finance/DepositView.vue')
        },
        {
          path: 'deposit/tambah',
          name: 'finance-deposit-tambah',
          component: () => import('../views/finance/TambahDepositView.vue')
        },
        {
          path: 'karyawan',
          name: 'finance-karyawan',
          component: () => import('../views/finance/KaryawanView.vue')
        },
        {
          path: 'arsip',
          name: 'finance-arsip',
          component: () => import('../views/finance/ArsipView.vue')
        }
      ]
    },

    // ─── Redirect lama (agar link lama tidak 404) ─────────────────
    { path: '/staf/masuk',    redirect: '/masuk' },
    { path: '/admin/masuk',   redirect: '/masuk' },
    { path: '/finance/masuk', redirect: '/masuk' },
    { path: '/staff/login',   redirect: '/masuk' },
    { path: '/admin/login',   redirect: '/masuk' },
    { path: '/finance/login', redirect: '/masuk' },
    { path: '/staff/dashboard',   redirect: '/staf/dasbor'   },
    { path: '/admin/dashboard',   redirect: '/admin/dasbor'  },
    { path: '/finance/dashboard', redirect: '/finance/dasbor' },
  ]
})

export default router
