import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "antd/dist/reset.css";
import '@ant-design/v5-patch-for-react-19';
import './index.css'
import App from './App.jsx'
import { QueryProvider } from './components/providers/QueryProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
