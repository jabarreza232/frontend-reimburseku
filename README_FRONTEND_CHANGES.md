# Frontend Changelog & Fixes

Dokumen ini merangkum perubahan teknis pada frontend (`frontend-reimburseku`) untuk perbaikan sinkronisasi API, perbaikan tata letak, dan logika validasi.

## 1. Konfigurasi API
**File:** `src/api/ApiService.js`
- **Perubahan:** Menambahkan header `Content-Type: multipart/form-data` pada `actionApproveOrReject`.
- **Alasan:** Request persetujuan dan pembayaran (yang menyertakan file bukti transfer) sebelumnya dikirim sebagai tipe default JSON, menyebabkan backend (Laravel) menolak request karena gagal membaca file dari form-data payload.

## 2. Dasbor Finance
**File:** `src/views/finance/DashboardView.vue`
- **Perubahan:**
  - Menghapus komponen `VueApexCharts` tipe donut (Kategori) untuk menyeimbangkan whitespace dan merevisi struktur kolom utama menjadi format grid `minmax(0, 1.8fr) minmax(0, 1.2fr)`.
  - Memperbaiki CSS pada elemen `.filter-row` menjadi tipe baris (*horizontal scroll, no-wrap, hidden scrollbar*) untuk menormalkan *overflow* tata letak pada resolusi sempit.
  - Menggabungkan data tanggal dan kategori ke dalam sub-header di struktur `history-row` demi meningkatkan *data density*.
  - Menerapkan `parentHeightOffset: 0` pada konfigurasi Area Chart untuk memperbaiki *clipping*.

## 3. Data Karyawan (Finance)
**File:** `src/views/finance/KaryawanView.vue`
- **Perubahan:**
  - Mengubah pemetaan respon API dari data *mock* (0 dan Rp 0) untuk `totalPengajuan` dan `totalAmount` menjadi variabel langsung dari API (`emp.reimbursement_requests_count` & `emp.reimbursement_requests_sum_amount`).
  - Menambahkan *filter* di sisi klien: `role_id === 1` untuk menyaring tampilan agar hanya staff yang muncul pada tabel pengajuan finance.

## 4. Validasi & Zona Waktu (Reimbursement Finance)
**File:** `src/views/finance/ReimbursementView.vue`
- **Perubahan:**
  - Menambahkan validasi `isMandatory` (beserta integrasi SweetAlert dan transisi CSS `@keyframes shake`). Sistem kini mencegah eksekusi fungsi persetujuan pembayaran jika DOM untuk *file proof* bernilai null.
  - Memperbaiki perhitungan zona waktu `new Date()` pada atribut `dateSubmitted` (dan `created_at`). String dari backend kini dipaksa parsing sebagai UTC dengan menambahkan substitusi `.replace(' ', 'T') + 'Z'` sebelum dikonversi ke *local timezone* (`id-ID`). Ini mengeliminasi deviasi selisih waktu 7 jam pada UI.

## 5. Dasbor Admin (Sinkronisasi Data Real)
**File:** `src/views/admin/DashboardView.vue`
- **Perubahan:**
  - Mengganti utilitas *fetch* dari `Promise.all` menjadi `Promise.allSettled`. Jika endpoint riwayat log gagal merespon, metrik lain tidak terinterupsi/freeze.
  - Menghapus konstanta *mock/dummy data* array pada variabel `donutSeries`, `categories`, dan metrik dasbor. 
  - Mengimplementasikan fungsi `populateDonutData` yang menyaring dan menghitung akumulasi total per kategori berdasarkan instans array *reimbursements* aktual.
