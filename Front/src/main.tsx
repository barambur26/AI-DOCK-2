import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { NextUIProvider } from '@nextui-org/react'
import App from './App.tsx'
import './index.css'
import './styles/thinking-animations.css'

// Initialize Sentry error monitoring
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  // Only send default PII in development
  sendDefaultPii: import.meta.env.VITE_ENVIRONMENT === 'development',
  integrations: [
    new Sentry.BrowserTracing({
      // Set up automatic route change tracking for React Router
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect
      ),
    }),
  ],
})

// This is where React starts running!
// We find the HTML element with id="root" and inject our React app into it
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>,
)
