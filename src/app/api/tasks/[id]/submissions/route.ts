import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { AnalyticsHooksService } from '@/lib/services/analytics-hooks.service';

const createSubmissionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fileUrl: z.string().optional(),
});

export async function POST(
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

    const task = await db.task.findUnique({
      where: { id: params.id },
      include: {
        internship: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user is assigned to this task
    if (task.assignedTo !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only submit to tasks assigned to you' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createSubmissionSchema.parse(body);

    const submission = await db.taskSubmission.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        content: validatedData.content,
        fileUrl: validatedData.fileUrl,
      },
      include: {
        task: {
          include: {
            internship: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
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

    // Update task status to IN_PROGRESS if it was PENDING
    if (task.status === 'PENDING') {
      await db.task.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Update user analytics after task submission
    AnalyticsHooksService.onTaskSubmitted(session.user.id, params.id).catch(error => {
      console.error('Failed to update analytics after task submission:', error)
    })

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}