# LAPORAN KERJA PRAKTEK

(**KERJA** **PRAKTEK** **MASIH** ON **GOING**)

Perancangan dan Implementasi Front-End pada Sistem Informasi Reimbursement Internal Berbasis Web Menggunakan Vue.js di PT Ilab Solusi Pratama

Disusun oleh : ### Wisnu Widya Pradana **411231088**

# PROGRAM STUDI TEKNIK INFORMATIKA

# FAKULTAS TEKNIK DAN INFORMATIKA # UNIVERSITAS DIAN NUSANTARA **JAKARTA** **MEI** **2026**

**HALAMAN** **PENGESAHAN**

### Nama Mahasiswa

: ### Wisnu Widya Pradana **NIM** Mahasiswa : **411231088** Judul KP : Perancangan dan Implementasi Front-End pada Sistem Informasi Reimbursement Internal Berbasis Web Menggunakan Vue.js ### Periode Kerja Praktek : 30 Maret **2026** s.d 30 Juni **2026** Nama Perusahaan/Institusi Tempat Kerja Praktek : PT. Ilab Solusi Pratama Alamat Perusahaan/Institusi : **SOHO** at Podomoro City Jl. Letjen S. Parman Kav 28 **DKI** Jakarta **11470**, Indonesia Nomor Telepon Perusahaan/Institusi : +62-21-**2789**-**3357** Email Perusahaan/Institusi :

Nama Pembimbing Lapangan : ### Tofik Indradjadja ### Jabatan Pembimbing Lapangan : ### Direktur Utama Nomor Telepon / E-mail Pembimbing Lapangan : +62 **818**-**693**-**576** Nama Dosen Pembimbing : Anita Ratnasari, S.Kom, M.Kom Nomor Telepon / E-mail Dosen Pembimbing : [anita.ratnasari@undira.ac.id](mailto:anita.ratnasari@undira.ac.id)

Telah disetujui dan disahkan Pada tanggal, bulan dan tahun sidang ### Pembimbing Kerja Praktek Industri

**TTD** + **STEMPEL** **PERUSAHAAN**

### Tofik Indradjadja

### Direktur Utama ### Dosen Pembimbing Kerja Praktek

Anita Ratnasari, S.Kom, M.Kom **NIP**. **11038101240055**

Mengetahui ### Ketua Program Studi Teknik Informatika Anita Ratnasari, S.Kom, M.Kom **NIK**/**NIP**. **11038101240055**

**KATA** **PENGANTAR**

Puji syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya, sehingga penulis dapat menyelesaikan laporan Kerja Praktek ini tepat pada waktunya. Laporan ini disusun berdasarkan kegiatan Kerja Praktek yang dilaksanakan di Ilab Solusi Pratama selama periode Maret s/d Juni **2026**. Penulisan laporan ini bertujuan untuk memenuhi syarat kelulusan mata kuliah Kerja Praktek pada Program Studi Teknik Informatika, Fakultas Teknik dan Informatika, Universitas Dian Nusantara. Selain itu, laporan ini diharapkan dapat memberikan gambaran mengenai penerapan ilmu Software Engineering di dunia industri. Dalam pelaksanaan Kerja Praktek dan penyusunan laporan ini, penulis menyadari masih terdapat berbagai kendala dan kekurangan, baik dari segi teknis maupun materi yang disajikan. Namun, berkat bantuan dan dukungan dari berbagai pihak, kendala tersebut dapat teratasi dengan baik. Oleh karena itu, pada kesempatan ini penulis ingin menyampaikan ucapan terima kasih kepada: Ibu Anita Ratnasari, S.Kom., M.Kom, selaku Dosen Pembimbing yang telah memberikan arahan dan bimbingan selama penyusunan laporan ini. Bapak Tofik Indradjadja selaku Pembimbing Lapangan di Ilab Solusi Pratama atas ilmu dan bimbingan praktis yang diberikan selama masa Kerja Praktek. Seluruh staf dan karyawan Ilab Solusi Pratama yang telah membantu kelancaran kegiatan selama di lapangan. Keluarga dan rekan-rekan mahasiswa Teknik Informatika yang selalu memberikan dukungan moral. Penulis berharap laporan ini dapat memberikan manfaat bagi pembaca, khususnya bagi rekan-rekan mahasiswa Universitas Dian Nusantara. Kritik dan saran yang membangun sangat penulis harapkan demi kesempurnaan laporan ini di masa mendatang. Jakarta, 13 Mei **2026**

Wisnu Widya Pradana **NIM** : **411231088** **ABSTRAK** Transformasi digital mendorong perusahaan untuk mengoptimalkan proses bisnis melalui sistem informasi berbasis web, termasuk pengelolaan reimbursement karyawan yang selama ini masih dilakukan secara manual dan kurang terstruktur. Dalam konteks tersebut, PT. Ilab Solusi Pratama mengembangkan ReimburseKu, sebuah sistem informasi reimbursement internal berbasis web yang melibatkan tiga peran pengguna, yaitu staff sebagai pengaju dan pemantau riwayat klaim, finance sebagai pihak yang melakukan verifikasi, persetujuan, dan pembayaran reimbursement, serta admin sebagai pengawas sistem dan pengelola data master perusahaan. Kerja praktek ini berfokus pada perancangan dan implementasi antarmuka front-end ReimburseKu menggunakan Vue.js dengan pendekatan Single Page Application. Pengembangan mencakup implementasi form pengajuan reimbursement, halaman daftar klaim dinamis, logika keputusan berbasis kondisi pada modul finance menggunakan Composition **API** Vue 3, serta integrasi **REST** **API** dengan backend berbasis Laravel melalui Axios. Penyesuaian tampilan dan hak akses berdasarkan role pengguna juga diimplementasikan untuk memastikan setiap pengguna hanya dapat mengakses fitur sesuai tanggung jawabnya. Pengujian menggunakan metode White Box Testing menunjukkan bahwa seluruh fungsi utama berjalan sesuai kebutuhan bisnis, dan pendekatan berbasis komponen Vue.js terbukti efektif dalam membangun antarmuka yang responsif, modular, dan terintegrasi secara real-time. Kata Kunci: Reimbursement, Vue.js, Front-End, Single Page Application, **REST** **API**, Role-Based Access Control

