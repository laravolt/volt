# Verified component recipes

APIs below were checked against `volt-preline@0.1.0` declarations and
`volt-pro@0.2.0` source/declarations. `volt-pro` is optional and private; never
copy its repository URL, source, or license-restricted assets into a public
change. If it is not installed, use the `volt-preline` and project-local paths.

## Availability

| Need | Verified implementation |
| --- | --- |
| Field anatomy | `volt-preline/fieldset`: `Fieldset`, `Legend`, `FieldGroup`, `Field`, `Label`, `Description`, `ErrorMessage` |
| Text/date input | `volt-preline/input`: `Input`, `InputGroup` |
| Long text | `volt-preline/textarea`: `Textarea` |
| Small single choice | `volt-preline/radio`: `RadioGroup`, `RadioField`, `Radio` |
| Multiple choice | `volt-preline/checkbox`: `CheckboxGroup`, `CheckboxField`, `Checkbox` |
| Immediate boolean | `volt-preline/switch`: `SwitchGroup`, `SwitchField`, `Switch` |
| Large single choice | `volt-preline/combobox`: generic `Combobox`, `ComboboxOption`, `ComboboxLabel`, `ComboboxDescription` |
| Compact single choice | `volt-preline/listbox`: `Listbox`, `ListboxOption`, `ListboxLabel`, `ListboxDescription` |
| Native select exception | `volt-preline/select`: `Select` |
| Buttons | `volt-preline/button`: exactly one of `color`, `outline`, or `plain` |
| Confirmation primitive | `volt-preline/alert`: `Alert`, `AlertTitle`, `AlertDescription`, `AlertActions` |
| Data table | `volt-preline/table`; optional `volt-pro/pro-table` headings and `volt-pro/users-page` blocks |
| Empty state | Project `app/ui/empty-state.tsx`; optional `volt-pro/empty-state` |
| Feedback/actions | Project `Notice`, `ActionRow`, `RequiredLegend`, `Toast`, `SubmitButton`, `ConfirmDialog`, `AutoFocusError` |
| Pro search/filter | `volt-pro/search-input`: controlled `SearchInput` |

Not exported by `volt-preline`: `Chip`, `SegmentedControl`, `Toast`, `Notice`,
`DatePicker`, `ConfirmDialog`, `SubmitButton`, `EmptyState`, `AutoFocusError`.
Do not invent those package imports. `ToggleButton` from `volt-pro/toggle-button`
is an action button (follow/connect style), not a form Switch.

## 1. Standard field anatomy

```tsx
import { Field, Label, Description, ErrorMessage } from 'volt-preline/fieldset'
import { Input } from 'volt-preline/input'

<Field id="email">
  <Label>
    Email <span aria-hidden="true">*</span>
  </Label>
  <Description>Gunakan alamat yang dapat menerima pesan.</Description>
  <Input
    type="email"
    name="email"
    required
    defaultValue={values.email}
    {...(errors.email ? { invalid: true } : {})}
  />
  {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
</Field>
```

`Field` supplies the control ID and `aria-describedby` IDs to compatible
controls. Keep `Description` persistent; placeholder is not a label.

## 2. Two to five options: visible radios

```tsx
import { Fieldset, Legend, Label, Description, ErrorMessage } from 'volt-preline/fieldset'
import { RadioGroup, RadioField, Radio } from 'volt-preline/radio'

<Fieldset>
  <Legend>Status publikasi</Legend>
  <Description>Pilih satu opsi.</Description>
  <RadioGroup name="status" defaultValue={values.status}>
    <RadioField>
      <Radio value="draft" required />
      <Label>Draf</Label>
      <Description>Belum terlihat oleh pembaca.</Description>
    </RadioField>
    <RadioField>
      <Radio value="published" />
      <Label>Terbit</Label>
      <Description>Langsung terlihat oleh pembaca.</Description>
    </RadioField>
  </RadioGroup>
  {errors.status && <ErrorMessage>{errors.status}</ErrorMessage>}
</Fieldset>
```

Never replace this two-option example with native `Select`. If a segmented
visual is truly needed, preserve these radio semantics and use only an existing,
verified style/component.

## 3. Small multiple choice: checkbox group

