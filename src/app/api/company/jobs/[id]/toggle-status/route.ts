import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { isActive } = await req.json()
    
    // Verify the job belongs to the user's company
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      )
    }

    // Update the job posting status
    const updatedJob = await db.jobPosting.updateMany({
      where: {
        id: params.id,
        companyId: user.company.id
      },
      data: {
        isActive: isActive
      }
    })

    if (updatedJob.count === 0) {
      return NextResponse.json(
        { error: "Job not found or not authorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Job ${isActive ? 'activated' : 'deactivated'} successfully`
    })

  } catch (error) {
    console.error("Error toggling job status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}