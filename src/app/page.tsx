import Link from "next/link"
import { Zap, Trophy, Flame, Users, BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative z-10">
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">GradeQuest</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-amber-500 hover:bg-amber-600">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Level Up Your
              <br />
              <span className="text-amber-400">Learning Journey</span>
            </h1>
            <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
              A gamified classroom grading app that makes learning fun. 
              Earn XP, level up, and compete on leaderboards!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-lg px-8">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="bg-white/10 backdrop-blur border-0 text-white">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Earn XP</h3>
                <p className="text-violet-100">
                  Complete quizzes and assignments to earn experience points and level up!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-0 text-white">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Build Streaks</h3>
                <p className="text-violet-100">
                  Keep your daily streak alive by completing activities every day!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-0 text-white">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Compete</h3>
                <p className="text-violet-100">
                  Climb the leaderboard and see how you rank against your classmates!
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
              <Users className="h-10 w-10 mb-4 text-violet-300" />
              <h2 className="text-2xl font-bold mb-2">For Teachers</h2>
              <ul className="space-y-2 text-violet-100">
                <li>✓ Create classes with unique join codes</li>
                <li>✓ Build quizzes with MCQ, True/False, and short answers</li>
                <li>✓ Auto-grade multiple choice questions</li>
                <li>✓ View analytics and student progress</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
              <BookOpen className="h-10 w-10 mb-4 text-violet-300" />
              <h2 className="text-2xl font-bold mb-2">For Students</h2>
              <ul className="space-y-2 text-violet-100">
                <li>✓ Join classes with a simple code</li>
                <li>✓ Take quizzes and earn XP</li>
                <li>✓ Track your progress and streaks</li>
                <li>✓ Compete on class leaderboards</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="text-center py-8 text-violet-200">
          <p>© 2026 GradeQuest. Built for schools that want to make learning fun.</p>
        </footer>
      </div>
    </div>
  )
}
