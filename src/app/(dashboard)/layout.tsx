import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/sidebar"
import { XPBar } from "@/components/gamification/xp-bar"
import { StreakCounter } from "@/components/gamification/streak-counter"
import { calculateLevel } from "@/lib/utils"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      xpLogs: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      streak: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const totalXP = user.xpLogs.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0)
  const { level, xpForNext, progress } = calculateLevel(totalXP)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="ml-64">
        <Header 
          user={user} 
          totalXP={totalXP} 
          level={level} 
          xpForNext={xpForNext}
          progress={progress}
          streak={user.streak?.currentStreak || 0}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
