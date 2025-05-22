/// <reference types="vite/client" />

interface HeaderProps {
  opened: boolean
  toggle: () => void
}

type NavItem = {
  label: string
  to: string
  icon: {
    filled: React.FC<{ size?: number }>
    outline: React.FC<{ size?: number }>
  }
}
