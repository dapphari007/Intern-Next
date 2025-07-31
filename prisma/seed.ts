import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus, MessageType, JobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting consolidated role-based seed...')

  // Clear existing data to prevent duplicates
  console.log('🧹 Cleaning existing data...')
  await prisma.taskSubmission.deleteMany()
  await prisma.task.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.creditHistory.deleteMany()
  await prisma.message.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.companyInternshipApplication.deleteMany()
  await prisma.jobApplication.deleteMany()
  await prisma.internshipApplication.deleteMany()
  await prisma.companyInternship.deleteMany()
  await prisma.jobPosting.deleteMany()
  await prisma.internship.deleteMany()
  await prisma.projectRoom.deleteMany()
  await prisma.studentAnalytics.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  // Create companies first
  console.log('🏢 Creating companies...')
  const techCorp = await prisma.company.create({
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

  const innovateInc = await prisma.company.create({
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

  const digitalWorks = await prisma.company.create({
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

  // Create more job postings for better data
  const jobPosting3 = await prisma.jobPosting.create({
    data: {
      title: 'UX/UI Designer',
      description: 'Creative designer needed to work on user interface and experience design for our digital products.',
      requirements: 'Figma, Adobe Creative Suite, 3+ years experience, portfolio required',
      location: 'Austin, TX',
      jobType: JobType.FULL_TIME,
      salaryMin: 70000,
      salaryMax: 95000,
      companyId: digitalWorks.id,
    }
  })

  const jobPosting4 = await prisma.jobPosting.create({
    data: {
      title: 'Backend Developer',
      description: 'Join our backend team to build scalable APIs and microservices using Node.js and cloud technologies.',
      requirements: 'Node.js, PostgreSQL, AWS, 4+ years experience',
      location: 'Remote',
      jobType: JobType.REMOTE,
      salaryMin: 100000,
      salaryMax: 140000,
      companyId: techCorp.id,
    }
  })

  const jobPosting5 = await prisma.jobPosting.create({
    data: {
      title: 'Data Scientist',
      description: 'Work with our data team to build predictive models and analyze large datasets.',
      requirements: 'Python, R, Machine Learning, Statistics, 3+ years experience',
      location: 'New York, NY',
      jobType: JobType.FULL_TIME,
      salaryMin: 110000,
      salaryMax: 160000,
      companyId: innovateInc.id,
    }
  })

  // Create more company internships
  const companyInternship4 = await prisma.companyInternship.create({
    data: {
      title: 'Backend Development Internship',
      description: 'Learn backend development with Node.js, Express, and database design. Work on API development and server-side logic.',
      domain: 'Backend Development',
      duration: 14,
      isPaid: true,
      stipend: 1800,
      isActive: true,
      maxInterns: 2,
      companyId: techCorp.id,
      mentorId: mentor2.id,
    }
  })

  const companyInternship5 = await prisma.companyInternship.create({
    data: {
      title: 'Data Science Internship',
      description: 'Work with our data science team on machine learning projects and data analysis.',
      domain: 'Data Science',
      duration: 16,
      isPaid: true,
      stipend: 2000,
      isActive: true,
      maxInterns: 1,
      companyId: innovateInc.id,
      mentorId: mentor4.id,
    }
  })

  const companyInternship6 = await prisma.companyInternship.create({
    data: {
      title: 'UX/UI Design Internship',
      description: 'Learn user experience and interface design principles while working on real client projects.',
      domain: 'Design',
      duration: 12,
      isPaid: true,
      stipend: 1400,
      isActive: false, // Inactive for testing
      maxInterns: 2,
      companyId: digitalWorks.id,
      mentorId: mentor5.id,
    }
  })

  console.log('✅ Job postings created')

  // ========== CREATE COMPREHENSIVE APPLICATIONS ==========
  
  // Company Internship Applications
  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship1.id,
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship1.id,
      userId: intern2.id,
      status: ApplicationStatus.PENDING,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship1.id,
      userId: intern3.id,
      status: ApplicationStatus.REJECTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship2.id,
      userId: intern5.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship2.id,
      userId: intern4.id,
      status: ApplicationStatus.PENDING,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship3.id,
      userId: intern3.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship4.id,
      userId: intern2.id,
      status: ApplicationStatus.PENDING,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship5.id,
      userId: intern5.id,
      status: ApplicationStatus.PENDING,
    }
  })

  // Job Applications
  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting1.id,
      userId: intern1.id,
      status: ApplicationStatus.PENDING,
      coverLetter: 'I am excited to apply for the Senior Frontend Developer position. With my experience in React and TypeScript, I believe I would be a great fit for your team.',
    }
  })

  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting1.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
      coverLetter: 'I have been working with React for 3 years and would love to contribute to your frontend team.',
    }
  })

  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting2.id,
      userId: intern5.id,
      status: ApplicationStatus.PENDING,
      coverLetter: 'As a Data Science student with strong ML background, I am very interested in this AI Research Scientist position.',
    }
  })

  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting3.id,
      userId: intern3.id,
      status: ApplicationStatus.REJECTED,
      coverLetter: 'I am passionate about UX/UI design and would love to work on your digital products.',
    }
  })

  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting4.id,
      userId: intern4.id,
      status: ApplicationStatus.PENDING,
      coverLetter: 'I have experience with Node.js and cloud technologies and am excited about this backend role.',
    }
  })

  await prisma.jobApplication.create({
    data: {
      jobId: jobPosting5.id,
      userId: intern5.id,
      status: ApplicationStatus.ACCEPTED,
      coverLetter: 'My background in Data Science and passion for machine learning makes me a perfect fit for this role.',
    }
  })

  // Independent Internship Applications
  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship1.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
      coverLetter: 'I am excited to work on React applications and learn modern frontend technologies.',
      resumeUrl: 'https://example.com/resume-bob.pdf',
      phone: '+1-555-0102',
      linkedin: 'https://linkedin.com/in/bobjohnson',
      github: 'https://github.com/bobjohnson',
      experience: 'I have worked on several React projects during my studies and have experience with TypeScript and modern CSS frameworks.',
      motivation: 'I want to gain real-world experience in frontend development and contribute to meaningful projects.',
    }
  })

  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship2.id,
      userId: intern3.id,
      status: ApplicationStatus.PENDING,
      coverLetter: 'I am passionate about UX design and would love to learn from an experienced designer.',
      resumeUrl: 'https://example.com/resume-carol.pdf',
      phone: '+1-555-0103',
      linkedin: 'https://linkedin.com/in/caroldavis',
      portfolio: 'https://caroldavis.design',
      experience: 'I have completed several design projects during my studies and have experience with Figma and Adobe Creative Suite.',
      motivation: 'I want to learn user-centered design principles and work on real design challenges.',
    }
  })

  console.log('✅ Applications created')

  // ========== CREATE CERTIFICATES ==========
  await prisma.certificate.create({
    data: {
      userId: intern1.id,
      title: 'Frontend Development Certificate',
      description: 'Successfully completed the Frontend Development internship program at TechCorp Solutions.',
      certificateUrl: 'https://certificates.techcorp.com/alice-smith-frontend-2024.pdf',
      status: CertificateStatus.ISSUED,
    }
  })

  await prisma.certificate.create({
    data: {
      userId: intern2.id,
      title: 'React Development Certificate',
      description: 'Completed advanced React development training with excellent performance.',
      certificateUrl: 'https://certificates.example.com/bob-johnson-react-2024.pdf',
      status: CertificateStatus.ISSUED,
    }
  })

  await prisma.certificate.create({
    data: {
      userId: intern5.id,
      title: 'AI Research Certificate',
      description: 'Successfully completed AI Research internship at Innovate Inc with outstanding results.',
      certificateUrl: 'https://certificates.innovateinc.com/eva-martinez-ai-2024.pdf',
      status: CertificateStatus.ISSUED,
    }
  })

  await prisma.certificate.create({
    data: {
      userId: intern3.id,
      title: 'Digital Marketing Certificate',
      description: 'Completed Digital Marketing internship program at Digital Works.',
      certificateUrl: 'https://certificates.digitalworks.com/carol-davis-marketing-2024.pdf',
      status: CertificateStatus.ISSUED,
    }
  })

  console.log('✅ Certificates created')

  // ========== CREATE TASKS AND SUBMISSIONS ==========
  const task1 = await prisma.task.create({
    data: {
      title: 'Build React Component Library',
      description: 'Create a reusable component library with common UI components using React and TypeScript.',
      internshipId: independentInternship1.id,
      assignedTo: intern2.id,
      status: TaskStatus.COMPLETED,
      dueDate: new Date('2024-02-15'),
    }
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Design User Dashboard',
      description: 'Create wireframes and high-fidelity designs for the user dashboard interface.',
      internshipId: independentInternship2.id,
      assignedTo: intern3.id,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2024-02-20'),
    }
  })

  // Task submissions
  await prisma.taskSubmission.create({
    data: {
      taskId: task1.id,
      userId: intern2.id,
      content: 'I have completed the React component library with 15 reusable components including buttons, forms, and navigation elements. All components are fully typed with TypeScript and include comprehensive documentation.',
      fileUrl: 'https://github.com/bobjohnson/react-component-library',
      status: SubmissionStatus.APPROVED,
      feedback: 'Excellent work! The component library is well-structured and documented. Great use of TypeScript.',
      creditsAwarded: 100,
      reviewedAt: new Date('2024-02-16'),
    }
  })

  await prisma.taskSubmission.create({
    data: {
      taskId: task2.id,
      userId: intern3.id,
      content: 'I have created wireframes for the user dashboard and am currently working on the high-fidelity designs. The wireframes include all major sections and user flows.',
      fileUrl: 'https://figma.com/file/dashboard-wireframes-carol',
      status: SubmissionStatus.SUBMITTED,
    }
  })

  console.log('✅ Tasks and submissions created')

  // ========== CREATE CREDIT HISTORY ==========
  await prisma.creditHistory.create({
    data: {
      userId: intern1.id,
      amount: 150,
      type: CreditType.EARNED,
      description: 'Completed Frontend Development project milestone',
    }
  })

  await prisma.creditHistory.create({
    data: {
      userId: intern2.id,
      amount: 100,
      type: CreditType.EARNED,
      description: 'Excellent performance on React Component Library task',
    }
  })

  await prisma.creditHistory.create({
    data: {
      userId: intern5.id,
      amount: 200,
      type: CreditType.EARNED,
      description: 'Outstanding contribution to AI research project',
    }
  })

  console.log('✅ Credit history created')

  // ========== CREATE COMPREHENSIVE MESSAGES ==========
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

  await prisma.message.create({
    data: {
      senderId: companyAdmin2.id,
      receiverId: intern5.id,
      subject: 'AI Research Project Assignment',
      content: 'Congratulations on being accepted to our AI Research internship! Your first project will be working on neural network optimization.',
      type: MessageType.DIRECT,
    }
  })

  await prisma.message.create({
    data: {
      senderId: companyAdmin3.id,
      receiverId: intern3.id,
      subject: 'Digital Marketing Campaign',
      content: 'Welcome to Digital Works! You will be working on our latest client campaign. Looking forward to your creative input.',
      type: MessageType.DIRECT,
    }
  })

  // Broadcast messages
  await prisma.message.create({
    data: {
      senderId: companyAdmin1.id,
      subject: 'Company All-Hands Meeting',
      content: 'All team members are invited to our quarterly all-hands meeting next Friday at 2 PM PST.',
      type: MessageType.BROADCAST,
    }
  })

  await prisma.message.create({
    data: {
      senderId: companyAdmin2.id,
      subject: 'New AI Research Lab Opening',
      content: 'We are excited to announce the opening of our new AI research lab with state-of-the-art equipment.',
      type: MessageType.BROADCAST,
    }
  })

  console.log('✅ Comprehensive messages created')

  // ========== CREATE STUDENT ANALYTICS ==========
  await prisma.studentAnalytics.create({
    data: {
      userId: intern1.id,
      totalTasks: 8,
      completedTasks: 6,
      pendingTasks: 2,
      overdueTasks: 0,
      averageScore: 87.5,
      totalSubmissions: 6,
      onTimeSubmissions: 5,
      lateSubmissions: 1,
      totalCredits: 850,
      lastActive: new Date(),
    }
  })

  await prisma.studentAnalytics.create({
    data: {
      userId: intern2.id,
      totalTasks: 5,
      completedTasks: 4,
      pendingTasks: 1,
      overdueTasks: 0,
      averageScore: 92.0,
      totalSubmissions: 4,
      onTimeSubmissions: 4,
      lateSubmissions: 0,
      totalCredits: 720,
      lastActive: new Date(),
    }
  })

  await prisma.studentAnalytics.create({
    data: {
      userId: intern3.id,
      totalTasks: 6,
      completedTasks: 4,
      pendingTasks: 2,
      overdueTasks: 0,
      averageScore: 78.5,
      totalSubmissions: 4,
      onTimeSubmissions: 3,
      lateSubmissions: 1,
      totalCredits: 650,
      lastActive: new Date(),
    }
  })

  await prisma.studentAnalytics.create({
    data: {
      userId: intern4.id,
      totalTasks: 7,
      completedTasks: 5,
      pendingTasks: 1,
      overdueTasks: 1,
      averageScore: 85.0,
      totalSubmissions: 5,
      onTimeSubmissions: 4,
      lateSubmissions: 1,
      totalCredits: 780,
      lastActive: new Date(),
    }
  })

  await prisma.studentAnalytics.create({
    data: {
      userId: intern5.id,
      totalTasks: 10,
      completedTasks: 9,
      pendingTasks: 1,
      overdueTasks: 0,
      averageScore: 95.5,
      totalSubmissions: 9,
      onTimeSubmissions: 9,
      lateSubmissions: 0,
      totalCredits: 920,
      lastActive: new Date(),
    }
  })

  console.log('✅ Student analytics created')

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