# Audit Fitur Tambah Produk di CMS

**Tanggal audit:** 15 Oktober 2026  
**Ruang lingkup:** Alur tambah produk Decap CMS, UI frontend admin, endpoint dan layanan backend, validasi data, serta preview.

## Ringkasan

CMS menggunakan Decap CMS dengan backend GitHub. Form produk membuat satu file
JSON di `src/data/products/` dan menyimpan perubahan melalui repository pada
branch `main`. `publish_mode: simple` berarti form tidak menggunakan alur
editorial/draft-review terpisah.

Generator AI adalah fitur bantu di frontend form. Tombol AI mengirim nama produk,
kategori, deskripsi opsional, dan konteks artikel ke endpoint Vercel. Endpoint
mengembalikan slug, judul Pinterest, deskripsi, dan spesifikasi; ia **tidak**
membuat file produk atau mengisi ID, kategori, gambar, link Shopee, badge, meta
description, maupun gambar tambahan. Pengguna tetap perlu melengkapi field
produk dan menyimpan form CMS.

Tidak ada kode atau konfigurasi aplikasi yang diubah untuk audit ini; hanya file
laporan ini yang ditambahkan.

## Frontend CMS

### Cara membuka dan autentikasi

- `/admin/` memuat Decap CMS dari CDN `decap-cms@^3.6.0` serta skrip preview dan
  widget kustom.
- CMS memakai backend `github`, repository `raddenpattah/Katalog-Affiliate`,
  branch `main`, dan OAuth proxy Cloudflare Worker
  `alfeto-decap-auth.alfeto.workers.dev`.
- Konfigurasi CMS aktif adalah `public/admin/config.yml`, yang ditautkan dari
  halaman admin. `public/config.yml` saat audit identik dengan konfigurasi ini.

### Form tambah produk saat ini

Koleksi **Produk** mengarah ke folder `src/data/products`, memakai ekstensi
`.json`, dan memakai field `slug` sebagai pola nama entry (`{{slug}}`).
Field yang tersedia di form:

| Field | Perilaku di form |
|---|---|
| `id` | String, diisi manual |
| `title` | String, nama asli Shopee; hint menyarankan tidak mengubahnya |
| `titlePinterest` | Opsional; widget kustom dengan tombol AI |
| `slug` | Widget string kustom yang dapat diisi hasil generator |
| `description` | Opsional; widget teks kustom |
| `category` | Relasi ke koleksi kategori |
| `image` | Gambar utama; dapat memilih URL atau aset gambar |
| `gambar_tambahan` | Daftar gambar tambahan, opsional |
| `spesifikasi` | Daftar spesifikasi melalui widget list kustom |
| `shopeeUrl` | String, diisi manual |
| `badge` | Label promo opsional, diisi manual |

Gambar produk yang diunggah memakai folder media `/public/images/products`
dengan URL publik `/images/products`. Media global CMS diarahkan ke gambar blog.

### Tombol AI dan preview

- Tombol **“AI Generate Semua Field”** berada di widget `titlePinterest`.
- Sebelum generate, widget memerlukan nama produk dan kategori. Deskripsi
  opsional dikirim sebagai konteks tambahan.
- Widget meminta data blog melalui `/api/data-provider?type=blog`. Jika
  pengambilan konteks gagal, proses generator tetap berjalan tanpa konteks blog.
- Saat berhasil, field `titlePinterest` diisi langsung. Event frontend mengisi
  `slug`, `description`, dan `spesifikasi` pada kontrol terkait.
- Preview produk saat ini menampilkan gambar utama, `title`, ID, kategori,
  tautan Shopee, badge, dan tombol untuk membuka halaman review Alfeto. Preview
  tidak menampilkan deskripsi, title Pinterest, spesifikasi, atau meta
  description.

## Backend dan penyimpanan

### Penyimpanan produk

- Endpoint AI tidak menulis ke filesystem, GitHub, atau database.
- Decap GitHub backend menyimpan dokumen produk sebagai JSON di
  `src/data/products/`; pola nama entry mengambil nilai `slug`.
- Dengan `publish_mode: simple`, tidak ada tahapan editorial workflow terpisah
  sebelum perubahan masuk ke repository.
- Produk yang tersimpan kemudian dibaca oleh Astro Content Collections dari
  file JSON tersebut.

### Generator AI

Alur backend:

1. `api/generate-product.js` menerima POST dan mensyaratkan
   `ENABLE_AI_GENERATOR=true`.