**DAFTAR** **ISI**
**LAPORAN** **KERJA** **PRAKTEK**	1
**HALAMAN** **PENGESAHAN**	i
**KATA** **PENGANTAR**	ii
**ABSTRAK**	iii
**DAFTAR** **ISI**	iv
**DAFTAR** **GAMBAR**	v
**DAFTAR** **TABEL**	vi
**BAB** 1. **PENDAHULUAN**	1
**BAB** 2. **GAMBARAN** **UMUM** **PERUSAHAAN**	2
**BAB** 3. **KEGIATAN** **KERJA** **PRAKTEK**	3
**BAB** 4. **HASIL** **DAN** **PEMBELAJARAN** **TEKNIS**	4
4.1 Hasil Pekerjaan	4
4.2 Penjelasan Teknis (**WAJIB** **SESUAI** **PEMINATAN**)	4
4.3 Kendala dan Solusi	6
4.4 Analisis dan Evaluasi	6
4.5 Pembelajaran yang Diperoleh	6
**BAB** 5. **PENUTUP**	7
5.1 Kesimpulan	7
5.2 Saran	7
**DAFTAR** **PUSTAKA**	8
**LAMPIRAN**	9
## Lampiran 1. Surat Pengantar KP dari Kampus	9
## Lampiran 2. Surat Kesediaan Penerimaan KP dari Industri	9
## Lampiran 3. Nilai KP dari Industri yang ditandatangani oleh supervisor dan stempel perusahaan cap basah (Nilai discan dan di insert ke dalam laporan KP) - Lihat template Formulir Penilaian Kerja Praktek	9
## Lampiran 5. Dokumentasi Pelaksanaan KP berupa foto dan Video (upload di Folder Data Master dengan minimal durasi 15 menit) - link dituliskan dalam laporan KP - Video Final Yang sudah Siap Upload di Youtube Prodi Maksimal 15 Menit - Berisi Rangkaian Kegiatan KP yang sudah Terlaksana	9
## Lampiran 6. Bukti Pendaftaran HAKI	9
**TEMPLATE** **NILAI** KP	10

**DAFTAR** **GAMBAR**

Gambar 1.1 Proses reimbursement yang masih manual	2
Gambar 4.1 Arsitektur Sistem ReimburseKu	15
Gambar 4.2 Wireframe Sistem reimburseKu	17
Gambar 4.3 Use Case Diagram Reimgram SistemburseKu	19
Gambar 4.4 Activity Diagram Proses Reimbursement	20
Gambar 4.5 Flowchart Proses Approval dan Pembayaran	21
Gambar 4.6 Sequence Diagram Pengajuan Reimbursement	23
Gambar 4.7 Sequence Diagram Approval dan Pembayaran	24

**DAFTAR** **TABEL**

Tabel 4.1 Hak Akses dan Fitur Utama Berdasarkan Role	14
Tabel 4.2 Hasil Pengujian White Box (Frontend)	25

**BAB** 1. **PENDAHULUAN** ### Latar Belakang Transformasi digital dalam beberapa tahun terakhir telah mendorong perusahaan untuk mengoptimalkan proses bisnis melalui pemanfaatan sistem (Fachrurazi et al., **2023**). informasi berbasis web. Pemanfaatan teknologi digital secara strategis terbukti mampu meningkatkan keunggulan kompetitif, mempercepat pertumbuhan organisasi, serta mentransformasi proses operasional secara menyeluruh (Fachrurazi et al., **2023**). Salah satu proses yang masih sering dikelola secara manual dan kurang terstruktur di lingkungan perusahaan adalah pengelolaan reimbursement atau penggantian biaya operasional karyawan. Proses ini pada umumnya melibatkan beberapa tahapan, mulai dari pengajuan oleh karyawan, verifikasi oleh pihak terkait, hingga pencairan dana oleh bagian keuangan. Ketika proses tersebut belum terintegrasi dalam suatu sistem, berbagai kendala dapat muncul seperti keterlambatan proses, kesalahan pencatatan, dan kurangnya transparansi dalam pelacakan status pengajuan (Hidayatun et al., **2023**). Gambar 1.1 Proses reimbursement yang masih manual

Seiring dengan meningkatnya kebutuhan akan efisiensi dan akuntabilitas, penggunaan sistem informasi berbasis web menjadi solusi yang semakin banyak diterapkan oleh perusahaan. Sistem berbasis web memungkinkan data dikelola secara terpusat dan dapat diakses secara real-time oleh berbagai pihak yang terlibat. Selain itu, penerapan mekanisme pengaturan hak akses berbasis peran (role-based access control) menjadi penting untuk memastikan bahwa setiap pengguna hanya dapat mengakses fitur yang sesuai dengan tanggung jawabnya. Sistem reimbursement berbasis web yang dirancang dengan pembagian hak akses per peran terbukti dapat mempercepat proses klaim sekaligus meningkatkan semangat kerja karyawan karena proses penggantian dana menjadi lebih transparan dan terstruktur (Pakpahan et al., **2025**). Dalam konteks tersebut, PT. Ilab Solusi Pratama mengembangkan ReimburseKu, sebuah sistem informasi reimbursement internal berbasis web yang dirancang untuk mendukung proses pengelolaan penggantian biaya karyawan secara lebih terstruktur. Sistem ini melibatkan tiga peran utama pengguna, yaitu staff sebagai pengaju dan pemantau riwayat klaim, finance sebagai pihak yang melakukan verifikasi administrasi, persetujuan, dan pembayaran reimbursement, serta admin sebagai pihak yang mengawasi sistem dan mengelola data master perusahaan. Perbedaan kebutuhan interaksi antar peran tersebut menuntut perancangan antarmuka yang mampu mengakomodasi alur kerja masing-masing secara efektif. Dalam pelaksanaan kerja praktek ini, penulis berfokus pada pengembangan bagian front-end menggunakan Vue.js 3 dengan pendekatan Single Page Application (**SPA**). Pemilihan Vue.js didasarkan pada kemampuannya dalam membangun antarmuka berbasis komponen yang reaktif dan modular, di mana hasil pengujian performa menunjukkan Vue.js unggul dalam kecepatan rendering dan efisiensi penggunaan memori dibandingkan framework lain pada skenario pengembangan website interaktif (Khoirurrizal et al., **2024**). Pengembangan front-end tidak hanya berperan dalam membangun tampilan visual, tetapi juga memastikan bahwa alur interaksi pengguna berjalan sesuai dengan proses bisnis. Antarmuka yang dirancang dengan baik secara langsung memengaruhi kemudahan penggunaan sistem dan efektivitas operasional pengguna dalam menyelesaikan tugasnya (Rahman et al., **2024**). ### Tujuan Kerja Praktek Tujuan dari pelaksanaan kerja praktek ini adalah sebagai berikut: Memahami alur kerja pengembangan sistem informasi di lingkungan industri, khususnya dalam pengembangan aplikasi berbasis web Menerapkan pengetahuan di bidang Teknik Informatika, terutama dalam pengembangan antarmuka menggunakan Vue.js 3 Mengembangkan keterampilan teknis dalam membangun user interface yang interaktif, responsif, dan berbasis komponen Memahami alur bisnis sistem reimbursement yang melibatkan beberapa peran pengguna seperti staff, admin, dan finance Mengimplementasikan integrasi antara front-end dan backend dalam menampilkan data secara dinamis melalui **REST** **API** Mengembangkan kemampuan bekerja secara kolaboratif dalam tim pengembangan perangkat lunak modern

