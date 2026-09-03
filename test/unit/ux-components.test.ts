import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { readFlash } from '../../app/ui/form.tsx'

describe('UX Components & Helpers', () => {
  it('readFlash reads error, success, warning, info from session', () => {
    let store = new Map<string, string>([
      ['success', 'Data tersimpan'],
      ['error', 'Terjadi kesalahan'],
      ['warning', 'Perhatian diperlukan'],
      ['info', 'Informasi baru'],
    ])
    let session = {
      get(key: string) {
        return store.get(key)
      },
    }

    let flash = readFlash(session)
    assert.equal(flash.success, 'Data tersimpan')
    assert.equal(flash.error, 'Terjadi kesalahan')
    assert.equal(flash.warning, 'Perhatian diperlukan')
    assert.equal(flash.info, 'Informasi baru')
  })
})
