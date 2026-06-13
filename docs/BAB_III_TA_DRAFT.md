# BAB III METODE PENELITIAN

## 3.1 Pendekatan Penelitian

Pendekatan penelitian yang digunakan dalam pengembangan website pencari kerja terintegrasi di Dinas Ketenagakerjaan Kabupaten Cirebon adalah penelitian pengembangan atau Research and Development (R&D) dengan pendekatan deskriptif kualitatif. Pendekatan ini dipilih karena penelitian berfokus pada proses analisis kebutuhan, perancangan, pembangunan, pengujian, dan evaluasi prototype sistem informasi rekrutmen digital berbasis web.

Pendekatan deskriptif kualitatif digunakan untuk menggambarkan kondisi sistem rekrutmen yang berjalan, kebutuhan pengguna, alur proses bisnis, rancangan sistem, serta kelayakan fungsi prototype yang dikembangkan. Data penelitian tidak dianalisis menggunakan perhitungan statistik sebagai fokus utama, melainkan dijelaskan secara deskriptif berdasarkan hasil observasi, wawancara, studi dokumentasi, dan pengujian sistem.

Gambar 3.1.1 Model Analisis Data Kualitatif Deskriptif

Berdasarkan Gambar 3.1.1, proses analisis data kualitatif deskriptif dilakukan melalui tahapan pengumpulan data, reduksi data, penyajian data, serta verifikasi atau penarikan kesimpulan. Pengumpulan data dilakukan untuk memperoleh informasi terkait proses rekrutmen, kebutuhan pengguna, kendala sistem berjalan, dan data yang diperlukan dalam pengembangan sistem. Data tersebut diperoleh melalui observasi, wawancara, dokumentasi, dan pengujian prototype.

Tahap reduksi data dilakukan dengan menyeleksi dan mengelompokkan data yang relevan dengan kebutuhan sistem. Data yang tidak berhubungan langsung dengan fokus penelitian disisihkan, sedangkan data yang penting digunakan sebagai dasar penentuan fitur utama sistem, seperti pengelolaan profil pencari kerja, pengelolaan perusahaan, informasi lowongan, pengajuan lamaran, pemantauan status lamaran, penjadwalan wawancara, AI sorter, serta pengelolaan data oleh administrator.

Tahap penyajian data dilakukan dengan menyusun data hasil analisis ke dalam bentuk uraian deskriptif, tabel kebutuhan sistem, analisis sistem berjalan, analisis kebutuhan data, rancangan alur proses, use case diagram, entity relationship diagram, dan dokumentasi hasil pengujian. Penyajian data bertujuan untuk memudahkan pemahaman hubungan antara kebutuhan pengguna, permasalahan sistem berjalan, dan fitur yang dikembangkan pada prototype.

Tahap verifikasi atau penarikan kesimpulan dilakukan dengan menilai kesesuaian antara hasil analisis kebutuhan, implementasi prototype, dan hasil pengujian sistem. Kesimpulan penelitian ditarik berdasarkan kemampuan sistem dalam menjawab kebutuhan pengguna, menyusun proses rekrutmen menjadi lebih terstruktur, serta mendukung pemantauan data rekrutmen secara lebih transparan.

Penelitian ini tidak bertujuan untuk membandingkan kinerja website lama dan website baru secara kuantitatif karena sistem yang dikembangkan masih berupa prototype dan belum digunakan sebagai sistem resmi operasional. Oleh karena itu, evaluasi penelitian difokuskan pada kesesuaian fungsi sistem dengan kebutuhan pengguna, keteraturan alur proses rekrutmen, kemudahan pemantauan status lamaran, dan kelayakan fungsi sistem berdasarkan hasil pengujian.

Pendekatan penelitian ini diimplementasikan menggunakan metode System Development Life Cycle (SDLC) dengan model prototyping. Model prototyping dipilih karena memungkinkan proses pengembangan sistem dilakukan secara bertahap, mulai dari analisis kebutuhan, perancangan sistem, implementasi prototype, pengujian, hingga evaluasi. Melalui model ini, sistem dapat dikembangkan berdasarkan kebutuhan pengguna dan dapat disempurnakan apabila ditemukan kekurangan pada tahap pengujian.

Gambar 3.1.2 Metode SDLC Model Prototyping

Penerapan SDLC pada penelitian ini mencakup tahapan analisis kebutuhan, perancangan sistem, implementasi, pengujian, dan evaluasi. Tahap analisis kebutuhan dilakukan untuk mengidentifikasi permasalahan pada proses rekrutmen, seperti belum terintegrasinya data pencari kerja, perusahaan, lowongan, lamaran, dan status seleksi. Tahap perancangan dilakukan dengan menyusun model sistem, struktur data, rancangan antarmuka, dan alur proses. Tahap implementasi dilakukan dengan membangun prototype menggunakan teknologi Next.js, Node.js, Prisma ORM, PostgreSQL, Supabase, dan Vercel.

Selain fitur utama rekrutmen digital, prototype ini dilengkapi dengan fitur AI sorter sebagai alat bantu penyaringan awal pelamar. Fitur ini bekerja dengan mencocokkan CV pelamar terhadap kebutuhan lowongan kerja melalui API eksternal berbasis kecerdasan buatan. Hasil pencocokan ditampilkan dalam bentuk persentase kecocokan, status rekomendasi, dan daftar keahlian yang sesuai. Fitur ini tidak digunakan sebagai penentu akhir keputusan seleksi, melainkan sebagai pendukung perusahaan dalam meninjau kandidat secara lebih cepat dan terarah.

Secara keseluruhan, pendekatan deskriptif kualitatif membantu peneliti memahami kebutuhan sistem secara mendalam, sedangkan metode SDLC model prototyping digunakan sebagai tahapan teknis dalam membangun prototype website pencari kerja terintegrasi. Dengan demikian, hasil penelitian diharapkan mampu menghasilkan rancangan sistem yang sesuai dengan kebutuhan Dinas Ketenagakerjaan Kabupaten Cirebon dan mendukung proses rekrutmen tenaga kerja secara lebih terstruktur, transparan, dan efisien.

## 3.2 Subjek Penelitian

Subjek penelitian ini adalah prototype website pencari kerja terintegrasi yang dikembangkan sebagai model usulan sistem rekrutmen digital pada Dinas Ketenagakerjaan Kabupaten Cirebon. Sistem ini dirancang untuk membantu proses penyampaian informasi lowongan kerja, pengelolaan data pencari kerja, pendaftaran dan verifikasi perusahaan, pengiriman lamaran, pemantauan status seleksi, penjadwalan wawancara, penyaringan awal kandidat menggunakan AI sorter, serta pengelolaan data oleh administrator.

Selain sistem yang dikembangkan, subjek penelitian juga mencakup aktor pengguna yang terlibat dalam proses rekrutmen, yaitu pencari kerja, perusahaan atau rekruter, dan Admin Disnaker. Pencari kerja berperan sebagai pengguna yang mencari informasi lowongan, melengkapi profil, mengunggah dokumen, mengirim lamaran, serta memantau status lamaran. Rekruter berperan sebagai pihak perusahaan yang mengelola profil perusahaan, membuat lowongan, melihat pelamar, meninjau hasil AI sorter, memperbarui status lamaran, dan menjadwalkan wawancara. Admin Disnaker berperan sebagai pengelola sistem yang melakukan verifikasi perusahaan, validasi lowongan, pemantauan data pengguna, pengelolaan berita, pengelolaan kontrak, dan pemantauan aktivitas sistem.

