import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import {
  formatDateIndo,
  formatDateTimeIndo,
  formatRupiah,
  parseRupiah,
} from '../../app/ui/format.ts'

describe('Indonesian format utilities (UAT Rule #11 & #12)', () => {
  it('formatRupiah formats positive and negative amounts correctly', () => {
    assert.equal(formatRupiah(14000), 'Rp 14.000')
    assert.equal(formatRupiah(140000), 'Rp 140.000')
    assert.equal(formatRupiah(1500000), 'Rp 1.500.000')
    assert.equal(formatRupiah(-50000), '-Rp 50.000')
    assert.equal(formatRupiah(14000, { withPrefix: false }), '14.000')
    assert.equal(formatRupiah(14000, { space: false }), 'Rp14.000')
    assert.equal(formatRupiah(1000000n), 'Rp 1.000.000')
  })

  it('parseRupiah converts formatted strings to integers', () => {
    assert.equal(parseRupiah('Rp 14.000'), 14000)
    assert.equal(parseRupiah('Rp 1.500.000'), 1500000)
    assert.equal(parseRupiah('-Rp 50.000'), -50000)
    assert.equal(parseRupiah('invalid'), 0)
  })

  it('formatDateIndo produces human-readable Indonesian dates', () => {
    let d = new Date(2026, 8, 2) // September 2, 2026
    assert.equal(formatDateIndo(d), '2 September 2026')
    assert.equal(formatDateIndo(d, { shortMonth: true }), '2 Sep 2026')
    assert.match(formatDateIndo(d, { withDay: true }), /2 September 2026/)
  })

  it('formatDateTimeIndo includes time and timezone', () => {
    let d = new Date(2026, 8, 2, 14, 30)
    let result = formatDateTimeIndo(d)
    assert.match(result, /2 September 2026, 14:30 WIB/)
  })
})
