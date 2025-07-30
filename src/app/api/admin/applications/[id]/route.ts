import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const application = await db.internshipApplication.findUnique({
      where: { id: params.id },
      include: {
        internship: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    const updatedApplication = await db.internshipApplication.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            skillCredits: true,
          },
        },
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

    // If application is accepted, create a project room and award credits
    if (validatedData.status === 'ACCEPTED') {
      // Check if project room already exists
      const existingRoom = await db.projectRoom.findFirst({
        where: { internshipId: application.internshipId },
      });

      if (!existingRoom) {
        await db.projectRoom.create({
          data: {
            internshipId: application.internshipId,
            name: `${application.internship.title} - Project Room`,
            description: `Collaboration space for ${application.internship.title}`,
          },
        });
      }

      // Award bonus credits for getting accepted
      await db.creditHistory.create({
        data: {
          userId: application.userId,
          amount: 50,
          type: 'BONUS',
          description: 'Internship application accepted by admin',
        },
      });

      await db.user.update({
        where: { id: application.userId },
        data: {
          skillCredits: {
            increment: 50,
          },
        },
      });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const application = await db.internshipApplication.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    await db.internshipApplication.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}