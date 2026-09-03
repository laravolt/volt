# Panduan UX Volt

Panduan ini menetapkan default UX untuk starter Volt. Aturan aksesibilitas dan
usabilitas dirangkum dari NotebookLM **Volt UX Foundations**; keputusan lokal
seperti batas jumlah opsi dibuat eksplisit sebagai konvensi, bukan hukum universal.
Implementasi ringkas tersedia di `.claude/skills/volt-ux/`.

## Sumber utama

- Adam Silver, *Form Design Patterns*
- Adam Wathan & Steve Schoger, *Refactoring UI*
- Heydon Pickering, *Inclusive Design Patterns*
- Manuel Matuzović, *Web Accessibility Cookbook*
- WAI-ARIA Authoring Practices Guide (APG)
- GOV.UK Design System dan U.S. Web Design System (USWDS)
- Nielsen Norman Group (NN/g), LukeW, dan Pencil & Paper

Audit NotebookLM disimpan sebagai note `volt-ux/01-choice-controls` sampai
`volt-ux/11-visual-hierarchy` agar keputusan dapat ditelusuri.

## 16 aturan

| # | Aturan | Default Volt | Dasar singkat |
| --- | --- | --- | --- |
| 1 | Hierarki aksi | Satu aksi primer jelas; aksi sekunder lebih tenang; urutan DOM sama dengan urutan visual. | Form Design Patterns; Web Accessibility Cookbook |
| 2 | Pending dan anti double-submit | Submit aktif saat awal, lalu terkunci hanya setelah submit valid; tangani event form agar Enter ikut terlindungi; tandai form sibuk. | Form Design Patterns; Smashing disabled buttons |
| 3 | Aksi destruktif | Utamakan Undo bila aman; untuk aksi serius/irreversibel, dialog menyebut aksi, entitas, jumlah, dan akibat. | NN/g Confirmation Dialogs; APG Dialog |
| 4 | Kanal feedback | Field error untuk koreksi field; Notice untuk konteks halaman; indicator untuk status melekat; Toast hanya untuk status pasif sekunder. | NN/g feedback taxonomy; APG Alert |
| 5 | Field wajib | Gunakan `required`, penanda visual, dan satu legenda `* wajib diisi` dekat awal form. | Inclusive Design Patterns; Web Accessibility Cookbook |
| 6 | Fokus setelah error | Satu error dapat fokus ke field; beberapa error fokus ke summary yang menaut ke setiap field. | GOV.UK Error Summary; Form Design Patterns |
| 7 | State error terlihat | Error tetap terbaca saat fokus dan tidak mengandalkan warna saja. | Form Design Patterns; Web Accessibility Cookbook |
| 8 | Pesan error solutif | Pesan berada dekat field, menyebut masalah, dan memberi cara memperbaiki tanpa jargon atau menyalahkan. | GOV.UK Error Message; NN/g form errors |
| 9 | Pilihan pendek/panjang | **Konvensi Volt:** 2–5 opsi tunggal memakai radio; >5 memakai combobox dengan pencarian. Batas lain dapat dipilih bila riset pengguna memberi alasan. | NN/g radios; USWDS; LukeW |
| 10 | Segmentasi form | `fieldset`/`legend` hanya untuk grup kontrol yang butuh konteks bersama; seksi input biasa memakai heading. | Form Design Patterns; Inclusive Design Patterns |
| 11 | Format Rupiah | Tampilkan `Rp 14.000` untuk nominal bulat; gunakan helper lokal dan uji nilai negatif/besar. | Konvensi locale `id-ID` |
| 12 | Format tanggal/waktu | Gunakan format Indonesia yang jelas dan zona waktu eksplisit; jangan memberi label zona yang berbeda dari konversi aktual. | Konvensi locale `id-ID` |
| 13 | Empty dan error state | Bedakan first-use, no-data, no-results, permission, dan load failure; jelaskan sebab dan beri pemulihan yang benar. | NN/g Empty States |
| 14 | Copywriting Indonesia | Gunakan istilah ringkas, aktif, spesifik, konsisten, dan action-oriented; istilah teknis universal boleh dipertahankan. | GOV.UK content/error guidance |
| 15 | Koneksi terputus | Jelaskan bahwa pengiriman tertunda, pertahankan input, dan sediakan retry; jangan sekadar mengunci kontrol tanpa jalan keluar. | Smashing disabled buttons; Web Accessibility Cookbook |
| 16 | Hierarki visual responsif | Gunakan type/spacing scale dan token semantik; lebih banyak ruang antargrup daripada di dalam grup; batasi lebar baca. | Refactoring UI |

## Keputusan komponen

| Situasi | Gunakan |
| --- | --- |
| Satu pilihan, 2–5 opsi | `RadioGroup`, `RadioField`, `Radio`, `Fieldset`, `Legend` |
| Satu pilihan, >5 opsi | Typed searchable `Combobox` |
| Beberapa pilihan kecil | `CheckboxGroup`, `CheckboxField`, `Checkbox` |
| Boolean yang disimpan saat submit | Standalone `Checkbox` |
| Boolean yang berlaku segera | `Switch` |
| Tanggal/waktu | Native `Input` dengan tipe date/time yang sesuai |
| Submit form | Project `SubmitButton` atau handler submit milik form |
| Destructive standalone | Project `ConfirmDialog`; di dalam island yang sudah ada, compose `Alert` biasa |
| Feedback inline | Project `Notice` |
| Feedback pasif sekunder | Project `Toast` |
| Empty/error state | Project `EmptyState`; `volt-pro/empty-state` bila paket tersedia |
| Tabel | `volt-preline/table`; helper `volt-pro` bila paket tersedia |

