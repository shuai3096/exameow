import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(__dirname, '../frontend')
const ocrDir = join(frontendDir, 'public/ocr')

const require = createRequire(join(frontendDir, 'package.json'))
const ppuEntry = pathToFileURL(require.resolve('ppu-paddle-ocr/web')).href
const { V6_TINY_MODEL } = await import(ppuEntry)

const targets = [
  { url: V6_TINY_MODEL.detection, file: 'detection.onnx' },
  { url: V6_TINY_MODEL.recognition, file: 'recognition.onnx' },
  { url: V6_TINY_MODEL.charactersDictionary, file: 'dict.txt' },
]

mkdirSync(ocrDir, { recursive: true })
for (const { url, file } of targets) {
  const dest = join(ocrDir, file)
  if (existsSync(dest)) {
    console.log(`[ocr] skip ${file} (exists)`)
    continue
  }
  console.log(`[ocr] downloading ${file} from ${url}`)
  let res = await fetch(url)
  if (!res.ok) {
    console.warn(`[ocr] first attempt failed ${res.status}, retrying once...`)
    res = await fetch(url)
  }
  if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
  console.log(`[ocr] downloaded ${file} (${buf.byteLength} bytes)`)
}

console.log('OCR assets ready.')
