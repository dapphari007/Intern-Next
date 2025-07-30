import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { AnalyticsHooksService } from '@/lib/services/analytics-hooks.service';

const reviewSubmissionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'NEEDS_REVISION']),
  feedback: z.string().optional(),
  creditsAwarded: z.number().min(0).default(0),
});

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

    const submission = await db.taskSubmission.findUnique({
      where: { id: params.id },
      include: {
        task: {
          include: {
            internship: true,
          },
        },
        user: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user is the mentor of this internship
    if (submission.task.internship.mentorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the mentor can review this submission' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSubmissionSchema.parse(body);

    const updatedSubmission = await db.taskSubmission.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        feedback: validatedData.feedback,
        creditsAwarded: validatedData.creditsAwarded,
        reviewedAt: new Date(),
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

    // If approved, award credits and update task status
    if (validatedData.status === 'APPROVED') {
      if (validatedData.creditsAwarded > 0) {
        // Add credits to user
        await db.user.update({
          where: { id: submission.userId },
          data: {
            skillCredits: {
              increment: validatedData.creditsAwarded,
            },
          },
        });

        // Record credit history
        await db.creditHistory.create({
          data: {
            userId: submission.userId,
            amount: validatedData.creditsAwarded,
            type: 'EARNED',
            description: `Task completed: ${submission.task.title}`,
          },
        });
      }

      // Update task status to COMPLETED
      await db.task.update({
        where: { id: submission.taskId },
        data: { status: 'COMPLETED' },
      });

      // Update analytics after credits awarded
      if (validatedData.creditsAwarded > 0) {
        AnalyticsHooksService.onCreditsAwarded(
          submission.userId, 
          validatedData.creditsAwarded, 
          `Task completed: ${submission.task.title}`
        ).catch(error => {
          console.error('Failed to update analytics after credits awarded:', error)
        })
      }
    }

    // Update analytics after task review
    AnalyticsHooksService.onTaskReviewed(
      submission.userId, 
      submission.taskId, 
      validatedData.status === 'APPROVED'
    ).catch(error => {
      console.error('Failed to update analytics after task review:', error)
    })

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      { error: 'Failed to review submission' },
      { status: 500 }
    );
  }
}