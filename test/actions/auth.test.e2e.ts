import * as assert from 'remix/assert'
import { createTestServer } from 'remix/node-fetch-server/test'
import { describe, it } from 'remix/test'

import { createAppRouter } from '../../app/router.ts'
import { routes } from '../../app/routes.ts'
import { createRepositories } from '../../app/services/index.ts'
import { MemoryMailer } from '../../app/services/mailer.ts'
import { hashPassword } from '../../app/services/password.ts'
import { createTestDb } from '../helpers.ts'

describe('Auth E2E', () => {
  it('shows error message after submitting wrong password with JS active', async (t) => {
    let db = await createTestDb()
    let repos = createRepositories(db)
    let mailer = new MemoryMailer()
    let router = createAppRouter({ db, mailer, rateLimits: false })

    // Seed test user
    repos.users.create({
      id: crypto.randomUUID(),
      email: 'alice@example.com',
      name: 'Alice',
      password: await hashPassword('correctpassword'),
    })

    let server = await createTestServer((req) => router.fetch(req))
    let page = await t.serve(server)

    try {
      await page.goto(routes.auth.loginPage.href())

      // Fill in identifier and wrong password
      await page.fill('input[name="identifier"]', 'alice@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')

      // Submit form with JS running (intercepted by Remix UI runtime & custom resolveFrame)
      await page.click('button[type="submit"]')

      // Error alert must be rendered into the frame
      let alert = page.locator('[role="alert"]')
      await alert.waitFor({ timeout: 5000 })

      let text = await alert.textContent()
      assert.ok(
        /Incorrect password|Invalid credentials/i.test(text ?? ''),
        `Expected error message in alert, got: "${text}"`,
      )
    } finally {
      db.close()
    }
  })
})
