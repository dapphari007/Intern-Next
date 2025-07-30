import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const internships = await db.internship.findMany({
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Transform the data to match the frontend interface
    const transformedInternships = internships.map((internship) => ({
      id: internship.id,
      title: internship.title,
      company: 'InternHub', // Since we don't have company field in schema, using platform name
      location: 'Remote', // Default location, can be added to schema later
      duration: internship.duration,
      isPaid: internship.isPaid,
      stipend: internship.stipend,
      domain: internship.domain,
      description: internship.description,
      mentor: internship.mentor.name || 'Unknown',
      mentorId: internship.mentorId,
      rating: 4.5, // Default rating, can be calculated from feedback later
      applicants: internship._count.applications,
      maxInterns: internship.maxInterns,
      skills: Array.isArray(internship.skills) ? internship.skills : [],
      postedAt: internship.createdAt.toISOString().split('T')[0],
      status: internship.status.toLowerCase() as 'active' | 'inactive' | 'completed',
      requirements: Array.isArray(internship.requirements) ? internship.requirements : [],
      responsibilities: Array.isArray(internship.responsibilities) ? internship.responsibilities : [],
      benefits: Array.isArray(internship.benefits) ? internship.benefits : [],
    }));

    return NextResponse.json(transformedInternships);
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
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      domain,
      duration,
      isPaid,
      stipend,
      maxInterns,
      mentorId,
      skills,
      requirements,
      responsibilities,
      benefits,
    } = body;

    // Validate required fields
    if (!title || !description || !domain || !duration || !mentorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify mentor exists and has MENTOR role
    const mentor = await db.user.findFirst({
      where: {
        id: mentorId,
        role: 'MENTOR',
      },
    });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Invalid mentor selected' },
        { status: 400 }
      );
    }

    const internship = await db.internship.create({
      data: {
        title,
        description,
        domain,
        duration: parseInt(duration),
        isPaid: Boolean(isPaid),
        stipend: isPaid ? parseFloat(stipend) || null : null,
        maxInterns: parseInt(maxInterns) || 1,
        mentorId,
        status: 'ACTIVE',
        skills: skills || [],
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        benefits: benefits || [],
      },
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
    };

    return NextResponse.json(transformedInternship, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}