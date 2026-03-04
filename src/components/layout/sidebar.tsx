"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Trophy, 
  Settings,
  LogOut,
  GraduationCap,
  Zap
} from "lucide-react"
import { signOut } from "next-auth/react"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const teacherNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Classes", href: "/dashboard/classes", icon: Users },
  { title: "Create Quiz", href: "/dashboard/create-quiz", icon: FileText },
  { title: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

const studentNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Classes", href: "/dashboard/classes", icon: GraduationCap },
  { title: "Quizzes", href: "/dashboard/quizzes", icon: FileText },
  { title: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { title: "Progress", href: "/dashboard/progress", icon: Zap },
]

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === "TEACHER" ? teacherNav : studentNav

  return (
    <aside className="w-64 bg-card border-r h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            GradeQuest
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-violet-100 text-violet-700"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
