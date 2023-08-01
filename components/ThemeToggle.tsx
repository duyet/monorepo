'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Sun, Moon, Monitor } from 'lucide-react';

import { cn } from '../lib/utils';

const toggleGroupClasses = cn(
  'p-[3px] w-fit flex rounded-full border border-gray-200',
  'dark:border-gray-800',
);

const toggleGroupItemClasses = cn(
  'h-8 w-8 flex items-center rounded-full justify-center transition',
  'text-gray-400 hover:text-gray-900 dark:hover:data-[state=off]:text-gray-100',
  'data-[state=on]:bg-gray-200 data-[state=on]:text-gray-900',
  'dark:data-[state=on]:bg-gray-800 dark:data-[state=on]:text-gray-200',
);

const iconProps = {
  className: cn('w-4 h-4'),
  strokeWidth: 1,
  size: 16,
};

export default function ThemeToggle() {
  // Avoid hydration mismatch
  // https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const onChange = (value: string) => {
    if (value) setTheme(value);
  };

  console.log('current theme', theme);

  return (
    <ToggleGroup.Root
      className={toggleGroupClasses}
      type="single"
      aria-label="Theme"
      onValueChange={onChange}
      value={theme}
    >
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="light"
        aria-label="Light"
      >
        <Sun {...iconProps} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="system"
        aria-label="System"
      >
        <Monitor {...iconProps} />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={toggleGroupItemClasses}
        value="dark"
        aria-label="Dark"
      >
        <Moon {...iconProps} />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
