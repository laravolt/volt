# Copywriting UI Bahasa Indonesia

Gunakan bahasa ringkas, aktif, spesifik, netral, dan berorientasi tindakan.
Sumber: GOV.UK Error Message/Summary, Smashing error-message guidance, NN/g
Empty States dan Confirmation Dialogs, serta NotebookLM note
`volt-ux/09-copywriting-id`.

## Kamus istilah

| Hindari | Gunakan |
| --- | --- |
| Submit | Simpan / Kirim / Lanjutkan, sesuai akibat |
| Cancel | Batal |
| Delete | Hapus |
| Edit | Ubah |
| Create / Add | Buat / Tambah |
| Retry | Coba lagi |
| Reset filters | Atur ulang filter |
| Clear selection | Hapus pilihan |
| Search | Cari |
| Loading | Memuat... |
| Saving | Menyimpan... |
| Sending | Mengirim... |
| Processing | Memproses... |
| Selected | Dipilih |
| No results | Tidak ada hasil yang cocok |
| Empty | Belum ada data |
| Unassigned | Belum ditugaskan |
| Enabled / Disabled | Aktif / Nonaktif |
| Success | Berhasil, lalu sebutkan hasil |
| Error | Jelaskan masalah dan langkah berikutnya |

Istilah teknis universal seperti API, CSV, URL, dan ID boleh dipertahankan bila
lebih jelas daripada terjemahannya.

## Label dan bantuan

- Label menamai nilai yang diminta: `Nama lengkap`, `Alamat email`, `Tanggal jatuh tempo`.
- Hindari instruksi panjang seperti `Silakan masukkan nama lengkap Anda di bawah ini`.
- Help text menambah aturan yang benar-benar diperlukan: `Gunakan minimal 8 karakter.`
- Contoh format: `Contoh: nama@domain.id`.
- Jangan mengulang label di placeholder; petunjuk penting harus tetap terlihat.
- Legenda wajib satu kali: `* wajib diisi`.

## Pesan error field

Pola:

- Kosong: `Masukkan [label].`
- Terlalu pendek/panjang: `[Label] harus [batasan].`
- Format: `Masukkan [label] dengan format [format].`
- Rentang: `[Label] harus antara [minimum] dan [maksimum].`
- Konflik: `[Label] sudah digunakan. Gunakan nilai lain.`
- Ketergantungan: `Pilih [A] sebelum mengisi [B].`

Contoh:

- `Masukkan alamat email.`
- `Kata sandi harus minimal 8 karakter.`
- `Masukkan tanggal dengan format DD-MM-YYYY.`
- `Jumlah harus lebih dari 0.`
- `Alamat email sudah digunakan. Gunakan alamat lain.`

Hindari:

- `Oops!`
- `Input tidak valid.`
- `Terjadi kesalahan.` tanpa langkah perbaikan
- kode internal, jargon teknis, humor, atau kalimat yang menyalahkan pengguna
- mengulang contoh format dalam error jika help text yang sama sudah terlihat

## Error summary

Judul tetap:

```text
Ada masalah
```

Isi berupa tautan dengan teks yang sama persis seperti error field:

```text
Ada masalah
- Masukkan alamat email.
- Kata sandi harus minimal 8 karakter.
```

Untuk satu error, fokus boleh langsung ke field. Untuk beberapa error, fokus ke
summary lalu biarkan tautan memindahkan fokus ke field terkait.

## Pending dan progres

Gunakan kata kerja yang sama dengan aksi awal:

| Tombol awal | Pending |
| --- | --- |
| Simpan | Menyimpan... |
| Kirim | Mengirim... |
| Hapus data | Menghapus data... |
| Unggah file | Mengunggah file... |
| Ekspor | Mengekspor... |
| Proses | Memproses... |

Hindari `Loading`, `Please wait`, atau label yang tidak menjelaskan proses.

## Feedback

### Berhasil / info

Pola: `[Entitas] berhasil [tindakan].`

- `Profil berhasil disimpan.`
- `Tautan berhasil disalin.`
- `3 data berhasil diekspor.`

### Peringatan

Pola: `[Kondisi]. [Dampak atau tindakan aman].`

- `Koneksi terputus. Perubahan belum dikirim dan tetap tersimpan di halaman ini.`
- `Sesi akan berakhir dalam 5 menit. Simpan perubahan sebelum melanjutkan.`

### Gagal

Pola: `Gagal [tindakan] karena [penyebab yang dipahami]. [pemulihan].`

- `Gagal menyimpan karena koneksi terputus. Periksa koneksi, lalu coba lagi.`
- `Gagal memuat daftar. Coba lagi beberapa saat.`

Error, peringatan penting, dan informasi yang membutuhkan tindakan tidak boleh
hilang otomatis. Toast singkat hanya untuk status pasif sekunder dan tetap
menyediakan tombol `Tutup`.

## Empty, no-results, dan error state

### First use / belum ada data

```text
Belum ada [entitas].
[Penjelasan manfaat atau cara data muncul].
[Tambah/Buat entitas]
```

Contoh:

```text
Belum ada kategori.
Tambahkan kategori untuk mengelompokkan data.
Tambah kategori
```

### Tidak ada hasil filter

```text
Tidak ada [entitas] yang cocok.
Ubah kata kunci atau atur ulang filter.
Atur ulang filter
```

Jangan menawarkan `Tambah data` bila penyebabnya hanya filter aktif.

### Gagal memuat / akses

```text
Gagal memuat [entitas].
[Penjelasan singkat bila diketahui].
Coba lagi
```

```text
Anda belum memiliki akses ke [entitas].
Minta akses kepada pengelola ruang kerja.
Minta akses
```

Jangan tampilkan empty state sebelum loading selesai.

## Konfirmasi destruktif

Pola judul:

```text
Hapus [jumlah] [entitas]?
```

Pola isi:

```text
Anda akan menghapus [detail yang membedakan]. Tindakan ini permanen dan tidak dapat dibatalkan.
```

Pola tombol:

```text
Batal | Hapus [entitas]
```

Contoh tunggal:

```text
Hapus kategori “Arsip”?
Kategori akan dihapus secara permanen. Data di dalamnya tidak ikut terhapus.
Batal | Hapus kategori
```

Contoh massal:

```text
Hapus 12 data?
Data yang dipilih akan dihapus secara permanen dan tidak dapat dibatalkan.
Batal | Hapus data
```

Hindari `Apakah Anda yakin?`, `Ya/Tidak`, dan tombol `OK`. Jika aksi dapat
dipulihkan, utamakan notifikasi hasil dengan aksi `Batalkan` daripada dialog.
Konfirmasi dengan mengetik kata hanya untuk aksi yang sangat berbahaya dan jarang.

## Filter, tabel, dan pagination

- Jumlah hasil: `Menampilkan 24 dari 120 data.`
- Pilihan massal: `5 data dipilih.`
- Sort: `Diurutkan berdasarkan tanggal, terbaru lebih dahulu.`
- Pagination: `Halaman 2 dari 8.`
- Aksi baris yang aksesibel harus menyertakan konteks: `Ubah kategori Arsip`, bukan hanya `Ubah`.
