interface AbstractShapesProps {
  className?: string;
}

export function AbstractShapes({ className = "" }: AbstractShapesProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50,80 Q60,70 70,80 T90,80"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <circle
        cx="140"
        cy="60"
        r="20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M30,120 L50,140 L70,120 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
      <rect
        x="120"
        y="120"
        width="40"
        height="40"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

export function WavyLines({ className = "" }: AbstractShapesProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0,40 Q50,20 100,40 T200,40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M0,70 Q50,50 100,70 T200,70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export function GeometricPattern({ className = "" }: AbstractShapesProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.3">
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <circle cx="100" cy="30" r="6" fill="currentColor" />
        <circle cx="150" cy="60" r="10" fill="currentColor" />
        <circle cx="80" cy="120" r="7" fill="currentColor" />
        <circle cx="140" cy="140" r="9" fill="currentColor" />
      </g>
      <path
        d="M40,100 L60,80 L80,100 L60,120 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M120,90 L140,110 L160,90"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

export function OrganicBlob({ className = "" }: AbstractShapesProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M100,30 C130,30 160,50 170,80 C180,110 170,140 150,160 C130,180 110,190 80,180 C50,170 30,150 25,120 C20,90 40,50 70,35 C80,30 90,30 100,30 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M100,60 Q120,60 130,80 T140,120"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
