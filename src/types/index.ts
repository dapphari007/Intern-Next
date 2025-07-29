import { UserRole, InternshipStatus, ApplicationStatus, TaskStatus, SubmissionStatus, CreditType, CertificateStatus } from "@prisma/client"

export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: UserRole
  bio?: string | null
  resume?: string | null
  skillCredits: number
  createdAt: Date
  updatedAt: Date
}

export interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend?: number | null
  mentorId: string
  status: InternshipStatus
  maxInterns: number
  createdAt: Date
  updatedAt: Date
  mentor?: User
  applications?: InternshipApplication[]
  tasks?: Task[]
}

export interface InternshipApplication {
  id: string
  internshipId: string
  userId: string
  status: ApplicationStatus
  appliedAt: Date
  updatedAt: Date
  internship?: Internship
  user?: User
}

export interface Task {
  id: string
  title: string
  description: string
  internshipId: string
  assignedTo: string
  status: TaskStatus
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
  internship?: Internship
  assignee?: User
  submissions?: TaskSubmission[]
}

export interface TaskSubmission {
  id: string
  taskId: string
  userId: string
  content: string
  fileUrl?: string | null
  status: SubmissionStatus
  feedback?: string | null
  creditsAwarded: number
  submittedAt: Date
  reviewedAt?: Date | null
  task?: Task
  user?: User
}

export interface CreditHistory {
  id: string
  userId: string
  amount: number
  type: CreditType
  description: string
  createdAt: Date
  user?: User
}

export interface Certificate {
  id: string
  userId: string
  internshipId?: string | null
  title: string
  description: string
  issueDate: Date
  certificateUrl?: string | null
  nftTokenId?: string | null
  status: CertificateStatus
  user?: User
}

export interface ProjectRoom {
  id: string
  internshipId: string
  name: string
  description?: string | null
  createdAt: Date
  internship?: Internship
  chatMessages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  projectRoomId: string
  userId: string
  content: string
  createdAt: Date
  projectRoom?: ProjectRoom
  user?: User
}

// Form types
export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface InternshipFormData {
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend?: number
  maxInterns: number
}

export interface TaskFormData {
  title: string
  description: string
  dueDate?: Date
}

export interface TaskSubmissionFormData {
  content: string
  fileUrl?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard stats
export interface DashboardStats {
  totalInternships: number
  activeInternships: number
  completedTasks: number
  totalCredits: number
  pendingApplications?: number
  totalInterns?: number
}

// Filter types
export interface InternshipFilters {
  domain?: string
  duration?: number
  isPaid?: boolean
  search?: string
}

export {
  UserRole,
  InternshipStatus,
  ApplicationStatus,
  TaskStatus,
  SubmissionStatus,
  CreditType,
  CertificateStatus,
}