### Lingkup Pekerjaan

Pelaksanaan kerja praktek dilakukan pada periode 30 Maret **2026** hingga 30 Juni **2026** di PT. Ilab Solusi Pratama dengan fokus pada pengembangan ReimburseKu, sistem reimbursement internal perusahaan. Dalam kegiatan ini, penulis bertanggung jawab pada pengembangan bagian front-end menggunakan Vue.js 3. Pekerjaan yang dilakukan meliputi perancangan dan implementasi halaman pengajuan reimbursement yang memungkinkan pengguna mengisi data seperti kategori, nominal, tanggal transaksi, serta mengunggah bukti pembayaran. Selain itu, penulis juga mengembangkan tampilan daftar reimbursement yang menampilkan status pengajuan secara dinamis berdasarkan proses yang dilakukan oleh pihak finance. Integrasi dengan backend berbasis Laravel dilakukan menggunakan Axios untuk memastikan data yang ditampilkan selalu terbarui dan sesuai kondisi sistem secara aktual (Rahman et al., **2024**). Penulis juga terlibat dalam pengembangan interaksi antarmuka, seperti penggunaan komponen modal untuk proses unggah bukti transfer, serta pengaturan tampilan dan hak akses berdasarkan role pengguna. Seluruh proses kerja praktek dilaksanakan secara full remote dengan koordinasi daring bersama tim backend melalui repositori Git.

**BAB** 2. **GAMBARAN** **UMUM** **PERUSAHAAN**

2.1 Profil Perusahaan PT. Ilab Solusi Pratama merupakan perusahaan yang bergerak di bidang teknologi informasi dengan fokus pada pengembangan perangkat lunak untuk mendukung kebutuhan operasional bisnis. Perusahaan berlokasi di **SOHO** at Podomoro City, Jl. Letjen S. Parman Kav 28, **DKI** Jakarta **11470**. Aktivitas utama perusahaan mencakup pengembangan aplikasi lintas platform berbasis web dan mobile, dengan penekanan pada pengelolaan data yang terintegrasi agar proses bisnis dapat berjalan lebih efisien. Pemanfaatan teknologi informasi dalam operasional bisnis seperti ini telah terbukti berkontribusi langsung terhadap peningkatan keunggulan kompetitif dan pertumbuhan organisasi melalui transformasi proses yang lebih adaptif dan terstruktur (Fachrurazi et al., **2023**). Seiring dengan perkembangan kebutuhan industri terhadap solusi digital yang adaptif, PT. Ilab Solusi Pratama terus mengembangkan kapabilitas tim dalam menerapkan teknologi pengembangan web modern, termasuk pendekatan full-stack yang memisahkan tanggung jawab antara frontend dan backend. Pendekatan ini memungkinkan pengembangan dan pengujian komponen sistem dilakukan secara lebih independen dan terstruktur. Vue.js dipilih sebagai framework frontend utama karena menunjukkan keunggulan performa dalam kecepatan rendering dan efisiensi memori pada pengembangan website interaktif berbasis komponen (Khoirurrizal et al., **2024**). 2.2 Posisi dan Peran Penulis Dalam pelaksanaan kerja praktek, penulis ditempatkan pada Divisi IT, khususnya pada unit pengembangan perangkat lunak yang bertanggung jawab dalam merancang dan membangun sistem untuk kebutuhan internal maupun pengembangan solusi digital lainnya. Proses kerja dilakukan secara kolaboratif antara pengembang backend dan front-end, sehingga setiap bagian memiliki peran yang saling melengkapi dalam membangun sistem yang utuh. Penulis berperan sebagai Front-End Developer dalam pengembangan ReimburseKu, sistem reimbursement internal perusahaan. Peran ini berfokus pada perancangan dan implementasi antarmuka pengguna menggunakan Vue.js 3, termasuk membangun halaman pengajuan reimbursement, menampilkan data pengajuan secara dinamis, serta menyesuaikan tampilan dan hak akses berdasarkan peran pengguna. Pengaturan akses berbasis peran ini diterapkan agar setiap pengguna hanya berinteraksi dengan fitur sesuai tanggung jawabnya, sejalan dengan pendekatan sistem reimbursement berbasis web yang memanfaatkan teknologi digital untuk mempercepat proses klaim secara terstruktur (Pakpahan et al., **2025**). Selain aspek visual, penulis juga memastikan bahwa setiap interaksi pada antarmuka dapat merepresentasikan alur proses bisnis yang berjalan, seperti perubahan status pengajuan, proses verifikasi, hingga tahap pembayaran oleh pihak finance. Keterlibatan penulis dalam keseluruhan siklus pengembangan memberikan pengalaman langsung dalam membangun antarmuka sistem yang tidak hanya berfungsi secara teknis, tetapi juga selaras dengan kebutuhan operasional nyata perusahaan (Hidayatun et al., **2023**). Seluruh proses kerja praktek dilaksanakan secara full remote. Koordinasi pengembangan, sinkronisasi endpoint **API**, dan proses debugging dilakukan secara daring melalui workflow kolaboratif berbasis repositori Git. Kondisi ini memberikan pengalaman langsung mengenai pola kerja pengembangan perangkat lunak modern yang tidak bergantung pada kehadiran fisik di satu lokasi, yang merupakan pendekatan yang semakin umum diterapkan pada industri teknologi informasi saat ini.

**BAB** 3. **KEGIATAN** **KERJA** **PRAKTEK** Timeline Kegiatan (Logbook) Tabel 1. Timeline Pekerjaan

Minggu Ke- Kegiatan ### Deskripsi Kegiatan Durasi ### Bukti Dokumentasi Kegiatan Minggu 1 Pengenalan Perusahaan dan Orientasi Melakukan orientasi kerja, memahami struktur organisasi perusahaan, serta mempelajari alur kerja tim pengembangan sistem. Selain itu, mengenal gambaran umum sistem reimbursement internal yang akan dikembangkan. 3 Hari

Minggu 2
### Analisis Kebutuhan Sistem
Mengidentifikasi kebutuhan sistem dari sisi pengguna (staff, admin, finance), khususnya terkait tampilan antarmuka dan alur interaksi. Melakukan diskusi dengan tim backend untuk memahami struktur data dan endpoint **API**.
4 Hari
1. ## Minggu 3
Desain Sistem dan Alur Kerja
Membuat desain awal antarmuka (wireframe) dan alur interaksi pengguna, termasuk flow pengajuan reimbursement, validasi data, serta perubahan status pengajuan.
4 Hari
1. framework admin section
2. framework finance section
3. framework staff section
4. link prototype UI UX figma

