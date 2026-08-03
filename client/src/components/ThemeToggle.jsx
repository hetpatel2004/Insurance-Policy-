import { SunFill, MoonStarsFill } from 'react-bootstrap-icons'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle ${className}`}
    >
      <SunFill className="theme-toggle-sun" />
      <MoonStarsFill className="theme-toggle-moon" />
    </button>
  )
}

export default ThemeToggle
