"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { 
  BookOpen, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Building,
  User
} from "lucide-react"
import Link from "next/link"

interface Internship {
  id: string
  title: string
  company: string
  location: string
  duration: number
  isPaid: boolean
  stipend?: number
  domain: string
  description: string
  mentor: string
  mentorId: string
  rating: number
  applicants: number
  maxInterns: number
  skills: string[]
  postedAt: string
  status: 'active' | 'inactive' | 'pending' | 'completed'
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
}

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [domainFilter, setDomainFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch internships from database
  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      // For now, we'll use the mock data from our JSON files
      const mockInternships: Internship[] = [
        {
          id: "1",
          title: "Frontend Developer Intern",
          company: "TechCorp",
          location: "Remote",
          duration: 12,
          isPaid: true,
          stipend: 1500,
          domain: "Web Development",
          description: "Work on React applications and learn modern frontend technologies. You'll be building user interfaces, implementing responsive designs, and collaborating with our design team.",
          mentor: "Sarah Johnson",
          mentorId: "mentor_1",
          rating: 4.8,
          applicants: 45,
          maxInterns: 2,
          skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "JavaScript"],
          postedAt: "2024-01-08",
          status: "active",
          requirements: [
            "Basic knowledge of HTML, CSS, and JavaScript",
            "Familiarity with React framework",
            "Understanding of responsive design principles",
            "Good communication skills"
          ],
          responsibilities: [
            "Develop user-facing features using React",
            "Collaborate with designers to implement UI/UX designs",
            "Write clean, maintainable code",
            "Participate in code reviews",
            "Learn and apply best practices in frontend development"
          ],
          benefits: [
            "Mentorship from senior developers",
            "Flexible working hours",
            "Access to learning resources",
            "Certificate upon completion",
            "Potential for full-time offer"
          ]
        },
        {
          id: "2",
          title: "Data Science Intern",
          company: "DataFlow Inc",
          location: "New York, NY",
          duration: 16,
          isPaid: true,
          stipend: 2000,
          domain: "Data Science",
          description: "Analyze large datasets and build machine learning models. Work with real-world data to extract insights and create predictive models.",
          mentor: "Dr. Michael Chen",
          mentorId: "mentor_2",
          rating: 4.9,
          applicants: 78,
          maxInterns: 1,
          skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
          postedAt: "2024-01-05",
          status: "active",
          requirements: [
            "Strong foundation in Python programming",
            "Basic understanding of statistics and mathematics",
            "Familiarity with data manipulation libraries",
            "Interest in machine learning concepts"
          ],
          responsibilities: [
            "Clean and preprocess large datasets",
            "Build and evaluate machine learning models",
            "Create data visualizations and reports",
            "Collaborate with data engineering team",
            "Present findings to stakeholders"
          ],
          benefits: [
            "Work with cutting-edge ML technologies",
            "Access to premium datasets",
            "Conference attendance opportunities",
            "Research publication opportunities",
            "Networking with data science professionals"
          ]
        },
        {
          id: "3",
          title: "UX Design Intern",
          company: "DesignStudio",
          location: "San Francisco, CA",
          duration: 10,
          isPaid: false,
          stipend: 0,
          domain: "Design",
          description: "Create user-centered designs for mobile and web applications. Learn design thinking methodology and work on real client projects.",
          mentor: "Emma Wilson",
          mentorId: "mentor_3",
          rating: 4.7,
          applicants: 32,
          maxInterns: 3,
          skills: ["Figma", "User Research", "Prototyping", "Adobe Creative Suite"],
          postedAt: "2024-01-10",
          status: "pending",
          requirements: [
            "Portfolio showcasing design work",
            "Proficiency in design tools (Figma, Sketch, etc.)",
            "Understanding of UX principles",
            "Strong visual communication skills"
          ],
          responsibilities: [
            "Conduct user research and usability testing",
            "Create wireframes and prototypes",
            "Design user interfaces for web and mobile",
            "Collaborate with development teams",
            "Maintain design systems and style guides"
          ],
          benefits: [
            "Portfolio development opportunities",
            "Mentorship from senior designers",
            "Client interaction experience",
            "Design tool licenses provided",
            "Industry networking events"
          ]
        },
        {
          id: "4",
          title: "Backend Developer Intern",
          company: "ServerTech",
          location: "Remote",
          duration: 14,
          isPaid: true,
          stipend: 1800,
          domain: "Backend Development",
          description: "Build scalable APIs and work with cloud infrastructure. Learn about microservices architecture and database optimization.",
          mentor: "James Rodriguez",
          mentorId: "mentor_4",
          rating: 4.6,
          applicants: 56,
          maxInterns: 2,
          skills: ["Node.js", "PostgreSQL", "AWS", "Docker", "REST APIs"],
          postedAt: "2024-01-07",
          status: "active",
          requirements: [
            "Strong programming skills in JavaScript or Python",
            "Understanding of database concepts",
            "Basic knowledge of web APIs",
            "Familiarity with version control (Git)"
          ],
          responsibilities: [
            "Develop and maintain REST APIs",
            "Optimize database queries and performance",
            "Implement authentication and authorization",
            "Deploy applications to cloud platforms",
            "Write comprehensive tests for backend services"
          ],
          benefits: [
            "Cloud platform credits for learning",
            "Exposure to enterprise-level systems",
            "DevOps and deployment experience",
            "Code review and mentorship",
            "Potential for remote work continuation"
          ]
        }
      ]
      
      setInternships(mockInternships)
    } catch (error) {
      console.error('Error fetching internships:', error)
      toast({
        title: "Error",
        description: "Failed to fetch internships. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter internships based on search and filters
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.mentor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = domainFilter === "all" || internship.domain === domainFilter
    const matchesStatus = statusFilter === "all" || internship.status === statusFilter
    
    return matchesSearch && matchesDomain && matchesStatus
  })

  const handleUpdateInternshipStatus = async (internshipId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      // In a real app, this would be an API call
      setInternships(prev => prev.map(internship => 
        internship.id === internshipId ? { ...internship, status: newStatus } : internship
      ))
      
      toast({
        title: "Success",
        description: `Internship status updated to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update internship status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteInternship = async (internshipId: string) => {
    try {
      // In a real app, this would be an API call
      setInternships(prev => prev.filter(internship => internship.id !== internshipId))
      
      toast({
        title: "Success",
        description: "Internship deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete internship",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      case 'completed': return 'destructive'
      default: return 'outline'
    }
  }

  const getDomains = () => {
    const domains = Array.from(new Set(internships.map(i => i.domain)))
    return domains
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading internships...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-3 h-8 w-8" />
                Internship Management
              </h1>
              <p className="text-muted-foreground">
                Manage internship postings, approvals, and monitoring
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  ← Back to Dashboard
                </Link>
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Internship
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internships.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all domains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {internships.filter(i => i.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently accepting applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {internships.filter(i => i.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {internships.reduce((sum, i) => sum + i.applicants, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                From all internships
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search internships by title, company, or mentor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {getDomains().map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Internships Table */}
        <Card>
          <CardHeader>
            <CardTitle>Internships ({filteredInternships.length})</CardTitle>
            <CardDescription>
              Manage internship postings and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Internship</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInternships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{internship.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span>{internship.company}</span>
                          <MapPin className="h-3 w-3 ml-2" />
                          <span>{internship.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{internship.domain}</Badge>
                          {internship.isPaid && (
                            <Badge variant="secondary" className="text-green-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ${internship.stipend}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {internship.mentor.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{internship.mentor}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-muted-foreground">{internship.rating}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(internship.status)}>
                        {internship.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{internship.applicants} applied</p>
                        <p className="text-muted-foreground">
                          Max: {internship.maxInterns} interns
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{internship.duration} weeks</p>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(internship.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInternship(internship)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {internship.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateInternshipStatus(internship.id, 'active')}
                              className="text-green-600 hover:text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateInternshipStatus(internship.id, 'inactive')}
                              className="text-red-600 hover:text-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInternship(internship.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Internship Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Internship Details</DialogTitle>
              <DialogDescription>
                View detailed information about this internship
              </DialogDescription>
            </DialogHeader>
            {selectedInternship && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{selectedInternship.title}</h3>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {selectedInternship.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedInternship.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedInternship.duration} weeks
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{selectedInternship.domain}</Badge>
                      <Badge variant={getStatusBadgeVariant(selectedInternship.status)}>
                        {selectedInternship.status}
                      </Badge>
                      {selectedInternship.isPaid && (
                        <Badge variant="secondary" className="text-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${selectedInternship.stipend}/month
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{selectedInternship.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedInternship.applicants} applications
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedInternship.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Mentor Information</h4>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {selectedInternship.mentor.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedInternship.mentor}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-sm text-muted-foreground">{selectedInternship.rating} rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Internship Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">{selectedInternship.applicants}</p>
                        <p className="text-sm text-muted-foreground">Applications</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedInternship.maxInterns}</p>
                        <p className="text-sm text-muted-foreground">Max Interns</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Responsibilities</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedInternship.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Posted on {new Date(selectedInternship.postedAt).toLocaleDateString()}
                  </p>
                  {selectedInternship.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleUpdateInternshipStatus(selectedInternship.id, 'inactive')
                          setIsViewDialogOpen(false)
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          handleUpdateInternshipStatus(selectedInternship.id, 'active')
                          setIsViewDialogOpen(false)
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}