import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { currentTheme, readThemeCookie, theme, THEME_COOKIE } from '../../app/middleware/theme.ts'

describe('Theme middleware', () => {
  it('reads theme cookie correctly', () => {
    assert.equal(readThemeCookie(null), null)
    assert.equal(readThemeCookie(''), null)
    assert.equal(readThemeCookie('other=val'), null)
    assert.equal(readThemeCookie('volt-theme=dark'), 'dark')
    assert.equal(readThemeCookie('volt-theme=light'), 'light')
    assert.equal(readThemeCookie('a=1; volt-theme=dark; b=2'), 'dark')
    assert.equal(readThemeCookie('volt-theme=invalid'), null)
  })

  it('provides currentTheme inside theme middleware run', async () => {
    let mockContext = {
      request: {
        headers: new Headers({ cookie: `${THEME_COOKIE}=dark` }),
      },
    } as any

    let executed = false
    let mw = theme()
    await mw(mockContext, async () => {
      executed = true
      assert.equal(currentTheme(), 'dark')
      return new Response('OK')
    })
    assert.equal(executed, true)
    assert.equal(currentTheme(), null)
  })
})
