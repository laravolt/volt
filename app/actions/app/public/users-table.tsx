/**
 * Admin users table with bulk delete + confirmation (Table/Checkbox/Alert), hydrated island.
 * Follows UAT standards: empty state, Indonesian date formatting, explicit confirmation dialog.
 */
import { clientEntry, on, type Handle } from 'remix/ui'
import { Alert, AlertActions, AlertDescription, AlertTitle } from 'volt-preline/alert'
import { Badge } from 'volt-preline/badge'
import { Button } from 'volt-preline/button'
import { Checkbox } from 'volt-preline/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'volt-preline/table'

import { formatDateIndo } from '../../../ui/public/format.ts'

export type UsersTableUser = {
  id: string
  name: string | null
  email: string
  is_admin: boolean
  is_verified: boolean
  created_at: number
}

/** Type alias (not interface) so it satisfies `SerializableProps`. */
export type UsersTableProps = {
  users: UsersTableUser[]
  currentUserId: string
  action: string
  csrfToken: string
}

export const UsersTable = clientEntry<UsersTableProps>(
  import.meta.url,
  function UsersTable(handle: Handle<UsersTableProps>) {
    let confirming = false
    let selected = 0
    let formEl: HTMLFormElement | null = null

    return () => {
      let { users, currentUserId, action, csrfToken } = handle.props

      if (users.length === 0) {
        return (
          <div className="rounded-xl border border-card-line bg-card p-8 text-center sm:p-12">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl border border-card-line bg-layer shadow-2xs">
              <svg
                className="size-6 text-muted-foreground-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-foreground">Belum ada pengguna</h3>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Tidak ada data pengguna lain yang terdaftar saat ini.
            </p>
          </div>
        )
      }

      return (
        <form
          method="post"
          action={action}
          mix={on('submit', (event) => {
            formEl = event.currentTarget
            if (confirming) return // confirmed via the alert: let the browser post
            event.preventDefault()
            selected = formEl.querySelectorAll('input[name="ids"]:checked').length
            if (selected === 0) return
            confirming = true
            handle.update()
          })}
        >
          <input type="hidden" name="_csrf" value={csrfToken} />
          <input type="hidden" name="_method" value="DELETE" />
          <Table className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <TableRow>
                <TableHeader className="w-8">
                  <span className="sr-only">Select</span>
                </TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader className="text-right">Joined</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    {u.id === currentUserId ? null : (
                      <Checkbox name="ids" value={u.id} aria-label={`Select ${u.email}`} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{u.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge color={u.is_admin ? 'lime' : 'zinc'}>{u.is_admin ? 'admin' : 'user'}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatDateIndo(u.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button type="submit" color="red" data-testid="delete-selected">
              Delete selected
            </Button>
          </div>
          <Alert
            open={confirming}
            onClose={() => {
              confirming = false
              handle.update()
            }}
          >
            <AlertTitle>Hapus {selected} pengguna yang dipilih?</AlertTitle>
            <AlertDescription>
              Tindakan ini permanen. Akun pengguna dan seluruh sesi yang terkait akan dihapus dari sistem.
            </AlertDescription>
            <AlertActions>
              <Button
                plain
                type="button"
                mix={on<HTMLButtonElement, 'click'>('click', () => {
                  confirming = false
                  handle.update()
                })}
              >
                Batal
              </Button>
              <Button
                color="red"
                type="button"
                mix={on<HTMLButtonElement, 'click'>('click', () => formEl?.requestSubmit())}
              >
                Hapus
              </Button>
            </AlertActions>
          </Alert>
        </form>
      )
    }
  },
)
