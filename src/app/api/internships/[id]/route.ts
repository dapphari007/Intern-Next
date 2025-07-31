import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const internship = await db.internship.findUnique({
      where: { id: params.id },
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
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            submissions: {
              select: {
                id: true,
                status: true,
                submittedAt: true,
              },
            },
          },
        },
        projectRooms: {
          include: {
            chatMessages: {
              take: 5,
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internship' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const internship = await db.internship.findUnique({
      where: { id: params.id },
      include: {
        company: true
      }
    });

    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Check if user is the mentor of this internship or company admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    });

    const canUpdate = internship.mentorId === session.user.id || 
                     (user?.role === 'COMPANY_ADMIN' && user?.companyId === internship.companyId);

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Only the mentor or company admin can update this internship' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const updatedInternship = await db.internship.update({
      where: { id: params.id },
      data: body,
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
        },
      },
    });

    return NextResponse.json(updatedInternship);
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { error: 'Failed to update internship' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const internship = await db.internship.findUnique({
      where: { id: params.id },
      include: {
        company: true
      }
    });

    if (!internship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Check if user is company admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    });

    if (user?.role !== 'COMPANY_ADMIN' || user?.companyId !== internship.companyId) {
      return NextResponse.json(
        { error: 'Only company admin can toggle internship status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Toggle status if requested
    if (body.action === 'toggle-status') {
      const updatedInternship = await db.internship.update({
        where: { id: params.id },
        data: { isActive: !internship.isActive },
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
          },
        },
      });

      return NextResponse.json(updatedInternship);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error toggling internship status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle internship status' },
      { status: 500 }
    );
  }
}