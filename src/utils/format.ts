// Small formatting helpers used across views. Kept dependency-free so
// they're easy to unit-test if we ever add a test runner.

const KB = 1024
const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']

export function formatBytes(n: number, digits = 2): string {
  if (!isFinite(n) || n < 0) return '—'
  if (n < KB) return `${n} B`
  let v = n
  let i = 0
  while (v >= KB && i < UNITS.length - 1) {
    v /= KB
    i++
  }
  return `${v.toFixed(digits)} ${UNITS[i]}`
}

export function formatBitsPerSec(bytesPerSec: number, digits = 2): string {
  return formatBytes(bytesPerSec, digits) + '/s'
}

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '—'
  return n.toLocaleString('en-US')
}

export function formatRate(perSec: number, digits = 1): string {
  if (!isFinite(perSec) || perSec < 0) return '—'
  if (perSec >= 1_000_000) return `${(perSec / 1_000_000).toFixed(digits)}M/s`
  if (perSec >= 1_000) return `${(perSec / 1_000).toFixed(digits)}k/s`
  return `${perSec.toFixed(digits)}/s`
}

export function formatDurationMs(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '—'
  if (ms < 1000) return `${ms.toFixed(0)} ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)} s`
  const m = Math.floor(s / 60)
  return `${m}m ${(s - m * 60).toFixed(0)}s`
}

// Convert a (possibly v6-mapped-v4) IP string into something more
// human-readable for table cells.
export function prettyIP(ip: string): string {
  if (!ip) return ''
  if (ip.startsWith('::ffff:')) return ip.slice(7)
  return ip
}

// Truncate a long string to N chars, appending ellipsis. Used for SNI /
// host / path columns to keep table widths sane.
export function ellipsis(s: string | undefined, n = 48): string {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

// formatTime renders an RFC3339-ish timestamp as `YYYY-MM-DD HH:mm:ss.SSS`
// in the browser's local timezone. Used by every table view; centralised
// here so the format is consistent across pages.
export function formatTime(iso: string | undefined | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}.${ms}`
}

