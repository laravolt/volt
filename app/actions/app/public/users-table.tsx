/**
 * Admin users table with bulk delete + confirmation (Table/Checkbox/Alert), hydrated island.
 */
import { clientEntry, on, type Handle } from 'remix/ui'
import { Alert, AlertActions, AlertDescription, AlertTitle } from 'volt-preline/alert'
import { Badge } from 'volt-preline/badge'
import { Button } from 'volt-preline/button'
import { Checkbox } from 'volt-preline/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'volt-preline/table'

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

export const UsersTable = clientEntry<UsersTableProps>(import.meta.url, function UsersTable(handle: Handle<UsersTableProps>) {
  let confirming = false
  let selected = 0
  let formEl: HTMLFormElement | null = null

  return () => {
    let { users, currentUserId, action, csrfToken } = handle.props
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
                  {u.id === currentUserId ? null : <Checkbox name="ids" value={u.id} aria-label={`Select ${u.email}`} />}
                </TableCell>
                <TableCell className="font-medium">{u.name ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge color={u.is_admin ? 'lime' : 'zinc'}>{u.is_admin ? 'admin' : 'user'}</Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">{new Date(u.created_at).toLocaleDateString('en-GB')}</TableCell>
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
          <AlertTitle>Delete {selected} user{selected === 1 ? '' : 's'}?</AlertTitle>
          <AlertDescription>This permanently removes the selected accounts and their sessions.</AlertDescription>
          <AlertActions>
            <Button
              plain
              type="button"
              mix={on<HTMLButtonElement, 'click'>('click', () => {
                confirming = false
                handle.update()
              })}
            >
              Cancel
            </Button>
            <Button color="red" type="button" mix={on<HTMLButtonElement, 'click'>('click', () => formEl?.requestSubmit())}>
              Delete
            </Button>
          </AlertActions>
        </Alert>
      </form>
    )
  }
})