Penelitian ini berada pada ranah pengembangan perangkat lunak dan sistem informasi berbasis web. Penelitian bersifat terapan karena menghasilkan prototype sistem yang dapat digunakan sebagai model usulan dalam mendukung digitalisasi layanan ketenagakerjaan, khususnya pada proses rekrutmen tenaga kerja yang lebih terintegrasi.

Tabel 3.2.1 Subjek dan Peran dalam Penelitian

| No | Subjek | Peran dalam Penelitian | Kebutuhan Utama |
| --- | --- | --- | --- |
| 1 | Prototype website pencari kerja | Objek utama yang dirancang, dibangun, dan diuji | Menyediakan sistem rekrutmen digital terintegrasi |
| 2 | Pencari kerja | Pengguna yang mencari dan melamar pekerjaan | Profil, dokumen, lowongan, lamaran, status seleksi, wawancara |
| 3 | Rekruter atau perusahaan | Pengguna yang membuka lowongan dan menyeleksi pelamar | Profil perusahaan, lowongan, pelamar, AI sorter, status lamaran, wawancara |
| 4 | Admin Disnaker | Pengelola dan pengawas sistem | Verifikasi perusahaan, validasi lowongan, monitoring data, audit log |

## 3.3 Instrumen Penelitian

Instrumen penelitian merupakan alat yang digunakan oleh peneliti untuk memperoleh data, mendukung proses analisis, dan mengevaluasi hasil pengembangan sistem. Dalam penelitian bidang Teknik Informatika yang berfokus pada pengembangan sistem informasi, instrumen penelitian tidak hanya berupa kuesioner atau pedoman wawancara, tetapi juga mencakup lembar observasi, dokumentasi teknis, skenario pengujian, dan artefak evaluasi sistem.

Pada penelitian ini, instrumen penelitian digunakan untuk mengidentifikasi kebutuhan sistem, menganalisis permasalahan pada sistem rekrutmen yang berjalan, menyusun kebutuhan data, serta mengevaluasi kelayakan fungsi website pencari kerja terintegrasi yang dikembangkan menggunakan Next.js, Node.js, Prisma ORM, PostgreSQL, Supabase, dan Vercel.

Instrumen penelitian yang digunakan dalam penelitian ini adalah sebagai berikut.

### 3.3.1 Pedoman Wawancara

Pedoman wawancara digunakan untuk menggali informasi terkait kebutuhan sistem, kendala operasional, alur proses rekrutmen, serta harapan pengguna terhadap sistem yang dikembangkan. Wawancara dilakukan secara semi-terstruktur agar peneliti tetap memiliki daftar pertanyaan utama, tetapi masih dapat menggali informasi tambahan sesuai jawaban narasumber.

Informasi yang dikumpulkan melalui wawancara meliputi proses penyampaian lowongan, proses pelamaran, kebutuhan validasi perusahaan, kebutuhan pemantauan status lamaran, kendala pengelolaan data pelamar, serta kebutuhan sistem pendukung untuk membantu proses seleksi awal kandidat.

### 3.3.2 Lembar Observasi Sistem Berjalan

Lembar observasi digunakan untuk mencatat kondisi proses rekrutmen yang berjalan, baik dari sisi pencari kerja, rekruter, maupun admin. Observasi dilakukan untuk memahami alur penyampaian informasi lowongan, pengumpulan data pelamar, pengelolaan status seleksi, penjadwalan wawancara, dan proses pemantauan data rekrutmen.

Hasil observasi digunakan untuk mengidentifikasi titik masalah dalam sistem berjalan, seperti data yang belum terintegrasi, proses validasi yang memerlukan alur lebih jelas, potensi lamaran ganda, keterbatasan monitoring status lamaran, dan belum tersentralnya data rekrutmen dalam satu sistem.

### 3.3.3 Studi Dokumentasi

Studi dokumentasi digunakan untuk menelaah dokumen, catatan, atau data pendukung yang berhubungan dengan pengembangan sistem. Dokumen yang dikaji dapat berupa data lowongan, data perusahaan, data pelamar, dokumen CV, struktur proses rekrutmen, referensi teknis pengembangan aplikasi web, serta dokumentasi kebutuhan fitur sistem.

Dokumentasi teknis seperti catatan bug, error log, hasil debugging, struktur basis data, dan skenario pengujian juga digunakan sebagai bahan evaluasi terhadap stabilitas dan kelayakan fungsi sistem.

### 3.3.4 Skenario Pengujian Black-Box

Skenario pengujian black-box digunakan untuk menguji fungsi utama sistem tanpa melihat struktur kode program. Pengujian dilakukan dengan memberikan input pada fitur tertentu dan membandingkan output sistem dengan hasil yang diharapkan.

Fitur yang diuji meliputi registrasi, login, pengelolaan profil, verifikasi perusahaan, pembuatan lowongan, validasi lowongan, pengiriman lamaran, pencegahan lamaran ganda, perubahan status lamaran, penjadwalan wawancara, AI sorter, pengelolaan kontrak, pengelolaan berita, dan audit log.

### 3.3.5 Kuesioner User Acceptance Testing

Kuesioner User Acceptance Testing (UAT) digunakan apabila penelitian melibatkan pengguna untuk menilai prototype. Aspek yang dinilai meliputi kemudahan penggunaan, kejelasan tampilan, kesesuaian fitur, kemudahan pemantauan proses rekrutmen, dan kebermanfaatan fitur AI sorter sebagai alat bantu penyaringan awal kandidat.

Apabila UAT tidak dilakukan secara formal, evaluasi sistem tetap dapat difokuskan pada pengujian black-box dan analisis kesesuaian fitur terhadap kebutuhan pengguna. Dengan demikian, kuesioner UAT bersifat sebagai instrumen pendukung apabila tersedia responden pengguna dalam tahap evaluasi.

Tabel 3.3.1 Instrumen Penelitian

| No | Instrumen | Tujuan Penggunaan | Output yang Dihasilkan |
| --- | --- | --- | --- |
| 1 | Pedoman wawancara | Menggali kebutuhan dan kendala proses rekrutmen | Daftar kebutuhan pengguna dan masalah sistem berjalan |
| 2 | Lembar observasi | Mengamati alur rekrutmen yang berjalan | Catatan kondisi proses dan permasalahan operasional |
| 3 | Studi dokumentasi | Mengkaji dokumen dan data pendukung | Data kebutuhan sistem dan referensi pengembangan |
| 4 | Skenario black-box | Menguji fungsi utama sistem | Hasil pengujian fitur berdasarkan input dan output |
| 5 | Kuesioner UAT | Menilai penerimaan pengguna terhadap prototype | Tanggapan pengguna terhadap kemudahan dan kesesuaian sistem |

