import { ViteReactSSG } from 'vite-react-ssg/single-page'
import './i18n'
import './index.css'
import App from './App.tsx'

export const createRoot = ViteReactSSG(<App />)
