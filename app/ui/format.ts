/**
 * Standard Indonesian formatting helpers for currency and dates.
 * Follows UAT brain-v2.1 standards for id-ID localization.
 */

/**
 * Format number or bigint as Indonesian Rupiah (Rp X.XXX).
 * Integer rupiah without decimal sen (sen is deprecated in real-world IDR transactions).
 */
export function formatRupiah(
  amount: number | bigint,
  options: { withPrefix?: boolean; space?: boolean } = {},
): string {
  let { withPrefix = true, space = true } = options
  let num = typeof amount === 'bigint' ? Number(amount) : amount
  let isNegative = num < 0
  let abs = Math.abs(Math.round(num))

  let formattedNumber = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (!withPrefix) {
    return isNegative ? `-${formattedNumber}` : formattedNumber
  }

  let prefix = space ? 'Rp ' : 'Rp'
  return isNegative ? `-${prefix}${formattedNumber}` : `${prefix}${formattedNumber}`
}

export const formatRp = formatRupiah
export const formatMoney = formatRupiah

/**
 * Parse a rupiah string into an integer.
 */
export function parseRupiah(str: string): number {
  let cleaned = str.replace(/[^0-9-]/g, '')
  let parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const BULAN_INDONESIA_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

/**
 * Format Date into human-readable Indonesian date: `2 September 2026`.
 */
export function formatDateIndo(
  date: Date | string | number,
  options: { shortMonth?: boolean; withDay?: boolean } = {},
): string {
  let d = typeof date === 'object' ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  let day = d.getDate()
  let month = options.shortMonth
    ? BULAN_INDONESIA_SHORT[d.getMonth()]
    : BULAN_INDONESIA[d.getMonth()]
  let year = d.getFullYear()

  if (options.withDay) {
    let dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    let dayName = dayNames[d.getDay()]
    return `${dayName}, ${day} ${month} ${year}`
  }

  return `${day} ${month} ${year}`
}

/**
 * Format Date into human-readable Indonesian datetime: `2 September 2026, 14:30 WIB`.
 */
export function formatDateTimeIndo(
  date: Date | string | number,
  options: { shortMonth?: boolean; timezone?: string } = {},
): string {
  let d = typeof date === 'object' ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  let dateStr = formatDateIndo(d, options)
  let hours = String(d.getHours()).padStart(2, '0')
  let minutes = String(d.getMinutes()).padStart(2, '0')
  let tz = options.timezone ?? 'WIB'

  return `${dateStr}, ${hours}:${minutes} ${tz}`
}
