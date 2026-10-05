// Ícones próprios, traço 1.75 consistente
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const PawIcon = () => (
  <svg {...base}>
    <ellipse cx="12" cy="16" rx="4.5" ry="3.8" />
    <circle cx="6" cy="10.5" r="1.8" />
    <circle cx="9.5" cy="6.5" r="1.8" />
    <circle cx="14.5" cy="6.5" r="1.8" />
    <circle cx="18" cy="10.5" r="1.8" />
  </svg>
)

export const StackIcon = () => (
  <svg {...base}>
    <rect x="6" y="4" width="12" height="16" rx="3" />
    <path d="M3 7v10M21 7v10" />
  </svg>
)

export const ChatIcon = () => (
  <svg {...base}>
    <path d="M4 18.5V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8z" />
    <path d="M9 9.5h6M9 12.5h3.5" />
  </svg>
)

export const HeartIcon = ({ size = 28 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.2}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />
  </svg>
)

export const CloseIcon = ({ size = 26 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={2.4}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
)

export const PinIcon = () => (
  <svg {...base} width={15} height={15}>
    <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
)

export const CameraIcon = () => (
  <svg {...base} width={28} height={28}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.5-2h4.4l1.5 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
    <circle cx="12" cy="12.5" r="3.4" />
  </svg>
)

export const InfoIcon = () => (
  <svg {...base} width={20} height={20}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)

export const PlusIcon = () => (
  <svg {...base} width={22} height={22}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const FilterIcon = () => (
  <svg {...base} width={20} height={20}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
)

export const BackIcon = () => (
  <svg {...base} width={22} height={22}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const SendIcon = () => (
  <svg {...base} width={20} height={20}>
    <path d="M4 12l16-8-6 16-3-7z" />
  </svg>
)

export const BellIcon = () => (
  <svg {...base}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
    <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
  </svg>
)

export const UserIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
)

export const MoreIcon = () => (
  <svg {...base} width={20} height={20}>
    <circle cx="5.5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="18.5" cy="12" r="1.2" />
  </svg>
)
