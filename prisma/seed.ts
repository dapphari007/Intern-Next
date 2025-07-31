import { PrismaClient, UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus, MessageType, JobType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive role-based seed with tasks...')

  // Clear existing data to prevent duplicates
  console.log('🧹 Cleaning existing data...')
  try {
    await prisma.taskSubmission.deleteMany()
  } catch (e) { console.log('No task submissions to delete') }
  try {
    await prisma.task.deleteMany()
  } catch (e) { console.log('No tasks to delete') }
  try {
    await prisma.certificate.deleteMany()
  } catch (e) { console.log('No certificates to delete') }
  try {
    await prisma.creditHistory.deleteMany()
  } catch (e) { console.log('No credit history to delete') }
  try {
    await prisma.message.deleteMany()
  } catch (e) { console.log('No messages to delete') }
  try {
    await prisma.chatMessage.deleteMany()
  } catch (e) { console.log('No chat messages to delete') }
  try {
    await prisma.companyInternshipApplication.deleteMany()
  } catch (e) { console.log('No company applications to delete') }
  try {
    await prisma.jobApplication.deleteMany()
  } catch (e) { console.log('No job applications to delete') }
  try {
    await prisma.internshipApplication.deleteMany()
  } catch (e) { console.log('No internship applications to delete') }
  try {
    await prisma.companyInternship.deleteMany()
  } catch (e) { console.log('No company internships to delete') }
  try {
    await prisma.jobPosting.deleteMany()
  } catch (e) { console.log('No job postings to delete') }
  try {
    await prisma.internship.deleteMany()
  } catch (e) { console.log('No internships to delete') }
  try {
    await prisma.projectRoom.deleteMany()
  } catch (e) { console.log('No project rooms to delete') }
  try {
    await prisma.studentAnalytics.deleteMany()
  } catch (e) { console.log('No student analytics to delete') }
  try {
    await prisma.session.deleteMany()
  } catch (e) { console.log('No sessions to delete') }
  try {
    await prisma.account.deleteMany()
  } catch (e) { console.log('No accounts to delete') }
  try {
    await prisma.user.deleteMany()
  } catch (e) { console.log('No users to delete') }
  try {
    await prisma.company.deleteMany()
  } catch (e) { console.log('No companies to delete') }

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

  // ========== COMPANY ADMIN USERS ==========
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

  // Independent mentors
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

  // Additional interns for better data
  const intern6 = await prisma.user.upsert({
    where: { email: 'frank.brown@student.edu' },
    update: {},
    create: {
      name: 'Frank Brown',
      email: 'frank.brown@student.edu',
      role: UserRole.INTERN,
      bio: 'CS student specializing in backend development and databases.',
      skillCredits: 590,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    }
  })

  const intern7 = await prisma.user.upsert({
    where: { email: 'grace.lee@student.edu' },
    update: {},
    create: {
      name: 'Grace Lee',
      email: 'grace.lee@student.edu',
      role: UserRole.INTERN,
      bio: 'Design student interested in UX/UI and digital marketing.',
      skillCredits: 670,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    }
  })

  console.log('✅ All users created')

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

  // ========== CREATE COMPANY INTERNSHIPS ==========
  const companyInternship1 = await prisma.companyInternship.create({
    data: {
      title: 'Frontend Development Internship',
      description: 'Work with our frontend team to build modern web applications using React, TypeScript, and Tailwind CSS.',
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
      description: 'Join our AI research team to work on cutting-edge machine learning projects.',
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
      description: 'Learn digital marketing strategies, content creation, and campaign management.',
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

  const companyInternship4 = await prisma.companyInternship.create({
    data: {
      title: 'Backend Development Internship',
      description: 'Learn backend development with Node.js, Express, and database design.',
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

  console.log('✅ Internships created')

  // ========== CREATE APPLICATIONS ==========
  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship1.id,
      userId: intern1.id,
      status: ApplicationStatus.ACCEPTED,
      coverLetter: 'I am very interested in this frontend development position.',
    }
  })

  await prisma.internshipApplication.create({
    data: {
      internshipId: independentInternship2.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
      coverLetter: 'Interested in UX design and user research.',
    }
  })

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
      status: ApplicationStatus.ACCEPTED,
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
      userId: intern6.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship5.id,
      userId: intern2.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  await prisma.companyInternshipApplication.create({
    data: {
      internshipId: companyInternship3.id,
      userId: intern7.id,
      status: ApplicationStatus.ACCEPTED,
    }
  })

  console.log('✅ Applications created')

// ========== CREATE COMPREHENSIVE TASKS ==========
console.log('📋 Creating comprehensive tasks...')

// Frontend Development Tasks
const frontendTask1 = await prisma.task.create({
  data: {
    title: 'Build Responsive Navigation Component',
    description: 'Create a responsive navigation component using React and Tailwind CSS. The component should work on both desktop and mobile devices with a hamburger menu for mobile.',
    internshipId: independentInternship1.id,
    assignedTo: intern1.id,
    status: TaskStatus.COMPLETED,
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  }
})

const frontendTask2 = await prisma.task.create({
  data: {
    title: 'Implement User Authentication UI',
    description: 'Design and implement login and registration forms with form validation and error handling.',
    internshipId: independentInternship1.id,
    assignedTo: intern1.id,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  }
})

const frontendTask3 = await prisma.task.create({
  data: {
    title: 'Create Dashboard Layout',
    description: 'Build a dashboard layout with sidebar navigation, main content area, and responsive design.',
    internshipId: independentInternship1.id,
    assignedTo: intern1.id,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  }
})

// AI Research Tasks (assigned to frontend internship)
const aiTask1 = await prisma.task.create({
  data: {
    title: 'Literature Review on Neural Networks',
    description: 'Conduct a comprehensive literature review on recent advances in neural network architectures, focusing on transformer models.',
    internshipId: independentInternship1.id,
    assignedTo: intern5.id,
    status: TaskStatus.COMPLETED,
    dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  }
})

const aiTask2 = await prisma.task.create({
  data: {
    title: 'Implement Basic CNN Model',
    description: 'Build and train a convolutional neural network for image classification using TensorFlow/PyTorch.',
    internshipId: independentInternship1.id,
    assignedTo: intern5.id,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  }
})

const aiTask3 = await prisma.task.create({
  data: {
    title: 'Data Preprocessing Pipeline',
    description: 'Create a data preprocessing pipeline for cleaning and preparing large datasets for machine learning models.',
    internshipId: independentInternship1.id,
    assignedTo: intern5.id,
    status: TaskStatus.OVERDUE,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
})

// Digital Marketing Tasks (assigned to design internship)
const marketingTask1 = await prisma.task.create({
  data: {
    title: 'Social Media Campaign Analysis',
    description: 'Analyze the performance of recent social media campaigns and provide insights for improvement.',
    internshipId: independentInternship2.id,
    assignedTo: intern3.id,
    status: TaskStatus.COMPLETED,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  }
})

const marketingTask2 = await prisma.task.create({
  data: {
    title: 'Create Content Calendar',
    description: 'Develop a comprehensive content calendar for Q1 2024 including blog posts, social media content, and email campaigns.',
    internshipId: independentInternship2.id,
    assignedTo: intern3.id,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  }
})

const marketingTask3 = await prisma.task.create({
  data: {
    title: 'SEO Audit Report',
    description: 'Conduct a comprehensive SEO audit of the company website and provide recommendations.',
    internshipId: independentInternship2.id,
    assignedTo: intern7.id,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  }
})

// Backend Development Tasks - MUST USE independentInternship1 (Task model only relates to Internship, not CompanyInternship)
const backendTask1 = await prisma.task.create({
  data: {
    title: 'API Design and Documentation',
    description: 'Design RESTful APIs for user management and create comprehensive documentation using Swagger.',
    internshipId: independentInternship1.id,
    assignedTo: intern6.id,
    status: TaskStatus.COMPLETED,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  }
})

const backendTask2 = await prisma.task.create({
  data: {
    title: 'Database Schema Design',
    description: 'Design and implement database schema for the internship management system using PostgreSQL.',
    internshipId: independentInternship1.id,
    assignedTo: intern6.id,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  }
})

const backendTask3 = await prisma.task.create({
  data: {
    title: 'Authentication Middleware',
    description: 'Implement JWT-based authentication middleware for securing API endpoints.',
    internshipId: independentInternship1.id,
    assignedTo: intern6.id,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
  }
})

// Data Science Tasks (assigned to design internship)
const dataTask1 = await prisma.task.create({
  data: {
    title: 'Exploratory Data Analysis',
    description: 'Perform comprehensive exploratory data analysis on customer behavior dataset using Python and Pandas.',
    internshipId: independentInternship2.id,
    assignedTo: intern2.id,
    status: TaskStatus.COMPLETED,
    dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  }
})

const dataTask2 = await prisma.task.create({
  data: {
    title: 'Predictive Model Development',
    description: 'Build a machine learning model to predict customer churn using scikit-learn.',
    internshipId: independentInternship2.id,
    assignedTo: intern2.id,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
  }
})

const dataTask3 = await prisma.task.create({
  data: {
    title: 'Data Visualization Dashboard',
    description: 'Create interactive data visualizations using Plotly or D3.js to display key business metrics.',
    internshipId: independentInternship2.id,
    assignedTo: intern2.id,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
  }
})

console.log('✅ Comprehensive tasks created')

// ========== CREATE TASK SUBMISSIONS ==========
console.log('📝 Creating task submissions...')

await prisma.taskSubmission.create({
  data: {
    taskId: frontendTask1.id,
    userId: intern1.id,
    content: 'I have successfully implemented the responsive navigation component. The component includes a mobile-friendly hamburger menu and smooth transitions.',
    status: SubmissionStatus.APPROVED,
    creditsAwarded: 100,
    feedback: 'Excellent work! The navigation component is well-structured and responsive. Great attention to detail.',
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  }
})

await prisma.taskSubmission.create({
  data: {
    taskId: aiTask1.id,
    userId: intern5.id,
    content: 'Completed comprehensive literature review covering latest transformer architectures including BERT, GPT-3, and Vision Transformers. Documented findings in a 20-page report.',
    status: SubmissionStatus.APPROVED,
    creditsAwarded: 150,
    feedback: 'Outstanding research work! The literature review is thorough and well-organized. Great insights on recent developments.',
    submittedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  }
})

await prisma.taskSubmission.create({
  data: {
    taskId: marketingTask1.id,
    userId: intern3.id,
    content: 'Analyzed Q4 social media campaigns across Instagram, Facebook, and LinkedIn. Identified key performance metrics and provided actionable recommendations.',
    status: SubmissionStatus.APPROVED,
    creditsAwarded: 80,
    feedback: 'Good analysis! The insights on engagement rates and optimal posting times are valuable.',
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }
})

await prisma.taskSubmission.create({
  data: {
    taskId: backendTask1.id,
    userId: intern6.id,
    content: 'Designed comprehensive RESTful API endpoints for user management, authentication, and internship operations. Created detailed Swagger documentation.',
    status: SubmissionStatus.APPROVED,
    creditsAwarded: 120,
    feedback: 'Excellent API design! The documentation is clear and comprehensive. Well done on following REST principles.',
    submittedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  }
})

await prisma.taskSubmission.create({
  data: {
    taskId: dataTask1.id,
    userId: intern2.id,
    content: 'Completed exploratory data analysis on customer behavior dataset. Identified key patterns and correlations. Created visualizations and statistical summaries.',
    status: SubmissionStatus.APPROVED,
    creditsAwarded: 110,
    feedback: 'Great analytical work! The visualizations clearly show important trends and patterns in the data.',
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  }
})

// Partial submission for in-progress task
await prisma.taskSubmission.create({
  data: {
    taskId: frontendTask2.id,
    userId: intern1.id,
    content: 'Progress update: Implemented login form with validation. Working on registration form and error handling.',
    status: SubmissionStatus.SUBMITTED,
    creditsAwarded: 0,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  }
})

console.log('✅ Task submissions created')

// ========== CREATE CERTIFICATES ==========
await prisma.certificate.create({
  data: {
    userId: intern1.id,
    title: 'Frontend Development Completion',
    description: 'Successfully completed frontend development internship with outstanding performance.',
    status: CertificateStatus.ISSUED,
  }
})

await prisma.certificate.create({
  data: {
    userId: intern5.id,
    title: 'AI Research Excellence',
    description: 'Demonstrated exceptional skills in AI research and machine learning.',
    status: CertificateStatus.ISSUED,
  }
})

await prisma.certificate.create({
  data: {
    userId: intern3.id,
    title: 'Digital Marketing Specialist',
    description: 'Completed digital marketing internship with proficiency in campaign analysis and content strategy.',
    status: CertificateStatus.ISSUED,
  }
})

console.log('✅ Certificates created')

// ========== CREATE CREDIT HISTORY ==========
const creditHistoryEntries = [
  { userId: intern1.id, amount: 100, type: CreditType.EARNED, description: 'Completed responsive navigation component task' },
  { userId: intern1.id, amount: 50, type: CreditType.EARNED, description: 'Progress on authentication UI implementation' },
  { userId: intern5.id, amount: 150, type: CreditType.EARNED, description: 'Outstanding literature review on neural networks' },
  { userId: intern5.id, amount: 100, type: CreditType.EARNED, description: 'Progress on CNN model implementation' },
  { userId: intern3.id, amount: 80, type: CreditType.EARNED, description: 'Excellent social media campaign analysis' },
  { userId: intern6.id, amount: 120, type: CreditType.EARNED, description: 'Comprehensive API design and documentation' },
  { userId: intern2.id, amount: 110, type: CreditType.EARNED, description: 'Thorough exploratory data analysis' },
  { userId: intern7.id, amount: 50, type: CreditType.BONUS, description: 'Bonus for quick adaptation to new role' },
]

for (const entry of creditHistoryEntries) {
  await prisma.creditHistory.create({ data: entry })
}

console.log('✅ Credit history created')

// ========== CREATE MESSAGES ==========
const messages = [
  {
    senderId: mentor1.id,
    receiverId: intern1.id,
    subject: 'Great work on navigation component!',
    content: 'Hi Alice, I reviewed your navigation component submission and I\'m impressed with the quality. The responsive design is excellent!',
    type: MessageType.DIRECT,
  },
  {
    senderId: mentor3.id,
    receiverId: intern5.id,
    subject: 'Next steps for CNN implementation',
    content: 'Eva, your literature review was outstanding. For the CNN task, I recommend starting with a simple architecture and gradually adding complexity.',
    type: MessageType.DIRECT,
  },
  {
    senderId: mentor5.id,
    receiverId: intern3.id,
    subject: 'Content calendar feedback',
    content: 'Carol, your progress on the content calendar looks good. Make sure to include seasonal trends in your planning.',
    type: MessageType.DIRECT,
  },
  {
    senderId: companyAdmin1.id,
    subject: 'Q1 Company All-Hands Meeting',
    content: 'All team members and interns are invited to our Q1 all-hands meeting next Friday at 2 PM PST. We\'ll be discussing company goals and intern program updates.',
    type: MessageType.BROADCAST,
  },
  {
    senderId: companyAdmin2.id,
    subject: 'New AI Research Lab Resources',
    content: 'We\'ve acquired new GPU resources for our AI research lab. All AI interns now have access to high-performance computing for their projects.',
    type: MessageType.BROADCAST,
  },
]

for (const message of messages) {
  await prisma.message.create({ data: message })
}

console.log('✅ Messages created')

// ========== CREATE STUDENT ANALYTICS ==========
const analyticsData = [
  {
    userId: intern1.id,
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 1,
    overdueTasks: 0,
    averageScore: 95.0,
    totalSubmissions: 2,
    onTimeSubmissions: 2,
    lateSubmissions: 0,
    totalCredits: 150,
    lastActive: new Date(),
  },
  {
    userId: intern5.id,
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 1,
    overdueTasks: 1,
    averageScore: 92.0,
    totalSubmissions: 1,
    onTimeSubmissions: 1,
    lateSubmissions: 0,
    totalCredits: 250,
    lastActive: new Date(),
  },
  {
    userId: intern3.id,
    totalTasks: 2,
    completedTasks: 1,
    pendingTasks: 1,
    overdueTasks: 0,
    averageScore: 88.0,
    totalSubmissions: 1,
    onTimeSubmissions: 1,
    lateSubmissions: 0,
    totalCredits: 80,
    lastActive: new Date(),
  },
  {
    userId: intern6.id,
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    overdueTasks: 0,
    averageScore: 90.0,
    totalSubmissions: 1,
    onTimeSubmissions: 1,
    lateSubmissions: 0,
    totalCredits: 120,
    lastActive: new Date(),
  },
  {
    userId: intern2.id,
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    overdueTasks: 0,
    averageScore: 94.0,
    totalSubmissions: 1,
    onTimeSubmissions: 1,
    lateSubmissions: 0,
    totalCredits: 110,
    lastActive: new Date(),
  },
]

for (const analytics of analyticsData) {
  await prisma.studentAnalytics.create({ data: analytics })
}

console.log('✅ Student analytics created')

console.log('🎉 Comprehensive seed completed successfully!')
console.log('📊 Summary:')
console.log('- Companies: 3')
console.log('- Users: 12 (1 admin, 3 company admins, 5 mentors, 7 interns)')
console.log('- Internships: 7 (2 independent, 5 company)')
console.log('- Tasks: 15 across different domains')
console.log('- Task Submissions: 6 with various statuses')
console.log('- Certificates: 3')
console.log('- Messages: 5')
console.log('- Analytics: 5 student records')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })