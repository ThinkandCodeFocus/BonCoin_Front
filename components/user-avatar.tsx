import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resolveStorageUrl } from "@/lib/media"

interface UserAvatarProps {
  user?: {
    name?: string
    photo?: string
  }
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ user, className = "w-10 h-10", fallbackClassName = "" }: UserAvatarProps) {
  const photoUrl = user?.photo
    ? resolveStorageUrl(user.photo)
    : undefined

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"

  return (
    <Avatar className={className}>
      <AvatarImage src={photoUrl} alt={user?.name || "User"} />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )
}
