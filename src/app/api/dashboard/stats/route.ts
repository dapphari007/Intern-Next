import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stats = {};

    if (user.role === 'INTERN') {
      // Intern dashboard stats
      const [applications, tasks, certificates, creditHistory] = await Promise.all([
        db.internshipApplication.findMany({
          where: { userId: session.user.id },
          include: { internship: true },
        }),
        db.task.findMany({
          where: { assignedTo: session.user.id },
          include: { submissions: true },
        }),
        db.certificate.findMany({
          where: { userId: session.user.id },
        }),
        db.creditHistory.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      stats = {
        totalApplications: applications.length,
        acceptedApplications: applications.filter(app => app.status === 'ACCEPTED').length,
        pendingApplications: applications.filter(app => app.status === 'PENDING').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
        pendingTasks: tasks.filter(task => task.status === 'PENDING').length,
        inProgressTasks: tasks.filter(task => task.status === 'IN_PROGRESS').length,
        totalCertificates: certificates.length,
        skillCredits: user.skillCredits,
        recentCreditHistory: creditHistory,
        applications: applications.slice(0, 5), // Recent applications
        tasks: tasks.slice(0, 5), // Recent tasks
      };
    } else if (user.role === 'MENTOR') {
      // Mentor dashboard stats
      const [internships, applications, tasks, certificates] = await Promise.all([
        db.internship.findMany({
          where: { mentorId: session.user.id },
          include: { 
            applications: true,
            tasks: true,
          },
        }),
        db.internshipApplication.findMany({
          where: { 
            internship: { mentorId: session.user.id } 
          },
          include: { 
            user: true,
            internship: true,
          },
        }),
        db.task.findMany({
          where: { 
            internship: { mentorId: session.user.id } 
          },
          include: { 
            assignee: true,
            submissions: true,
          },
        }),
        db.certificate.findMany({
          where: { 
            internshipId: { 
              in: (await db.internship.findMany({
                where: { mentorId: session.user.id },
                select: { id: true },
              })).map(i => i.id)
            }
          },
          include: { user: true },
        }),
      ]);

      stats = {
        totalInternships: internships.length,
        activeInternships: internships.filter(i => i.status === 'ACTIVE').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'PENDING').length,
        acceptedApplications: applications.filter(app => app.status === 'ACCEPTED').length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(task => task.status === 'PENDING').length,
        completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
        totalCertificates: certificates.length,
        recentApplications: applications.slice(0, 5),
        recentTasks: tasks.slice(0, 5),
        internships: internships.slice(0, 5),
      };
    } else if (user.role === 'ADMIN') {
      // Admin dashboard stats
      const [users, internships, applications, tasks, certificates] = await Promise.all([
        db.user.findMany(),
        db.internship.findMany({
          include: { mentor: true, applications: true },
        }),
        db.internshipApplication.findMany({
          include: { user: true, internship: true },
        }),
        db.task.findMany({
          include: { assignee: true, internship: true },
        }),
        db.certificate.findMany({
          include: { user: true },
        }),
      ]);

      stats = {
        totalUsers: users.length,
        totalInterns: users.filter(u => u.role === 'INTERN').length,
        totalMentors: users.filter(u => u.role === 'MENTOR').length,
        totalInternships: internships.length,
        activeInternships: internships.filter(i => i.status === 'ACTIVE').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'PENDING').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
        totalCertificates: certificates.length,
        recentUsers: users.slice(-5).reverse(),
        recentInternships: internships.slice(-5).reverse(),
        recentApplications: applications.slice(-5).reverse(),
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}