Minggu 4
Setup Proyek Front-End
Melakukan inisialisasi proyek menggunakan Vue.js, konfigurasi struktur folder, serta setup environment dan integrasi awal dengan **API** backend Laravel.
5 Hari
1. setup vue
2. setup npm
3. struktur proyek
Minggu 5
### Pengembangan Form Pengajuan
Mengimplementasikan halaman form pengajuan reimbursement yang mencakup input kategori, nominal, tanggal transaksi, serta fitur upload bukti pembayaran.
5 Hari

github Minggu 6 ### Pengembangan Halaman List Data Membangun halaman daftar reimbursement dengan menampilkan data secara dinamis dari **API**, termasuk informasi status pengajuan dan detail data. 5 Hari

github
Minggu 7
Implementasi Role-Based Interface
Menyesuaikan tampilan dan fitur berdasarkan role pengguna (staff, admin, finance), termasuk pengaturan akses terhadap fitur tertentu.
4 Hari
1. dashboard staff
2. dashboard finance
3. dashboard admin
Minggu 8
Integrasi **API**
Mengintegrasikan front-end dengan backend menggunakan **REST** **API** untuk proses pengambilan data, pengiriman data pengajuan, serta update status reimbursement.
5 Hari

Minggu 9
### Pengembangan Fitur Interaktif
Menambahkan fitur interaktif seperti modal upload bukti transfer, validasi input form, notifikasi status, serta handling error pada input pengguna.
4 Hari
1. interactive
Minggu 10
Testing dan Debugging
Melakukan pengujian awal fungsi antarmuka pada sisi front-end, mengidentifikasi dan memperbaiki bug yang ditemukan selama proses integrasi **API**, serta memverifikasi kesesuaian alur antarmuka dengan kebutuhan bisnis yang telah didefinisikan. 
5 Hari
testing dengan user
Minggu 11
Penyempurnaan UI/UX
Melakukan perbaikan dan penyesuaian tampilan antarmuka berdasarkan hasil pengujian awal, meningkatkan responsivitas komponen, serta menyempurnakan alur interaksi pengguna agar lebih intuitif sesuai dengan feedback yang diperoleh selama proses pengembangan. 
4 Hari
on going
Minggu 12
Dokumentasi dan Penyusunan Laporan
Menyusun dokumentasi teknis dan laporan kerja praktek berdasarkan seluruh aktivitas pengembangan yang telah dilaksanakan. Dokumentasi mencakup arsitektur sistem, alur bisnis, serta implementasi antarmuka yang telah dikerjakan selama periode kerja praktek. Pengembangan sistem sendiri masih berlanjut dan akan terus disempurnakan hingga batas waktu yang telah ditentukan. 
4 Hari
on going

### Deskripsi Pekerjaan

Selama pelaksanaan kerja praktek di PT. Ilab Solusi Pratama, penulis berperan sebagai Front-End Developer yang bertanggung jawab dalam pengembangan antarmuka ReimburseKu, sistem informasi reimbursement internal berbasis webs. Fokus utama pekerjaan tidak hanya pada tampilan visual, tetapi juga memastikan bahwa setiap interaksi yang dilakukan pengguna benar-benar merepresentasikan alur bisnis yang berjalan di perusahaan. Pada tahap awal, penulis mempelajari terlebih dahulu bagaimana proses reimbursement dilakukan secara nyata, mulai dari pengajuan oleh staff, proses verifikasi, hingga tahap pencairan oleh pihak finance. Pemahaman ini menjadi dasar dalam merancang alur antarmuka agar tidak sekadar “berfungsi”, tetapi juga terasa logis dan mudah digunakan oleh masing-masing peran. Dalam implementasinya, penulis mengembangkan beberapa fitur utama, seperti halaman pengajuan reimbursement yang memungkinkan pengguna mengisi data transaksi secara lengkap serta mengunggah bukti pembayaran. Selain itu, penulis juga membangun halaman daftar reimbursement yang menampilkan data secara dinamis, termasuk status pengajuan yang terus berubah sesuai proses di backend. Penulis juga menangani penyesuaian tampilan berdasarkan role pengguna (staff, admin, dan finance). Setiap role memiliki kebutuhan yang berbeda, sehingga diperlukan pengaturan akses dan tampilan yang tidak hanya berbeda secara visual, tetapi juga dari sisi interaksi dan fitur yang tersedia. Selama proses pengembangan, penulis secara aktif melakukan integrasi dengan backend berbasis Laravel melalui **REST** **API**. Hal ini mencakup pengumpulan data, pengiriman data pengajuan, serta penanganan response dari server. Dalam praktiknya, penulis juga menghadapi beberapa kendala seperti data yang tidak sinkron, error pada response **API**, serta validasi input yang belum optimal, yang kemudian diselesaikan melalui proses debugging dan diskusi dengan tim backend. Di tahap akhir, penulis melakukan penyempurnaan pada sisi tampilan dan interaksi, seperti memperbaiki struktur komponen, meningkatkan responsivitas, serta menambahkan validasi dan feedback kepada pengguna. Proses ini dilakukan agar sistem tidak hanya berjalan dengan baik secara teknis, tetapi juga nyaman digunakan dalam aktivitas sehari-hari.

Tools dan Teknologi Dalam pengembangan front-end sistem informasi reimbursement ini, penulis menggunakan beberapa tools dan teknologi sebagai berikut: JavaScript Digunakan sebagai bahasa pemrograman utama dalam membangun logika aplikasi pada sisi client. Vue.js Digunakan sebagai framework front-end untuk membangun antarmuka berbasis komponen yang terstruktur, modular, dan reaktif terhadap perubahan data. **REST** **API** (Laravel) Digunakan sebagai media komunikasi antara front-end dan backend untuk proses pengambilan data, pengiriman data pengajuan, serta update status reimbursement. ### Visual Studio Code Digunakan sebagai code editor utama dalam proses pengembangan. Git Digunakan untuk version control dalam mengelola perubahan kode serta mendukung kolaborasi dengan tim. ### Browser Developer Tools Digunakan untuk proses debugging, khususnya dalam memeriksa request **API**, response data, serta error pada sisi client.

**BAB** 4. **HASIL** **DAN** **PEMBELAJARAN** **TEKNIS**

