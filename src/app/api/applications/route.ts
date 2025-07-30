import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { AnalyticsHooksService } from '@/lib/services/analytics-hooks.service';

const createApplicationSchema = z.object({
  internshipId: z.string().min(1, 'Internship ID is required'),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
  resumeLink: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await db.internshipApplication.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        internship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an intern
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'INTERN') {
      return NextResponse.json(
        { error: 'Only interns can apply for internships' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createApplicationSchema.parse(body);

    // Check if internship exists and is active
    const internship = await db.internship.findUnique({
      where: { id: validatedData.internshipId },
    });

    if (!internship || internship.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Internship not found or not active' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const existingApplication = await db.internshipApplication.findUnique({
      where: {
        internshipId_userId: {
          internshipId: validatedData.internshipId,
          userId: session.user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this internship' },
        { status: 400 }
      );
    }

    const application = await db.internshipApplication.create({
      data: {
        internshipId: validatedData.internshipId,
        userId: session.user.id,
        coverLetter: validatedData.coverLetter,
        resumeUrl: validatedData.resumeUrl,
        resumeLink: validatedData.resumeLink,
        phone: validatedData.phone,
        linkedin: validatedData.linkedin,
        github: validatedData.github,
        portfolio: validatedData.portfolio,
        experience: validatedData.experience,
        motivation: validatedData.motivation,
      },
      include: {
        internship: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Update analytics after application submission
    AnalyticsHooksService.onApplicationSubmitted(session.user.id, validatedData.internshipId).catch(error => {
      console.error('Failed to update analytics after application submission:', error)
    })

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}