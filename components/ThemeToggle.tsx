import { useTheme } from 'next-themes'
import { ChangeEvent } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value)
  }

  return (
    <>
      <select
        onChange={onChange}
        value={theme}
        className='bg-gray-50 text-gray-900 text-sm block rounded w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
      >
        <option value='light'>Light</option>
        <option value='dark'>Dark</option>
      </select>
    </>
  )
}
