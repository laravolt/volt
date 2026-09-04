# volt-ux skill evaluation

Manual blind evaluation for the repository-local UX skill.

## Protocol

1. Run each scenario in a fresh Agent subagent with no shared conversation.
2. Tell the agent to follow repository guidance and inspect installed APIs, but do not name the UX skill or expected components.
3. The agent must not read `test/skills/**` or GitHub issue #2.
4. Keep the run read-only. Ask for a concrete implementation sketch with imports, component placement, props, form behavior, and relevant copy.
5. After the sketch, ask the agent to list repository guidance files it consulted.
6. Score only the returned implementation; do not reward claims without code evidence.
7. On failure, revise the skill and rerun the failed scenario with a fresh agent, maximum two revision rounds.

## Scenario prompts

### A — form with two options

> Buat rancangan implementasi halaman Remix 3 untuk form pengaturan publikasi. Ada satu pertanyaan wajib dengan tepat dua jawaban pendek: “Draf” dan “Terbit”. Form harus tetap bekerja tanpa JavaScript, menampilkan validasi yang dapat diakses, dan mengikuti seluruh panduan repo. Berikan kode konkret beserta path file yang disarankan. Jangan mengubah repo.

### B — form with twenty options

> Buat rancangan implementasi halaman Remix 3 untuk memilih tepat satu wilayah dari 20 pilihan bernama. Pengguna harus dapat menemukan pilihan dengan cepat, nilai pilihan harus ikut terkirim oleh form server, error harus dapat diakses, dan implementasi harus mengikuti seluruh panduan repo. Berikan kode konkret beserta path file yang disarankan. Jangan mengubah repo.

### C — permanent bulk deletion

> Buat rancangan implementasi halaman Remix 3 berisi tabel dengan checkbox untuk memilih beberapa data dan aksi penghapusan permanen massal. Alur harus aman untuk keyboard, mencegah penghapusan tidak sengaja, menyertakan CSRF, dan mengikuti seluruh panduan repo. Berikan kode konkret beserta path file yang disarankan. Jangan mengubah repo.

## Parent-only rubric

### A passes when

- Uses `RadioGroup`, `RadioField`, and `Radio`.
- Uses semantic `Fieldset`/`Legend` for the related choice.
- Uses visible labels and accessible error treatment.
- Does not use native `Select`, `Listbox`, or `Combobox`.
- Remains server-first; no island is added without interaction that needs it.

### B passes when

- Uses the generic searchable `Combobox` and typed option model.
- Uses a function `valueKey={(option) => option.id}` and posts a named hidden value.
- Places interaction under an app-owned `public/` client entry.
- Uses serializable `type`-alias props.
- Does not put this island through another island's children/serialized props.
- Uses visible label and accessible error treatment.

### C passes when

- Uses `Table`, named row checkboxes, and selected-count feedback.
- Uses a confirmation pattern based on `volt-preline/alert` with entity/count and consequence-specific copy.
- Keeps selection and confirmation state inside the owning table island.
- Posts only after confirmation and includes the CSRF field.
- Provides a safe cancel action; does not nest the project `ConfirmDialog` client entry.
- Does not invent `volt-preline/confirm-dialog`.

### All scenarios fail for

- Invented package imports or unsupported props such as `Button variant`.
- Placeholder used as the only label.
- Fake clickable `div` controls or positive `tabindex`.
- A client entry passed as a child/serialized prop through another client entry.
- Non-neutral organization, client, company, or derived-project identifiers.

## Results

| Date | Scenario | Agent | Result | Evidence |
| --- | --- | --- | --- | --- |
| 2026-09-03 | A | fresh general-purpose subagent | PASS | Chose `RadioGroup`/`RadioField`/`Radio` inside `Fieldset`/`Legend`, native required validation, inline error, preserved values, and no select or unnecessary field island. |
| 2026-09-03 | B | fresh general-purpose subagent | PASS | Chose a typed searchable `Combobox` in `app/**/public/**`, function `valueKey`, named form value, visible label/error wiring, serializable `type` props, and sibling-island composition. |
| 2026-09-03 | C | fresh general-purpose subagent | PASS | Chose an owner-table island with `Table`/`Checkbox`, selected-count status, CSRF, `Alert` confirmation naming count/consequence, safe cancel, and post-confirm submit without nested client entry. |
