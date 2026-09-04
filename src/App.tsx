import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { ThemeProvider } from './theme/ThemeContext'
import { ConnectPage } from './pages/ConnectPage'
import { CvPage } from './pages/CvPage'
import { HomePage } from './pages/HomePage'
import { ResearchPage } from './pages/ResearchPage'

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SiteLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cv" element={<CvPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/projects" element={<Navigate to="/research" replace />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
