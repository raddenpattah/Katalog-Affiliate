# Laporan Perbaikan Metadata dan Halaman Produk

**Tanggal:** 15 Oktober 2026
**Ruang lingkup:** Skema produk, metadata SEO, kartu rekomendasi, dan halaman detail produk

## Ringkasan

Skema produk kini menyediakan `metaDescription` opsional dengan batas maksimal
160 karakter dan `specs` opsional berupa daftar string. Metadata halaman produk
memprioritaskan `metaDescription`, lalu deskripsi produk yang dipotong pada
batas kata hingga maksimal 155 karakter, dan terakhir kalimat template.
Meta description, Open Graph description, dan Twitter description menggunakan
teks yang sama.

Judul halaman menggunakan `title` produk yang whitespace-nya dinormalisasi;
`titlePinterest` tidak digunakan pada `<title>`. Deskripsi panjang tetap tampil
sebagai paragraf di halaman detail, spesifikasi tampil sebagai bullet jika ada,
dan kartu rekomendasi memakai teks ringkas dengan batas dua baris.

Tidak ada JSON produk yang diubah.

## File yang diubah

### `src/content.config.ts`

Menambahkan validasi skema:

```ts
metaDescription: z.string().max(160).optional(),
specs: z.array(z.string()).optional(),
```

### `src/data/products.ts`

Memperbarui tipe `Product` agar mencakup:

```ts
titlePinterest?: string;
metaDescription?: string;
specs?: string[];
```

Field `titlePinterest` sudah ada pada skema konten; tipe TypeScript diselaraskan
dengan data tersebut agar tetap tersedia untuk penggunaan Pinterest di masa
mendatang.

### `src/pages/produk/[slug].astro`

- Meta description dipilih menurut prioritas `metaDescription`, deskripsi
  produk yang dipotong pada batas kata, lalu template kategori.
- Tiga tag description (`description`, `og:description`, dan
  `twitter:description`) menerima nilai yang sama.
- `<title>`, `og:title`, dan alt gambar utama menggunakan judul produk dengan
  spasi berulang dinormalisasi dan whitespace tepi dihapus.
- `titlePinterest` tidak dipakai untuk `<title>`.
- Paragraf halaman tetap menampilkan deskripsi produk; daftar `specs` hanya
  dirender jika array berisi item.
- Gambar utama menggunakan `loading="eager"` dan `fetchpriority="high"`.
- Tombol Shopee desktop dan mobile tetap memakai `product.shopeeUrl`, dengan
  `target="_blank"` dan `rel="nofollow sponsored noopener"`.

### `src/components/ProductCard.astro`

- Judul dan deskripsi dirapikan whitespace-nya sebelum ditampilkan.
- Judul memakai `line-clamp-2`.
- Deskripsi memakai `line-clamp-2`, bukan ditampilkan tanpa batas.
- Gambar kartu memiliki alt dari judul produk dan `loading="lazy"`.

Karena halaman rekomendasi menggunakan `ProductCard`, pembatasan dua baris juga
berlaku pada bagian “Rekomendasi Produk Lainnya”.

## Validasi

- `npm run build`: berhasil; Astro membangun 31 halaman tanpa error.
- Pemeriksaan HTML hasil build untuk 23 halaman produk memastikan ketiga
  description meta sama, judul normal, gambar memiliki alt dan atribut loading
  yang sesuai, serta CTA Shopee menggunakan target dan rel yang diminta.
- Pemeriksaan editor untuk keempat file sumber tidak menemukan error.
- `git diff --check`: berhasil.
- File JSON produk tidak disentuh.