4.1 Hasil Pekerjaan Hasil utama dari pelaksanaan Kerja Praktek ini adalah pengembangan antarmuka sistem ReimburseKu berbasis web yang digunakan sebagai platform manajemen klaim biaya karyawan di lingkungan internal perusahaan. Pengembangan difokuskan pada sisi frontend menggunakan Vue 3 dengan pendekatan Single Page Application untuk mendukung proses pengajuan, verifikasi, persetujuan, hingga pembayaran reimbursement secara digital dan terintegrasi. Seluruh proses Kerja Praktik dilaksanakan secara full remote sehingga koordinasi pengembangan dilakukan secara daring bersama tim backend dan pihak perusahaan. Proses sinkronisasi fitur, integrasi **REST** **API**, debugging, serta evaluasi tampilan antarmuka dilakukan melalui workflow kolaboratif berbasis repository Git dan tools manajemen task internal perusahaan. Kondisi ini memberikan pengalaman langsung mengenai pola kerja pengembangan perangkat lunak modern yang tidak bergantung pada kehadiran fisik dalam satu lokasi kerja. Pengembangan sistem ReimburseKu masih terus berlanjut hingga akhir periode kerja praktek, dengan fokus pada penyempurnaan fitur dan pengujian menyeluruh bersama tim backend Role staf pada sistem berfungsi sebagai pengaju reimbursement melalui halaman ReimbursementAddView.vue yang digunakan untuk menginput data transaksi, kategori biaya, nominal pengeluaran, serta unggah bukti pembayaran. Role finance menggunakan halaman ReimbursementView.vue untuk melakukan verifikasi administrasi, persetujuan klaim, dan proses pembayaran reimbursement.  Sementara itu, role admin menggunakan modul dashboard dan monitoring untuk mengawasi aktivitas sistem serta pengelolaan data master perusahaan. Pengembangan frontend juga menitikberatkan pada keterbacaan antarmuka, konsistensi navigasi, dan responsivitas tampilan agar sistem tetap nyaman digunakan dalam aktivitas operasional harian perusahaan. 4.2 Penjelasan Teknis Software Engineering 4.2.1 Arsitektur Sistem ReimburseKu dibangun menggunakan arsitektur client-server dengan pemisahan tanggung jawab yang jelas antara frontend dan backend. Sisi frontend dikembangkan menggunakan Vue 3 dengan Vite sebagai build tool utama untuk mendukung proses development yang lebih ringan dan cepat. Struktur aplikasi menggunakan pendekatan Single Page Application sehingga proses perpindahan halaman tidak memerlukan reload penuh pada browser. Seluruh komponen antarmuka dikembangkan menggunakan Composition **API** untuk memisahkan state, reactive data, lifecycle hook, dan fungsi logika ke dalam struktur yang lebih modular. Pendekatan ini digunakan agar komponen lebih mudah dipelihara ketika terjadi penambahan fitur atau proses refactoring pada tahap pengembangan berikutnya. Frontend berkomunikasi dengan Laravel **REST** **API** menggunakan library Axios melalui format pertukaran data **JSON**. Seluruh request seperti login, pengambilan data reimbursement, pengiriman formulir klaim, perubahan status reimbursement, dan validasi hak akses dilakukan secara asynchronous melalui endpoint backend yang telah disediakan oleh tim backend.

Gambar 4.1 Arsitektur Sistem ReimburseKu

Berdasarkan diagram arsitektur di atas, browser pengguna akan mengakses frontend Vue.js yang kemudian melakukan request data ke Laravel **REST** **API** melalui protokol **HTTP**. Backend bertugas melakukan validasi request, pengolahan data reimbursement, serta autentikasi pengguna, sebelum mengirimkan response dalam format **JSON** kembali ke frontend. Response tersebut kemudian diolah dan ditampilkan pada antarmuka pengguna secara dinamis sesuai dengan role yang sedang aktif. 4.2.2 Desain Sistem dan Alur Bisnis Desain sistem dibuat dengan menyesuaikan kebutuhan reimbursement internal perusahaan yang melibatkan beberapa role pengguna dengan hak akses yang berbeda. Setiap role memiliki halaman dan fitur yang berbeda agar proses bisnis dapat berjalan lebih terstruktur serta meminimalkan kesalahan akses terhadap fitur tertentu. Gambaran umum mengenai hak akses dan fitur utama untuk masing masing role disajikan pada Tabel berikut.

Tabel 4.1 Hak Akses dan Fitur Utama Berdasarkan Role Role ### Akses Halaman ### Fitur Utama Staff Dashboard, Reimbursement, Profil, Cetak Struk Mengajukan klaim reimbursement, memantau riwayat dan status pengajuan, mengekspor laporan dalam format **PDF** dan Excel Finance Dashboard, Reimbursement, Karyawan, Deposit, Arsip Melakukan verifikasi, persetujuan, dan pembayaran reimbursement, serta mengelola deposit kas Admin Dashboard, Karyawan, Kategori, Deposit, Hak Akses, Metode Bayar Mengelola data master karyawan, kategori, metode pembayaran, dan memantau aktivitas sistem

Sebelum melakukan implementasi, dilakukan tahap perancangan wireframe dan prototype antarmuka menggunakan Figma untuk masing-masing role pengguna (staff, admin, dan finance). Wireframe ini berfungsi sebagai acuan awal dalam menentukan struktur tata letak, navigasi, serta elemen interaktif sebelum dikembangkan menjadi komponen Vue.js pada tahap implementasi.

Gambar 4.2 Wireframe Sistem reimburseKu Role staf menggunakan halaman ReimbursementAddView.vue untuk melakukan pengajuan reimbursement. Pada halaman tersebut pengguna diwajibkan mengisi informasi seperti judul klaim, kategori pengeluaran, nominal transaksi, tanggal transaksi, serta mengunggah bukti pembayaran sebelum data dikirim ke backend. Data reimbursement yang berhasil dikirim akan disimpan dengan status awal “Menunggu”.Selanjutnya role finance melakukan verifikasi melalui halaman ReimbursementView.vue. Halaman ini menjadi pusat eksekusi reimbursement karena seluruh proses persetujuan dan pembayaran dilakukan melalui satu antarmuka utama.

Gambar 4.3 Use Case Diagram Reimgram SistemburseKu

Use case diagram di atas menunjukkan hubungan antara role staf, finance, dan admin terhadap fitur utama pada sistem reimbursement. Role staf hanya memiliki akses terhadap proses pengajuan dan monitoring riwayat klaim, sedangkan role finance memiliki akses terhadap proses validasi dan pembayaran reimbursement. Role admin digunakan untuk pengawasan sistem dan pengelolaan data master perusahaan.

Gambar 4.4 Activity Diagram Proses Reimbursement

Activity diagram di atas menggambarkan alur proses reimbursement dimulai dari penginputan data oleh staf hingga tahap pembayaran oleh bagian finance. Setiap perubahan status reimbursement dilakukan secara dinamis dan langsung diperbarui pada dashboard pengguna tanpa perlu refresh halaman. Untuk memperjelas logika perubahan status reimbursement, sistem juga divisualisasikan menggunakan flowchart proses approval dan pembayaran.

Gambar 4.5 Flowchart Proses Approval dan Pembayaran

