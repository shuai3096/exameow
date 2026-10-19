export async function fileToCanvas(file: Blob, maxSide = 2000): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas
}

export function canvasToJpegDataUrl(canvas: HTMLCanvasElement, maxSide = 1600, quality = 0.85): string {
  let target = canvas
  const largest = Math.max(canvas.width, canvas.height)
  if (largest > maxSide) {
    const scale = maxSide / largest
    target = document.createElement('canvas')
    target.width = Math.round(canvas.width * scale)
    target.height = Math.round(canvas.height * scale)
    target.getContext('2d')!.drawImage(canvas, 0, 0, target.width, target.height)
  }
  return target.toDataURL('image/jpeg', quality)
}
