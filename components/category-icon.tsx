import {
  Car,
  Home,
  Smartphone,
  Sofa,
  Shirt,
  Music,
  Briefcase,
  Dog,
  PawPrint,
  Gamepad2,
  MoreHorizontal,
  Gift,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  smartphone: Smartphone,
  sofa: Sofa,
  shirt: Shirt,
  music: Music,
  briefcase: Briefcase,
  dog: Dog,
  pawprint: PawPrint,
  "paw-print": PawPrint,
  gamepad2: Gamepad2,
  gamepad: Gamepad2,
  "more-horizontal": MoreHorizontal,
}

export function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  const Icon = (icon && ICONS[icon.toLowerCase()]) || Gift
  return <Icon className={className} />
}
