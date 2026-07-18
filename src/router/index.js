import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/masuk'
    },

    // ─── Titik Masuk Tunggal (Login) ───────────────────────────────
    {
      path: '/masuk',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
        path:'/daftar',
        name:'register',
        component: () => import('../views/RegisterView.vue')
    },

    // ─── Rute Staf ───────────────────────────────────────────────
    {
      path: '/staf',
      component: () => import('../layouts/StaffLayout.vue'),
      children: [
        {
          path: 'dasbor',
          name: 'staf-dasbor',
          meta: { title: 'Beranda' },
          component: () => import('../views/staff/DashboardView.vue')
        },
        {
          path: 'cetak-struk',
          name: 'staf-cetak-struk',
          component: () => import('../views/staff/CetakStrukView.vue')
        },
        {
          path: 'reimbursement',
          name: 'staf-reimbursement',
          meta: { title: 'Reimbursement' },
          component: () => import('../views/staff/ReimbursementView.vue')
        },
        {
          path: 'reimbursement/tambah',
          name: 'staf-reimbursement-tambah',
          meta: { title: 'Tambah Reimbursement' },
          component: () => import('../views/staff/ReimbursementAddView.vue')
        },
        {
          path: 'reimbursement/:id',
          name: 'staf-reimbursement-detail',
          meta: { title: 'Detail Reimbursement' },
          component: () => import('../views/staff/ReimbursementDetailView.vue')
        },
        {
          path: 'profil',
          name: 'staf-profil',
          meta: { title: 'Profil' },
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
          meta: { title: 'Beranda' },
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'karyawan',
          name: 'admin-karyawan',
          meta: { title: 'Karyawan' },
          component: () => import('../views/admin/KaryawanView.vue')
        },
        {
          path: 'kategori',
          name: 'admin-kategori',
          meta: { title: 'Kategori' },
          component: () => import('../views/admin/KategoriView.vue')
        },
        {
          path: 'metode-bayar',
          name: 'admin-metode-bayar',
          meta: { title: 'Kelola Metode Bayar' },
          component: () => import('../views/admin/MetodeBayarView.vue')
        },
        {
          path: 'hak-akses',
          name: 'admin-hak-akses',
          meta: { title: 'Hak Akses' },
          component: () => import('../views/admin/HakAksesView.vue')
        },
        {
          path: 'deposit',
          name: 'admin-deposit',
          meta: { title: 'Deposit' },
          component: () => import('../views/admin/DepositView.vue')
        },
        {
          path: 'arsip-deposit',
          name: 'admin-arsip-deposit',
          meta: { title: 'Arsip Deposit' },
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
          meta: { title: 'Beranda' },
          component: () => import('../views/finance/DashboardView.vue')
        },
        {
          path: 'reimbursement',
          name: 'finance-reimbursement',
          meta: { title: 'Reimbursement' },
          component: () => import('../views/finance/ReimbursementView.vue')
        },
        {
          path: 'deposit',
          name: 'finance-deposit',
          meta: { title: 'Deposit' },
          component: () => import('../views/finance/DepositView.vue')
        },
        {
          path: 'deposit/tambah',
          name: 'finance-deposit-tambah',
          meta: { title: 'Tambah Deposit' },
          component: () => import('../views/finance/TambahDepositView.vue')
        },
        {
          path: 'karyawan',
          name: 'finance-karyawan',
          meta: { title: 'Karyawan' },
          component: () => import('../views/finance/KaryawanView.vue')
        },
        {
          path: '/karyawan/:id', // Menangkap ID karyawan di URL
          name: 'finance-karyawan-detail',
          component: () => import('../views/finance/KaryawanDetailView.vue')
        },
        {
          path: 'arsip',
          name: 'finance-arsip',
          meta: { title: 'Arsip' },
          component: () => import('../views/finance/ArsipView.vue')
        }
      ]
    },

    // ─── Pengalihan link lama (mencegah 404) ──────────────────────
    { path: '/staf/masuk', redirect: '/masuk' },
    { path: '/admin/masuk', redirect: '/masuk' },
    { path: '/finance/masuk', redirect: '/masuk' },
    { path: '/staff/login', redirect: '/masuk' },
    { path: '/admin/login', redirect: '/masuk' },
    { path: '/finance/login', redirect: '/masuk' },
    { path: '/staff/dashboard', redirect: '/staf/dasbor' },
    { path: '/admin/dashboard', redirect: '/admin/dasbor' },
    { path: '/finance/dashboard', redirect: '/finance/dasbor' },

    // ─── Catch-all 404 ──────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/masuk' },
  ]
})

export default router
