import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { ConsoleMailer } from '../../app/services/mailer.ts'

async function captureLog(fn: () => Promise<void>): Promise<string> {
  let original = console.log
  let lines: string[] = []
  console.log = (...args: unknown[]) => void lines.push(args.join(' '))
  try {
    await fn()
  } finally {
    console.log = original
  }
  return lines.join('\n')
}

describe('ConsoleMailer', () => {
  let message = { to: 'a@x.com', subject: 'Reset Password', text: 'Open http://app/reset-password/abc' }

  it('keeps the body out of the log when asked', async () => {
    let out = await captureLog(() => new ConsoleMailer({ includeBody: false }).send(message))
    assert.match(out, /subject="Reset Password"/)
    assert.equal(out.includes('reset-password/abc'), false)
  })

  it('prints the body by default (development)', async () => {
    let out = await captureLog(() => new ConsoleMailer().send(message))
    assert.match(out, /reset-password\/abc/)
  })
})
