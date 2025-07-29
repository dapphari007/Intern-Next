import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get real-time stats from database
    const [
      totalInternships,
      totalUsers,
      totalCertificates,
      totalCredits
    ] = await Promise.all([
      db.internship.count({
        where: { status: 'ACTIVE' }
      }),
      db.user.count({
        where: { role: 'INTERN' }
      }),
      db.certificate.count(),
      db.creditHistory.aggregate({
        _sum: { amount: true },
        where: { type: 'EARNED' }
      })
    ]);

    const stats = [
      { label: "Active Internships", value: totalInternships.toString() },
      { label: "Active Interns", value: totalUsers.toString() },
      { label: "Certificates Issued", value: totalCertificates.toString() },
      { label: "Skill Credits Earned", value: (totalCredits._sum.amount || 0).toString() }
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}