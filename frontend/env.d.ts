/// <reference types="vite/client" />

declare module '@tauri-apps/plugin-dialog' {
  export function open(options?: any): Promise<string | null>
}