Flowchart tersebut memperlihatkan bahwa proses reimbursement berjalan melalui dua tahap utama yaitu persetujuan administratif dan pembayaran reimbursement. Sistem membedakan kedua proses tersebut berdasarkan keberadaan file bukti transfer pada modal konfirmasi di halaman ReimbursementView.vue. 4.2.3 Implementasi Logika Keputusan Dinamis pada Modul Keuangan Implementasi logika utama pada modul keuangan dikembangkan di dalam berkas ReimbursementView.vue melalui fungsi confirmAction. Fungsi ini dirancang untuk menyederhanakan proses eksekusi reimbursement dengan memanfaatkan satu tombol aksi yang mampu menangani dua kondisi berbeda secara dinamis. Ketika finance membuka modal konfirmasi proses reimbursement, sistem akan memeriksa apakah variabel fileBukti memiliki lampiran file atau tidak. Jika file bukti transfer tersedia, maka sistem secara otomatis menjalankan proses pelunasan reimbursement dengan mengubah status klaim menjadi “dibayar”. Pada kondisi tersebut modal konfirmasi akan ditutup dan sistem menampilkan modal sukses sebagai indikator bahwa proses pembayaran telah selesai dilakukan. Sebaliknya, apabila proses dilakukan tanpa lampiran file bukti transfer, sistem hanya akan mengubah status reimbursement menjadi “disetujui”. Kondisi ini digunakan untuk menandai bahwa proses validasi administratif telah selesai dilakukan oleh bagian finance namun proses transfer dana masih belum dieksekusi. Pendekatan ini digunakan untuk mengurangi kompleksitas antarmuka karena pengguna tidak perlu berhadapan dengan banyak tombol aksi yang berbeda untuk setiap kondisi reimbursement. Seluruh proses approval dan pembayaran dapat dijalankan melalui satu alur interaksi yang lebih sederhana dan efisien.

Gambar 4.6 Sequence Diagram Pengajuan Reimbursement

Sequence diagram di atas menunjukkan proses komunikasi antara frontend dan backend ketika pengguna melakukan pengajuan reimbursement melalui halaman ReimbursementAddView.vue. Frontend mengirimkan request data ke backend menggunakan Axios sebelum backend melakukan validasi dan penyimpanan data ke database. Gambar 4.7 Sequence Diagram Approval dan Pembayaran

Pada sequence diagram approval dan pembayaran di atas, halaman ReimbursementView.vue mengirimkan request perubahan status reimbursement ke backend berdasarkan kondisi fileBukti. Backend kemudian melakukan update status reimbursement sebelum response terbaru dikirim kembali ke frontend untuk diperbarui secara real-time pada dashboard pengguna. 4.2.4 Algoritma Penyaringan Data Reaktif Penyaringan data reimbursement pada dashboard diimplementasikan menggunakan computed properties Vue 3 yang bekerja secara reaktif terhadap perubahan input pencarian pengguna. Logika ini digunakan untuk mempermudah proses pencarian data reimbursement tanpa perlu melakukan request tambahan ke backend. Algoritma filtering bekerja dengan mengevaluasi isi variabel pencarian lalu membandingkannya terhadap properti nama dan judul pada array daftarReimburse. Seluruh proses filtering dilakukan di sisi client sehingga pencarian dapat berlangsung lebih cepat dan responsif. Pendekatan reactive filtering dipilih karena jumlah data reimbursement yang ditampilkan pada dashboard relatif masih dapat diproses secara optimal oleh browser tanpa memberikan beban tambahan pada server backend. 4.2.5 Cuplikan Logika Program Berikut merupakan implementasi logika utama pada proses penentuan status reimbursement di halaman ReimbursementView.vue (modul Finance), pada fungsi confirmAction: const confirmAction = async () => { if (!selectedItem.value) return

    if (isMandatory.value && !proofFile.value) {
    // Validasi wajib unggah bukti transfer
    return
    }

    if (proofFile.value) {
    // Proses Pembayaran (Bayar)
    const formData = new FormData()
    formData.append('status', '**APPROVED**')
    formData.append('transfer_receipt', proofFile.value)

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)
    selectedItem.value.status = 'dibayar'
    } else {
    // Proses Persetujuan (Setuju)
    const formData = new FormData()
    formData.append('status', '**APPROVED**')

    await ApiService.actionApproveOrReject(selectedItem.value.approvalId, formData)
    selectedItem.value.status = 'disetujui'
    }
}
Logika tersebut menjadi bagian penting pada sistem karena menentukan jalur proses reimbursement berdasarkan keberadaan lampiran bukti transfer, sekaligus langsung memperbarui status melalui pemanggilan endpoint actionApproveOrReject pada ApiService. 
4.2.6 Pengujian Sistem
Pengujian sistem dilakukan menggunakan metode White Box Testing yang berfokus pada logika internal kode program, alur kondisional, serta struktur implementasi pada sisi frontend. Mengingat lingkup kerja praktek penulis terbatas pada pengembangan frontend, pengujian dilakukan dengan menelusuri jalur eksekusi pada fungsi fungsi utama di sisi client tanpa menguji logika internal pada backend. Backend hanya diperlakukan sebagai endpoint yang dipanggil melalui ApiService, dan responnya digunakan untuk memverifikasi bahwa jalur kode frontend berjalan sesuai harapan. Hasil pengujian disajikan pada Tabel 4.2 berikut.

		Tabel 4.2 Hasil Pengujian White Box (Frontend)
No
Modul / Fungsi
Kondisi yang Diuji
### Jalur Eksekusi
Hasil yang Diharapkan
### Hasil Aktual
1
confirmAction pada ReimbursementView.vue (Finance)
File bukti transfer tersedia
Sistem mengirim status **APPROVED** beserta transfer_receipt melalui actionApproveOrReject
Status berubah menjadi dibayar dan modal sukses ditampilkan
Sesuai
2
confirmAction pada ReimbursementView.vue (Finance)
File bukti transfer tidak tersedia dan isMandatory bernilai false
Sistem mengirim status **APPROVED** tanpa file melalui actionApproveOrReject
Status berubah menjadi disetujui
Sesuai
3
Validasi unggah wajib pada confirmAction
isMandatory bernilai true dan file bukti transfer tidak tersedia
Validasi gagal, animasi peringatan ditampilkan, dan proses dibatalkan
Proses dibatalkan, status tidak berubah, dan peringatan ditampilkan kepada pengguna
Sesuai
4
Penyaringan data reaktif (filteredItems)
Kata kunci pencarian diisi pada kolom pencarian
Sistem menyaring data reimbursement berdasarkan nama karyawan dan judul pengajuan
Tabel menampilkan data yang sesuai dengan kata kunci pencarian
Sesuai
5
mapStatusToFrontend pada utils/format.js
Status backend berupa **PENDING**, **APPROVED**, **REJECTED**, atau **PAID**
Sistem memetakan status backend ke label frontend yang sesuai
Label status pada antarmuka sesuai dengan status dari backend
Sesuai
6
Pembatasan akses berdasarkan role
Pengguna dengan role staff mengakses halaman admin secara langsung melalui **URL**
Sistem melakukan pengecekan role dan menolak akses ke halaman tersebut
Halaman admin tidak dapat diakses oleh pengguna dengan role staff
Sesuai
7
tolakAction pada ReimbursementView.vue (Finance)
Finance menolak pengajuan dengan status menunggu
Sistem mengirim status **REJECTED** beserta alasan penolakan melalui actionApproveOrReject
Status berubah menjadi ditolak dan notifikasi berhasil ditampilkan
Sesuai
8
Validasi formulir pengajuan pada ReimbursementAddView.vue
Salah satu field wajib seperti kategori, tanggal, total, atau file tidak diisi
Sistem memeriksa setiap field, mengumpulkan pesan kesalahan, dan menampilkan peringatan
Formulir tidak dapat dikirim dan pesan kesalahan ditampilkan sesuai field yang kosong
Sesuai

