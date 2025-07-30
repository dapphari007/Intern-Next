import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus, MessageType, JobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting consolidated role-based seed...')

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

  let digitalWorks = await prisma.company.findFirst({
    where: { name: 'Digital Works' }
  })

  if (!digitalWorks) {
    digitalWorks = await prisma.company.create({
      data: {
        name: 'Digital Works',
        description: 'Full-service digital agency providing web design, development, and digital marketing solutions.',
        website: 'https://digitalworks.com',
        industry: 'Digital Marketing',
        size: '25-50',
        location: 'Austin, TX',
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

  // ========== COMPANY ADMIN USERS (Consolidated Role) ==========
  const companyAdmin1 = await prisma.user.upsert({
    where: { email: 'admin@techcorp.com' },
    update: {},
    create: {
      name: 'Michael Chen',
      email: 'admin@techcorp.com',
      role: UserRole.COMPANY_ADMIN,
      bio: 'Company Administrator managing all TechCorp operations including internships, job postings, HR functions, and talent management.',
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
      bio: 'Company Administrator overseeing Innovate Inc operations, HR functions, recruitment, and strategic initiatives.',
      skillCredits: 0,
      companyId: innovateInc.id,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    }
  })

  const companyAdmin3 = await prisma.user.upsert({
    where: { email: 'admin@digitalworks.com' },
    update: {},
    create: {
      name: 'Jennifer Martinez',
      email: 'admin@digitalworks.com',
      role: UserRole.COMPANY_ADMIN,
      bio: 'Company Administrator handling Digital Works operations, talent acquisition, and company coordination.',
      skillCredits: 0,
      companyId: digitalWorks.id,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
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

  const mentor5 = await prisma.user.upsert({
    where: { email: 'mentor1@digitalworks.com' },
    update: {},
    create: {
      name: 'Alex Thompson',
      email: 'mentor1@digitalworks.com',
      role: UserRole.MENTOR,
      bio: 'Creative Director and UX/UI Designer with expertise in digital marketing and web design.',
      skillCredits: 0,
      companyId: digitalWorks.id,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
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

  const companyInternship3 = await prisma.companyInternship.create({
    data: {
      title: 'Digital Marketing Internship',
      description: 'Learn digital marketing strategies, content creation, and campaign management. Work with real clients and gain hands-on experience.',
      domain: 'Digital Marketing',
      duration: 10,
      isPaid: true,
      stipend: 1200,
      isActive: true,
      maxInterns: 2,
      companyId: digitalWorks.id,
      mentorId: mentor5.id,
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
      description: 'Learn user experience design principles and work on real design projects. You will create wireframes, prototypes, and conduct user research.',
      domain: 'Design',
      duration: 10,
      isPaid: false,
      mentorId: independentMentor2.id,
      status: InternshipStatus.ACTIVE,
      maxInterns: 1
    }
  })

  console.log('✅ Internships created')

  // ========== CREATE JOB POSTINGS ==========
  const jobPosting1 = await prisma.jobPosting.create({
    data: {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced frontend developer to join our team. You will work on large-scale applications and mentor junior developers.',
      requirements: 'React, TypeScript, 5+ years experience, leadership skills',
      location: 'San Francisco, CA',
      jobType: JobType.FULL_TIME,
      salaryMin: 120000,
      salaryMax: 180000,
      companyId: techCorp.id,
    }
  })

  const jobPosting2 = await prisma.jobPosting.create({
    data: {
      title: 'AI Research Scientist',
      description: 'Join our research team to develop next-generation AI solutions. PhD preferred but not required for exceptional candidates.',
      requirements: 'Machine Learning, Python, Research experience, PhD preferred',
      location: 'New York, NY',
      jobType: JobType.FULL_TIME,
      salaryMin: 150000,
      salaryMax: 250000,
      companyId: innovateInc.id,
    }
  })

  console.log('✅ Job postings created')

  // ========== CREATE APPLICATIONS ==========
  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship1.id,
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship2.id,
      userId: intern5.id,
      status: ApplicationStatus.PENDING,
    }
  })

  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship1.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  console.log('✅ Applications created')

  // ========== CREATE SAMPLE MESSAGES ==========
  await prisma.message.create({
    data: {
      senderId: companyAdmin1.id,
      receiverId: intern1.id,
      subject: 'Welcome to TechCorp!',
      content: 'Welcome to your internship at TechCorp! We are excited to have you on board. Please check your email for onboarding instructions.',
      type: MessageType.DIRECT,
    }
  })

  await prisma.message.create({
    data: {
      senderId: mentor1.id,
      receiverId: intern1.id,
      subject: 'First Week Tasks',
      content: 'Hi Alice! Here are your tasks for the first week. Please let me know if you have any questions.',
      type: MessageType.DIRECT,
    }
  })

  console.log('✅ Sample messages created')

  console.log('🎉 Consolidated seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })