import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // For now, we'll create some testimonials from existing users
    // In a real app, you'd have a separate testimonials table
    const testimonials = await db.user.findMany({
      where: {
        role: {
          in: ['INTERN', 'MENTOR']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        internships: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            internship: {
              select: {
                title: true,
                domain: true
              }
            }
          }
        },
        certificates: {
          select: {
            title: true
          }
        }
      },
      take: 6
    })

    // Transform users into testimonials
    const testimonialData = testimonials.map((user, index) => {
      const testimonialTexts = [
        "The skill-based matching helped me find the perfect internship. I earned credits and got valuable experience!",
        "Mentoring through this platform has been incredibly rewarding. The credit system motivates interns to excel.",
        "The Web3 certificates gave me a competitive edge in job interviews. Employers love the verified credentials.",
        "Working on real projects with industry mentors has accelerated my learning tremendously.",
        "The gamified credit system made learning fun and engaging. I completed all my tasks ahead of schedule!",
        "This platform connected me with amazing opportunities I wouldn't have found elsewhere."
      ]

      const companies = [
        "TechCorp", "DataFlow Inc", "DesignStudio", "AI Solutions", "CryptoTech", "InnovateLab"
      ]

      const application = user.internships[0]
      const company = application?.internship?.domain || companies[index % companies.length]
      const roleTitle = user.role === 'MENTOR' ? 
        `${application?.internship?.title || 'Senior'} Mentor` : 
        `${application?.internship?.title || 'Software Engineering'} Intern`

      return {
        id: user.id,
        name: user.name || `User ${index + 1}`,
        role: roleTitle,
        company: company,
        content: testimonialTexts[index % testimonialTexts.length],
        rating: 5,
        createdAt: user.createdAt
      }
    })

    return NextResponse.json(testimonialData)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}