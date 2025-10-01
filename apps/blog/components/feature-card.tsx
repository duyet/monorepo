import { cn } from '@duyet/libs/utils'

interface FeatureCardProps {
  title: string
  description?: string
  href?: string
  icon: React.ReactNode
  bgColor?: string
  className?: string
}

export function FeatureCard({
  title,
  description,
  href,
  icon,
  bgColor = 'bg-beige-200',
  className,
}: FeatureCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-3xl p-8 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        bgColor,
        className,
      )}
    >
      <div className="mb-6 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-beige-950 dark:text-brown-50">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-beige-800 dark:text-brown-100">
          {description}
        </p>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  return content
}

// SVG Icon Components matching Anthropic style
export function DataEngineeringIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Abstract data flow shapes */}
      <circle
        cx="60"
        cy="35"
        r="8"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      <circle
        cx="30"
        cy="70"
        r="12"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      <circle
        cx="90"
        cy="70"
        r="10"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      <path
        d="M30 85 Q30 95, 40 95 L80 95 Q90 95, 90 85"
        stroke="#2D2A26"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="dark:stroke-brown-50"
      />
      {/* Connection lines */}
      <path
        d="M56 40 L35 65"
        stroke="#C89865"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M64 40 L85 65"
        stroke="#C89865"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Decorative circles */}
      <circle cx="20" cy="45" r="4" fill="#D4A574" opacity="0.6" />
      <circle cx="100" cy="50" r="5" fill="#D4A574" opacity="0.6" />
    </svg>
  )
}

export function OpenSourceIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stack/layers representation */}
      <rect
        x="25"
        y="35"
        width="70"
        height="15"
        rx="3"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      <rect
        x="25"
        y="55"
        width="70"
        height="15"
        rx="3"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      <rect
        x="25"
        y="75"
        width="70"
        height="15"
        rx="3"
        fill="#2D2A26"
        className="dark:fill-brown-50"
      />
      {/* Decorative motion lines */}
      <path
        d="M15 42 L10 42"
        stroke="#C89865"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 62 L8 62"
        stroke="#C89865"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 82 L10 82"
        stroke="#C89865"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M105 42 L110 42"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M105 62 L112 62"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M105 82 L110 82"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FeaturedPostsIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document/article representation */}
      <rect
        x="30"
        y="25"
        width="60"
        height="70"
        rx="4"
        fill="white"
        stroke="#2D2A26"
        strokeWidth="3"
        className="dark:fill-brown-700 dark:stroke-brown-50"
      />
      {/* Text lines */}
      <line
        x1="40"
        y1="40"
        x2="80"
        y2="40"
        stroke="#C89865"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="50"
        x2="70"
        y2="50"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="60"
        x2="75"
        y2="60"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="70"
        x2="65"
        y2="70"
        stroke="#D4A574"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Star badge */}
      <circle cx="75" cy="30" r="8" fill="#C89865" />
      <path
        d="M75 26 L76 29 L79 29 L77 31 L78 34 L75 32 L72 34 L73 31 L71 29 L74 29 Z"
        fill="white"
      />
    </svg>
  )
}

export function ArchivesIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Box/archive representation */}
      <path
        d="M35 45 L60 30 L85 45 L85 85 L60 100 L35 85 Z"
        fill="white"
        stroke="#2D2A26"
        strokeWidth="3"
        className="dark:fill-brown-700 dark:stroke-brown-50"
      />
      <path
        d="M35 45 L60 60 L85 45"
        stroke="#C89865"
        strokeWidth="2.5"
      />
      <line
        x1="60"
        y1="60"
        x2="60"
        y2="100"
        stroke="#C89865"
        strokeWidth="2.5"
      />
      {/* Decorative dots */}
      <circle cx="50" cy="70" r="3" fill="#D4A574" />
      <circle cx="70" cy="70" r="3" fill="#D4A574" />
    </svg>
  )
}
