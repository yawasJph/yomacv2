import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FollowProvider } from './context/FollowContext.jsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <FollowProvider>
      <QueryClientProvider client={queryClient}>
      <App />
      </QueryClientProvider>
      </FollowProvider>
    </AuthContextProvider>
  </StrictMode>,
)
