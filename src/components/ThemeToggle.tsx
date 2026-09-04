import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  )
}
