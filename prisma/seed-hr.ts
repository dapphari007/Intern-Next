import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, JobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting HR seed...')

  // Create a company first
  let company = await prisma.company.findFirst({
    where: { name: 'TechCorp Solutions' }
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider specializing in web development, mobile apps, and cloud services.',
        website: 'https://techcorp.com',
        industry: 'Technology',
        size: '100-500',
        location: 'San Francisco, CA',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
      }
    })
  }

  console.log('✅ Company created:', company.name)

  // Create HR Manager user
  const hrManager = await prisma.user.upsert({
    where: { email: 'hr@techcorp.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'hr@techcorp.com',
      role: UserRole.HR_MANAGER,
      bio: 'Experienced HR Manager with 8+ years in talent acquisition and employee relations.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ HR Manager created:', hrManager.name)

  // Create Company Admin
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com' },
    update: {},
    create: {
      name: 'Michael Chen',
      email: 'admin@techcorp.com',
      role: UserRole.COMPANY_ADMIN,
      bio: 'Company Administrator overseeing all operations and strategic initiatives.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ Company Admin created:', companyAdmin.name)

  // Create Company Manager
  const companyManager = await prisma.user.upsert({
    where: { email: 'manager@techcorp.com' },
    update: {},
    create: {
      name: 'Jennifer Martinez',
      email: 'manager@techcorp.com',
      role: UserRole.COMPANY_MANAGER,
      bio: 'Company Manager responsible for overseeing daily operations and team coordination.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ Company Manager created:', companyManager.name)

  // Create Company Coordinator
  const companyCoordinator = await prisma.user.upsert({
    where: { email: 'coordinator@techcorp.com' },
    update: {},
    create: {
      name: 'Alex Thompson',
      email: 'coordinator@techcorp.com',
      role: UserRole.COMPANY_COORDINATOR,
      bio: 'Company Coordinator managing internship programs and alumni relations.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ Company Coordinator created:', companyCoordinator.name)

  // Create some mentors for the company
  const mentor1 = await prisma.user.upsert({
    where: { email: 'mentor1@techcorp.com' },
    update: {},
    create: {
      name: 'David Rodriguez',
      email: 'mentor1@techcorp.com',
      role: UserRole.MENTOR,
      bio: 'Senior Full Stack Developer with expertise in React, Node.js, and cloud technologies.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  const mentor2 = await prisma.user.upsert({
    where: { email: 'mentor2@techcorp.com' },
    update: {},
    create: {
      name: 'Emily Watson',
      email: 'mentor2@techcorp.com',
      role: UserRole.MENTOR,
      bio: 'Lead Mobile Developer specializing in React Native and Flutter applications.',
      skillCredits: 0,
      companyId: company.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ Mentors created')

  // Create some intern users (alumni)
  const intern1 = await prisma.user.upsert({
    where: { email: 'alice.smith@student.edu' },
    update: {},
    create: {
      name: 'Alice Smith',
      email: 'alice.smith@student.edu',
      role: UserRole.INTERN,
      bio: 'Computer Science student passionate about web development and UI/UX design.',
      skillCredits: 850,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  const intern2 = await prisma.user.upsert({
    where: { email: 'bob.johnson@student.edu' },
    update: {},
    create: {
      name: 'Bob Johnson',
      email: 'bob.johnson@student.edu',
      role: UserRole.INTERN,
      bio: 'Software Engineering student with experience in Python, Java, and machine learning.',
      skillCredits: 720,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  const intern3 = await prisma.user.upsert({
    where: { email: 'carol.davis@student.edu' },
    update: {},
    create: {
      name: 'Carol Davis',
      email: 'carol.davis@student.edu',
      role: UserRole.INTERN,
      bio: 'Information Systems student interested in database design and backend development.',
      skillCredits: 650,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  const intern4 = await prisma.user.upsert({
    where: { email: 'daniel.wilson@student.edu' },
    update: {},
    create: {
      name: 'Daniel Wilson',
      email: 'daniel.wilson@student.edu',
      role: UserRole.INTERN,
      bio: 'Computer Engineering student with focus on mobile app development and DevOps.',
      skillCredits: 780,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ Intern users created')

  // Create company internships
  const internship1 = await prisma.companyInternship.create({
    data: {
      title: 'Frontend Development Internship',
      description: 'Work with our frontend team to build modern web applications using React, TypeScript, and Tailwind CSS. You will contribute to real projects and learn industry best practices.',
      domain: 'Frontend Development',
      duration: 12,
      isPaid: true,
      stipend: 1500,
      isActive: true,
      maxInterns: 3,
      companyId: company.id,
      mentorId: mentor1.id,
    }
  })

  const internship2 = await prisma.companyInternship.create({
    data: {
      title: 'Mobile App Development Internship',
      description: 'Join our mobile team to develop cross-platform applications using React Native. Learn mobile development patterns and contribute to our flagship mobile products.',
      domain: 'Mobile Development',
      duration: 16,
      isPaid: true,
      stipend: 1800,
      isActive: true,
      maxInterns: 2,
      companyId: company.id,
      mentorId: mentor2.id,
    }
  })

  const internship3 = await prisma.companyInternship.create({
    data: {
      title: 'Full Stack Development Internship',
      description: 'Complete internship program covering both frontend and backend development. Work on end-to-end features and gain comprehensive web development experience.',
      domain: 'Full Stack Development',
      duration: 20,
      isPaid: true,
      stipend: 2000,
      isActive: false, // Completed program
      maxInterns: 4,
      companyId: company.id,
      mentorId: mentor1.id,
    }
  })

  console.log('✅ Company internships created')

  // Create internship applications (alumni)
  const application1 = await prisma.companyInternshipApplication.create({
    data: {
      internshipId: internship3.id, // Completed internship
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2023-08-15'),
    }
  })

  const application2 = await prisma.companyInternshipApplication.create({
    data: {
      internshipId: internship3.id, // Completed internship
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2023-08-20'),
    }
  })

  const application3 = await prisma.companyInternshipApplication.create({
    data: {
      internshipId: internship1.id, // Active internship
      userId: intern3.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2024-01-10'),
    }
  })

  const application4 = await prisma.companyInternshipApplication.create({
    data: {
      internshipId: internship2.id, // Active internship
      userId: intern4.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2024-01-15'),
    }
  })

  console.log('✅ Internship applications created')

  // Create job postings
  const jobPosting1 = await prisma.jobPosting.create({
    data: {
      title: 'Junior Frontend Developer',
      description: 'We are looking for a talented Junior Frontend Developer to join our growing team. You will work on exciting projects using modern technologies like React, TypeScript, and Next.js.',
      requirements: 'Bachelor\'s degree in Computer Science or related field, 1-2 years of experience with React, strong understanding of HTML, CSS, and JavaScript.',
      jobType: JobType.FULL_TIME,
      location: 'San Francisco, CA',
      salaryMin: 70000,
      salaryMax: 90000,
      isActive: true,
      companyId: company.id,
    }
  })

  const jobPosting2 = await prisma.jobPosting.create({
    data: {
      title: 'Mobile App Developer',
      description: 'Join our mobile team to build cutting-edge mobile applications. You will work with React Native and native iOS/Android technologies.',
      requirements: '2+ years of mobile development experience, proficiency in React Native or native mobile development, experience with app store deployment.',
      jobType: JobType.FULL_TIME,
      location: 'San Francisco, CA',
      salaryMin: 80000,
      salaryMax: 110000,
      isActive: true,
      companyId: company.id,
    }
  })

  const jobPosting3 = await prisma.jobPosting.create({
    data: {
      title: 'Senior Full Stack Engineer',
      description: 'Lead our full stack development initiatives and mentor junior developers. Work on complex projects using modern web technologies.',
      requirements: '5+ years of full stack development experience, expertise in React, Node.js, and database design, leadership experience preferred.',
      jobType: JobType.FULL_TIME,
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 160000,
      isActive: true,
      companyId: company.id,
    }
  })

  const jobPosting4 = await prisma.jobPosting.create({
    data: {
      title: 'DevOps Engineer',
      description: 'Help us scale our infrastructure and improve our deployment processes. Work with cloud technologies and automation tools.',
      requirements: '3+ years of DevOps experience, proficiency with AWS/Azure, experience with Docker, Kubernetes, and CI/CD pipelines.',
      jobType: JobType.FULL_TIME,
      location: 'San Francisco, CA',
      salaryMin: 95000,
      salaryMax: 130000,
      isActive: false, // Filled position
      companyId: company.id,
    }
  })

  console.log('✅ Job postings created')

  // Create job applications
  const jobApp1 = await prisma.jobApplication.create({
    data: {
      jobId: jobPosting1.id,
      userId: intern1.id, // Alice applying for Junior Frontend Developer
      status: ApplicationStatus.PENDING,
      appliedAt: new Date('2024-01-20'),
      coverLetter: 'Having completed my internship at TechCorp, I am excited to continue my career as a Junior Frontend Developer. I have hands-on experience with your tech stack and understand your development processes.',
    }
  })

  const jobApp2 = await prisma.jobApplication.create({
    data: {
      jobId: jobPosting2.id,
      userId: intern4.id, // Daniel applying for Mobile App Developer
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2024-01-18'),
      coverLetter: 'My internship experience with mobile development at TechCorp has prepared me well for this role. I am passionate about creating exceptional mobile experiences.',
    }
  })

  const jobApp3 = await prisma.jobApplication.create({
    data: {
      jobId: jobPosting1.id,
      userId: intern3.id, // Carol applying for Junior Frontend Developer
      status: ApplicationStatus.REJECTED,
      appliedAt: new Date('2024-01-22'),
      coverLetter: 'I am interested in transitioning from my current internship to a full-time frontend role. I have been working with React and would love to continue growing with TechCorp.',
    }
  })

  const jobApp4 = await prisma.jobApplication.create({
    data: {
      jobId: jobPosting3.id,
      userId: intern2.id, // Bob applying for Senior Full Stack Engineer
      status: ApplicationStatus.PENDING,
      appliedAt: new Date('2024-01-25'),
      coverLetter: 'While I may be early in my career, my internship experience and strong technical skills make me a candidate worth considering for growth into this senior role.',
    }
  })

  // Create external job applications (from non-alumni)
  const externalUser1 = await prisma.user.upsert({
    where: { email: 'external1@example.com' },
    update: {},
    create: {
      name: 'Jennifer Lee',
      email: 'external1@example.com',
      role: UserRole.INTERN,
      bio: 'Experienced frontend developer looking for new opportunities.',
      skillCredits: 0,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  const jobApp5 = await prisma.jobApplication.create({
    data: {
      jobId: jobPosting1.id,
      userId: externalUser1.id,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date('2024-01-28'),
      coverLetter: 'I am excited about the opportunity to join TechCorp as a Junior Frontend Developer. My experience with React and modern web technologies aligns well with your requirements.',
    }
  })

  console.log('✅ Job applications created')

  // Create some messages for the HR manager
  await prisma.message.create({
    data: {
      subject: 'Interview Scheduling - Junior Frontend Position',
      content: 'Hi Sarah, I wanted to follow up on the interview scheduling for the Junior Frontend Developer position. When would be a good time to conduct the technical interviews?',
      type: 'DIRECT',
      senderId: companyAdmin.id,
      receiverId: hrManager.id,
      isRead: false,
    }
  })

  await prisma.message.create({
    data: {
      subject: 'Alumni Engagement Program',
      content: 'We should consider creating a formal alumni engagement program to maintain relationships with our former interns. This could help with future recruitment and company branding.',
      type: 'DIRECT',
      senderId: mentor1.id,
      receiverId: hrManager.id,
      isRead: true,
    }
  })

  await prisma.message.create({
    data: {
      subject: 'Job Application Update',
      content: 'Thank you for considering my application for the Junior Frontend Developer position. I am very excited about the opportunity to continue my career at TechCorp.',
      type: 'DIRECT',
      senderId: intern1.id,
      receiverId: hrManager.id,
      isRead: false,
    }
  })

  console.log('✅ Messages created')

  // Create some certificates for alumni
  await prisma.certificate.create({
    data: {
      title: 'Full Stack Development Internship Certificate',
      description: 'Successfully completed a 20-week Full Stack Development internship program at TechCorp Solutions.',
      userId: intern1.id,
      issueDate: new Date('2023-12-15'),
      status: 'ISSUED',
    }
  })

  await prisma.certificate.create({
    data: {
      title: 'Full Stack Development Internship Certificate',
      description: 'Successfully completed a 20-week Full Stack Development internship program at TechCorp Solutions.',
      userId: intern2.id,
      issueDate: new Date('2023-12-15'),
      status: 'ISSUED',
    }
  })

  console.log('✅ Certificates created')

  // Add some credit history for alumni
  await prisma.creditHistory.createMany({
    data: [
      {
        userId: intern1.id,
        amount: 100,
        type: 'EARNED',
        description: 'Completed React fundamentals task',
        createdAt: new Date('2023-09-01'),
      },
      {
        userId: intern1.id,
        amount: 150,
        type: 'EARNED',
        description: 'Built responsive user interface',
        createdAt: new Date('2023-09-15'),
      },
      {
        userId: intern1.id,
        amount: 200,
        type: 'EARNED',
        description: 'Implemented API integration',
        createdAt: new Date('2023-10-01'),
      },
      {
        userId: intern1.id,
        amount: 250,
        type: 'EARNED',
        description: 'Completed final project',
        createdAt: new Date('2023-12-01'),
      },
      {
        userId: intern2.id,
        amount: 120,
        type: 'EARNED',
        description: 'Database design task',
        createdAt: new Date('2023-09-10'),
      },
      {
        userId: intern2.id,
        amount: 180,
        type: 'EARNED',
        description: 'Backend API development',
        createdAt: new Date('2023-10-15'),
      },
    ]
  })

  console.log('✅ Credit history created')

  console.log('🎉 HR seed completed successfully!')
  console.log('')
  console.log('📧 Login credentials:')
  console.log('HR Manager: hr@techcorp.com')
  console.log('Company Admin: admin@techcorp.com')
  console.log('Company Manager: manager@techcorp.com')
  console.log('Company Coordinator: coordinator@techcorp.com')
  console.log('Mentor 1: mentor1@techcorp.com')
  console.log('Mentor 2: mentor2@techcorp.com')
  console.log('')
  console.log('📊 Data created:')
  console.log('- 1 Company (TechCorp Solutions)')
  console.log('- 8 Users (HR Manager, Company Admin, Company Manager, Company Coordinator, 2 Mentors, 4 Interns/Alumni)')
  console.log('- 3 Company Internships')
  console.log('- 4 Internship Applications (Alumni)')
  console.log('- 4 Job Postings')
  console.log('- 5 Job Applications')
  console.log('- 3 Messages')
  console.log('- 2 Certificates')
  console.log('- 6 Credit History entries')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })