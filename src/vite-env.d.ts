/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ERROR_REPORTING_ENDPOINT?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
