import {
  Car,
  Home,
  Smartphone,
  Sofa,
  Shirt,
  Music,
  Briefcase,
  Dog,
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
  "more-horizontal": MoreHorizontal,
}

export function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  const Icon = (icon && ICONS[icon]) || Gift
  return <Icon className={className} />
}