2. Endpoint memvalidasi object JSON, mewajibkan `title` dan `category`, serta
   membatasi input title hingga 200 karakter, kategori 100 karakter, dan
   deskripsi 4.000 karakter.
3. Maksimal delapan entri konteks artikel diteruskan sebagai konteks inspirasi.
4. `lib/product-ai.js` memilih provider berdasarkan urutan konfigurasi. Provider
   yang didukung adalah Gemini dan Groq; model/provider dapat dikonfigurasi,
   sedangkan API key berasal dari environment server.
5. Hasil di-parse sebagai JSON. Slug dinormalisasi menjadi lowercase ASCII
   kebab-case; judul AI dipotong maksimal 60 karakter; deskripsi dan daftar
   spesifikasi harus tersedia. Jika provider pertama gagal, generator mencoba
   provider selanjutnya yang aktif dan memiliki API key.
6. Respons API memetakan `product.title` menjadi `titlePinterest`, lalu
   mengembalikan `slug`, `titlePinterest`, `description`, dan `spesifikasi`.

API mengembalikan status 405 untuk metode selain POST, 403 jika generator
dinonaktifkan, 400 untuk input invalid/terlalu panjang, 200 untuk hasil, dan 502
jika proses AI gagal.

### API data bersama

`api/data-provider.js` menyediakan GET untuk membaca `products`, `blog`,
`categories`, atau `all` dari file proyek. Handler ini hanya membaca data dan
tidak menulis produk. Tidak ada pemeriksaan autentikasi di handler. Untuk produk,
endpoint juga menerapkan slug cadangan/unik ketika `slug` kosong atau konflik.

## Validasi dan konsumsi di website

Skema produk Astro di `src/content.config.ts` mewajibkan `id`, `title`,
`category`, `image`, dan URL `shopeeUrl`. `category` harus terdaftar dalam data
kategori; `image` harus berupa URL atau path lokal `/images/products/...`.
Skema juga mengenali `slug`, `titlePinterest`, `badge`, `description`,
`metaDescription` (maksimal 160 karakter), dan `specs` sebagai field opsional.

Website memakai `product.image`, `product.title`, `product.description`,
`product.metaDescription`, `product.specs`, `product.slug`, dan `product.shopeeUrl`
untuk katalog/halaman produk. Model TypeScript `Product` juga mendeklarasikan
`titlePinterest`, `metaDescription`, dan `specs`.

## Gap yang ditemukan

1. **Nama field spesifikasi tidak konsisten.** Form CMS dan respons AI memakai
   `spesifikasi`, tetapi schema Astro dan renderer halaman produk memakai
   `specs`. Karena itu spesifikasi yang dibuat dari widget CMS tersimpan dengan
   nama berbeda dari field yang dibaca halaman. Beberapa JSON saat ini dapat
   berisi keduanya, tetapi alur form tidak menyinkronkannya.
2. **Field `metaDescription` belum ada di form produk.** Schema Astro sudah
   mendukungnya, tetapi CMS form dan generator AI tidak mengisinya.
3. **Gambar tambahan belum terhubung ke model/renderer produk.** Form
   menyimpan `gambar_tambahan`, sedangkan schema/model produk tidak
   mendeklarasikannya dan halaman detail tidak merender galeri tersebut.
4. **Nama produk yang ditampilkan preview dan halaman produk berbeda dari
   keluaran AI.** Ini tampaknya disengaja: AI menulis ke `titlePinterest`,
   sementara `title` tetap sebagai nama produk sumber. Preview produk hanya
   menampilkan `title`.
5. **Tidak semua field form divalidasi seketat schema build.** Contohnya,
   `shopeeUrl` adalah widget string biasa; validitas URL baru diperiksa oleh
   schema Astro saat konten diproses/build. Schema produk juga tidak membatasi
   panjang `title`, slug kebab-case, atau jumlah item `specs`.
6. **Label tombol AI lebih luas dari cakupan hasil.** Tombol bernama “Generate
   Semua Field”, tetapi generator hanya mengisi slug, title Pinterest,
   description, dan spesifikasi.

## File yang ditinjau

- `public/admin/index.html`
- `public/admin/config.yml`
- `public/admin/generate-product-widget.js`
- `public/admin/product-preview.js`
- `api/generate-product.js`
- `api/data-provider.js`
- `lib/product-ai.js`
- `lib/config-store.js`
- `api/settings.js`
- `src/content.config.ts`
- `src/data/products.ts`
- `vercel.json`

Audit ini bersifat baca-saja terhadap aplikasi. Build dan data produksi tidak
diubah atau diuji sebagai bagian dari peninjauan ini.