## 3.4 Teknik Pengumpulan Data

Teknik pengumpulan data merupakan langkah penting untuk memperoleh informasi yang dibutuhkan secara sistematis dan akurat. Dalam penelitian ini, teknik pengumpulan data disesuaikan dengan tujuan penelitian, yaitu mengembangkan website pencari kerja terintegrasi sebagai sarana digitalisasi proses rekrutmen di Dinas Ketenagakerjaan Kabupaten Cirebon.

Pengumpulan data dilakukan untuk memahami kondisi sistem yang berjalan, mengidentifikasi permasalahan yang ada, menentukan kebutuhan pengguna, serta mengevaluasi kelayakan fungsi prototype. Teknik pengumpulan data yang digunakan meliputi wawancara, observasi, studi dokumentasi, dan pengujian sistem.

### 3.4.1 Wawancara

Wawancara dilakukan dengan pihak yang berkaitan dengan proses rekrutmen, seperti staf Disnaker, pihak perusahaan, atau rekruter. Teknik ini digunakan untuk menggali informasi mengenai alur rekrutmen yang berjalan, kendala yang dihadapi, kebutuhan pengguna terhadap sistem pencari kerja terintegrasi, serta fitur yang diperlukan untuk mendukung proses rekrutmen digital.

Wawancara dilakukan secara semi-terstruktur dengan menggunakan pedoman pertanyaan. Data yang diperoleh dari wawancara kemudian digunakan untuk memperkuat analisis sistem berjalan dan menentukan kebutuhan fungsional maupun nonfungsional sistem.

### 3.4.2 Observasi

Observasi dilakukan untuk memahami alur proses rekrutmen, mulai dari penyampaian informasi lowongan, proses pelamaran, pengelolaan data pelamar, pemantauan status seleksi, hingga kebutuhan penyaringan awal kandidat. Observasi membantu peneliti mengetahui proses yang masih belum terintegrasi dan bagian yang dapat diperbaiki melalui sistem usulan.

Melalui observasi, peneliti dapat mencatat kondisi faktual yang berkaitan dengan data pencari kerja, data perusahaan, data lowongan, data lamaran, jadwal wawancara, dan kebutuhan monitoring oleh admin.

### 3.4.3 Studi Dokumentasi

Studi dokumentasi dilakukan dengan mengumpulkan dan mengkaji dokumen yang mendukung pengembangan sistem. Dokumen tersebut dapat berupa contoh data lowongan, data perusahaan, data pelamar, dokumen CV, struktur proses rekrutmen, catatan kebutuhan sistem, serta referensi teknis yang berkaitan dengan pengembangan aplikasi web.

Studi dokumentasi juga digunakan untuk mendukung penyusunan rancangan basis data, rancangan fitur, dan kebutuhan pengujian sistem.

### 3.4.4 Pengujian Sistem

Pengujian sistem dilakukan setelah prototype selesai dikembangkan. Pengujian digunakan untuk memperoleh data mengenai keberhasilan fungsi sistem berdasarkan skenario black-box. Hasil pengujian menjadi dasar untuk mengevaluasi kelayakan fungsi sistem, termasuk fitur AI sorter yang digunakan untuk mencocokkan CV pelamar dengan kebutuhan lowongan kerja.

Data hasil pengujian dianalisis secara deskriptif untuk mengetahui apakah sistem telah berjalan sesuai kebutuhan. Jika ditemukan kesalahan atau kekurangan, hasil pengujian digunakan sebagai dasar perbaikan sistem.

Tabel 3.4.1 Teknik Pengumpulan Data

| No | Teknik Pengumpulan Data | Sumber Data | Data yang Diperoleh |
| --- | --- | --- | --- |
| 1 | Wawancara | Staf Disnaker, rekruter, atau pihak terkait | Kebutuhan pengguna, kendala proses, alur rekrutmen |
| 2 | Observasi | Proses rekrutmen yang berjalan | Kondisi sistem berjalan dan titik permasalahan |
| 3 | Studi dokumentasi | Dokumen lowongan, data pelamar, data perusahaan, CV, referensi teknis | Kebutuhan data dan rancangan sistem |
| 4 | Pengujian sistem | Prototype website pencari kerja | Hasil pengujian fungsi sistem dan AI sorter |

## 3.5 Analisis Sistem Berjalan

Analisis sistem berjalan dilakukan untuk memahami kondisi proses rekrutmen tenaga kerja sebelum adanya prototype website pencari kerja terintegrasi. Analisis ini penting karena menjadi dasar dalam menentukan kebutuhan sistem usulan dan fitur yang perlu dikembangkan. Sistem berjalan yang dimaksud dalam penelitian ini adalah proses penyampaian informasi lowongan, pendaftaran pelamar, pengelolaan data perusahaan, pengiriman lamaran, pemantauan status seleksi, penjadwalan wawancara, dan rekapitulasi data rekrutmen yang belum sepenuhnya terintegrasi dalam satu platform.

Berdasarkan hasil observasi, wawancara, dan studi dokumentasi, proses rekrutmen yang berjalan masih memiliki beberapa kendala. Informasi lowongan kerja dapat tersebar pada berbagai kanal, sehingga pencari kerja perlu mencari informasi dari beberapa sumber. Pengelolaan data pencari kerja, perusahaan, lowongan, dan lamaran juga membutuhkan alur yang lebih terstruktur agar proses rekrutmen dapat dipantau dengan lebih mudah.

Dari sisi pencari kerja, proses pencarian lowongan dan pengiriman lamaran belum sepenuhnya berada dalam satu alur digital yang terintegrasi. Pencari kerja membutuhkan akses terhadap informasi lowongan yang jelas, data perusahaan yang kredibel, serta fasilitas untuk memantau perkembangan status lamaran. Tanpa adanya sistem pemantauan yang terpusat, pencari kerja dapat mengalami kesulitan mengetahui apakah lamaran masih diproses, ditolak, masuk tahap wawancara, atau diterima.

Dari sisi perusahaan atau rekruter, proses pengelolaan lowongan dan pelamar membutuhkan sistem yang mampu membantu pencatatan data secara rapi. Rekruter memerlukan fasilitas untuk mendaftarkan perusahaan, mengajukan lowongan, melihat daftar pelamar, memeriksa dokumen kandidat, memperbarui status seleksi, dan menjadwalkan wawancara. Selain itu, rekruter juga membutuhkan alat bantu untuk meninjau kecocokan kandidat dengan kebutuhan lowongan, terutama ketika jumlah pelamar cukup banyak.

Dari sisi Admin Disnaker, sistem berjalan membutuhkan mekanisme pengawasan data yang lebih terpusat. Admin perlu memastikan bahwa perusahaan yang membuka lowongan telah diverifikasi, lowongan yang dipublikasikan sesuai ketentuan, dan aktivitas penting dalam sistem dapat dipantau. Tanpa sistem yang terintegrasi, proses rekapitulasi data perusahaan, lowongan, pencari kerja, lamaran, dan status seleksi dapat menjadi kurang efisien.

Tabel 3.5.1 Analisis Sistem Berjalan

