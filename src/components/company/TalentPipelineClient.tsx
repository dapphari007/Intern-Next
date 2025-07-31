"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddTalentModal } from '@/components/modals/talent/AddTalentModal'
import { ViewTalentModal } from '@/components/modals/talent/ViewTalentModal'
import { 
  Users, 
  Star, 
  TrendingUp,
  Award,
  Mail,
  Eye,
  Filter,
  Search,
  UserPlus,
  Target,
  Clock,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface TalentPipelineClientProps {
  talent: any[]
  companyId: string
}

export function TalentPipelineClient({ talent, companyId }: TalentPipelineClientProps) {
  const [selectedTalent, setSelectedTalent] = useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('score')

  // Utility function to calculate talent score - must be defined before use
  const getTalentScore = (talent: any) => {
    let score = 0
    score += (talent.certificates?.length || 0) * 10
    score += talent.performance || 0
    score += (talent.skillCredits || 0) / 10
    return Math.min(score, 100)
  }

  // Calculate statistics
  const totalTalent = talent.length
  const activeInterns = talent.filter(t => t.type === 'intern' && t.status === 'ACCEPTED').length
  const pendingApplicants = talent.filter(t => t.status === 'PENDING').length
  const topPerformers = talent.filter(t => getTalentScore(t) >= 80).length

  // Filter and sort talent
  const filteredTalent = talent
    .filter(t => {
      const matchesSearch = !searchTerm || 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.internshipDomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'interns' && t.type === 'intern') ||
        (filterBy === 'applicants' && t.type === 'job_applicant') ||
        (filterBy === 'pending' && t.status === 'PENDING') ||
        (filterBy === 'accepted' && t.status === 'ACCEPTED') ||
        (filterBy === 'high_performers' && getTalentScore(t) >= 80)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return getTalentScore(b) - getTalentScore(a)
        case 'name':
          return (a.name || a.email).localeCompare(b.name || b.email)
        case 'recent':
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        case 'performance':
          return (b.performance || 0) - (a.performance || 0)
        default:
          return 0
      }
    })

  const handleViewTalent = (talentData: any) => {
    setSelectedTalent(talentData)
    setIsViewModalOpen(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Talent Pipeline</h1>
            <p className="text-muted-foreground">
              Manage and nurture your company's talent pool
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Talent
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Talent</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTalent}</div>
              <p className="text-xs text-muted-foreground">
                In pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInterns}</div>
              <p className="text-xs text-muted-foreground">
                Currently working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplicants}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers}</div>
              <p className="text-xs text-muted-foreground">
                High potential
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search talent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Talent</SelectItem>
                <SelectItem value="interns">Interns</SelectItem>
                <SelectItem value="applicants">Job Applicants</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="high_performers">High Performers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Talent Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Talent Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>High-performing talent in your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {talent
                  .filter(t => getTalentScore(t) >= 70)
                  .sort((a, b) => getTalentScore(b) - getTalentScore(a))
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={t.image || undefined} />
                        <AvatarFallback>
                          {t.name?.charAt(0) || t.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">
                            {t.name || t.email}
                          </p>
                          <Badge variant={t.type === 'intern' ? 'default' : 'secondary'} className="text-xs">
                            {t.type === 'intern' ? 'Intern' : 'Applicant'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={getTalentScore(t)} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {getTalentScore(t).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewTalent(t)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Recent Applications
              </CardTitle>
              <CardDescription>Latest talent applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {talent
                  .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={t.image || undefined} />
                        <AvatarFallback>
                          {t.name?.charAt(0) || t.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">
                            {t.name || t.email}
                          </p>
                          <Badge variant={
                            t.status === 'ACCEPTED' ? 'default' : 
                            t.status === 'PENDING' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {t.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(t.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${t.id}`}>
                            <Mail className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTalent(t)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Talent */}
        <Card>
          <CardHeader>
            <CardTitle>All Talent ({filteredTalent.length})</CardTitle>
            <CardDescription>Complete talent pipeline overview</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTalent.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm || filterBy !== 'all' ? 'No talent found' : 'No talent in pipeline'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search terms or filters.'
                    : 'Start by creating internships or job postings to attract talent.'
                  }
                </p>
                {!searchTerm && filterBy === 'all' && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button asChild>
                      <Link href="/company/internships/create">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Create Internship
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/company/jobs/create">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Job
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTalent.map((t) => (
                  <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={t.image || undefined} />
                          <AvatarFallback>
                            {t.name?.charAt(0) || t.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">
                              {t.name || t.email}
                            </h3>
                            <Badge variant={t.type === 'intern' ? 'default' : 'secondary'}>
                              {t.type === 'intern' ? 'Intern' : 'Job Applicant'}
                            </Badge>
                            <Badge variant={
                              t.status === 'ACCEPTED' ? 'default' : 
                              t.status === 'PENDING' ? 'secondary' : 'destructive'
                            }>
                              {t.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {t.email}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              {t.certificates?.length || 0} certs
                            </span>
                            <span className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {t.skillCredits || 0} credits
                            </span>
                            {t.performance > 0 && (
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {t.performance.toFixed(0)}% performance
                              </span>
                            )}
                          </div>
                          {(t.internshipDomain || t.jobTitle) && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {t.internshipDomain || t.jobTitle}
                              </Badge>
                              {t.jobType && (
                                <Badge variant="outline" className="text-xs">
                                  {t.jobType}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium">
                            Score: {getTalentScore(t).toFixed(0)}%
                          </div>
                          <Progress value={getTalentScore(t)} className="w-20 h-2 mt-1" />
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?to=${t.id}`}>
                            <Mail className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTalent(t)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddTalentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        companyId={companyId}
      />
      
      <ViewTalentModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        talent={selectedTalent}
      />
    </div>
  )
}