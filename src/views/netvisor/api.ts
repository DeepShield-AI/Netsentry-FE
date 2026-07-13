// Shared API helpers for NetVisor native pages.
// All calls go through the /api/nv/ proxy to the NetVisor controller.

const NV_BASE = '/api/nv'

export async function nvGet<T = any>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(NV_BASE + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const resp = await fetch(url.toString())
  if (!resp.ok) throw new Error(`NV API ${path}: ${resp.status}`)
  return resp.json()
}

export async function nvPost<T = any>(path: string, body?: any): Promise<T> {
  const resp = await fetch(NV_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!resp.ok) throw new Error(`NV API POST ${path}: ${resp.status}`)
  return resp.json()
}

// Format helpers
export function fmtBytes(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + ' GB'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + ' MB'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + ' KB'
  return v + ' B'
}

export function fmtNum(v: number): string {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(v)
}

export function fmtBps(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + ' Gbps'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + ' Mbps'
  if (v >= 1e3) return (v / 1e3).toFixed(1) + ' Kbps'
  return v + ' bps'
}
