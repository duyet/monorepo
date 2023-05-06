import { twMerge } from 'tailwind-merge'

type ContainerProps = {
  children: React.ReactNode
  className?: string
}

export default function Container({
  children,
  className = '',
}: ContainerProps) {
  return (
    <div
      className={twMerge('container max-w-3xl m-auto px-4 mb-10', className)}
    >
      {children}
    </div>
  )
}
