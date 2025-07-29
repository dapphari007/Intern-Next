import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createInternshipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  domain: z.string().min(1, 'Domain is required'),
  duration: z.number().min(1, 'Duration must be at least 1 week'),
  isPaid: z.boolean().default(false),
  stipend: z.number().optional(),
  maxInterns: z.number().min(1).default(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const isPaid = searchParams.get('isPaid');
    
    const internships = await db.internship.findMany({
      where: {
        status: 'ACTIVE',
        ...(domain && { domain }),
        ...(isPaid && { isPaid: isPaid === 'true' }),
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internships' },
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

    // Check if user is a mentor
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Only mentors can create internships' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createInternshipSchema.parse(body);

    const internship = await db.internship.create({
      data: {
        ...validatedData,
        mentorId: session.user.id,
      },
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
    });

    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating internship:', error);
    return NextResponse.json(
      { error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}