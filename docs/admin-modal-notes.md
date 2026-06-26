# Analisis Issue Modal Admin Section

**Status Keseluruhan:** Issue sebagian besar berasal dari Frontend (modal belum diimplementasikan), dengan sedikit catatan pada flow Backend.

## 1. Frontend Issue
Penyebab utama tombol "Tambah" (Add/Create) tidak berfungsi di halaman Admin (Kategori, Metode Bayar, Hak Akses, Karyawan) adalah karena modal di frontend belum dibuat. 
Di dalam kode komponen Vue sebelumnya, fungsi tersebut hanya berisi komentar:
```javascript
function openAdd() {
  // TODO: Implementasi modal tambah
}
```

### Solusi yang sudah diterapkan:
Saya sudah membangun UI modal beserta logic submit form untuk komponen berikut:
- `KategoriView.vue`
- `MetodeBayarView.vue`
- `HakAksesView.vue`
- `KaryawanView.vue`

Kini setiap tombol tambah sudah akan menampilkan popup modal yang dapat digunakan untuk menyimpan data baru.

---

## 2. Backend Notes & Flow Issues
Meskipun API Endpoint untuk create data telah tersedia di Backend (`ApiService.js` di Frontend juga sudah tersambung dengan API tersebut), terdapat beberapa catatan (potensi bug/kerumitan) yang harus diperhatikan oleh tim Backend:

### A. Endpoint Pembuatan Karyawan (`EmployeeController@store`)
Backend mensyaratkan `account_payout_id` wajib diisi saat membuat Karyawan baru:
```php
'account_payout_id' => 'required|integer|exists:account_payout,id_account_payout',
```
**Masalah**: 
Saat Admin ingin mendaftarkan Karyawan baru melalui dashboard, kemungkinan Karyawan tersebut belum mendaftarkan/memiliki nomor rekening di sistem (tabel `account_payout`). 
Saat ini, di frontend (modal yang saya buat), Admin harus menebak atau mengisi `account_payout_id` secara manual (angka integer). Jika ID tersebut tidak ada di tabel, backend akan menolak (mengembalikan error validation).
**Saran untuk Backend**: 
- Buat agar `account_payout_id` bisa `nullable` pada saat karyawan baru dibuat. (Karyawan dapat melengkapi rekeningnya sendiri nanti, atau Admin melengkapinya saat update profil). 

### B. Naming Convention pada Payload Provider (`ProviderController@store`)
Pada saat membuat Metode Pembayaran, backend berekspektasi key json bernama `code_provider`, tetapi respons kembalian (saat fetch) terkadang menggunakan nama field yang berbeda seperti `provider_code`.
```php
// ProviderController.php
'code_provider' => 'required|string',
```
Hal ini sudah ditangani di frontend dengan mengirim form berupa `code_provider`, namun alangkah baiknya diseragamkan penamaannya jika memungkinkan.