Berdasarkan hasil pengujian pada Tabel 4.2, seluruh jalur kondisional pada fungsi fungsi utama di sisi frontend berjalan sesuai dengan logika yang dirancang. 4.3 Kendala dan Solusi Strategis Kendala teknis utama selama proses pengembangan adalah ketidakkonsistenan penamaan komponen, route, dan variabel pada struktur frontend project. Sebagian file masih menggunakan campuran Bahasa Inggris dan Bahasa Indonesia sehingga menyebabkan proses maintenance dan debugging menjadi lebih sulit dilakukan. Masalah tersebut muncul karena pada tahap awal pengembangan belum terdapat standarisasi naming convention yang digunakan secara konsisten antar anggota tim. Seiring bertambahnya jumlah fitur dan halaman, struktur project berkembang secara kurang terorganisir. Permasalahan tersebut diatasi melalui proses naming audit dan refactoring menyeluruh terhadap struktur frontend. Penulis melakukan penyesuaian nama route pada router/index.js, merapikan struktur folder pada direktori src/views, serta menyelaraskan penamaan variabel dan komponen agar lebih konsisten dan mudah dipahami. Kendala lain yang cukup berpengaruh adalah proses pengembangan yang dilakukan secara full remote. Koordinasi debugging dan sinkronisasi perubahan endpoint **API** harus dilakukan secara daring bersama tim backend sehingga diperlukan komunikasi yang cukup intensif untuk menghindari konflik integrasi fitur. 4.4 Analisis dan Evaluasi Sejauh tahap pengembangan yang telah dicapai, sistem ReimburseKu menunjukkan potensi yang baik dalam menyederhanakan proses reimbursement internal perusahaan melalui integrasi proses persetujuan dan pembayaran di dalam satu antarmuka utama. Penggunaan pendekatan reactive state pada Vue 3 memungkinkan perubahan data ditampilkan secara real-time sehingga pengalaman pengguna menjadi lebih responsif. Kelebihan utama sistem terletak pada struktur antarmuka yang cukup ringkas dan efisien dalam menangani alur reimbursement bertahap. Penggunaan logika keputusan dinamis pada halaman ReimbursementView.vue juga berhasil mengurangi redudansi aksi dan mempercepat proses kerja bagian finance. Dari sisi maintainability, proses refactoring dan standarisasi naming convention memberikan dampak positif terhadap keterbacaan kode dan kemudahan pengembangan fitur lanjutan. Keterbatasan sistem saat ini terletak pada ketergantungan frontend terhadap backend untuk proses pembuatan dokumen laporan reimbursement dalam format **PDF** atau Excel. Sistem juga belum memiliki fitur notifikasi real-time berbasis websocket sehingga pembaruan status masih bergantung pada proses request ulang data dari frontend. Selain itu, pengujian end-to-end secara menyeluruh belum dapat dilaksanakan pada periode kerja praktek ini mengingat pengembangan sistem masih dalam tahap aktif hingga akhir periode kerja praktek. 4.5 Pembelajaran yang Diperoleh Pelaksanaan Kerja Praktik ini memberikan pengalaman langsung mengenai pengembangan frontend aplikasi berbasis Vue 3 dalam skala project nyata. Penulis memperoleh pemahaman yang lebih mendalam mengenai penggunaan Composition **API**, reactive state management, integrasi **REST** **API**, serta proses debugging asynchronous request menggunakan browser developer tools. Pengalaman melakukan refactoring struktur frontend juga memberikan pemahaman mengenai pentingnya clean code dan konsistensi naming convention dalam pengembangan perangkat lunak tingkat industri. Melalui sistem kerja full remote, penulis juga memperoleh pengalaman mengenai pola kolaborasi modern dalam pengembangan software yang menuntut koordinasi teknis secara daring, sinkronisasi repository Git, serta komunikasi yang efektif antara frontend developer dan backend developer selama proses integrasi sistem berlangsung.