```tsx
import { Label, Description } from 'volt-preline/fieldset'
import { CheckboxGroup, CheckboxField, Checkbox } from 'volt-preline/checkbox'

<CheckboxGroup>
  {[
    ['email', 'Email'],
    ['sms', 'SMS'],
    ['push', 'Notifikasi aplikasi'],
  ].map(([value, label]) => (
    <CheckboxField key={value}>
      <Checkbox name="channels" value={value} />
      <Label>{label}</Label>
      <Description>Pilih jika ingin menerima pembaruan melalui {label}.</Description>
    </CheckboxField>
  ))}
</CheckboxGroup>
```

For more than five choices, keep selection explicit and filter the visible
checkbox list; do not claim `Combobox` or `Listbox` supports multiple values.

```tsx
// app/actions/filters/public/category-filter.tsx
import { clientEntry, type Handle } from 'remix/ui'
import { Input } from 'volt-preline/input'
import { Checkbox, CheckboxField } from 'volt-preline/checkbox'
import { Label } from 'volt-preline/fieldset'

type Category = { id: string; name: string }
type CategoryFilterProps = { categories: Category[] }

export const CategoryFilter = clientEntry<CategoryFilterProps>(
  import.meta.url,
  function CategoryFilter(handle: Handle<CategoryFilterProps>) {
    let query = ''
    return () => {
      let visible = handle.props.categories.filter((category) =>
        category.name.toLowerCase().includes(query.toLowerCase()),
      )
      return (
        <div>
          <Label htmlFor={`${handle.id}-filter`}>Cari kategori</Label>
          <Input
            id={`${handle.id}-filter`}
            type="search"
            value={query}
            onInput={(event) => { query = event.currentTarget.value; handle.update() }}
          />
          {visible.map((category) => (
            <CheckboxField key={category.id}>
              <Checkbox name="categoryIds" value={category.id} />
              <Label>{category.name}</Label>
            </CheckboxField>
          ))}
        </div>
      )
    }
  },
)
```

## 4. More than five options: typed searchable combobox

This behavior needs one app-owned island under `public/`.

```tsx
// app/actions/settings/public/region-field.tsx
import { clientEntry, type Handle } from 'remix/ui'
import { Field, Label, ErrorMessage } from 'volt-preline/fieldset'
import {
  Combobox,
  ComboboxOption,
  ComboboxLabel,
  ComboboxDescription,
} from 'volt-preline/combobox'

type Region = { id: string; name: string; code: string }
type RegionFieldProps = {
  regions: Region[]
  defaultRegionId?: string
  error?: string
}

const RegionCombobox = Combobox as typeof Combobox<Region>
const RegionOption = ComboboxOption as typeof ComboboxOption<Region>

export const RegionField = clientEntry<RegionFieldProps>(
  import.meta.url,
  function RegionField(handle: Handle<RegionFieldProps>) {
    return () => {
      let { regions, defaultRegionId, error } = handle.props
      let defaultRegion = regions.find((region) => region.id === defaultRegionId) ?? null

      return (
        <Field id="region">
          <Label>Wilayah</Label>
          <RegionCombobox
            name="regionId"
            options={regions}
            defaultValue={defaultRegion}
            displayValue={(region) => region?.name}
            valueKey={(region) => region.id}
            filter={(region, query) =>
              `${region.name} ${region.code}`.toLowerCase().includes(query.toLowerCase())
            }
            placeholder="Cari wilayah"
            {...(error ? { invalid: true } : {})}
          >
            {(region) => (
              <RegionOption value={region}>
                <ComboboxLabel>{region.name}</ComboboxLabel>
                <ComboboxDescription>{region.code}</ComboboxDescription>
              </RegionOption>
            )}
          </RegionCombobox>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Field>
      )
    }
  },
)
```

`valueKey` is a function returning the string posted by the hidden form input.
Do not write `valueKey="id"`; that is not this installed API.

## 5. Submitted boolean: checkbox

```tsx
<CheckboxField>
  <Checkbox name="receiveUpdates" value="yes" defaultChecked={values.receiveUpdates} />
  <Label>Saya ingin menerima pembaruan</Label>
  <Description>Perubahan disimpan saat formulir dikirim.</Description>
</CheckboxField>
```

Use positive wording. Do not pass `checked={undefined}`.

## 6. Immediate boolean: switch

```tsx
import { Label, Description } from 'volt-preline/fieldset'
import { SwitchField, Switch } from 'volt-preline/switch'

<SwitchField>
  <Label>Mode gelap</Label>
  <Description>Perubahan berlaku segera di perangkat ini.</Description>
  <Switch
    checked={darkMode}
    onChange={(checked) => {
      darkMode = checked
      applyTheme(checked)
      handle.update()
    }}
  />
</SwitchField>
```

