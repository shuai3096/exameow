import { isCloudflare } from './platform'
import ortWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url'
import ortMjsUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs?url'

type OcrService = {
  recognize: (input: HTMLCanvasElement, options?: Record<string, unknown>) => Promise<{ text: string }>
  destroy: () => Promise<void>
}

let servicePromise: Promise<OcrService> | null = null

const ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/'

function tlog(msg: string) {
  console.log('[OCR]', msg)
  import('@tauri-apps/api/core')
    .then(({ invoke }) => invoke('frontend_log', { msg: `[OCR] ${msg}` }).catch(() => {}))
    .catch(() => {})
}

async function tryCreateService(ppu: any, model: { detection: string; recognition: string; charactersDictionary: string }): Promise<OcrService> {
  const service = new ppu.PaddleOcrService({ model })
  await service.initialize()
  return service as unknown as OcrService
}

async function createService(): Promise<OcrService> {
  tlog('初始化 OCR 服务…')
  const [ppu, ort] = await Promise.all([
    import('ppu-paddle-ocr/web'),
    import('onnxruntime-web'),
  ])
  tlog('OCR 模块加载完成')
  ort.env.wasm.wasmPaths = isCloudflare()
    ? ORT_CDN
    : { wasm: new URL(ortWasmUrl, location.href).href, mjs: new URL(ortMjsUrl, location.href).href }

  if (isCloudflare()) {
    const service = await tryCreateService(ppu, ppu.V6_TINY_MODEL)
    tlog('OCR 服务初始化完成 (CDN)')
    return service
  }

  const localModel = { detection: '/ocr/detection.onnx', recognition: '/ocr/recognition.onnx', charactersDictionary: '/ocr/dict.txt' }
  try {
    const service = await tryCreateService(ppu, localModel)
    tlog('OCR 服务初始化完成 (local)')
    return service
  } catch (e) {
    tlog(`本地模型加载失败，尝试 CDN: ${e instanceof Error ? e.message : String(e)}`)
    const service = await tryCreateService(ppu, ppu.V6_TINY_MODEL)
    tlog('OCR 服务初始化完成 (CDN fallback)')
    return service
  }
}

export function preloadOcr(): Promise<void> {
  if (!servicePromise) servicePromise = createService()
  return servicePromise.then(() => undefined)
}

export async function recognizeImage(canvas: HTMLCanvasElement): Promise<string> {
  if (!servicePromise) servicePromise = createService()
  let service: OcrService
  try {
    service = await servicePromise
  } catch (e) {
    servicePromise = null
    tlog(`OCR 初始化失败: ${e instanceof Error ? e.message : String(e)}`)
    throw e
  }
  // noCache: 库的全局缓存只用图像前 1024 字节做 key，
  // 同一应用/相同尺寸的画面会撞键返回陈旧结果
  const result = await service.recognize(canvas, { noCache: true })
  return (result.text || '').trim()
}