| No | Proses Berjalan | Kondisi yang Ditemukan | Dampak | Kebutuhan Sistem Usulan |
| --- | --- | --- | --- | --- |
| 1 | Penyampaian informasi lowongan | Informasi lowongan belum sepenuhnya terpusat dalam satu sistem rekrutmen digital | Pencari kerja perlu mencari informasi dari beberapa sumber | Sistem menyediakan daftar dan detail lowongan secara terstruktur |
| 2 | Pengelolaan data pencari kerja | Data pencari kerja belum terhubung langsung dengan proses lamaran | Data pelamar sulit dimanfaatkan secara menyeluruh dalam seleksi | Sistem menyediakan profil pencari kerja dan dokumen pendukung |
| 3 | Pendaftaran perusahaan | Perusahaan perlu divalidasi sebelum dapat memposting lowongan | Risiko lowongan tidak valid jika tidak ada verifikasi | Sistem menyediakan verifikasi perusahaan oleh Admin Disnaker |
| 4 | Pengajuan lowongan | Pengajuan lowongan memerlukan format yang jelas dan alur validasi | Informasi lowongan dapat kurang seragam | Sistem menyediakan form lowongan dan validasi lowongan |
| 5 | Pengiriman lamaran | Lamaran dapat tercatat secara tidak terstruktur dan berpotensi ganda | Rekruter sulit mengelola pelamar secara efisien | Sistem menyediakan pengiriman lamaran dan pembatasan lamaran ganda |
| 6 | Monitoring status lamaran | Status lamaran sulit dipantau oleh pencari kerja | Transparansi proses seleksi berkurang | Sistem menyediakan dashboard status lamaran |
| 7 | Penjadwalan wawancara | Jadwal wawancara dapat tersebar pada komunikasi terpisah | Koordinasi antara rekruter dan pelamar kurang terpusat | Sistem menyediakan fitur pengelolaan wawancara |
| 8 | Penyaringan awal pelamar | Rekruter membutuhkan bantuan untuk meninjau kandidat yang relevan | Proses screening kandidat dapat memakan waktu | Sistem menyediakan AI sorter sebagai alat bantu awal |
| 9 | Rekapitulasi dan monitoring admin | Data perusahaan, lowongan, pelamar, dan aktivitas sistem belum tersentral | Admin sulit melakukan pemantauan secara menyeluruh | Sistem menyediakan dashboard admin dan audit log |

Berdasarkan analisis sistem berjalan tersebut, dapat disimpulkan bahwa permasalahan utama terletak pada belum terintegrasinya data dan alur proses rekrutmen dalam satu sistem. Oleh karena itu, prototype website pencari kerja terintegrasi dirancang untuk menyatukan proses pencarian lowongan, pengelolaan profil, pengiriman lamaran, monitoring status seleksi, penjadwalan wawancara, validasi perusahaan, pengelolaan lowongan, serta pemantauan data oleh admin.

Sistem usulan tidak menggantikan keputusan akhir dalam proses rekrutmen. Sistem berperan sebagai alat bantu untuk membuat alur rekrutmen lebih tertata, data lebih mudah dipantau, dan informasi lebih transparan bagi setiap aktor yang terlibat. Keputusan akhir penerimaan tenaga kerja tetap berada pada pihak perusahaan atau rekruter sesuai proses seleksi yang berlaku.

## 3.6 Analisis Data

Analisis data dalam penelitian ini menggunakan pendekatan deskriptif kualitatif. Data yang diperoleh dari wawancara, observasi, studi dokumentasi, dan pengujian sistem dianalisis untuk mengidentifikasi kebutuhan sistem, memetakan permasalahan pada proses rekrutmen, menentukan kebutuhan data, serta mengevaluasi kesesuaian prototype dengan tujuan penelitian.

Analisis data dilakukan melalui tiga tahapan utama, yaitu reduksi data, penyajian data, dan penarikan kesimpulan. Reduksi data dilakukan dengan memilah data yang relevan dengan pengembangan sistem. Penyajian data dilakukan dalam bentuk uraian deskriptif, tabel kebutuhan data, tabel masalah sistem berjalan, rancangan alur proses, dan dokumentasi hasil pengujian. Penarikan kesimpulan dilakukan untuk menentukan fitur yang perlu dikembangkan dan menilai apakah prototype telah sesuai dengan kebutuhan pengguna.

### 3.6.1 Analisis Data Kualitatif

Analisis data kualitatif dilakukan dengan mengelompokkan dan menginterpretasikan data hasil wawancara, observasi, serta studi dokumentasi. Analisis ini bertujuan untuk mengidentifikasi permasalahan utama pada proses rekrutmen tenaga kerja, seperti pengelolaan data pencari kerja, validasi data perusahaan, penyusunan informasi lowongan, pengiriman lamaran, transparansi status seleksi, penjadwalan wawancara, dan kebutuhan penyaringan awal kandidat.

Tabel 3.6.1 Masalah pada Sistem Berjalan dan Solusi Prototype

| No | Aspek Data atau Proses | Permasalahan | Solusi pada Prototype |
| --- | --- | --- | --- |
| 1 | Data pencari kerja | Data belum terhubung langsung dengan proses lamaran | Sistem menyediakan profil pencari kerja dan dokumen pendukung |
| 2 | Data perusahaan | Perusahaan perlu divalidasi sebelum dapat memposting lowongan | Admin dapat memverifikasi perusahaan sebelum lowongan dibuat |
| 3 | Data lowongan | Informasi lowongan perlu disusun dengan format yang lebih terstruktur | Rekruter dapat membuat lowongan melalui form yang jelas |
| 4 | Data lamaran | Berpotensi terjadi lamaran ganda pada lowongan yang sama | Sistem menerapkan pembatasan lamaran pada satu lowongan yang sama |
| 5 | Status lamaran | Perkembangan status lamaran sulit dipantau | Sistem menyediakan dashboard pemantauan status lamaran |
| 6 | Jadwal wawancara | Penjadwalan wawancara dapat tersebar pada komunikasi terpisah | Sistem menyediakan fitur pengelolaan wawancara |
| 7 | Penyaringan pelamar | Rekruter membutuhkan bantuan untuk meninjau kandidat yang relevan | Sistem menyediakan AI sorter sebagai alat bantu screening awal |
| 8 | Aktivitas sistem | Aktivitas penting sulit ditelusuri | Sistem menyediakan audit log untuk admin |

Temuan dari analisis kualitatif digunakan sebagai dasar dalam perancangan kebutuhan fungsional sistem, seperti pengelolaan profil pencari kerja, verifikasi perusahaan, pengajuan lowongan, pengiriman lamaran, pencegahan lamaran ganda, monitoring status lamaran, penjadwalan wawancara, AI sorter, dan audit log.

### 3.6.2 Analisis Kebutuhan Data Sistem

Analisis kebutuhan data dilakukan untuk menentukan data apa saja yang perlu dikelola oleh sistem. Data yang dianalisis mencakup data pengguna, pencari kerja, perusahaan, rekruter, lowongan, lamaran, wawancara, kontrak, berita, audit log, serta data yang digunakan dalam proses AI sorter.

