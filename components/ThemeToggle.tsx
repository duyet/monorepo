import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'

import { Sun, Moon } from 'lucide-react'

const toggleGroupItemClasses =
  'bg-white data-[state=on]:bg-slate-200 dark:bg-transparent dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-white dark:data-[state=on]:border-white flex h-8 w-8 items-center justify-center text-base leading-4 first:rounded-l last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none'

export default function ThemeToggle() {
  // Avoid hydration mismatch
  // https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const onChange = (value: string) => {
    if (value) setTheme(value)
  }

  console.log('current theme', theme)

  return (
    <ToggleGroup.Root
      className='inline-flex rounded space-x-px'
      type='single'
      aria-label='Theme'
      onValueChange={onChange}
      value={theme}
    >
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value='light'
        aria-label='Light'
      >
        <Sun className='w-5 h-5' />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value='dark'
        aria-label='Dark'
      >
        <Moon className='w-5 h-5' />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  )
}
