# Fase 2: Fix Gemini Stream

## Perubahan
- `lib/providers/gemini.js`: pasang rejection handler segera pada `result.response`, konsumsi promise agregat di dalam try/catch, abort request saat stream gagal, dan minta iterator menutup stream.
- Menambahkan idle timeout yang meng-abort `AbortController` saat stream tidak mengirim chunk. Nilai dapat diatur melalui `AI_GEMINI_STREAM_IDLE_TIMEOUT_MS`; default mengikuti `AI_REQUEST_TIMEOUT_MS` (default 20 detik).
- Idle timeout diberi kode non-retryable agar Gemini tidak mengulang model dan fallback provider bisa dimulai segera setelah request dibatalkan.
- `lib/ai-provider.js`: tiap percobaan provider mendapat `AbortController`; error ditangkap, signal di-abort, lalu baru provider berikutnya dicoba secara berurutan.

## Backup
- `laporan/gemini-provider.backup-2026-10-13-1154`
- `laporan/ai-provider.backup-2026-10-13-1154`

## Validasi
- API `generate-blog` diuji dengan stream Gemini yang melempar read error; endpoint selesai dengan event error dan tanpa unhandled rejection.
- API diuji dengan stream yang tidak mengirim chunk; timeout 30 ms membatalkan signal dan fallback berjalan tanpa menunggu retry Gemini.
- `node --check` untuk kedua file dan `npm run build` berhasil.

Tidak ada logika penulisan artikel atau pemilihan rekomendasi yang diubah. Pemanggilan model AI live dengan kredensial produksi tidak dilakukan.