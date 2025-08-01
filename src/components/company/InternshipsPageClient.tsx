"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Briefcase, 
  Users, 
  FileSearch
} from "lucide-react"
import { JobsPageClient } from "./JobsPageClient"
import { RecruitmentPageClient } from "./RecruitmentPageClient"
import { InternshipManagementTab } from "./InternshipManagementTab"

interface JobPosting {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  jobType: string
  salaryMin: number | null
  salaryMax: number | null
  isActive: boolean
  createdAt: Date
  applications: Array<{
    id: string
    status: string
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }>
}

interface Application {
  id: string
  status: string
  appliedAt: Date | string
  coverLetter?: string | null
  resumeUrl?: string | null
  resumeLink?: string | null
  phone?: string | null
  linkedin?: string | null
  github?: string | null
  portfolio?: string | null
  experience?: string | null
  motivation?: string | null
  type: 'internship' | 'job'
  position: string
  positionId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio?: string | null
    location?: string | null
    certificates: any[]
  }
  internship?: {
    id: string
    title: string
    domain: string
    companyId: string
  } | null
  jobPosting?: {
    id: string
    title: string
    jobType: string
    companyId: string
  } | null
}

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  isActive: boolean
  maxInterns: number
  createdAt: Date
  mentorId: string | null
  mentor: {
    id: string
    name: string | null
    email: string
    image: string | null
  } | null
  applications: Array<{
    id: string
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    createdAt: string
    coverLetter?: string
    resumeUrl?: string
    resumeLink?: string
    phone?: string
    linkedin?: string
    github?: string
    portfolio?: string
    experience?: string
    motivation?: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
}

interface InternshipsPageClientProps {
  // Internship data
  initialInternships: Internship[]
  totalInternships: number
  activeInternships: number
  totalApplications: number
  acceptedApplications: number
  avgStipend: number
  // Job data
  initialJobs: JobPosting[]
  totalJobs: number
  activeJobs: number
  totalJobApplications: number
  avgSalary: number
  // Recruitment data
  initialApplications: Application[]
  totalAllApplications: number
  pendingApplications: number
  acceptedAllApplications: number
  rejectedApplications: number
  // Company data
  companyId: string
}

export function InternshipsPageClient({
  initialInternships,
  totalInternships,
  activeInternships,   
  totalApplications,
  acceptedApplications,
  avgStipend,
  initialJobs,
  totalJobs,
  activeJobs,
  totalJobApplications,
  avgSalary,
  initialApplications,
  totalAllApplications,
  pendingApplications,
  acceptedAllApplications,
  rejectedApplications,
  companyId
}: InternshipsPageClientProps) {
  const [activeTab, setActiveTab] = useState("internships")

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">
            Manage your company's opportunities and recruitment
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="internships" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Internships
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Job Postings
            </TabsTrigger>
            <TabsTrigger value="recruitment" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Recruitment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internships">
            <InternshipManagementTab
              initialInternships={initialInternships}
              totalInternships={totalInternships}
              activeInternships={activeInternships}
              totalApplications={totalApplications}
              acceptedApplications={acceptedApplications}
              avgStipend={avgStipend}
              companyId={companyId}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobsPageClient
              initialJobs={initialJobs}
              totalJobs={totalJobs}
              activeJobs={activeJobs}
              totalApplications={totalJobApplications}
              avgSalary={avgSalary}
            />
          </TabsContent>

          <TabsContent value="recruitment">
            <RecruitmentPageClient
              initialApplications={initialApplications}
              totalApplications={totalAllApplications}
              pendingApplications={pendingApplications}
              acceptedApplications={acceptedAllApplications}
              rejectedApplications={rejectedApplications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}