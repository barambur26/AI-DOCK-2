/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly NODE_ENV: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global process fallback for browser environment
declare global {
  var process: {
    env: {
      NODE_ENV: string;
      [key: string]: string | undefined;
    };
  };
}

export {};