Because `onChange` is used, render this inside an app island. For a normal form
whose value is saved later, use a checkbox instead.

## 7. Native date input

```tsx
<Field id="due-on">
  <Label>Tanggal jatuh tempo</Label>
  <Input type="date" name="dueOn" defaultValue={values.dueOn} />
  <Description>Gunakan zona waktu yang berlaku untuk proses ini.</Description>
</Field>
```

Verified input types are `date`, `datetime-local`, `month`, `time`, and `week`.
There is no `volt-preline/datepicker` export.

## 8. Compact listbox and native select exceptions

`Listbox` is a single string value and needs an owning island:

```tsx
<Listbox name="sort" defaultValue="newest" aria-label="Urutkan data">
  <ListboxOption value="newest"><ListboxLabel>Terbaru</ListboxLabel></ListboxOption>
  <ListboxOption value="oldest"><ListboxLabel>Terlama</ListboxLabel></ListboxOption>
</Listbox>
```

Use native `Select` only as an explicit exception (for example, when platform
native behavior is more important than the Volt threshold), never for the ≤5
acceptance case:

```tsx
<Field>
  <Label>Zona waktu</Label>
  <Select name="timeZone" defaultValue={values.timeZone}>
    {timeZones.map((zone) => <option key={zone.value} value={zone.value}>{zone.label}</option>)}
  </Select>
</Field>
```

Never auto-submit either control on selection.

## 9. Submit pending state

Use the project helper on a server-rendered form that is not serialized through
another client entry:

```tsx
import { SubmitButton } from '../../../ui/public/submit-button.tsx'

<form method="post" action={action}>
  <CsrfField token={csrfToken} />
  {/* fields */}
  <SubmitButton label="Simpan" pendingText="Menyimpan..." color="blue" />
</form>
```

The helper listens to the form `submit` event, so pointer clicks and Enter share
the same pending lock. `Button` styling accepts exactly one of:

```tsx
<Button color="blue">Primer</Button>
<Button outline>Sekunder</Button>
<Button plain>Minimal</Button>
```

There is no `variant` prop in `volt-preline/button`.

## 10. Notice, toast, and empty/error state

```tsx
import { Notice } from '../../../ui/form.tsx'
import { EmptyState } from '../../../ui/empty-state.tsx'

{error && <Notice variant="error" title="Gagal memuat" error={error} />}

{loaded && rows.length === 0 && (
  <EmptyState
    variant={query ? 'search' : 'default'}
    title={query ? 'Tidak ada hasil yang cocok' : 'Belum ada data'}
    description={query ? 'Atur ulang pencarian untuk melihat semua data.' : 'Tambahkan data pertama.'}
    action={query ? <Button outline type="reset">Atur ulang pencarian</Button> : <Button color="blue" href={createHref}>Tambah data</Button>}
  />
)}
```

Use project `Toast` only for passive secondary feedback. Error and warning
items persist by default; success/info may auto-dismiss and always have a manual
close button.

```tsx
import { Toast, type ToastItem } from '../../../ui/public/toast.tsx'

let toasts: ToastItem[] = [
  { id: 'copy-complete', message: 'Tautan berhasil disalin.', variant: 'success' },
]

{toasts.length > 0 && <Toast toasts={toasts} />}
```

Do not put validation, payment, deletion failure, or required next steps in this
toast.

Optional Pro empty state:

```tsx
import { EmptyState } from 'volt-pro/empty-state'

<EmptyState
  variant="search"
  compact
  title="Tidak ada hasil yang cocok"
  description="Ubah atau atur ulang pencarian."
  action={<Button outline type="reset">Atur ulang</Button>}
/>
```

Verified Pro variants: `icon`, `illustration`, `search`, `error`.

## 11. Standalone destructive confirmation

Use the project `ConfirmDialog` only where it is an independent island, not
inside another island:

```tsx
<ConfirmDialog
  triggerLabel="Hapus data"
  triggerVariant="outline"
  dialogTitle="Hapus 1 data?"
  dialogDescription="Tindakan ini permanen dan tidak dapat dibatalkan."
  confirmLabel="Hapus data"
  formAction={deleteAction}
  csrfToken={csrfToken}
/>
```

The trigger style is mapped internally to valid `color`/`outline`/`plain`
button props.

## 12. Bulk deletion inside an existing table island

