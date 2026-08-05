"use client";

import React from "react";

// ============================================================
// Inline SVG icons — drop-in replacement for lucide-react
// All lucide icons are ISC licensed. SVG paths from lucide.dev.
// ============================================================

type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

function icon(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export const Plus = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Sparkles = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0Z" />
    <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
  </svg>
);

export const Archive = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M4 9h16l-1.2 9.6A2 2 0 0 1 16.84 20H7.16a2 2 0 0 1-1.96-1.4L4 9Z" />
    <path d="M12 13v4M9 13h6" />
  </svg>
);

export const Lock = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Zap = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const Flame = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  </svg>
);

export const Trophy = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const TrendingUp = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const Sun = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const Moon = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const ChevronDown = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Calendar = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const Circle = ({
  size = 24,
  className,
  style,
  fill,
}: IconProps & { fill?: string }) => (
  <svg
    {...icon(size, className)}
    style={style}
    fill={fill || "none"}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const Target = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const Home = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const Chart = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export const Trash = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const Download = ({ size = 24, className, style }: IconProps) => (
  <svg {...icon(size, className)} style={style}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
