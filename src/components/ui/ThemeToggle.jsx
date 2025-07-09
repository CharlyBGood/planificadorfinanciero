import SunIcon from "../utilities/SunIcon"
import MoonIcon from "../utilities/MoonIcon"

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full p-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
      aria-label="Cambiar modo claro/oscuro"
      title="Cambiar modo claro/oscuro"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