Tabel 3.6.2 Data yang Dibutuhkan Sistem

| No | Data yang Dibutuhkan | Digunakan Oleh | Tujuan |
| --- | --- | --- | --- |
| 1 | Data akun pengguna | Pencari kerja, rekruter, admin | Autentikasi dan pembagian hak akses |
| 2 | Data profil pencari kerja | Pencari kerja, rekruter, admin | Identitas pelamar dan bahan seleksi |
| 3 | Data dokumen pencari kerja | Pencari kerja, rekruter | Kelengkapan administrasi dan screening kandidat |
| 4 | Data perusahaan | Rekruter, admin, pencari kerja | Validasi perusahaan dan informasi profil perusahaan |
| 5 | Data lowongan kerja | Pencari kerja, rekruter, admin | Publikasi dan pengelolaan informasi lowongan |
| 6 | Data skill lowongan | Rekruter, sistem AI | Kebutuhan pencocokan kandidat |
| 7 | Data lamaran | Pencari kerja, rekruter, admin | Proses seleksi dan monitoring lamaran |
| 8 | Data status lamaran | Pencari kerja, rekruter, admin | Transparansi tahapan seleksi |
| 9 | Data wawancara | Pencari kerja, rekruter | Penjadwalan dan respons wawancara |
| 10 | Data CV pelamar | Pencari kerja, rekruter, sistem AI | Pencocokan CV dengan lowongan pekerjaan |
| 11 | Data hasil AI sorter | Rekruter | Rekomendasi awal kandidat berdasarkan kecocokan |
| 12 | Data kontrak pekerja | Rekruter, admin | Pengelolaan pekerja yang diterima |
| 13 | Data resign | Pencari kerja, rekruter, admin | Pengajuan dan pemantauan resign pekerja |
| 14 | Data berita | Admin, pengguna publik | Publikasi informasi ketenagakerjaan |
| 15 | Data audit log | Admin | Pemantauan aktivitas penting sistem |

Berdasarkan kebutuhan data tersebut, sistem dirancang menggunakan basis data relasional agar hubungan antar data dapat dikelola secara terstruktur. Relasi penting dalam sistem meliputi hubungan pengguna dengan profil pencari kerja, pengguna dengan rekruter, rekruter dengan perusahaan, perusahaan dengan lowongan, lowongan dengan lamaran, pencari kerja dengan lamaran, lamaran dengan wawancara, serta aktivitas sistem dengan audit log.

### 3.6.3 Analisis Data Berdasarkan Aktor Sistem

Analisis data juga dilakukan berdasarkan aktor utama sistem, yaitu pencari kerja, rekruter, dan Admin Disnaker. Setiap aktor memiliki kebutuhan data dan hak akses yang berbeda sehingga sistem perlu dirancang menggunakan pendekatan role-based access.

Tabel 3.6.3 Kebutuhan Data Pencari Kerja

| No | Kebutuhan Data atau Fitur | Deskripsi | Digunakan Untuk |
| --- | --- | --- | --- |
| 1 | Registrasi dan login | Autentikasi menggunakan email dan kata sandi | Akses sistem |
| 2 | Data pribadi | Nama, NIK, tanggal lahir, jenis kelamin | Identitas pencari kerja |
| 3 | Data kontak | Alamat, nomor telepon, email | Komunikasi dan kelengkapan profil |
| 4 | Pendidikan | Pendidikan terakhir, institusi, jurusan, tahun lulus | Penilaian kualifikasi |
| 5 | Pengalaman kerja | Riwayat pekerjaan dan posisi | Penilaian pengalaman kandidat |
| 6 | Sertifikat dan keahlian | Sertifikat, skill, dan kompetensi | Validasi kompetensi |
| 7 | Dokumen pendukung | CV, KTP, AK1, ijazah, sertifikat | Kelengkapan administrasi |
| 8 | Melihat lowongan | Informasi lowongan aktif | Pencarian kerja |
| 9 | Melamar lowongan | Pengiriman lamaran ke perusahaan | Proses rekrutmen |
| 10 | Status lamaran | Informasi proses seleksi | Transparansi lamaran |
| 11 | Jadwal wawancara | Jadwal dan respons wawancara | Seleksi lanjutan |

Tabel 3.6.4 Kebutuhan Data Rekruter

| No | Kebutuhan Data atau Fitur | Deskripsi | Digunakan Untuk |
| --- | --- | --- | --- |
| 1 | Registrasi dan login | Autentikasi akun rekruter | Akses sistem |
| 2 | Profil perusahaan | Nama perusahaan, bidang usaha, alamat, kontak | Identitas perusahaan |
| 3 | Status verifikasi | Validasi oleh Admin Disnaker | Legalitas dan kelayakan posting lowongan |
| 4 | Membuat lowongan | Judul, deskripsi, kualifikasi, lokasi, jenis pekerjaan | Publikasi lowongan |
| 5 | Mengelola lowongan | Mengubah, menutup, atau memantau lowongan | Kontrol proses rekrutmen |
| 6 | Data pelamar | Profil, pendidikan, pengalaman, dokumen | Seleksi kandidat |
| 7 | Hasil AI sorter | Persentase kecocokan, status rekomendasi, skill cocok | Screening awal kandidat |
| 8 | Status lamaran | Perubahan status seleksi | Manajemen seleksi |
| 9 | Jadwal wawancara | Penjadwalan wawancara pelamar | Seleksi lanjutan |
| 10 | Data kontrak | Data pekerja diterima dan kontrak | Pengelolaan pekerja |

Tabel 3.6.5 Kebutuhan Data Admin Disnaker

| No | Kebutuhan Data atau Fitur | Deskripsi | Digunakan Untuk |
| --- | --- | --- | --- |
| 1 | Login admin | Autentikasi internal admin | Akses sistem |
| 2 | Verifikasi perusahaan | Validasi data perusahaan | Keamanan dan kredibilitas lowongan |
| 3 | Validasi lowongan | Pemeriksaan data lowongan | Kontrol informasi lowongan |
| 4 | Data pengguna | Data pencari kerja dan rekruter | Monitoring sistem |
| 5 | Monitoring lamaran | Data proses rekrutmen | Transparansi dan pengawasan |
| 6 | Data kontrak | Data pekerja kontrak | Pengelolaan administrasi pekerja |
| 7 | Data berita | Informasi ketenagakerjaan | Publikasi konten |
| 8 | Audit log | Riwayat aktivitas penting | Pemantauan aktivitas sistem |
| 9 | Statistik sistem | Ringkasan data pengguna, perusahaan, lowongan, lamaran | Pengambilan keputusan dan rekap data |

### 3.6.4 Analisis Data AI Sorter

AI sorter merupakan fitur pendukung yang digunakan untuk membantu rekruter melakukan penyaringan awal terhadap pelamar. Data yang digunakan pada fitur ini meliputi CV pelamar, judul lowongan, deskripsi lowongan, dan daftar skill yang dibutuhkan oleh lowongan. Data tersebut dikirim ke API eksternal berbasis kecerdasan buatan untuk memperoleh hasil pencocokan.

