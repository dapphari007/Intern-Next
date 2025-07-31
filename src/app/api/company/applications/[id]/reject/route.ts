import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
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

    const applicationId = params.id

    // First, check if this is an internship application or job application
    let application = await db.companyInternshipApplication.findUnique({
      where: { id: applicationId },
      include: {
        internship: {
          include: {
            company: true
          }
        }
      }
    })

    if (application) {
      // Verify the application belongs to the user's company
      if (application.internship.company.id !== session.user.companyId) {
        return NextResponse.json(
          { error: "Unauthorized - Application not from your company" },
          { status: 403 }
        )
      }

      // Update internship application status
      await db.companyInternshipApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' }
      })

      return NextResponse.json({ success: true })
    }

    // Check if it's a job application
    const jobApplication = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    })

    if (jobApplication) {
      // Verify the application belongs to the user's company
      if (jobApplication.job.company.id !== session.user.companyId) {
        return NextResponse.json(
          { error: "Unauthorized - Application not from your company" },
          { status: 403 }
        )
      }

      // Update job application status
      await db.jobApplication.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    )

  } catch (error) {
    console.error("Error rejecting application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}