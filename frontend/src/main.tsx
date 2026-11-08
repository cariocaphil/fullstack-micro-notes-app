import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { register } from '@public-ui/components'
import { defineCustomElements } from '@public-ui/components/loader'
import { DEFAULT } from '@public-ui/theme-default'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function bootstrap() {
  await register(DEFAULT, defineCustomElements)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap().catch((error) => {
  console.error('Failed to start Minimal Notes App', error)
})
