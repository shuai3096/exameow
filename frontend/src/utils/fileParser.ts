import { fileToCanvas } from './image'
import { recognizeImage } from './ocr'

export interface ParseProgressReport {
  current: number
  total: number
  images: number
  pdfPages: number
  files: number
  message: string
}

export async function parseBrowserFileWithProgress(
  file: File,
  onProgress: (p: ParseProgressReport) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')

  try {
    if (file.type.startsWith('image/')) {
      const canvas = await fileToCanvas(file)
      const text = await recognizeImage(canvas)
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
      onProgress({ current: 1, total: 1, images: 1, pdfPages: 0, files: 0, message: '' })
      return text
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const { extractPdfTextWithOcr } = await import('./pdfParser')
      const text = await extractPdfTextWithOcr(
        file,
        (done, total, ocrPages) => {
          onProgress({ current: done, total, images: 0, pdfPages: ocrPages, files: 0, message: '' })
        },
        signal,
      )
      return text
    }

    const text = await parseBrowserFile(file)
    onProgress({ current: 1, total: 1, images: 0, pdfPages: 0, files: 0, message: '' })
    return text
  } catch (e: any) {
    if (e?.name === 'AbortError') throw e
    console.warn(`[fileParser] Failed to parse ${file.name}:`, e)
    const msg = `[fileParser] ${file.name} 解析失败: ${e?.name ?? ''} ${e?.message ?? String(e)} ${e?.stack ?? ''}`
    import('@tauri-apps/api/core')
      .then(({ invoke }) => invoke('frontend_log', { msg }).catch(() => {}))
      .catch(() => {})
    onProgress({ current: 1, total: 1, images: 0, pdfPages: 0, files: 0, message: '' })
    return ''
  }
}

export async function parseBrowserFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'

  switch (ext) {
    case 'txt':
    case 'md':
    case 'json':
    case 'xml':
    case 'log':
    case 'csv':
      return file.text()

    case 'html':
    case 'htm':
      return parseHtml(await file.text())

    case 'pdf':
      return (await import('./pdfParser')).extractPdfText(file)

    case 'docx':
      return parseDocx(await file.arrayBuffer())

    case 'xlsx':
    case 'xls':
    case 'xlsm':
    case 'ods':
      return parseExcel(await file.arrayBuffer())

    case 'pptx':
      return parsePptx(await file.arrayBuffer())

    case 'odt':
      return parseOdt(await file.arrayBuffer())

    case 'epub':
      return parseEpub(await file.arrayBuffer())

    default:
      return file.text()
  }
}

async function parseHtml(raw: string): Promise<string> {
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

async function parseExcel(arrayBuffer: ArrayBuffer): Promise<string> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
  const texts: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const csvText = XLSX.utils.sheet_to_csv(sheet!, { FS: '\t' })
    if (csvText.trim()) {
      texts.push(`[${sheetName}]\n${csvText}`)
    }
  }

  return texts.join('\n\n') || new TextDecoder('utf-8').decode(arrayBuffer)
}

async function parsePptx(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await readZipFromBuffer(arrayBuffer)
  const slideFiles = Object.keys(zip)
    .filter(k => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort()

  if (!slideFiles.length) return '[PPTX: no slides found]'

  const texts: string[] = []
  for (let i = 0; i < slideFiles.length; i++) {
    const key = slideFiles[i]!
    const xml = new TextDecoder('utf-8').decode(zip[key]!)
    const slideText = extractXmlText(xml, 'a:t').join('\n')
    if (slideText.trim()) texts.push(`[Slide ${i + 1}]\n${slideText}`)
  }
  return texts.join('\n\n')
}

async function parseOdt(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await readZipFromBuffer(arrayBuffer)
  const contentXml = zip['content.xml']
  if (!contentXml) return '[ODT: no content.xml found]'

  const xml = new TextDecoder('utf-8').decode(contentXml)
  return xml
    .replace(/<[^>]+>/g, '\n')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function parseEpub(arrayBuffer: ArrayBuffer): Promise<string> {
  const zip = await readZipFromBuffer(arrayBuffer)
  const htmlFiles = Object.keys(zip).filter(
    k => (k.endsWith('.html') || k.endsWith('.xhtml') || k.endsWith('.htm')) &&
         !k.includes('nav') && !k.includes('toc')
  )

  if (htmlFiles.length === 0) return '[EPUB: no content files found]'

  const texts: string[] = []
  for (const file of htmlFiles) {
    const html = new TextDecoder('utf-8').decode(zip[file])
    const text = extractXmlText(html, 'p,h1,h2,h3,h4,h5,h6,li,td,th,div,span,a,blockquote,pre').join('\n')
    if (text.trim()) texts.push(text)
  }
  return texts.join('\n\n')
}

function extractXmlText(xml: string, tagNames: string): string[] {
  const results: string[] = []
  const tags = tagNames.split(',')
  for (const tag of tags) {
    const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'gi')
    let match
    while ((match = regex.exec(xml)) !== null) {
      const text = match[1]!.replace(/<[^>]+>/g, '').trim()
      if (text) results.push(text)
    }
  }
  return results
}

// ZIP reader (browser-safe, no decompression needed for Office XML)
async function readZipFromBuffer(data: ArrayBuffer): Promise<Record<string, Uint8Array>> {
  const view = new DataView(data)
  const files: Record<string, Uint8Array> = {}

  let eocdOffset = data.byteLength - 22
  while (eocdOffset >= 0) {
    if (view.getUint32(eocdOffset, true) === 0x06054b50) break
    eocdOffset--
  }
  if (eocdOffset < 0) return files

  const centralDirOffset = view.getUint32(eocdOffset + 16, true)
  let offset = centralDirOffset

  while (offset < eocdOffset) {
    if (view.getUint32(offset, true) !== 0x02014b50) break

    const compMethod = view.getUint16(offset + 10, true)
    const compSize = view.getUint32(offset + 20, true)
    const nameLen = view.getUint16(offset + 28, true)
    const extraLen = view.getUint16(offset + 30, true)
    const commentLen = view.getUint16(offset + 32, true)
    const localOffset = view.getUint32(offset + 42, true)

    const nameBytes = new Uint8Array(data.slice(offset + 46, offset + 46 + nameLen))
    const fileName = new TextDecoder('utf-8').decode(nameBytes)

    const localNameLen = view.getUint16(localOffset + 26, true)
    const localExtraLen = view.getUint16(localOffset + 28, true)
    const dataStart = localOffset + 30 + localNameLen + localExtraLen

    if (compSize > 0 && dataStart + compSize <= data.byteLength) {
      const rawData = new Uint8Array(data.slice(dataStart, dataStart + compSize))

      if (compMethod === 0) {
        files[fileName] = rawData
      } else if (compMethod === 8) {
        try {
          files[fileName] = await inflateDeflate(rawData)
        } catch {
          files[fileName] = rawData
        }
      } else {
        files[fileName] = rawData
      }
    }

    offset += 46 + nameLen + extraLen + commentLen
  }

  return files
}

async function inflateDeflate(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw')
  const writer = ds.writable.getWriter()
  const reader = ds.readable.getReader()
  writer.write(compressed as unknown as BufferSource)
  writer.close()

  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  const totalLen = chunks.reduce((s, c) => s + c.length, 0)
  const result = new Uint8Array(totalLen)
  let pos = 0
  for (const chunk of chunks) {
    result.set(chunk, pos)
    pos += chunk.length
  }
  return result
}