The owner island must keep selection, dialog state, and final submit together.
Do not nest the `ConfirmDialog` client entry.

```tsx
// app/actions/items/public/items-table.tsx
import { clientEntry, on, type Handle } from 'remix/ui'
import { Alert, AlertActions, AlertDescription, AlertTitle } from 'volt-preline/alert'
import { Button } from 'volt-preline/button'

type ItemsTableProps = { items: Item[]; action: string; csrfToken: string }

export const ItemsTable = clientEntry<ItemsTableProps>(
  import.meta.url,
  function ItemsTable(handle: Handle<ItemsTableProps>) {
    let confirming = false
    let selectedCount = 0
    let form: HTMLFormElement | null = null

    return () => (
      <form
        method="post"
        action={handle.props.action}
        mix={on<HTMLFormElement, 'submit'>('submit', (event) => {
          form = event.currentTarget
          if (confirming) return
          event.preventDefault()
          selectedCount = form.querySelectorAll('input[name="ids"]:checked').length
          if (selectedCount === 0) return
          confirming = true
          handle.update()
        })}
      >
        <input type="hidden" name="_csrf" value={handle.props.csrfToken} />
        {/* Table + Checkbox name="ids" value={item.id} */}
        <Button type="submit" color="red">Hapus yang dipilih</Button>

        <Alert open={confirming} onClose={() => { confirming = false; handle.update() }}>
          <AlertTitle>Hapus {selectedCount} data?</AlertTitle>
          <AlertDescription>Tindakan ini permanen dan tidak dapat dibatalkan.</AlertDescription>
          <AlertActions>
            <Button plain type="button" mix={on<HTMLButtonElement, 'click'>('click', () => { confirming = false; handle.update() })}>
              Batal
            </Button>
            <Button color="red" type="button" mix={on<HTMLButtonElement, 'click'>('click', () => form?.requestSubmit())}>
              Hapus data
            </Button>
          </AlertActions>
        </Alert>
      </form>
    )
  },
)
```

`Alert` already uses the package modal mechanics (native dialog, Escape,
backdrop close, focus containment/restore). Keep the safe action first.

## 13. Data table, filters, pagination, loading

Free components:

```tsx
<div role="region" aria-labelledby="items-heading" tabIndex={0} className="overflow-x-auto">
  <Table>
    <TableHead>
      <TableRow>
        <TableHeader>Nama</TableHeader>
        <TableHeader className="text-right">Jumlah</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
<p role="status" className="sr-only">Menampilkan {rows.length} data</p>
```

Optional Pro headings and blocks:

```tsx
import { ProTableHead, ProTableHeader } from 'volt-pro/pro-table'
import { SearchInput } from 'volt-pro/search-input'
import { BulkActionsBar, TablePagination } from 'volt-pro/users-page'

<SearchInput
  value={query}
  aria-label="Cari data"
  placeholder="Cari data"
  onValueChange={(value) => { query = value; handle.update() }}
  onClear={() => { query = ''; handle.update() }}
/>

{selectedIds.length > 0 && (
  <BulkActionsBar count={selectedIds.length} label="{count} dipilih">
    <Button color="red">Hapus yang dipilih</Button>
  </BulkActionsBar>
)}

<Table>
  <ProTableHead>
    <TableRow>
      <ProTableHeader>Nama</ProTableHeader>
      <ProTableHeader className="text-right">Jumlah</ProTableHeader>
    </TableRow>
  </ProTableHead>
  {/* body */}
</Table>

<TablePagination
  page={page}
  pageCount={pageCount}
  total={total}
  totalLabel="{total} hasil"
  onPageChange={(next) => { page = next; handle.update() }}
/>
```

`SearchInput`, `BulkActionsBar`, and `TablePagination` need an owning app island
for callbacks. `ProTableHead` and `ProTableHeader` are static.

## Island boundaries

Correct: server layout renders independent sibling islands and server content.

```tsx
export function AppShell(handle: Handle<AppShellProps>) {
  return () => (
    <StackedLayout>
      <AppShellChrome user={handle.props.user} />
      <StackedLayoutContent>{handle.props.children}</StackedLayoutContent>
    </StackedLayout>
  )
}
```

Forbidden: making the shell itself a `clientEntry` and passing page content,
another client entry, or event mixins through its `children`. Client-entry props
must be plain serializable data using `type` aliases. An island may own ordinary
interactive descendants; it may not serialize another island through props.