Output dari AI sorter berupa persentase kecocokan, status rekomendasi, daftar skill yang cocok, dan informasi pendukung lain yang dapat membantu rekruter meninjau kandidat. Hasil AI sorter tidak digunakan sebagai keputusan akhir seleksi, tetapi hanya sebagai alat bantu agar rekruter dapat meninjau kandidat secara lebih cepat dan terarah.

Tabel 3.6.6 Analisis Data AI Sorter

| No | Data Input | Sumber Data | Proses | Output |
| --- | --- | --- | --- | --- |
| 1 | CV pelamar | Dokumen yang diunggah pencari kerja | Ekstraksi dan pencocokan isi CV | Informasi kandidat dan skill terdeteksi |
| 2 | Judul lowongan | Data lowongan dari rekruter | Pencocokan konteks pekerjaan | Kesesuaian terhadap posisi |
| 3 | Skill lowongan | Data kebutuhan lowongan | Perbandingan skill kandidat dan lowongan | Skill yang cocok dan tidak cocok |
| 4 | Hasil pencocokan | API AI sorter | Penghitungan relevansi kandidat | Persentase kecocokan dan status rekomendasi |

Analisis data AI sorter dilakukan secara deskriptif. Penelitian ini tidak menjadikan AI sorter sebagai alat validasi keputusan akhir, melainkan sebagai fitur pendukung yang membantu perusahaan dalam proses screening awal. Keputusan akhir penerimaan kandidat tetap berada pada pihak rekruter berdasarkan proses seleksi yang berlaku.

### 3.6.5 Analisis Data Hasil Pengujian Sistem

Data hasil pengujian sistem diperoleh dari pengujian fungsional black-box dan pengujian keluaran fitur AI sorter. Data pengujian fungsional digunakan untuk mengetahui apakah fitur utama sistem berjalan sesuai rancangan, sedangkan data AI sorter digunakan untuk melihat apakah sistem mampu menghasilkan informasi pencocokan antara CV pelamar dan kebutuhan lowongan.

Data pengujian dianalisis secara deskriptif berdasarkan kesesuaian antara skenario pengujian, input yang diberikan, proses yang dilakukan sistem, dan output yang dihasilkan. Jika output sesuai dengan hasil yang diharapkan, maka fitur dinyatakan berjalan sesuai kebutuhan. Jika terdapat ketidaksesuaian, maka hasil pengujian menjadi dasar perbaikan sistem.

Tabel 3.6.7 Data Hasil Pengujian yang Dianalisis

| No | Fitur yang Diuji | Data yang Dianalisis | Tujuan Analisis |
| --- | --- | --- | --- |
| 1 | Registrasi dan login | Data akun, role, token autentikasi | Memastikan pengguna dapat mengakses sistem sesuai peran |
| 2 | Profil pencari kerja | Data identitas, dokumen, kelengkapan profil | Memastikan profil tersimpan dan dapat digunakan untuk lamaran |
| 3 | Verifikasi perusahaan | Data perusahaan dan status verifikasi | Memastikan admin dapat memvalidasi perusahaan |
| 4 | Pengajuan lowongan | Data lowongan dan status lowongan | Memastikan rekruter dapat membuat lowongan sesuai ketentuan |
| 5 | Pengiriman lamaran | Data lowongan, pencari kerja, dokumen lamaran | Memastikan lamaran tersimpan dan tidak ganda |
| 6 | Status lamaran | Perubahan status seleksi | Memastikan status dapat dipantau pencari kerja dan rekruter |
| 7 | Wawancara | Jadwal, peserta, respons wawancara | Memastikan jadwal wawancara dapat dikelola |
| 8 | AI sorter | CV, skill lowongan, hasil kecocokan | Memastikan sistem menghasilkan rekomendasi awal kandidat |
| 9 | Audit log | Aktivitas penting sistem | Memastikan aktivitas tertentu dapat dipantau admin |

Apabila penelitian menggunakan UAT, data dari kuesioner dapat dianalisis secara deskriptif dalam bentuk persentase atau kategori penilaian. Namun, data tersebut digunakan sebagai pendukung evaluasi penerimaan pengguna, bukan sebagai pembanding kuantitatif antara website lama dan website baru.

## 3.7 Prosedur Penelitian

Prosedur penelitian disusun secara sistematis untuk memastikan setiap tahapan pengembangan website pencari kerja terintegrasi di Dinas Ketenagakerjaan Kabupaten Cirebon berjalan terarah dan sesuai dengan tujuan penelitian. Prosedur penelitian mengikuti pendekatan SDLC model prototyping yang terdiri dari identifikasi masalah, pengumpulan dan analisis data, perancangan sistem, implementasi, pengujian, dan evaluasi.

### 3.7.1 Tahap Identifikasi Masalah dan Studi Literatur

Tahap awal penelitian dimulai dengan identifikasi permasalahan pada proses rekrutmen tenaga kerja. Identifikasi dilakukan melalui observasi awal, wawancara, dan penelaahan proses yang berjalan. Permasalahan yang dikaji meliputi belum terintegrasinya data rekrutmen, keterbatasan monitoring status lamaran, kebutuhan validasi perusahaan, kebutuhan pengelolaan lowongan yang lebih terstruktur, serta kebutuhan alat bantu penyaringan awal pelamar.

Studi literatur dilakukan untuk memperkuat landasan teori penelitian. Literatur yang dikaji meliputi sistem informasi rekrutmen, digitalisasi layanan publik, SDLC model prototyping, full-stack web development, Next.js, Node.js, Prisma ORM, PostgreSQL, keamanan sistem, pengujian black-box, User Acceptance Testing, dan pemanfaatan AI sebagai alat bantu screening kandidat.

### 3.7.2 Tahap Pengumpulan dan Analisis Data

Setelah permasalahan teridentifikasi, penelitian dilanjutkan dengan pengumpulan dan analisis data. Data dikumpulkan melalui wawancara, observasi, studi dokumentasi, dan pengujian sistem. Data yang dikumpulkan meliputi data pencari kerja, data perusahaan, data lowongan, data lamaran, data status lamaran, data wawancara, data kontrak, data CV, data skill lowongan, data hasil AI sorter, dan data audit log.

Data yang diperoleh kemudian dianalisis untuk menentukan kebutuhan sistem. Hasil analisis digunakan untuk menyusun kebutuhan fungsional, kebutuhan nonfungsional, kebutuhan data, serta prioritas fitur yang akan dikembangkan pada prototype.

### 3.7.3 Tahap Perancangan Sistem

Pada tahap perancangan sistem, hasil analisis kebutuhan diterjemahkan ke dalam rancangan sistem yang lebih konkret. Perancangan dilakukan agar proses pengembangan sistem berjalan sesuai kebutuhan pengguna dan alur rekrutmen yang telah dianalisis.

