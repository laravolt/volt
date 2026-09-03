# Volt — Agent Guide

Remix **3.0.0-rc.1** (web-standards Remix, not v2) + better-sqlite3 + Tailwind v4 + volt-preline.

## Commands
```sh
npm run dev | npm test | npm run typecheck | npm run migrate | npm run routes | npm run doctor
```
Install with `bun install` (npm on this machine blocks packages younger than 7 days).

## Non-negotiable rules (see ARCHITECTURE.md)
1. **Handler → Service → Repository → DB.** No layer may be skipped.
2. SQL only in `app/repositories/*`. Services never touch `Db`; handlers never touch repositories.
3. Auth identity comes from the session payload (`context.get(Auth)`), never a per-request users query.
4. Every state-changing route goes through the global `csrf()`; pages render `<CsrfField>`.
5. Session id rotates on login (`completeAuth(context)` then `setSessionUser`).
6. Schema changes are SQL migrations in `db/migrations/<ts>_<slug>/`; never edit applied ones.
7. Halaman error harus HTML; status apa pun dirender. Runtime client (`app/actions/public/entry.ts`) memakai custom `resolveFrame` yang meneruskan response ber-content-type `text/html` apa pun statusnya (401, 422, 429) agar UI pesan error dirender ke dalam frame.

## Where things go
- New URL → `app/routes.ts` first, then the owning `app/actions/<area>/controller.tsx`.
- Route-local page components live next to the controller (`pages.tsx`); shared UI in `app/ui/`.
- Services are reached via `context.services.<name>`; new services register in `app/services/index.ts`.
- Validation: `remix/data-schema` + `remix/data-schema/form-data`; helpers in `app/actions/shared.ts` (`str.required`, `parseForm`).
- Errors: services throw `DomainError`; handlers map with `toFieldErrors` or return JSON.
- Tests: `test/**/*.test.ts` using `test/helpers.ts` (`createTestApp`, `login`, `csrfFor`).

## UI components
- All pages use `volt-preline/*` (Preline UI tokens on Remix UI; git dep pinned by commit, MIT).
  `volt-catalyst/*` has the identical API for licensed teams. Props accept `className`; form
  controls read ids from `<Field>` context. Style with semantic tokens (`bg-card`, `text-muted-foreground`), not raw palette classes.
- Interactive Catalyst parts only hydrate inside a `clientEntry` island under a `public/` dir:
  `app/ui/public/app-shell.tsx` (StackedLayout + Navbar + account Dropdown + mobile drawer) and
  `app/actions/app/public/users-table.tsx` (Table + Checkbox + Alert confirm). Island props must be
  plain serializable objects typed with `type` aliases (interfaces fail `SerializableProps`).
- Auth pages share `app/ui/auth-card.tsx`; `app/ui/form.tsx` holds `CsrfField`/`Notice`/`ActionRow`/`RequiredLegend`/types.
- Standard UX components (UAT brain-v2.1 guidelines, detail di `docs/UX_GUIDELINES.md`):
  - **Notice** (`app/ui/form.tsx`): Banner notifikasi halaman dengan varian semantik (`success`, `error`, `warning`, `info`), `role="alert"/"status"`, dan `aria-live="polite"`.
  - **Toast** (`app/ui/public/toast.tsx`): Notifikasi melayang di pojok layar dengan auto-dismiss timer dan tombol tutup manual.
  - **ActionRow** (`app/ui/form.tsx`): Baris tombol aksi form standar (`border-t`), aksi sekunder/batal di kiri, aksi primer di paling kanan.
  - **SubmitButton** (`app/ui/public/submit-button.tsx`): Tombol submit interaktif yang mengunci double-submit, menampilkan spinner + label pending ("Menyimpan..."), dan mengeset `aria-busy="true"` pada form.
  - **ConfirmDialog** (`app/ui/public/confirm-dialog.tsx`): Dialog konfirmasi modal berbasis `Alert` untuk aksi destruktif (delete, cancel) dengan deskripsi risiko eksplisit.
  - **EmptyState** (`app/ui/empty-state.tsx`): Komponen keadaan kosong standar untuk tabel/daftar dengan ikon, judul deskriptif, dan tombol aksi perbaikan.
  - **AutoFocusError** (`app/ui/public/auto-focus-error.tsx`): Mengarahkan fokus kursor otomatis ke field pertama yang bermasalah saat validasi form gagal.
  - **Format Helpers** (`app/ui/public/format.ts` & `app/ui/format.ts`): `formatRupiah` (integer IDR tanpa sen), `parseRupiah`, `formatDateIndo`, `formatDateTimeIndo` (lokalisasi id-ID).
- Never pass `checked/value/open={undefined}` explicitly to host elements (rc.1 resets the DOM prop).
- After changing UI classes run `npm run css` (or keep `css:watch` running).

## Remix 3 reference
`.agents/skills/remix/SKILL.md` and `references/*.md` (shipped by `remix new`). Package READMEs:
`node_modules/@remix-run/<pkg>/README.md`.

## Gotchas
- JSX attributes are `className`/`htmlFor` (`jsxImportSource: remix/ui`). Components are
  `function X(handle: Handle<Props>) { return () => <.../> }`.
- `data-schema` checks take no message argument; use `.refine(pred, message)` (see `str` helpers).
- `app/router.ts` must stay side-effect free (tests import it); the real DB opens in `app/app.ts`.
- Tailwind output `public/app.css` is gitignored; `predev`/`prestart` rebuild it.
