// ICMP type/code → human label.
//
// Subset of RFC 792 / RFC 4443 most likely to show up in real traffic.
// Falls back to "type/code" for unknown values.
//
// Reference: https://www.iana.org/assignments/icmp-parameters

const TYPE_NAMES: Record<number, string> = {
  0: 'Echo Reply',
  3: 'Destination Unreachable',
  4: 'Source Quench (deprecated)',
  5: 'Redirect',
  8: 'Echo Request',
  9: 'Router Advertisement',
  10: 'Router Solicitation',
  11: 'Time Exceeded',
  12: 'Parameter Problem',
  13: 'Timestamp Request',
  14: 'Timestamp Reply',
  17: 'Address Mask Request',
  18: 'Address Mask Reply',
  // ICMPv6 (a few common ones — we currently only see v4 here, but keep it
  // forward-compatible).
  128: 'Echo Request (v6)',
  129: 'Echo Reply (v6)',
  133: 'Router Solicitation (v6)',
  134: 'Router Advertisement (v6)',
  135: 'Neighbor Solicitation',
  136: 'Neighbor Advertisement',
}

// Codes are type-dependent; keep only the most informative subset.
const CODE_NAMES: Record<string, string> = {
  '3/0': 'Net unreachable',
  '3/1': 'Host unreachable',
  '3/2': 'Protocol unreachable',
  '3/3': 'Port unreachable',
  '3/4': 'Fragmentation needed',
  '3/5': 'Source route failed',
  '3/6': 'Destination network unknown',
  '3/7': 'Destination host unknown',
  '3/9': 'Network admin prohibited',
  '3/10': 'Host admin prohibited',
  '3/13': 'Communication admin prohibited',
  '5/0': 'Redirect for network',
  '5/1': 'Redirect for host',
  '5/2': 'Redirect for ToS+net',
  '5/3': 'Redirect for ToS+host',
  '11/0': 'TTL exceeded in transit',
  '11/1': 'Fragment reassembly time exceeded',
  '12/0': 'Pointer indicates error',
  '12/1': 'Missing required option',
  '12/2': 'Bad length',
}

export function icmpTypeName(t: number | undefined): string {
  if (t === undefined || t === null) return ''
  return TYPE_NAMES[t] ?? `Type ${t}`
}

export function icmpCodeLabel(t: number | undefined, c: number | undefined): string {
  if (t === undefined || c === undefined) return ''
  const k = `${t}/${c}`
  return CODE_NAMES[k] ?? `Code ${c}`
}

// One-line summary for table cells, e.g. "Echo Request" or "Dest Unreachable / Port unreachable".
export function icmpLabel(t: number | undefined, c: number | undefined): string {
  const tn = icmpTypeName(t)
  if (!tn) return ''
  if (c === 0 || c === undefined) return tn
  const cn = icmpCodeLabel(t, c)
  if (cn === `Code ${c}`) return `${tn} (code ${c})`
  return `${tn} · ${cn}`
}