`Notice`, `Toast`, `SubmitButton`, `ConfirmDialog`, `EmptyState`, dan
`AutoFocusError` adalah helper project, bukan export `volt-preline`.
`volt-preline/button` menerima tepat satu gaya: `color`, `outline`, atau `plain`;
tidak ada prop `variant`.

## Form dan validasi

1. Setiap kontrol memiliki label visual yang terkait secara programatik.
2. Placeholder bukan label; gunakan hanya sebagai contoh opsional yang pendek.
3. Petunjuk penting tetap terlihat dan terhubung melalui `aria-describedby`.
4. Nilai yang sudah benar dipertahankan setelah validasi atau kegagalan sistem.
5. Field invalid menggunakan state programatik dan pesan inline yang spesifik.
6. Error summary memuat tautan dengan teks yang sama seperti error inline.
7. Jangan memakai `fieldset` hanya untuk styling atau section card.
8. Submit tidak dinonaktifkan sejak awal tanpa alasan dan penjelasan.
9. Pending dimulai dari jalur `submit`, bukan hanya click tombol.

## Dialog destruktif

- Gunakan dialog hanya untuk tindakan dengan konsekuensi serius atau tidak mudah dipulihkan.
- Judul: `Hapus 12 data?`, bukan `Apakah Anda yakin?`.
- Deskripsi menjelaskan apa yang hilang dan apakah tindakan dapat dibatalkan.
- Tombol aman dan tombol destruktif memakai label konsekuensi yang jelas.
- Fokus masuk ke dialog, tetap di dalamnya, Escape menutup, dan fokus kembali ke pemicu.
- Fokus awal aksi destruktif berada pada target yang aman.
- Konfirmasi dengan mengetik kata hanya untuk tindakan yang sangat berbahaya dan jarang.

## Feedback

- `role="status"`/polite untuk pembaruan rutin dan hasil non-kritis.
- `role="alert"`/assertive hanya untuk informasi mendesak atau sensitif waktu.
- Alert tidak mengambil fokus; gunakan dialog bila interupsi benar-benar diperlukan.
- Error, warning penting, dan pesan yang membutuhkan tindakan tidak auto-dismiss.
- Success/info pasif boleh auto-dismiss setelah waktu baca yang layak dan tetap memiliki tombol tutup.

## Tabel, filter, dan daftar

- Beri nama/caption yang aksesibel dan header asli.
- Teks rata kiri; angka, uang, dan nilai yang dibandingkan rata kanan.
- Aksi berulang memiliki accessible name yang menyebut record.
- Bulk toolbar muncul setelah pilihan dan mengumumkan jumlah terpilih.
- Destructive bulk action mengonfirmasi jumlah dan akibat.
- Filter aktif terlihat dan memiliki aksi Atur ulang.
- Sort memakai button dan `aria-sort`; pagination memakai nav berlabel dan current state.
- Perubahan hasil dinamis diumumkan melalui status tanpa mencuri fokus dari input filter.
- Loading memakai indikator/`aria-busy`; empty state baru muncul setelah loading selesai.
- Tabel lebar berada dalam region scroll horizontal yang dapat difokuskan dan memiliki nama.

## Empty dan error state

- **First use/no data:** jelaskan fungsi area dan beri aksi mulai bila tersedia.
- **No results:** sebutkan filter/kata kunci dan beri aksi atur ulang, bukan CTA membuat data.
- **Permission:** jelaskan keterbatasan dan jalur meminta akses bila ada.
- **Load failure:** beri pesan netral, retry/help, dan pertahankan pekerjaan pengguna.
- Jangan pernah menampilkan `Data kosong` ketika sistem masih memuat.

## Remix island

- Server-render dahulu; hydrate hanya interaksi yang membutuhkan state browser.
- Source island berada di `app/**/public/**`; props berupa data serializable dan memakai `type` alias.
- Independent sibling islands diperbolehkan.
- Jangan melewatkan page content, event mixin, atau island lain sebagai children/props serializable dari `clientEntry`.
- Island tabel/page yang sudah aktif harus memiliki state `Alert`, `Combobox`, atau kontrol interaktif turunannya sendiri; jangan menumpuk client entry.
- Jangan mengirim `checked`, `value`, atau `open` sebagai `undefined`.

## Contoh tombol yang valid

```tsx
<Button color="blue" type="submit">Simpan</Button>
<Button outline type="button">Batal</Button>
<Button plain href={backHref}>Kembali</Button>
```

Lihat `.claude/skills/volt-ux/references/components.md` untuk recipe lengkap dan
`.claude/skills/volt-ux/references/copywriting-id.md` untuk pola pesan.
