import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
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

    const internship = await db.internship.findUnique({
      where: { id: params.id },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
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

    // Transform the data to match the frontend interface
    const transformedInternship = {
      id: internship.id,
      title: internship.title,
      company: 'InternHub',
      location: 'Remote',
      duration: internship.duration,
      isPaid: internship.isPaid,
      stipend: internship.stipend,
      domain: internship.domain,
      description: internship.description,
      mentor: internship.mentor.name || 'Unknown',
      mentorId: internship.mentorId,
      rating: 4.5,
      applicants: internship._count.applications,
      maxInterns: internship.maxInterns,
      skills: Array.isArray(internship.skills) ? internship.skills : [],
      postedAt: internship.createdAt.toISOString().split('T')[0],
      status: internship.status.toLowerCase() as 'active' | 'inactive' | 'completed',
      requirements: Array.isArray(internship.requirements) ? internship.requirements : [],
      responsibilities: Array.isArray(internship.responsibilities) ? internship.responsibilities : [],
      benefits: Array.isArray(internship.benefits) ? internship.benefits : [],
      applications: internship.applications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt.toISOString(),
        user: app.user,
      })),
    };

    return NextResponse.json(transformedInternship);
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
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, ...updateData } = body;

    // Check if internship exists
    const existingInternship = await db.internship.findUnique({
      where: { id: params.id },
    });

    if (!existingInternship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (status) {
      // Map frontend status to database enum
      const statusMap = {
        'active': 'ACTIVE',
        'inactive': 'INACTIVE',
        'completed': 'COMPLETED',
      };
      dataToUpdate.status = statusMap[status as keyof typeof statusMap] || 'ACTIVE';
    }

    // Add other fields if provided
    if (updateData.title) dataToUpdate.title = updateData.title;
    if (updateData.description) dataToUpdate.description = updateData.description;
    if (updateData.domain) dataToUpdate.domain = updateData.domain;
    if (updateData.duration) dataToUpdate.duration = parseInt(updateData.duration);
    if (updateData.isPaid !== undefined) dataToUpdate.isPaid = Boolean(updateData.isPaid);
    if (updateData.stipend !== undefined) dataToUpdate.stipend = updateData.isPaid ? parseFloat(updateData.stipend) || null : null;
    if (updateData.maxInterns) dataToUpdate.maxInterns = parseInt(updateData.maxInterns);
    if (updateData.mentorId) {
      // Verify mentor exists and has MENTOR role
      const mentor = await db.user.findFirst({
        where: {
          id: updateData.mentorId,
          role: 'MENTOR',
        },
      });

      if (!mentor) {
        return NextResponse.json(
          { error: 'Invalid mentor selected' },
          { status: 400 }
        );
      }
      dataToUpdate.mentorId = updateData.mentorId;
    }

    const updatedInternship = await db.internship.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Transform the response to match frontend interface
    const transformedInternship = {
      id: updatedInternship.id,
      title: updatedInternship.title,
      company: 'InternHub',
      location: 'Remote',
      duration: updatedInternship.duration,
      isPaid: updatedInternship.isPaid,
      stipend: updatedInternship.stipend,
      domain: updatedInternship.domain,
      description: updatedInternship.description,
      mentor: updatedInternship.mentor.name || 'Unknown',
      mentorId: updatedInternship.mentorId,
      rating: 4.5,
      applicants: updatedInternship._count.applications,
      maxInterns: updatedInternship.maxInterns,
      skills: Array.isArray(updatedInternship.skills) ? updatedInternship.skills : [],
      postedAt: updatedInternship.createdAt.toISOString().split('T')[0],
      status: updatedInternship.status.toLowerCase() as 'active' | 'inactive' | 'completed',
      requirements: Array.isArray(updatedInternship.requirements) ? updatedInternship.requirements : [],
      responsibilities: Array.isArray(updatedInternship.responsibilities) ? updatedInternship.responsibilities : [],
      benefits: Array.isArray(updatedInternship.benefits) ? updatedInternship.benefits : [],
    };

    return NextResponse.json(transformedInternship);
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { error: 'Failed to update internship' },
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

    // Check if internship exists
    const existingInternship = await db.internship.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            applications: true,
            tasks: true,
          },
        },
      },
    });

    if (!existingInternship) {
      return NextResponse.json(
        { error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Check if internship has applications or tasks
    if (existingInternship._count.applications > 0 || existingInternship._count.tasks > 0) {
      return NextResponse.json(
        { error: 'Cannot delete internship with existing applications or tasks. Please set status to inactive instead.' },
        { status: 400 }
      );
    }

    await db.internship.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      { error: 'Failed to delete internship' },
      { status: 500 }
    );
  }
}