import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@internhub.com' },
    update: {},
    create: {
      email: 'admin@internhub.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      skillCredits: 0,
      bio: 'Platform administrator'
    }
  })

  const mentor1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@techcorp.com' },
    update: {},
    create: {
      email: 'sarah.johnson@techcorp.com',
      name: 'Sarah Johnson',
      role: UserRole.MENTOR,
      skillCredits: 0,
      bio: 'Senior Frontend Developer with 8+ years of experience in React and TypeScript.'
    }
  })

  const mentor2 = await prisma.user.upsert({
    where: { email: 'michael.chen@dataflow.com' },
    update: {},
    create: {
      email: 'michael.chen@dataflow.com',
      name: 'Dr. Michael Chen',
      role: UserRole.MENTOR,
      skillCredits: 0,
      bio: 'Data Science expert with PhD in Machine Learning and 10+ years in industry.'
    }
  })

  const mentor3 = await prisma.user.upsert({
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

  const intern1 = await prisma.user.upsert({
    where: { email: 'alice.johnson@student.com' },
    update: {},
    create: {
      email: 'alice.johnson@student.com',
      name: 'Alice Johnson',
      role: UserRole.INTERN,
      skillCredits: 1250,
      bio: 'Computer Science student passionate about frontend development.'
    }
  })

  const intern2 = await prisma.user.upsert({
    where: { email: 'bob.smith@student.com' },
    update: {},
    create: {
      email: 'bob.smith@student.com',
      name: 'Bob Smith',
      role: UserRole.INTERN,
      skillCredits: 800,
      bio: 'Data Science enthusiast with strong Python and ML skills.'
    }
  })

  const intern3 = await prisma.user.upsert({
    where: { email: 'carol.davis@student.com' },
    update: {},
    create: {
      email: 'carol.davis@student.com',
      name: 'Carol Davis',
      role: UserRole.INTERN,
      skillCredits: 600,
      bio: 'Design student interested in UX/UI and user research.'
    }
  })

  // Create internships
  const internship1 = await prisma.internship.create({
    data: {
      title: 'Frontend Developer Intern',
      description: 'Work on React applications and learn modern frontend technologies. You will be building user interfaces, implementing responsive designs, and working with APIs.',
      domain: 'Web Development',
      duration: 12,
      isPaid: true,
      stipend: 1500,
      mentorId: mentor1.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 2
    }
  })

  const internship2 = await prisma.internship.create({
    data: {
      title: 'Data Science Intern',
      description: 'Analyze large datasets and build machine learning models. Learn data preprocessing, feature engineering, and model deployment.',
      domain: 'Data Science',
      duration: 16,
      isPaid: true,
      stipend: 2000,
      mentorId: mentor2.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 1
    }
  })

  const internship3 = await prisma.internship.create({
    data: {
      title: 'UX Design Intern',
      description: 'Create user-centered designs for mobile and web applications. Learn user research, wireframing, and prototyping.',
      domain: 'Design',
      duration: 10,
      isPaid: false,
      stipend: 0,
      mentorId: mentor3.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 3
    }
  })

  const internship4 = await prisma.internship.create({
    data: {
      title: 'Backend Developer Intern',
      description: 'Build scalable APIs and work with cloud infrastructure. Learn Node.js, databases, and deployment strategies.',
      domain: 'Backend Development',
      duration: 14,
      isPaid: true,
      stipend: 1800,
      mentorId: mentor1.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 2
    }
  })

  const internship5 = await prisma.internship.create({
    data: {
      title: 'Mobile App Developer Intern',
      description: 'Develop cross-platform mobile applications using React Native. Learn mobile UI/UX patterns and app deployment.',
      domain: 'Mobile Development',
      duration: 12,
      isPaid: true,
      stipend: 1600,
      mentorId: mentor1.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 1
    }
  })

  // Create applications
  const application1 = await prisma.internshipApplication.create({
    data: {
      internshipId: internship1.id,
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED
    }
  })

  const application2 = await prisma.internshipApplication.create({
    data: {
      internshipId: internship2.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED
    }
  })

  const application3 = await prisma.internshipApplication.create({
    data: {
      internshipId: internship3.id,
      userId: intern3.id,
      status: ApplicationStatus.ACCEPTED
    }
  })

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Create login/signup forms with validation and integrate with backend API. Use React Hook Form and Zod for validation.',
      internshipId: internship1.id,
      assignedTo: intern1.id,
      status: TaskStatus.COMPLETED,
      dueDate: new Date('2024-01-15')
    }
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Design responsive dashboard',
      description: 'Create a responsive dashboard layout using Tailwind CSS. Include charts, cards, and navigation.',
      internshipId: internship1.id,
      assignedTo: intern1.id,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2024-01-20')
    }
  })

  const task3 = await prisma.task.create({
    data: {
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for authentication components using Jest and React Testing Library.',
      internshipId: internship1.id,
      assignedTo: intern1.id,
      status: TaskStatus.PENDING,
      dueDate: new Date('2024-01-25')
    }
  })

  const task4 = await prisma.task.create({
    data: {
      title: 'Data preprocessing pipeline',
      description: 'Build a data preprocessing pipeline for customer data analysis. Handle missing values and feature scaling.',
      internshipId: internship2.id,
      assignedTo: intern2.id,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2024-01-18')
    }
  })

  // Create task submissions
  const submission1 = await prisma.taskSubmission.create({
    data: {
      taskId: task1.id,
      userId: intern1.id,
      content: 'Implemented complete authentication system with login, signup, and password reset functionality. Used React Hook Form for form handling and Zod for validation.',
      status: SubmissionStatus.APPROVED,
      feedback: 'Excellent work! Clean code and good error handling. The validation is comprehensive and user-friendly.',
      creditsAwarded: 50,
      submittedAt: new Date('2024-01-14'),
      reviewedAt: new Date('2024-01-15')
    }
  })

  // Create credit history
  await prisma.creditHistory.create({
    data: {
      userId: intern1.id,
      amount: 50,
      type: CreditType.EARNED,
      description: 'Task completion: Implement user authentication'
    }
  })

  await prisma.creditHistory.create({
    data: {
      userId: intern1.id,
      amount: 75,
      type: CreditType.EARNED,
      description: 'Task completion: Dashboard design'
    }
  })

  await prisma.creditHistory.create({
    data: {
      userId: intern1.id,
      amount: 25,
      type: CreditType.BONUS,
      description: 'Bonus: Early submission'
    }
  })

  // Create certificates
  const certificate1 = await prisma.certificate.create({
    data: {
      userId: intern1.id,
      internshipId: internship1.id,
      title: 'Frontend Development Mastery',
      description: 'Successfully completed a comprehensive frontend development internship with excellent performance.',
      status: CertificateStatus.ISSUED
    }
  })

  const certificate2 = await prisma.certificate.create({
    data: {
      userId: intern2.id,
      internshipId: internship2.id,
      title: 'Data Science Fundamentals',
      description: 'Demonstrated proficiency in data analysis and machine learning techniques.',
      status: CertificateStatus.MINTED,
      nftTokenId: '0x1234567890abcdef'
    }
  })

  // Create project rooms
  const projectRoom1 = await prisma.projectRoom.create({
    data: {
      internshipId: internship1.id,
      name: 'Frontend Development Project',
      description: 'Collaboration space for frontend development tasks and discussions.'
    }
  })

  const projectRoom2 = await prisma.projectRoom.create({
    data: {
      internshipId: internship2.id,
      name: 'Data Science Project',
      description: 'Workspace for data analysis and machine learning projects.'
    }
  })

  // Create chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        projectRoomId: projectRoom1.id,
        userId: mentor1.id,
        content: 'Welcome to the project room! Let\'s start with the authentication task.'
      },
      {
        projectRoomId: projectRoom1.id,
        userId: intern1.id,
        content: 'Thank you! I\'ve started working on the login form. Should I use any specific validation library?'
      },
      {
        projectRoomId: projectRoom1.id,
        userId: mentor1.id,
        content: 'Great question! Please use Zod for validation as it integrates well with React Hook Form.'
      },
      {
        projectRoomId: projectRoom1.id,
        userId: intern1.id,
        content: 'Perfect! I\'ll implement it with Zod. I\'ve also uploaded the initial wireframes for review.'
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created ${await prisma.user.count()} users`)
  console.log(`💼 Created ${await prisma.internship.count()} internships`)
  console.log(`📝 Created ${await prisma.task.count()} tasks`)
  console.log(`🏆 Created ${await prisma.certificate.count()} certificates`)
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