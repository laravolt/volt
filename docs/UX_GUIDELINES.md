# Panduan Standar UX Volt (Volt UX Guidelines)

Panduan standar User Experience (UX) untuk starter template **Volt** (`laravolt/volt`), disusun berdasarkan hasil temuan nyata dan penyempurnaan pada sesi User Acceptance Testing (UAT) proyek *brain-v2.1* (khususnya *Product Frontend* dan *Helpdesk Frontend* PT Kubota Indonesia per 31 Agustus – 2 September 2026).

---

## Ringkasan 16 Aturan UX Baku

| # | Aturan UX | Ringkasan Pola | Bukti & Referensi Proyek |
|---|---|---|---|
| 1 | **Tata Letak Baris Aksi Form (Action Row Pattern)** | Aksi primer di **paling kanan**, aksi sekunder/batal/destruktif di kiri dengan pembatas `border-t`. Tombol "Batal" adalah button sekunder, bukan teks link biasa. | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §3 (tabel baris 12), commit `af497f4`. |
| 2 | **Loading State & Anti Double-Submit** | Tombol submit wajib terkunci (`disabled`) dan menampilkan status proses ("Menyimpan...", "Mengirim...") saat form dikirim untuk mencegah duplicate submission. Form diberi `aria-busy="true"`. | `brain-v2.1: wiki/moduzen/livewire-ux-engineering-playbook.md` §5.1, `wiki/memory/livewire-ux-template-standard.md`, `wiki/deliverables/2026-09-02-panduan-uat-helpdesk.md` skenario H5. |
| 3 | **Konfirmasi Aksi Destruktif Eksplisit** | Aksi merusak/menghapus wajib melalui dialog konfirmasi (`Alert`) yang menyebutkan secara spesifik entitas dan jumlah yang dihapus, bukan tombol hapus terbuka di setiap baris tabel. | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §5 (tabel baris 14), `wiki/moduzen/livewire-ux-engineering-playbook.md` §14.2. |
| 4 | **Sistem Notifikasi & Feedback Konsisten (Notice & Toast)** | Menyediakan pesan status visual yang seragam: `success` (hijau), `error` (merah), `warning` (amber), `info` (biru) dengan dukungan `aria-live="polite"` dan auto-dismiss / close manual. | `brain-v2.1: wiki/moduzen/livewire-ux-engineering-playbook.md` §14.2, `wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §20. |
| 5 | **Penanda Field Wajib & Legenda Tunggal** | Field wajib ditandai bintang merah (`*`), tetapi keterangan `* wajib diisi` cukup dicantumkan **satu kali** di atas form (abu-abu kecil), bukan diulang pada setiap kartu/seksi. | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §4 (baris 13) & §20, `wiki/deliverables/2026-09-01-before-after-uat-new-item.md` baris 67. |
| 6 | **Fokus Otomatis ke Field Pertama yang Error** | Saat validasi form gagal, fokus kursor otomatis diarahkan ke input pertama yang tidak valid agar pengguna tidak perlu mencari letak kesalahan secara manual. | `brain-v2.1: wiki/lessons/important-style-beats-validation-class.md`, `wiki/deliverables/2026-09-02-panduan-uat-helpdesk.md` skenario H3. |
| 7 | **Prioritas Border Merah Saat Field Error Fokus** | Border merah invalid harus tetap terlihat jelas saat field yang bersangkutan sedang difokuskan, tidak boleh tertimpa oleh styling ring fokus default. | `brain-v2.1: wiki/lessons/important-style-beats-validation-class.md` (pelajaran `!important`), commit `d072392`. |
| 8 | **Pesan Error yang Solutif dan Actionable** | Pesan validasi diletakkan tepat di bawah field yang bermasalah dan menjelaskan aturan/cara memperbaiki nilai (mis. "Minimal 6 karakter", "Gunakan format email@domain.com"). | `brain-v2.1: wiki/deliverables/2026-09-02-panduan-uat-helpdesk.md` skenario H3, `wiki/moduzen/livewire-ux-engineering-playbook.md` §4. |
| 9 | **Pilihan Singkat vs Panjang (Radio ≤5 vs Select >5)** | Opsi berjumlah ≤5 ditampilkan sebagai radio button atau chip agar langsung terlihat tanpa klik; opsi >5 menggunakan dropdown dengan pencarian (searchable select). | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §6 (baris 15) & §20, `wiki/deliverables/2026-09-01-before-after-uat-new-item.md` baris 51 & 66. |
| 10 | **Hierarki & Segmentasi Form (Fieldset & Sections)** | Form panjang dikelompokkan ke dalam `<fieldset>` per seksi dengan `<legend>` yang jelas dan grid multi-kolom proporsional agar tidak melelahkan pengguna (*form fatigue*). | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §4 (baris 13), `wiki/deliverables/2026-09-02-laporan-perbaikan-uat-new-item.md` §2. |
| 11 | **Format Mata Uang Rupiah Standar (id-ID Currency)** | Format nominal rupiah menggunakan prefiks `Rp ` dengan pemisah ribuan titik (`.`) tanpa desimal sen jika bulat (contoh: `Rp 14.000` atau `-Rp 14.000`). | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §18, `wiki/deliverables/2026-08-28-notulen-uat-new-item.md`. |
| 12 | **Format Tanggal & Waktu Lokal Indonesia** | Tanggal disajikan dalam format bahasa Indonesia yang mudah dipahami (`D MMMM YYYY`, misal `2 September 2026`) dan waktu 24 jam (`HH:mm WIB`). | `brain-v2.1: wiki/deliverables/2026-09-02-panduan-uat-helpdesk.md` skenario H6 & H29, `wiki/deliverables/2026-09-01-before-after-uat-new-item.md`. |
| 13 | **Keadaan Kosong Informatif (Standardized EmptyState)** | Daftar atau tabel tanpa data menampilkan komponen `EmptyState` lengkap dengan ikon, judul deskriptif, penjelasan sebab kosong, dan tombol aksi pemulihan. | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §20, `wiki/moduzen/livewire-ux-engineering-playbook.md` §14.2. |
| 14 | **Kamus Istilah Antarmuka Baku Bahasa Indonesia** | Penggunaan label UI konsisten: *Baru*, *Dikerjakan*, *Selesai*, *Batal*, *Simpan*, *Belum ditugaskan* (bukan *Unassigned*). Istilah teknis universal (CSV, API) tetap dipertahankan. | `brain-v2.1: wiki/deliverables/2026-09-02-panduan-uat-helpdesk.md` §Kamus label final, commit `971c0fd`. |
| 15 | **Umpan Balik Koneksi Terputus (Offline Feedback)** | Sistem mendeteksi hilangnya koneksi jaringan, menampilkan indikator offline, dan mengunci tombol aksi tulis agar data tidak hilang secara tak terduga. | `brain-v2.1: wiki/moduzen/livewire-ux-engineering-playbook.md` §6, `wiki/memory/livewire-ux-template-standard.md`. |
| 16 | **Penyelarasan Lebar Konten Form Responsif** | Halaman form input menggunakan kontainer terpusat yang proporsional (`max-w-4xl` s/d `max-w-5xl`) agar judul, header, dan form sejajar serta tidak terentang berlebihan di layar lebar. | `brain-v2.1: wiki/deliverables/2026-09-02-kit-pola-ui-product.md` §2.A (baris 33-36). |

---

## Rincian Panduan & Implementasi Komponen di Volt

### 1. Pola Baris Aksi Form (Action Row Pattern)
Tombol form tidak boleh diletakkan sembarangan di sisi kiri atau tercampur tanpa hierarki:
- Gunakan `<ActionRow>` di bawah form: `border-t border-card-line pt-4 flex items-center justify-between gap-3`.
- Aksi sekunder (misal tombol `Batal` bertipe `variant="secondary"`) berada di sisi kiri.
- Aksi primer (misal `SubmitButton` atau tombol `Simpan`) berada di sisi paling kanan.

### 2. Tombol Submit dengan State Pending (SubmitButton)
Saat pengguna menekan tombol kirim:
- Tombol otomatis menampilkan indikator spinner pemrosesan dan mengubah label menjadi kata kerja progresif (misal: "Menyimpan...", "Mengirim...").
- Atribut `disabled` diaktifkan agar klik berulang tidak mengirim request berkali-kali ke server.
- Form/kontainer induk diberi `aria-busy="true"` untuk aksesibilitas.

### 3. Konfirmasi Aksi Destruktif (Destructive Confirmation Dialog)
Jangan menempatkan tombol aksi destruktif (hapus permanen) secara langsung tanpa pelindung:
- Gunakan modal/alert konfirmasi yang jelas: judul pertanyaan eksplisit (misal: "Hapus 3 pengguna?"), deskripsi risiko ("Tindakan ini permanen dan tidak dapat dibatalkan"), serta dua tombol aksi: `Batal` (warna netral) dan `Hapus` (warna merah / destructive).

### 4. Notifikasi dan Flash Message (Notice / Toast)
Gunakan komponen `Notice` untuk pesan dalam halaman dan `Toast` untuk notifikasi melayang:
- Mendukung varian: `success`, `error`, `warning`, `info`.
- Menyediakan `role="alert"` atau `role="status"` dengan `aria-live="polite"`.
- Opsi tombol dismiss (tutup) dan auto-dismiss setelah beberapa detik.

### 5. Format Angka Rupiah dan Tanggal Indonesia
Hindari format mentah mata uang dan tanggal bahasa Inggris:
- Gunakan helper `formatRupiah(amount)` -> `Rp 14.000` (angka bulat tanpa desimal sen).
- Gunakan helper `formatDateIndo(date)` -> `2 September 2026` dan `formatDateTimeIndo(date)` -> `2 September 2026, 14:30 WIB`.

### 6. Fokus Otomatis pada Field Pertama yang Error (Auto-focus First Error)
Pada saat form gagal divalidasi oleh server atau klien:
- Halaman mendeteksi elemen input pertama yang memiliki pesan error atau `aria-invalid="true"`.
- Kursor/fokus otomatis digeser ke elemen tersebut dengan `input.focus()`.
- Warna border merah tetap terjaga di CSS agar pengguna langsung mengenali letak koreksi yang diperlukan.
