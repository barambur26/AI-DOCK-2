// Global type declarations for deployment compatibility

// Node.js globals in browser environment
declare global {
  interface NodeJS {
    Timer: any;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    
    interface Process {
      env: ProcessEnv;
    }
  }

  var process: {
    env: {
      NODE_ENV?: string;
      [key: string]: string | undefined;
    };
  };

  // Jest globals for test files
  var describe: any;
  var it: any;
  var expect: any;
  var beforeEach: any;
  var jest: any;

  // Import meta for Vite
  interface ImportMeta {
    env: {
      VITE_API_URL?: string;
      [key: string]: string | undefined;
    };
  }
}

// Module declarations for missing types
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

export {};
