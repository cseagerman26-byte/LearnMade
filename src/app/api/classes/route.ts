import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateJoinCode } from "@/lib/utils"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let classes

    if (session.user.role === "TEACHER") {
      classes = await prisma.class.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: {
            select: { enrollments: true, assignments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: session.user.id },
        include: {
          class: {
            include: {
              teacher: { select: { name: true } },
              _count: {
                select: { enrollments: true, assignments: true },
              },
            },
          },
        },
      })
      classes = enrollments.map((e: { class: any }) => e.class)
    }

    return NextResponse.json(classes)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, subject } = await req.json()

    let joinCode = generateJoinCode()
    let existing = await prisma.class.findUnique({ where: { joinCode } })
    while (existing) {
      joinCode = generateJoinCode()
      existing = await prisma.class.findUnique({ where: { joinCode } })
    }

    const cls = await prisma.class.create({
      data: {
        name,
        subject,
        joinCode,
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: { enrollments: true, assignments: true },
        },
      },
    })

    return NextResponse.json(cls)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}