Perancangan sistem mencakup data flow diagram, use case diagram, entity relationship diagram, flowchart, rancangan arsitektur aplikasi, rancangan basis data, dan rancangan antarmuka pengguna. Data flow diagram digunakan untuk menggambarkan aliran data antara aktor, proses sistem, dan penyimpanan data. Use case diagram digunakan untuk menggambarkan interaksi antara pencari kerja, rekruter, Admin Disnaker, dan sistem. Entity relationship diagram digunakan untuk memodelkan hubungan antar data. Flowchart digunakan untuk menjelaskan alur proses sistem secara keseluruhan serta alur proses dari sisi pencari kerja dan rekruter. Rancangan antarmuka digunakan untuk memberikan gambaran tampilan sistem sebelum implementasi.

![Gambar 3.7.1 Data Flow Diagram Level 0 Website Pencari Kerja Terintegrasi](figures/gambar-3-7-1-dfd-keseluruhan-sistem.svg)

Gambar 3.7.1 Data Flow Diagram Level 0 Website Pencari Kerja Terintegrasi

Data Flow Diagram (DFD) pada Gambar 3.7.1 menggambarkan aliran data utama pada sistem. Pencari kerja mengirimkan data akun, profil, dokumen, dan lamaran. Rekruter mengirimkan data perusahaan, lowongan, perubahan status lamaran, dan jadwal wawancara. Admin Disnaker melakukan verifikasi perusahaan, validasi lowongan, monitoring data, dan pengelolaan data pendukung. Sistem menyimpan data ke dalam basis data yang terdiri dari data pengguna, profil, perusahaan, lowongan, lamaran, wawancara, kontrak, berita, dan audit log. Pada fitur AI sorter, sistem mengirimkan data CV dan kebutuhan lowongan ke API eksternal untuk memperoleh hasil rekomendasi awal kandidat.

![Gambar 3.7.2 Flowchart Keseluruhan Website Pencari Kerja Terintegrasi](figures/gambar-3-7-2-flowchart-keseluruhan-sistem.svg)

Gambar 3.7.2 Flowchart Keseluruhan Website Pencari Kerja Terintegrasi

Flowchart pada Gambar 3.7.2 menggambarkan alur umum penggunaan sistem berdasarkan tiga peran utama. Alur dimulai dari pengguna mengakses website, melakukan registrasi atau login, kemudian sistem mengarahkan pengguna sesuai role. Pencari kerja melengkapi profil, mencari lowongan, mengirim lamaran, dan memantau status seleksi. Rekruter melengkapi data perusahaan, menunggu verifikasi, membuat lowongan, mengelola pelamar, menggunakan AI sorter, serta memperbarui status seleksi. Admin Disnaker melakukan verifikasi perusahaan, validasi lowongan, monitoring proses rekrutmen, serta pengelolaan data pendukung sistem.

Gambar 3.7.3 Rancangan Use Case Diagram Website Pencari Kerja Disnaker

Use case diagram menggambarkan fungsi utama sistem berdasarkan peran pengguna. Pencari kerja memiliki akses untuk registrasi, login, mengelola profil, melihat lowongan, mengirim lamaran, memantau status lamaran, dan merespons jadwal wawancara. Rekruter memiliki akses untuk mendaftarkan perusahaan, mengelola profil perusahaan, membuat lowongan, melihat pelamar, meninjau hasil AI sorter, memperbarui status lamaran, dan menjadwalkan wawancara. Admin Disnaker memiliki akses untuk memverifikasi perusahaan, memvalidasi lowongan, memantau pengguna, mengelola berita, mengelola kontrak, dan melihat audit log.

Gambar 3.7.4 Rancangan Entity Relationship Diagram

Entity relationship diagram menggambarkan struktur data yang digunakan pada sistem. Entitas utama yang dirancang meliputi users, jobseekers, recruiters, companies, jobs, applications, interviews, interview_participants, contract_workers, resignations, news, dan audit_logs. Relasi antar entitas dirancang agar data rekrutmen dapat dikelola secara terintegrasi dan mengurangi risiko pencatatan data yang tidak konsisten.

Gambar 3.7.5 Flowchart Proses Rekruter

Flowchart proses rekruter menggambarkan alur perusahaan dalam menggunakan sistem. Proses dimulai dari registrasi akun, pengisian data perusahaan, verifikasi oleh admin, pembuatan lowongan, validasi lowongan, publikasi lowongan, pengelolaan pelamar, peninjauan hasil AI sorter, perubahan status lamaran, penjadwalan wawancara, hingga pengelolaan kandidat yang diterima.

Gambar 3.7.6 Flowchart Proses Pencari Kerja

Flowchart proses pencari kerja menggambarkan alur pelamar dalam sistem. Proses dimulai dari registrasi akun, login, pengisian profil, pengunggahan dokumen, pencarian lowongan, pengiriman lamaran, pemantauan status lamaran, respons jadwal wawancara, hingga hasil akhir proses seleksi.

Selain diagram perancangan, prototype antarmuka pengguna juga disusun untuk menggambarkan tampilan dan alur penggunaan website. Rancangan antarmuka mencakup landing page, halaman login dan registrasi, halaman daftar lowongan, halaman detail lowongan, halaman profil pencari kerja, halaman profil perusahaan, dashboard rekruter, dashboard admin, halaman lamaran, halaman wawancara, dan halaman monitoring status lamaran.

### 3.7.4 Tahap Implementasi dan Pengkodean

Tahap implementasi dilakukan dengan menerjemahkan rancangan sistem ke dalam kode program. Pengembangan website pencari kerja dilakukan menggunakan arsitektur full-stack JavaScript. Next.js digunakan untuk membangun antarmuka pengguna dan routing aplikasi, sedangkan Node.js digunakan untuk menangani logika server-side dan API. Prisma ORM digunakan untuk memetakan struktur data aplikasi ke basis data PostgreSQL, sedangkan Supabase digunakan sebagai penyedia layanan basis data dan penyimpanan file. Vercel digunakan sebagai platform deployment aplikasi.

Fokus pengembangan pada tahap implementasi meliputi registrasi dan login pengguna, pengelolaan profil pencari kerja, pengelolaan profil perusahaan, verifikasi perusahaan, pembuatan dan validasi lowongan, pencarian lowongan, pengiriman lamaran, pencegahan lamaran ganda, monitoring status lamaran, penjadwalan wawancara, AI sorter, pengelolaan kontrak, pengelolaan berita, dan audit log.

Gambar 3.7.7 Next.js sebagai Framework Frontend

Gambar 3.7.8 Node.js sebagai Backend Aplikasi

Gambar 3.7.9 Prisma ORM sebagai Pengelola Mapping Database

Gambar 3.7.10 Supabase sebagai Penyedia PostgreSQL dan Cloud Storage

Gambar 3.7.11 Vercel sebagai Platform Deployment

### 3.7.5 Tahap Pengujian Sistem

Setelah sistem selesai dikembangkan, dilakukan pengujian untuk memastikan seluruh fungsi utama berjalan sesuai kebutuhan. Pengujian dilakukan menggunakan metode black-box, yaitu pengujian berdasarkan input dan output tanpa melihat struktur kode program.

