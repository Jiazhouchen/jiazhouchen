import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { ThemeProvider } from './theme/ThemeContext'
import { ConnectPage } from './pages/ConnectPage'
import { CvPage } from './pages/CvPage'
import { HomePage } from './pages/HomePage'
import { ResearchPage } from './pages/ResearchPage'
import { LiveDocPage } from './pages/LiveDocPage'
import { content } from './content'
import { getLiveDocPath } from './utils/liveDocs'

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
            {content.liveDocs.map((liveDoc) => {
              const path = getLiveDocPath(liveDoc)
              return <Route key={path} path={path} element={<LiveDocPage liveDoc={liveDoc} />} />
            })}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SiteLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
