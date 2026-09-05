/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_RENDER_TIMEOUT_MS?: string;
  readonly VITE_DOWNLOAD_TIMEOUT_MS?: string;
  /** When "true", show Sound on/off in the editor. Default off. */
  readonly VITE_FEATURE_VIDEO_SOUND?: string;
  /** When "true", unlock Magic Board editor. false/unset = Coming soon. */
  readonly VITE_FEATURE_BOARD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

