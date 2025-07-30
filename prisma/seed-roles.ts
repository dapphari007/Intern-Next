import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus, MessageType, JobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive role-based seed...')

  // Create companies first
  let techCorp = await prisma.company.findFirst({
    where: { name: 'TechCorp Solutions' }
  })

  if (!techCorp) {
    techCorp = await prisma.company.create({
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

  let innovateInc = await prisma.company.findFirst({
    where: { name: 'Innovate Inc' }
  })

  if (!innovateInc) {
    innovateInc = await prisma.company.create({
      data: {
        name: 'Innovate Inc',
        description: 'Innovative startup focused on AI and machine learning solutions.',
        website: 'https://innovateinc.com',
        industry: 'Artificial Intelligence',
        size: '50-100',
        location: 'New York, NY',
        logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop&crop=center',
      }
    })
  }

  console.log('✅ Companies created')

  // ========== ADMIN USERS ==========
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@internhub.com' },
    update: {},
    create: {
      email: 'admin@internhub.com',
      name: 'Platform Administrator',
      role: UserRole.ADMIN,
      skillCredits: 0,
      bio: 'Platform administrator with full system access and management capabilities.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }
  })

  // ========== COMPANY ADMIN USERS ==========
  const companyAdmin1 = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com' },
    update: {},
    create: {
      name: 'Michael Chen',
      email: 'admin@techcorp.com',
      role: UserRole.COMPANY_ADMIN,
      bio: 'Company Administrator overseeing all TechCorp operations and strategic initiatives.',
      skillCredits: 0,
      companyId: techCorp.id,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }
  })

  const companyAdmin2 = await prisma.user.upsert({
    where: { email: 'admin@innovateinc.com' },
    update: {},
    create: {
      name: 'Sarah Williams',
      email: 'admin@innovateinc.com',
      role: UserRole.COMPANY_ADMIN,
      bio: 'Company Administrator managing Innovate Inc operations and growth strategies.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  // ========== COMPANY MANAGER USERS ==========
  const companyManager1 = await prisma.user.upsert({
    where: { email: 'manager@techcorp.com' },
    update: {},
    create: {
      name: 'Jennifer Martinez',
      email: 'manager@techcorp.com',
      role: UserRole.COMPANY_MANAGER,
      bio: 'Company Manager responsible for overseeing daily operations and team coordination at TechCorp.',
      skillCredits: 0,
      companyId: techCorp.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  const companyManager2 = await prisma.user.upsert({
    where: { email: 'manager@innovateinc.com' },
    update: {},
    create: {
      name: 'Robert Johnson',
      email: 'manager@innovateinc.com',
      role: UserRole.COMPANY_MANAGER,
      bio: 'Company Manager handling operations and project management at Innovate Inc.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  // ========== COMPANY COORDINATOR USERS ==========
  const companyCoordinator1 = await prisma.user.upsert({
    where: { email: 'coordinator@techcorp.com' },
    update: {},
    create: {
      name: 'Alex Thompson',
      email: 'coordinator@techcorp.com',
      role: UserRole.COMPANY_COORDINATOR,
      bio: 'Company Coordinator managing internship programs and alumni relations at TechCorp.',
      skillCredits: 0,
      companyId: techCorp.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  const companyCoordinator2 = await prisma.user.upsert({
    where: { email: 'coordinator@innovateinc.com' },
    update: {},
    create: {
      name: 'Lisa Davis',
      email: 'coordinator@innovateinc.com',
      role: UserRole.COMPANY_COORDINATOR,
      bio: 'Company Coordinator overseeing internship coordination and student relations at Innovate Inc.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  // ========== HR MANAGER USERS ==========
  const hrManager1 = await prisma.user.upsert({
    where: { email: 'hr@techcorp.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'hr@techcorp.com',
      role: UserRole.HR_MANAGER,
      bio: 'Experienced HR Manager with 8+ years in talent acquisition and employee relations at TechCorp.',
      skillCredits: 0,
      companyId: techCorp.id,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  const hrManager2 = await prisma.user.upsert({
    where: { email: 'hr@innovateinc.com' },
    update: {},
    create: {
      name: 'David Rodriguez',
      email: 'hr@innovateinc.com',
      role: UserRole.HR_MANAGER,
      bio: 'HR Manager specializing in tech talent acquisition and employee development at Innovate Inc.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  // ========== MENTOR USERS ==========
  const mentor1 = await prisma.user.upsert({
    where: { email: 'mentor1@techcorp.com' },
    update: {},
    create: {
      name: 'David Rodriguez',
      email: 'mentor1@techcorp.com',
      role: UserRole.MENTOR,
      bio: 'Senior Full Stack Developer with expertise in React, Node.js, and cloud technologies.',
      skillCredits: 0,
      companyId: techCorp.id,
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
      companyId: techCorp.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  const mentor3 = await prisma.user.upsert({
    where: { email: 'mentor1@innovateinc.com' },
    update: {},
    create: {
      name: 'Dr. Michael Chen',
      email: 'mentor1@innovateinc.com',
      role: UserRole.MENTOR,
      bio: 'Data Science expert with PhD in Machine Learning and 10+ years in AI industry.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    }
  })

  const mentor4 = await prisma.user.upsert({
    where: { email: 'mentor2@innovateinc.com' },
    update: {},
    create: {
      name: 'Emma Wilson',
      email: 'mentor2@innovateinc.com',
      role: UserRole.MENTOR,
      bio: 'AI Research Scientist passionate about creating innovative machine learning solutions.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  // Independent mentors (not tied to companies)
  const independentMentor1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@freelance.com' },
    update: {},
    create: {
      email: 'sarah.johnson@freelance.com',
      name: 'Sarah Johnson',
      role: UserRole.MENTOR,
      skillCredits: 0,
      bio: 'Independent Senior Frontend Developer with 8+ years of experience in React and TypeScript.'
    }
  })

  const independentMentor2 = await prisma.user.upsert({
    where: { email: 'emma.wilson@designstudio.com' },
    update: {},
    create: {
      email: 'emma.wilson@designstudio.com',
      name: 'Emma Wilson',
      role: UserRole.MENTOR,
      skillCredits: 0,
      bio: 'UX Designer passionate about creating user-centered digital experiences.'
    }
  })

  // ========== INTERN USERS ==========
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

  const intern5 = await prisma.user.upsert({
    where: { email: 'eva.martinez@student.edu' },
    update: {},
    create: {
      name: 'Eva Martinez',
      email: 'eva.martinez@student.edu',
      role: UserRole.INTERN,
      bio: 'Data Science student passionate about AI and machine learning applications.',
      skillCredits: 920,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ All users created')

  // ========== CREATE COMPANY INTERNSHIPS ==========
  const companyInternship1 = await prisma.companyInternship.create({
    data: {
      title: 'Frontend Development Internship',
      description: 'Work with our frontend team to build modern web applications using React, TypeScript, and Tailwind CSS. You will contribute to real projects and learn industry best practices.',
      domain: 'Frontend Development',
      duration: 12,
      isPaid: true,
      stipend: 1500,
      isActive: true,
      maxInterns: 3,
      companyId: techCorp.id,
      mentorId: mentor1.id,
    }
  })

  const companyInternship2 = await prisma.companyInternship.create({
    data: {
      title: 'AI Research Internship',
      description: 'Join our AI research team to work on cutting-edge machine learning projects. Learn about neural networks, deep learning, and AI model deployment.',
      domain: 'Artificial Intelligence',
      duration: 16,
      isPaid: true,
      stipend: 2200,
      isActive: true,
      maxInterns: 2,
      companyId: innovateInc.id,
      mentorId: mentor3.id,
    }
  })

  // ========== CREATE INDEPENDENT INTERNSHIPS ==========
  const independentInternship1 = await prisma.internship.create({
    data: {
      title: 'Frontend Developer Intern',
      description: 'Work on React applications and learn modern frontend technologies. You will be building user interfaces, implementing responsive designs, and working with APIs.',
      domain: 'Web Development',
      duration: 12,
      isPaid: true,
      stipend: 1500,
      mentorId: independentMentor1.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 2
    }
  })

  const independentInternship2 = await prisma.internship.create({
    data: {
      title: 'UX Design Intern',
      description: 'Create user-centered designs for mobile and web applications. Learn user research, wireframing, and prototyping.',
      domain: 'Design',
      duration: 10,
      isPaid: false,
      stipend: 0,
      mentorId: independentMentor2.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 3
    }
  })

  // ========== CREATE APPLICATIONS ==========
  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship1.id,
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2024-01-10'),
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship2.id,
      userId: intern5.id,
      status: ApplicationStatus.ACCEPTED,
      appliedAt: new Date('2024-01-15'),
    }
  })

  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship1.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED
    }
  })

  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship2.id,
      userId: intern3.id,
      status: ApplicationStatus.ACCEPTED
    }
  })

  // ========== CREATE MESSAGES ==========
  await prisma.message.createMany({
    data: [
      {
        senderId: companyAdmin1.id,
        receiverId: intern1.id,
        subject: 'Welcome to TechCorp Internship Program',
        content: 'Welcome to our internship program! We are excited to have you on board. Please check your tasks and feel free to reach out if you have any questions.',
        type: MessageType.DIRECT,
        isRead: false,
      },
      {
        senderId: hrManager1.id,
        receiverId: intern1.id,
        subject: 'HR Orientation Schedule',
        content: 'Please find attached your orientation schedule. The session will cover company policies, benefits, and important procedures.',
        type: MessageType.DIRECT,
        isRead: true,
      },
      {
        senderId: companyCoordinator1.id,
        receiverId: intern1.id,
        subject: 'Internship Program Guidelines',
        content: 'Here are the guidelines for your internship program. Please review them carefully and let me know if you have any questions.',
        type: MessageType.DIRECT,
        isRead: false,
      },
      {
        senderId: companyManager1.id,
        receiverId: mentor1.id,
        subject: 'Intern Progress Review',
        content: 'Please provide an update on the intern progress for this month. We need to prepare the monthly report.',
        type: MessageType.DIRECT,
        isRead: false,
      },
      {
        senderId: platformAdmin.id,
        subject: 'Platform Maintenance Notice',
        content: 'The platform will undergo scheduled maintenance this weekend. Please plan accordingly.',
        type: MessageType.BROADCAST,
        isRead: false,
      }
    ]
  })

  // ========== CREATE TASKS ==========
  const task1 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Create login/signup forms with validation and integrate with backend API. Use React Hook Form and Zod for validation.',
      internshipId: independentInternship1.id,
      assignedTo: intern2.id,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2024-02-15')
    }
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Design user research survey',
      description: 'Create a comprehensive user research survey to understand user needs and preferences for the mobile app.',
      internshipId: independentInternship2.id,
      assignedTo: intern3.id,
      status: TaskStatus.PENDING,
      dueDate: new Date('2024-02-20')
    }
  })

  // ========== CREATE ANALYTICS ==========
  await prisma.studentAnalytics.createMany({
    data: [
      {
        userId: intern1.id,
        totalTasks: 5,
        completedTasks: 3,
        pendingTasks: 1,
        overdueTasks: 1,
        averageScore: 85.5,
        totalSubmissions: 4,
        onTimeSubmissions: 3,
        lateSubmissions: 1,
        totalCredits: 850,
        lastActive: new Date(),
      },
      {
        userId: intern2.id,
        totalTasks: 3,
        completedTasks: 1,
        pendingTasks: 2,
        overdueTasks: 0,
        averageScore: 78.0,
        totalSubmissions: 2,
        onTimeSubmissions: 2,
        lateSubmissions: 0,
        totalCredits: 720,
        lastActive: new Date(),
      },
      {
        userId: intern3.id,
        totalTasks: 4,
        completedTasks: 2,
        pendingTasks: 2,
        overdueTasks: 0,
        averageScore: 82.3,
        totalSubmissions: 3,
        onTimeSubmissions: 3,
        lateSubmissions: 0,
        totalCredits: 650,
        lastActive: new Date(),
      },
      {
        userId: intern4.id,
        totalTasks: 6,
        completedTasks: 4,
        pendingTasks: 1,
        overdueTasks: 1,
        averageScore: 88.7,
        totalSubmissions: 5,
        onTimeSubmissions: 4,
        lateSubmissions: 1,
        totalCredits: 780,
        lastActive: new Date(),
      },
      {
        userId: intern5.id,
        totalTasks: 7,
        completedTasks: 5,
        pendingTasks: 2,
        overdueTasks: 0,
        averageScore: 91.2,
        totalSubmissions: 6,
        onTimeSubmissions: 6,
        lateSubmissions: 0,
        totalCredits: 920,
        lastActive: new Date(),
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n🔐 LOGIN CREDENTIALS:')
  console.log('==========================================')
  console.log('📋 PLATFORM ADMIN:')
  console.log('   Email: admin@internhub.com')
  console.log('   Role: ADMIN')
  console.log('')
  console.log('🏢 COMPANY ADMINS:')
  console.log('   TechCorp: admin@techcorp.com (COMPANY_ADMIN)')
  console.log('   Innovate Inc: admin@innovateinc.com (COMPANY_ADMIN)')
  console.log('')
  console.log('👔 COMPANY MANAGERS:')
  console.log('   TechCorp: manager@techcorp.com (COMPANY_MANAGER)')
  console.log('   Innovate Inc: manager@innovateinc.com (COMPANY_MANAGER)')
  console.log('')
  console.log('🤝 COMPANY COORDINATORS:')
  console.log('   TechCorp: coordinator@techcorp.com (COMPANY_COORDINATOR)')
  console.log('   Innovate Inc: coordinator@innovateinc.com (COMPANY_COORDINATOR)')
  console.log('')
  console.log('👥 HR MANAGERS:')
  console.log('   TechCorp: hr@techcorp.com (HR_MANAGER)')
  console.log('   Innovate Inc: hr@innovateinc.com (HR_MANAGER)')
  console.log('')
  console.log('🎓 MENTORS:')
  console.log('   Company Mentors:')
  console.log('     mentor1@techcorp.com (MENTOR)')
  console.log('     mentor2@techcorp.com (MENTOR)')
  console.log('     mentor1@innovateinc.com (MENTOR)')
  console.log('     mentor2@innovateinc.com (MENTOR)')
  console.log('   Independent Mentors:')
  console.log('     sarah.johnson@freelance.com (MENTOR)')
  console.log('     emma.wilson@designstudio.com (MENTOR)')
  console.log('')
  console.log('🎯 INTERNS:')
  console.log('   alice.smith@student.edu (INTERN)')
  console.log('   bob.johnson@student.edu (INTERN)')
  console.log('   carol.davis@student.edu (INTERN)')
  console.log('   daniel.wilson@student.edu (INTERN)')
  console.log('   eva.martinez@student.edu (INTERN)')
  console.log('')
  console.log('💡 Note: For credentials login, use any email above with any password.')
  console.log('   The system will authenticate based on the email and role.')
  console.log('==========================================')
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`👤 Total users: ${await prisma.user.count()}`)
  console.log(`🏢 Companies: ${await prisma.company.count()}`)
  console.log(`💼 Company internships: ${await prisma.companyInternship.count()}`)
  console.log(`🎓 Independent internships: ${await prisma.internship.count()}`)
  console.log(`📝 Tasks: ${await prisma.task.count()}`)
  console.log(`💬 Messages: ${await prisma.message.count()}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })