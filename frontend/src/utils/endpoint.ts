export function normalizeEndpoint(raw: string): string {
  let u = raw.trim().replace(/\/+$/, '')
  u = u.replace(/\/chat\/completions$/i, '')
  return u.replace(/\/+$/, '')
}

export function withV1Suffix(endpoint: string): string | null {
  if (/\/v\d+$/i.test(endpoint)) return null
  return `${endpoint}/v1`
}
