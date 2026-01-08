import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Package, Star } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "message",
    icon: MessageCircle,
    title: "Nouveau message",
    description: "Fatou Ndiaye vous a envoyé un message",
    time: "Il y a 5 min",
    unread: true,
  },
  {
    id: 2,
    type: "favorite",
    icon: Heart,
    title: "Favori ajouté",
    description: 'Votre annonce "iPhone 14 Pro Max" a été ajoutée aux favoris',
    time: "Il y a 1h",
    unread: true,
  },
  {
    id: 3,
    type: "listing",
    icon: Package,
    title: "Annonce publiée",
    description: 'Votre annonce "MacBook Pro M2" est maintenant en ligne',
    time: "Il y a 2h",
    unread: false,
  },
  {
    id: 4,
    type: "review",
    icon: Star,
    title: "Nouvel avis",
    description: "Mamadou Sall a laissé un avis 5 étoiles",
    time: "Hier",
    unread: false,
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <Badge variant="secondary">{notifications.filter((n) => n.unread).length} non lues</Badge>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    notification.unread ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold">{notification.title}</p>
                        {notification.unread && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
