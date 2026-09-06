import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { readFlash as readFlashFromShared } from '../../app/actions/shared.ts'
import { readFlash } from '../../app/ui/form.tsx'

describe('UX Components & Helpers', () => {
  it('readFlash reads error, success, status, warning, info from session', () => {
    let store = new Map<string, string>([
      ['success', 'Data tersimpan'],
      ['status', 'Status diperbarui'],
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
    assert.equal(flash.status, 'Status diperbarui')
    assert.equal(flash.error, 'Terjadi kesalahan')
    assert.equal(flash.warning, 'Perhatian diperlukan')
    assert.equal(flash.info, 'Informasi baru')

    // Delegated readFlash in app/actions/shared.ts also works
    let sharedFlash = readFlashFromShared(session as any)
    assert.equal(sharedFlash.success, 'Data tersimpan')
    assert.equal(sharedFlash.status, 'Status diperbarui')
    assert.equal(sharedFlash.error, 'Terjadi kesalahan')
    assert.equal(sharedFlash.warning, 'Perhatian diperlukan')
    assert.equal(sharedFlash.info, 'Informasi baru')
  })

  it('readFlash maps status to success when success is not set', () => {
    let store = new Map<string, string>([['status', 'Operasi berhasil']])
    let session = {
      get(key: string) {
        return store.get(key)
      },
    }

    let flash = readFlash(session)
    assert.equal(flash.status, 'Operasi berhasil')
    assert.equal(flash.success, 'Operasi berhasil')
  })
})
