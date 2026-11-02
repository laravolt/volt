import * as assert from 'remix/assert'
import { createTestServer } from 'remix/node-fetch-server/test'
import { describe, it } from 'remix/test'

import { routes } from '../../app/routes.ts'
import { createE2EHarness, loginViaBrowser, seedE2EUser, waitForHydration } from '../e2e-helpers.ts'

describe('Admin E2E', () => {
  // The users table is a client entry in the server-rendered page, next to the shell's
  // AppShellChrome island. The confirm dialog must be named by its title (context from Alert),
  // the delete must go through, and the table must drop the row after the redirect.
  it('deletes a user after confirming in the dialog', async (t) => {
    let harness = await createE2EHarness('e2e-admin')
    let { user: admin, password } = await seedE2EUser(harness.repos, {
      email: 'admin@example.test',
      name: 'Admin',
      is_admin: 1,
    })
    let { user: member } = await seedE2EUser(harness.repos, {
      email: 'member@example.test',
      name: 'Member',
    })

    let server = await createTestServer((req) => harness.router.fetch(req))
    let page = await t.serve(server)

    try {
      await loginViaBrowser(page, admin.email, password)
      await page.goto(routes.app.dashboard.href())
      await waitForHydration(page)

      await page.getByLabel(`Select ${member.email}`).check()
      await page.click('[data-testid="delete-selected"]')

      let dialog = page.getByRole('alertdialog', { name: 'Hapus 1 pengguna yang dipilih?' })
      await dialog.waitFor({ state: 'visible', timeout: 5000 })
      let deleteRequest = page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          new URL(res.url()).pathname === routes.app.deleteUsers.href(),
        { timeout: 5000 },
      )
      await dialog.getByRole('button', { name: 'Hapus' }).click()
      let response = await deleteRequest
      // Let the runtime follow the redirect before checking the page and closing the database.
      await page.waitForLoadState('networkidle')

      assert.equal(
        harness.repos.users.findById(member.id),
        undefined,
        `member still exists after POST ${response.status()}`,
      )
      assert.ok(harness.repos.users.findById(admin.id))
      await page.getByText(member.email).waitFor({ state: 'detached', timeout: 5000 })
      assert.equal(await page.getByRole('alertdialog').isVisible(), false)
    } finally {
      harness.cleanup()
    }
  })
})
