// nDPI risk bitmap catalogue + decoder, shared by the forensic Hunt page and
// the application-layer view. Bit numbers match NDPI_RISK_* in nDPI 4.x.

export interface DecodedRisk {
  bit: number
  name: string
  short: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export const RISK_CATALOGUE: DecodedRisk[] = [
  { bit: 1, name: 'URL Possible XSS', short: 'XSS', severity: 'critical' },
  { bit: 2, name: 'URL Possible SQL Injection', short: 'SQLi', severity: 'critical' },
  { bit: 3, name: 'URL Possible RCE Injection', short: 'RCE', severity: 'critical' },
  { bit: 4, name: 'Binary Application Transfer', short: 'BinXfer', severity: 'warning' },
  { bit: 5, name: 'Known Proto on Non-Std Port', short: 'NonStd', severity: 'info' },
  { bit: 6, name: 'TLS Self-Signed Cert', short: 'SelfSign', severity: 'warning' },
  { bit: 7, name: 'TLS Obsolete Version', short: 'OldTLS', severity: 'error' },
  { bit: 8, name: 'TLS Weak Cipher', short: 'WeakCiph', severity: 'error' },
  { bit: 9, name: 'TLS Certificate Expired', short: 'CertExp', severity: 'error' },
  { bit: 10, name: 'TLS Certificate Mismatch', short: 'CertMis', severity: 'error' },
  { bit: 11, name: 'Suspicious User Agent', short: 'SusUA', severity: 'warning' },
  { bit: 12, name: 'Numeric IP Host', short: 'NumIP', severity: 'warning' },
  { bit: 13, name: 'Suspicious URL', short: 'SusURL', severity: 'warning' },
  { bit: 14, name: 'Suspicious Header', short: 'SusHdr', severity: 'warning' },
  { bit: 15, name: 'TLS Not Carrying HTTPS', short: 'NoHTTPS', severity: 'info' },
  { bit: 16, name: 'Suspicious DGA Domain', short: 'DGA', severity: 'error' },
  { bit: 17, name: 'Malformed Packet', short: 'Malform', severity: 'warning' },
  { bit: 18, name: 'SSH Obsolete Client', short: 'OldSSHc', severity: 'warning' },
  { bit: 19, name: 'SSH Obsolete Server', short: 'OldSSHs', severity: 'warning' },
  { bit: 20, name: 'SMB Insecure Version', short: 'OldSMB', severity: 'error' },
  { bit: 21, name: 'TLS Suspicious ESNI', short: 'ESNI', severity: 'warning' },
  { bit: 22, name: 'Unsafe Protocol', short: 'Unsafe', severity: 'warning' },
  { bit: 23, name: 'DNS Suspicious Traffic', short: 'DnsSus', severity: 'warning' },
  { bit: 24, name: 'TLS Missing SNI', short: 'NoSNI', severity: 'info' },
  { bit: 25, name: 'HTTP Suspicious Content', short: 'SusCont', severity: 'warning' },
  { bit: 26, name: 'Risky ASN', short: 'BadASN', severity: 'warning' },
  { bit: 27, name: 'Risky Domain', short: 'BadDom', severity: 'error' },
  { bit: 28, name: 'Malicious JA3', short: 'BadJA3', severity: 'error' },
  { bit: 29, name: 'Malicious SHA1 Cert', short: 'BadCert', severity: 'error' },
  { bit: 30, name: 'Desktop/File Sharing', short: 'RDP/SMB', severity: 'info' },
  { bit: 31, name: 'TLS Uncommon ALPN', short: 'ALPN', severity: 'info' },
  { bit: 32, name: 'TLS Cert Validity Too Long', short: 'LongCrt', severity: 'warning' },
  { bit: 33, name: 'TLS Suspicious Extension', short: 'SusExt', severity: 'warning' },
  { bit: 34, name: 'TLS Fatal Alert', short: 'TLSFat', severity: 'error' },
  { bit: 35, name: 'Suspicious Entropy', short: 'Entropy', severity: 'warning' },
  { bit: 36, name: 'Clear-Text Credentials', short: 'Creds!', severity: 'error' },
  { bit: 37, name: 'DNS Large Packet', short: 'DnsLrg', severity: 'info' },
  { bit: 38, name: 'DNS Fragmented', short: 'DnsFrag', severity: 'info' },
  { bit: 39, name: 'Invalid Characters', short: 'BadChar', severity: 'warning' },
  { bit: 40, name: 'Possible Exploit', short: 'Exploit', severity: 'critical' },
  { bit: 41, name: 'TLS Cert About to Expire', short: 'CrtSoon', severity: 'warning' },
  { bit: 42, name: 'Punycode/IDN', short: 'IDN', severity: 'info' },
  { bit: 43, name: 'Error Code Detected', short: 'ErrCode', severity: 'info' },
  { bit: 44, name: 'Crawler/Bot', short: 'Bot', severity: 'info' },
  { bit: 45, name: 'Anonymous Subscriber', short: 'AnonSub', severity: 'warning' },
  { bit: 46, name: 'Unidirectional Traffic', short: 'UniDir', severity: 'info' },
  { bit: 47, name: 'HTTP Obsolete Server', short: 'OldHTTP', severity: 'warning' },
  { bit: 48, name: 'Periodic Flow', short: 'Beacon', severity: 'warning' },
  { bit: 49, name: 'Minor Issues', short: 'Minor', severity: 'info' },
  { bit: 50, name: 'TCP Issues', short: 'TCPIss', severity: 'info' },
  { bit: 51, name: 'Fully Encrypted', short: 'FullEnc', severity: 'info' },
  { bit: 52, name: 'TLS ALPN SNI Mismatch', short: 'ALPNMis', severity: 'warning' },
  { bit: 53, name: 'Malware Host Contacted', short: 'Malware', severity: 'critical' },
  { bit: 54, name: 'Binary Data Transfer', short: 'Binary', severity: 'info' },
  { bit: 55, name: 'Probing Attempt', short: 'Probe', severity: 'warning' },
  { bit: 56, name: 'Obfuscated Traffic', short: 'Obfusc', severity: 'warning' },
]

// decodeRisks expands a (lossy ≤2^53) risk bitmap into its set risks.
export function decodeRisks(bitmap: number): DecodedRisk[] {
  if (!bitmap) return []
  const out: DecodedRisk[] = []
  for (const r of RISK_CATALOGUE) {
    // Bit math beyond 2^31 needs float-safe testing; bitmap arrives as a JS
    // number so we use division/modulo rather than `&` for high bits.
    const set = r.bit < 31
      ? (bitmap & (1 << r.bit)) !== 0
      : Math.floor(bitmap / Math.pow(2, r.bit)) % 2 === 1
    if (set) out.push(r)
  }
  return out
}

export function tagToneForSeverity(sev: string): 'info' | 'warning' | 'danger' | 'success' {
  if (sev === 'critical' || sev === 'error') return 'danger'
  if (sev === 'warning') return 'warning'
  return 'info'
}
