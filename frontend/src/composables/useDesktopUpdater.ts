import { ref } from 'vue'

export type UpdateStage = 'idle' | 'available' | 'downloading' | 'ready' | 'failed' | 'upToDate'

const stage = ref<UpdateStage>('idle')
const version = ref('')
const progress = ref(0)
const error = ref('')

let update: any = null

export function useDesktopUpdater() {
  async function checkForUpdate(manual = false): Promise<void> {
    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      update = await check()
      if (update?.available) {
        version.value = update.version
        stage.value = 'available'
      } else if (manual) {
        stage.value = 'upToDate'
      }
    } catch (e: any) {
      if (manual) {
        error.value = String(e?.message ?? e)
        stage.value = 'failed'
      }
    }
  }

  async function startUpdate() {
    if (!update) return
    stage.value = 'downloading'
    progress.value = 0
    try {
      let total = 0
      let downloaded = 0
      await update.downloadAndInstall((event: any) => {
        if (event.event === 'Started' && event.data.contentLength) {
          total = event.data.contentLength
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength
          if (total > 0) progress.value = Math.min(99, Math.round((downloaded / total) * 100))
        } else if (event.event === 'Finished') {
          progress.value = 100
        }
      })
      stage.value = 'ready'
    } catch (e: any) {
      error.value = String(e?.message ?? e)
      stage.value = 'failed'
    }
  }

  async function restart() {
    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
  }

  function dismiss() {
    stage.value = 'idle'
  }

  return { stage, version, progress, error, checkForUpdate, startUpdate, restart, dismiss }
}
