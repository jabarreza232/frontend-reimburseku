# Isu Sinkronisasi Backend-Frontend

Dokumen ini mengidentifikasi perbedaan dan celah koneksi (missing links) antara aplikasi `frontend-reimburseku` (Vue 3) dan API `backend-api-reimburseku` (Laravel).

## 1. Endpoint API yang Belum Tersedia di Frontend (`ApiService.js`)

Berdasarkan hasil analisis pada file `routes/api.php` di backend, ditemukan beberapa endpoint yang sudah didefinisikan dan diekspos dengan benar oleh Laravel, namun **belum diimplementasikan** pada file `ApiService.js` di frontend. Hal ini menciptakan celah sinkronisasi di mana komponen frontend tidak dapat mengakses data tertentu atau menjalankan perintah yang sebenarnya sudah didukung oleh backend.

### A. Pesan Reimbursement (Reimbursement Messages)
*   **Kurang:** `GET /reimbursement-message/{id}` (Membaca detail satu pesan)
*   **Kurang:** `POST /reimbursement-message/{id}` (Memperbarui pesan)
*   **Kurang:** `DELETE /reimbursement-message/delete/{id}` (Menghapus pesan)

### B. Persetujuan Reimbursement (Approval Reimbursements)
*   **Kurang:** `GET /approval-reimbursement/{id}` (Membaca detail satu persetujuan)
*   **Kurang:** `DELETE /approval-reimbursement/delete/{id}` (Menghapus catatan persetujuan)

### C. Deposit (Finance/Admin)
*   **Kurang:** `GET /deposit/{id}` (Membaca detail satu deposit)
*   **Kurang:** `GET /deposit/log/{id}` (Membaca riwayat/log deposit)

### D. Pengajuan Reimbursement (Reimbursements)
*   **Kurang:** `DELETE /reimburse/delete/{id}` (Menghapus pengajuan reimbursement)

### E. Data Master (Admin)
*   **Kurang:** `GET /category/{id}` (Membaca detail satu kategori)
*   **Kurang:** `GET /provider/{id}` (Membaca detail satu provider)
*   **Kurang:** `GET /role/{id}` (Membaca detail satu role/peran)
*   **Kurang:** `GET /employee/{id}` (Membaca detail satu karyawan)

## 2. Konfigurasi Lingkungan (Environment)
*   **Masalah:** Pada `src/api/apiClient.js`, variabel `baseURL` saat ini di-*hardcode* langsung ke alamat `https://backend-api-reimburseku.vercel.app/api`.
*   **Peningkatan:** Untuk memastikan sinkronisasi yang sempurna di berbagai environment (lokal, staging, dan produksi), sebaiknya frontend mengambil URL API secara dinamis menggunakan variabel environment dari Vite (contoh: `import.meta.env.VITE_API_URL`).

## 3. Perbaikan yang Telah Diimplementasikan
*   Endpoint-endpoint yang hilang pada poin 1 telah ditambahkan secara langsung ke dalam file `src/api/ApiService.js` dengan mengikuti pola penamaan yang sudah ada (contoh: `getEmployeeDetail(id)`, `deleteReimbursement(id)`). Hal ini telah memulihkan 100% sinkronisasi API tanpa merusak struktur kode yang ada.
