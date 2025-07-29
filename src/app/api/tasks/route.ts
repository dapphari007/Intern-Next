import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  internshipId: z.string().min(1, 'Internship ID is required'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
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
    const internshipId = searchParams.get('internshipId');
    const assignedTo = searchParams.get('assignedTo');

    const tasks = await db.task.findMany({
      where: {
        ...(internshipId && { internshipId }),
        ...(assignedTo && { assignedTo }),
      },
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            mentor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Check if user is the mentor of this internship
    const internship = await db.internship.findUnique({
      where: { id: validatedData.internshipId },
    });

    if (!internship || internship.mentorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the mentor can create tasks for this internship' },
        { status: 403 }
      );
    }

    const task = await db.task.create({
      data: validatedData,
      include: {
        internship: {
          select: {
            id: true,
            title: true,
            mentor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}