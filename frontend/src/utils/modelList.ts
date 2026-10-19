import type { ModelInfo } from '@exameow/shared'
import { normalizeEndpoint } from '@/utils/endpoint'

export async function fetchModelsFromEndpoint(endpoint: string, apiKey: string): Promise<ModelInfo[]> {
  const url = `${normalizeEndpoint(endpoint)}/models`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(() => '')}`)
  const data = await res.json()
  const list = data.data || data || []
  return list.map((m: any) => ({ id: m.id || m.name || m.model }))
}
