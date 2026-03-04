import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Only students can join classes" },
      { status: 403 }
    )
  }

  try {
    const { joinCode } = await req.json()

    const cls = await prisma.class.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
    })

    if (!cls) {
      return NextResponse.json({ error: "Invalid join code" }, { status: 404 })
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: session.user.id,
          classId: cls.id,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this class" },
        { status: 400 }
      )
    }

    await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        classId: cls.id,
      },
    })

    return NextResponse.json({ message: "Joined successfully", class: cls })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to join class" },
      { status: 500 }
    )
  }
}
