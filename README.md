# Reimburseku - Frontend Application

**Reimburseku** adalah aplikasi manajemen *reimbursement* perusahaan yang memfasilitasi proses klaim pengeluaran karyawan, manajemen kas operasional (deposit), serta pencatatan transaksi secara terstruktur.

Aplikasi ini dibangun menggunakan **Vue 3** (Composition API) dan dirancang dengan antarmuka yang modern, responsif, serta *high-density* bergaya *dashboard* profesional.

---

## 👥 Hak Akses & Peran (Roles)

Sistem ini membagi pengguna ke dalam 3 peran (role) utama, masing-masing dengan antarmuka dan batasan akses khusus:

### 1. Staff (Karyawan)
Peran ini ditujukan untuk karyawan yang ingin mengajukan klaim pengeluaran (reimburse) ke perusahaan.
*   **Beranda (Dashboard):** Menampilkan ringkasan status klaim pribadi (Total Diajukan, Menunggu, Disetujui, Ditolak) beserta grafik pengeluaran 7 hari terakhir.
*   **Reimbursement:** Tempat staf mengajukan klaim baru dengan mengunggah bukti struk (PDF/Gambar), serta memantau riwayat dan status klaim yang pernah dibuat.
*   **Cetak Struk:** Fitur utilitas bagi staf untuk mengunggah bukti transaksi digital (PDF/Gambar) untuk dicetak (print) dalam ukuran struk kasir standar, guna mempermudah pemberkasan fisik.
*   **Profil:** Pengaturan akun pribadi, memperbarui informasi kontak, serta mengganti *password*.

### 2. Finance (Keuangan)
Peran ini berfokus pada eksekusi pencairan dana, verifikasi, serta pengelolaan kas operasional perusahaan.
*   **Beranda (Dashboard):** Ringkasan seluruh klaim yang menunggu persetujuan (Pending/Menunggu), akses cepat manajemen kas, dan grafik komposisi pengeluaran perusahaan.
*   **Reimbursement:** Panel kontrol utama bagi tim Finance untuk memeriksa bukti struk yang diunggah staf. Finance memiliki otoritas untuk **Menyetujui**, **Menolak**, atau menandai klaim sebagai **Telah Dibayar (PAID)**.
*   **Deposit:** Pencatatan aliran kas operasional masuk ke dalam sistem. Dana deposit ini nantinya menjadi saldo utama yang dipotong saat perusahaan mencairkan *reimbursement*.
*   **Karyawan:** Memantau daftar seluruh karyawan aktif beserta data rekening/e-wallet (payout account) mereka. Finance juga dapat mengekspor rekapitulasi data karyawan ke dalam format PDF atau Excel.
*   **Arsip:** Menyimpan seluruh riwayat klaim reimbursement yang telah selesai diproses (Berstatus *Dibayar* atau *Ditolak*).

### 3. Admin (Administrator)
Peran ini bertanggung bertanggung jawab penuh atas pengelolaan *master data* dan pengaturan sistem konfigurasi aplikasi.
*   **Beranda (Dashboard):** Memberikan intipan (bird-eye view) terhadap total aktivitas, komposisi kategori reimbursement, klaim yang menunggu, serta log aktivitas sistem secara langsung.
*   **Karyawan:** Mengelola (Tambah/Edit/Hapus) akun seluruh karyawan di dalam sistem, mereset password, serta mengatur detail rekening pencairan masing-masing staf.
*   **Kategori:** Mengatur jenis-jenis pengeluaran yang diizinkan (contoh: Transportasi, Makanan, Parkir).
*   **Kelola Metode Bayar:** Mengelola daftar penyedia layanan finansial (Bank atau E-Wallet) yang diakui oleh sistem.
*   **Hak Akses:** Melihat dan mengelola level hierarki akses (Roles).
*   **Deposit & Arsip Deposit:** Admin dapat memantau deposit, serta memiliki hak khusus untuk **menghapus** (soft-delete) deposit atau **memulihkan** (*restore*) data dari arsip.

---

## 🎨 Arsitektur & Antarmuka UI/UX

*   **Non-Scrollable Layouts:** Aplikasi dirancang menggunakan pola UI *Desktop-App* di mana kontainer utama akan menyesuaikan 100% ukuran layar (Edge-to-Edge) tanpa adanya global *scroll* pada halaman browser, melainkan *internal scrolling* pada komponen spesifik.
*   **Modals:** Penggunaan modal difokuskan untuk formulir ringkas (Tambah/Edit data *master*) dan pengiriman notifikasi, menghindari pengalihan halaman secara berlebih.
*   **Consistency:** Memanfaatkan properti Flexbox dan CSS Grid yang dirancang secara teliti agar ukuran *card*, posisi tombol, *textbox*, dan area konten selalu sejajar dan seimbang (*balanced*) di seluruh *role*.

## 🚀 Instalasi & Menjalankan Aplikasi

1.  Pastikan Anda telah menginstal Node.js (direkomendasikan v18+).
2.  Lakukan instalasi dependensi:
    ```bash
    npm install
    ```
3.  Jalankan *Development Server*:
    ```bash
    npm run dev
    ```
4.  Buka URL yang ditampilkan pada terminal (biasanya `http://localhost:5173`).