Fitur yang diuji meliputi registrasi, login, pengelolaan profil, verifikasi perusahaan, pembuatan lowongan, validasi lowongan, pencarian lowongan, pengiriman lamaran, pencegahan lamaran ganda, monitoring status lamaran, penjadwalan wawancara, AI sorter, pengelolaan kontrak, pengelolaan berita, dan audit log. Hasil pengujian digunakan untuk mengetahui apakah sistem berjalan sesuai rancangan dan untuk menemukan bagian yang perlu diperbaiki.

### 3.7.6 Tahap Evaluasi dan Penyempurnaan

Tahap evaluasi dilakukan setelah pengujian sistem. Evaluasi bertujuan untuk menilai kesesuaian fitur dengan kebutuhan pengguna, kelayakan fungsi sistem, dan potensi manfaat prototype dalam mendukung proses rekrutmen yang lebih terstruktur. Apabila ditemukan kesalahan atau kekurangan, sistem diperbaiki dan diuji kembali sampai fungsi utama berjalan sesuai kebutuhan.

Jika UAT dilakukan, hasil evaluasi juga mempertimbangkan tanggapan pengguna terhadap kemudahan penggunaan, kejelasan alur, dan kesesuaian sistem dengan kebutuhan proses rekrutmen. Hasil evaluasi menjadi dasar penyusunan kesimpulan dan rekomendasi pengembangan sistem pada tahap berikutnya.

Tabel 3.7.1 Tahapan Prosedur Penelitian

| No | Tahapan Penelitian | Aktivitas | Output |
| --- | --- | --- | --- |
| 1 | Identifikasi masalah dan studi literatur | Observasi awal, wawancara, kajian teori | Rumusan masalah dan dasar teori |
| 2 | Pengumpulan dan analisis data | Wawancara, observasi, dokumentasi, analisis kebutuhan | Kebutuhan sistem dan kebutuhan data |
| 3 | Perancangan sistem | Use case, ERD, flowchart, UI/UX, arsitektur aplikasi | Rancangan sistem dan prototype antarmuka |
| 4 | Implementasi | Pengkodean frontend, backend, database, dan deployment | Prototype website pencari kerja |
| 5 | Pengujian | Black-box testing dan pengujian AI sorter | Hasil pengujian fungsi sistem |
| 6 | Evaluasi dan penyempurnaan | Analisis hasil pengujian dan perbaikan sistem | Sistem yang lebih sesuai kebutuhan pengguna |

## 3.8 Evaluasi Penelitian

Evaluasi penelitian merupakan tahap untuk menilai hasil pengembangan website pencari kerja terintegrasi dalam mendukung digitalisasi proses rekrutmen tenaga kerja di Dinas Ketenagakerjaan Kabupaten Cirebon. Evaluasi dilakukan untuk memastikan bahwa sistem telah berfungsi sesuai kebutuhan pengguna, memenuhi tujuan penelitian, dan memberikan gambaran manfaat terhadap proses rekrutmen yang lebih terstruktur.

Evaluasi sistem dilakukan berdasarkan hasil pengujian fungsional black-box. Pengujian ini bertujuan untuk memastikan bahwa seluruh fitur utama website pencari kerja berjalan sesuai dengan spesifikasi yang telah dirancang. Fitur yang dievaluasi meliputi proses registrasi dan login pengguna, pengelolaan profil, verifikasi perusahaan, pembuatan lowongan, validasi lowongan, proses pelamaran, pemantauan status lamaran, penjadwalan wawancara, AI sorter, pengelolaan kontrak, pengelolaan berita, dan audit log.

Selain pengujian fungsional, evaluasi dapat dilakukan melalui User Acceptance Testing apabila melibatkan pengguna sistem. UAT difokuskan pada penilaian kemudahan penggunaan, kejelasan alur proses rekrutmen, kesesuaian fitur dengan kebutuhan pengguna, serta kenyamanan pengguna dalam mengoperasikan sistem. Responden UAT dapat mencakup pencari kerja, rekruter, dan Admin Disnaker.

Evaluasi terhadap fitur AI sorter dilakukan dengan melihat kemampuan sistem dalam menghasilkan informasi pencocokan antara CV pelamar dan kebutuhan lowongan. Hasil yang dinilai meliputi persentase kecocokan, status rekomendasi, dan daftar skill yang cocok. Evaluasi ini bersifat deskriptif dan tidak digunakan sebagai dasar keputusan akhir seleksi, karena AI sorter hanya berperan sebagai alat bantu screening awal bagi rekruter.

Evaluasi efisiensi sistem dilakukan secara analitis berdasarkan perubahan alur proses. Prototype dinilai memiliki potensi membantu proses rekrutmen karena data pencari kerja, perusahaan, lowongan, lamaran, status seleksi, wawancara, dan aktivitas sistem dikelola dalam satu platform. Dengan adanya integrasi data tersebut, pencari kerja dapat memantau lamaran, rekruter dapat mengelola pelamar, dan admin dapat melakukan pengawasan data secara lebih terstruktur.

Tabel 3.8.1 Aspek Evaluasi Penelitian

| No | Aspek Evaluasi | Indikator | Metode Evaluasi |
| --- | --- | --- | --- |
| 1 | Kesesuaian fungsi | Fitur berjalan sesuai kebutuhan dan rancangan | Black-box testing |
| 2 | Kemudahan penggunaan | Pengguna dapat memahami alur sistem | UAT atau observasi penggunaan |
| 3 | Integrasi data | Data pencari kerja, perusahaan, lowongan, dan lamaran saling terhubung | Analisis sistem dan pengujian fitur |
| 4 | Transparansi status lamaran | Pencari kerja dapat memantau status seleksi | Pengujian dashboard lamaran |
| 5 | Validasi perusahaan dan lowongan | Admin dapat memverifikasi data sebelum dipublikasikan | Pengujian fitur admin |
| 6 | Pengelolaan pelamar | Rekruter dapat melihat dan memperbarui status pelamar | Pengujian dashboard rekruter |
| 7 | AI sorter | Sistem menghasilkan persentase kecocokan dan rekomendasi awal | Pengujian keluaran AI sorter |
| 8 | Monitoring sistem | Admin dapat melihat data dan aktivitas penting | Pengujian dashboard admin dan audit log |

Hasil evaluasi kemudian dianalisis untuk menilai sejauh mana website pencari kerja mampu memenuhi tujuan penelitian. Penelitian ini tidak menyimpulkan efisiensi operasional dalam bentuk pengukuran waktu, biaya, atau produktivitas secara kuantitatif karena prototype belum digunakan sebagai sistem resmi operasional. Kesimpulan evaluasi difokuskan pada kelayakan fungsi, kesesuaian fitur dengan kebutuhan pengguna, keteraturan alur proses, dan potensi manfaat sistem dalam mendukung proses rekrutmen tenaga kerja yang lebih terstruktur, transparan, dan efisien.

Temuan dari tahap evaluasi menjadi dasar dalam penyusunan kesimpulan penelitian dan rekomendasi pengembangan sistem di masa mendatang. Pengembangan selanjutnya dapat diarahkan pada integrasi dengan sistem resmi, peningkatan keamanan, pengujian pengguna yang lebih luas, penyempurnaan AI sorter, serta optimalisasi performa sistem untuk penggunaan dalam skala yang lebih besar.
