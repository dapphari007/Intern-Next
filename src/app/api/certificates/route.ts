import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCertificateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  internshipId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const certificates = await db.certificate.findMany({
      where: {
        userId: userId || session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
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

    // Check if user is a mentor or admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'MENTOR' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only mentors and admins can issue certificates' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createCertificateSchema.parse(body);

    // If internshipId is provided, verify the mentor owns the internship
    if (validatedData.internshipId && user.role === 'MENTOR') {
      const internship = await db.internship.findUnique({
        where: { id: validatedData.internshipId },
      });

      if (!internship || internship.mentorId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only issue certificates for your own internships' },
          { status: 403 }
        );
      }
    }

    const certificate = await db.certificate.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Award bonus credits for receiving a certificate
    await db.creditHistory.create({
      data: {
        userId: validatedData.userId,
        amount: 100,
        type: 'BONUS',
        description: `Certificate issued: ${validatedData.title}`,
      },
    });

    await db.user.update({
      where: { id: validatedData.userId },
      data: {
        skillCredits: {
          increment: 100,
        },
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to create certificate' },
      { status: 500 }
    );
  }
}