import * as assert from 'remix/assert'
import { createTestServer } from 'remix/node-fetch-server/test'
import { describe, it } from 'remix/test'

import { routes } from '../../app/routes.ts'
import { createE2EHarness, loginViaBrowser, seedE2EUser, waitForHydration } from '../e2e-helpers.ts'

describe('Profile E2E', () => {
  it('updates profile name via browser with JS hydration and feedback', async (t) => {
    let harness = await createE2EHarness('e2e-profile')
    let { user, password } = await seedE2EUser(harness.repos, {
      email: 'profile-user@example.test',
      name: 'Original Name',
    })

    let server = await createTestServer((req) => harness.router.fetch(req))
    let page = await t.serve(server)

    try {
      await loginViaBrowser(page, user.email, password)

      // Navigate to profile page
      await page.goto(routes.app.profile.href())
      await waitForHydration(page)

      // Verify current name
      let nameInput = page.locator('input[name="name"]')
      await nameInput.waitFor()
      assert.equal(await nameInput.inputValue(), 'Original Name')

      // Update name
      await nameInput.fill('Updated Name')
      await page.click('button[type="submit"]')

      // Feedback toast or notice rendered into frame
      let heading = page.locator('h1, h2, [role="status"]')
      await heading.first().waitFor({ timeout: 5000 })

      let updatedUser = harness.repos.users.findById(user.id)
      assert.equal(updatedUser?.name, 'Updated Name')
    } finally {
      harness.cleanup()
    }
  })
})