**BAB** 5. **PENUTUP** 5.1 Kesimpulan Pelaksanaan Kerja Praktek di PT. Ilab Solusi Pratama telah memberikan pengalaman nyata dalam pengembangan perangkat lunak berbasis web di lingkungan industri. Selama periode kerja praktek, penulis berperan sebagai Front-End Developer dalam membangun antarmuka sistem ReimburseKu, sebuah platform manajemen reimbursement internal perusahaan berbasis web. Beberapa hal yang dapat disimpulkan dari pelaksanaan kerja praktek ini adalah sebagai berikut: Implementasi frontend berhasil dilaksanakan menggunakan Vue.js dengan pendekatan Single Page Application (**SPA**), mencakup halaman pengajuan reimbursement, daftar klaim, serta tampilan yang disesuaikan berdasarkan role pengguna (staff, admin, dan finance). Integrasi dengan backend Laravel melalui **REST** **API** berhasil dilakukan secara asynchronous menggunakan Axios, mencakup proses pengambilan data, pengiriman formulir klaim, serta pembaruan status reimbursement secara real-time. Penerapan role-based interface berhasil diimplementasikan, di mana setiap role pengguna memiliki tampilan dan hak akses yang berbeda sesuai dengan alur bisnis reimbursement yang berjalan di perusahaan. Pengembangan sistem dilaksanakan secara full remote, memberikan pengalaman langsung mengenai pola kolaborasi modern dalam pengembangan perangkat lunak, termasuk sinkronisasi melalui Git dan koordinasi teknis antara frontend dan backend secara daring. Pemahaman teknis yang diperoleh selama kerja praktek meliputi penggunaan Composition **API** pada Vue 3, reactive state management, penanganan asynchronous request, serta proses debugging menggunakan browser developer tools. 5.2 Saran Berdasarkan pengalaman selama pelaksanaan kerja praktek, penulis menyampaikan beberapa saran sebagai berikut: Untuk Perusahaan (PT. Ilab Solusi Pratama): Penambahan fitur notifikasi real-time berbasis WebSocket perlu dipertimbangkan untuk pengembangan sistem ReimburseKu ke depannya, sehingga pembaruan status reimbursement dapat langsung diterima oleh pengguna tanpa harus melakukan refresh halaman secara manual. Fitur ekspor laporan dalam format **PDF** atau Excel sebaiknya dikembangkan langsung di sisi frontend agar tidak sepenuhnya bergantung pada backend, sehingga mempercepat proses pelaporan bagi pihak finance dan admin. Standarisasi dokumentasi **API** antara tim frontend dan backend perlu ditingkatkan agar proses integrasi dapat berjalan lebih efisien dan meminimalkan terjadinya miskomunikasi antar tim. Untuk Kegiatan Kerja Praktek ke Depan: Pembekalan awal mengenai workflow kolaborasi antara frontend dan backend sebaiknya diberikan sebelum mahasiswa memulai pengerjaan proyek, terutama bagi mahasiswa yang akan menjalani kerja praktek secara full remote. Penetapan scope pekerjaan yang jelas sejak awal antara mahasiswa, dosen pembimbing, dan pihak perusahaan akan sangat membantu dalam penyusunan laporan, khususnya ketika proyek masih dalam tahap pengembangan saat periode kerja praktek berakhir. Pengenalan tools version control seperti Git secara lebih mendalam dalam kurikulum perkuliahan akan sangat membantu mahasiswa dalam beradaptasi dengan lingkungan kerja industri yang sesungguhnya. **DAFTAR** **PUSTAKA** Fachrurazi, Rukmana, A. Y., Supriyanto, Syamsulbahri, & Iskandar. (**2023**). Revolusi Bisnis di Era Digital: Strategi dan Dampak Transformasi Proses Teknologi terhadap Keunggulan Kompetitif dan Pertumbuhan Organisasi. Jurnal Bisnis Dan Manajemen West Science, 2(03), **297**–**305**. [https://doi.org/10.**58812**/jbmws.v2i03.**563**](https://doi.org/10.**58812**/jbmws.v2i03.**563**) Hidayatun, N., Susafa’ati, S., & Murtina, H. (**2023**). **RANCANG** **BANGUNG** **APLIKASI** E-**REIMBURSEMENT** **BERBASIS** **WEB** **MENGGUNAKAN** **MODEL** **SEKUENSIAL** **LINIER**. Jurnal Digit, 13(2), **112**. [https://doi.org/10.**51920**/jd.v13i2.**347**](https://doi.org/10.**51920**/jd.v13i2.**347**) Khoirurrizal, M. F., Hidayat, C. R., & Ruuhwan, R. (**2024**). **ANALISIS** **PERBANDINGAN** **FRAMEWORK** **FRONT**-**END** **JAVASCRIPT** **SOLIDJS** **DAN** **VUEJS** **PADA** **PENGEMBANGAN** **WEBSITE** **INTERAKTIF**. Jurnal Informatika Dan Teknik Elektro Terapan, 12(2). [https://doi.org/10.**23960**/jitet.v12i2.**4106**](https://doi.org/10.**23960**/jitet.v12i2.**4106**) Pakpahan, R., Fitriyani, Y., & Kholik, A. (**2025**). **PERANCANGAN** **SISTEM** **KLAIM** **REIMBURSEMENT** **BERBASIS** **WEB** **UNTUK** **MENINGKATKAN** **SEMANGAT** **KERJA** **KARYAWAN** **PADA** **PERUSAHAAN**. Journal of Information System, Informatics and Computing, 9(1), 92. [https://doi.org/10.**52362**/jisicom.v9i1.**1916**](https://doi.org/10.**52362**/jisicom.v9i1.**1916**) Rahman, F., Samsudin, A. R., Islam, R., & Sunardi, S. (**2024**). Pengembangan Website **UMKM** Desa Teniga dengan Laravel dan Vue.js. Jurnal Pendidikan Dan Teknologi Indonesia, 4(12), **597**–**602**. [https://doi.org/10.**52436**/1.jpti.**510**](https://doi.org/10.**52436**/1.jpti.**510**) **LAMPIRAN** Lampiran ## Surat Pengantar KP dari Kampus ## WISNU WIDYA PRADANA (1).pdf

Lampiran 2. Surat Keterangan Selesai Magang Surat Keterangan Selesai Magang - Wisnu Widya Pradana.pdf

Cek Template atau boleh menyesuaikan dengan surat dari industri : **LINK** Lampiran 3. Nilai KP dari Industri yang ditandatangani oleh supervisor dan stempel perusahaan cap basah Formulir Penilaian Mahasiswa -Wisnu Widya Pradana.pdf

(Nilai discan dan di insert ke dalam laporan KP) - Lihat template Formulir Penilaian Kerja Praktek melalui **LINK**

Lampiran 4. Sertifikat Pelaksanaan KP yang dikeluarkan oleh Perusahaan(Optional) Sertifikat Magang - Wisnu Widya pradana.pdf

Lampiran 5. Surat Implementation Agreement yang sudah ditandatangani oleh Perusahaan Cek Template pada **LINK** Lampiran 6 : Dokumentasi Pelaksanaan KP berupa foto dan Video (upload di Folder Data Master dengan minimal durasi 15 menit) – link dituliskan dalam laporan KP - Video Final Yang sudah Siap Upload di Youtube Prodi Maksimal 15 Menit - Berisi Rangkaian Kegiatan KP yang sudah Terlaksana Lampiran 7. Bukti Pendaftaran **HAKI**

Format Penulisan : Cover (Halaman Sampul) Font: Times New Roman Ukuran Font: 14 Spasi: 1.5 (untuk teks) Margin: 1 inci di semua sisi Penempatan Teks: Di tengah halaman (vertikal dan horizontal)

### Halaman Pengesahan

Font: Times New Roman Ukuran Font: 12 Spasi: 1.5 (untuk teks) Margin: 1 inci di semua sisi Penempatan Teks: Diatur sesuai dengan ketentuan pengesahan dari universitas.

Abstrak Font: Times New Roman Ukuran Font: 11, italic/miring Spasi: 1 Margin: 1 inci di semua sisi Penempatan Teks: Kiri, rata kiri-kanan

Daftar Isi, Daftar Tabel, Daftar Gambar Font: Times New Roman Ukuran Font: 10 Spasi: 1 Margin: 1 inci di semua sisi Penempatan Teks: Rata kiri-kanan

Bab 1 s.d Bab 5 Font: Times New Roman Ukuran Font: 12 Spasi: 1.5 Margin: 1 inci di semua sisi Penempatan Teks: Rata kiri-kanan

### Daftar Pustaka

Font: Times New Roman Ukuran Font: 12 Spasi: 1 Margin: 1 inci di semua sisi Penempatan Teks: Rata kiri-kanan Format : **APA**