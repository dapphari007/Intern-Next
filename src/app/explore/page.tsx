"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Filter,
  Star,
  Building
} from "lucide-react"

// Mock internship data
const mockInternships = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "TechCorp",
    location: "Remote",
    duration: 12,
    isPaid: true,
    stipend: 1500,
    domain: "Web Development",
    description: "Work on React applications and learn modern frontend technologies.",
    mentor: "Sarah Johnson",
    rating: 4.8,
    applicants: 45,
    maxInterns: 2,
    skills: ["React", "TypeScript", "Tailwind CSS"],
    postedAt: "2024-01-08"
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
    description: "Analyze large datasets and build machine learning models.",
    mentor: "Dr. Michael Chen",
    rating: 4.9,
    applicants: 78,
    maxInterns: 1,
    skills: ["Python", "Machine Learning", "SQL"],
    postedAt: "2024-01-05"
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
    description: "Create user-centered designs for mobile and web applications.",
    mentor: "Emma Wilson",
    rating: 4.7,
    applicants: 32,
    maxInterns: 3,
    skills: ["Figma", "User Research", "Prototyping"],
    postedAt: "2024-01-10"
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
    description: "Build scalable APIs and work with cloud infrastructure.",
    mentor: "James Rodriguez",
    rating: 4.6,
    applicants: 56,
    maxInterns: 2,
    skills: ["Node.js", "PostgreSQL", "AWS"],
    postedAt: "2024-01-07"
  },
  {
    id: "5",
    title: "Mobile App Developer Intern",
    company: "MobileFirst",
    location: "Austin, TX",
    duration: 12,
    isPaid: true,
    stipend: 1600,
    domain: "Mobile Development",
    description: "Develop cross-platform mobile applications using React Native.",
    mentor: "Lisa Park",
    rating: 4.8,
    applicants: 41,
    maxInterns: 1,
    skills: ["React Native", "JavaScript", "Firebase"],
    postedAt: "2024-01-09"
  },
  {
    id: "6",
    title: "DevOps Intern",
    company: "CloudOps",
    location: "Seattle, WA",
    duration: 16,
    isPaid: true,
    stipend: 1700,
    domain: "DevOps",
    description: "Learn CI/CD pipelines and cloud infrastructure management.",
    mentor: "Alex Kumar",
    rating: 4.5,
    applicants: 29,
    maxInterns: 1,
    skills: ["Docker", "Kubernetes", "Jenkins"],
    postedAt: "2024-01-06"
  }
]

const domains = ["All", "Web Development", "Data Science", "Design", "Backend Development", "Mobile Development", "DevOps"]

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("All")
  const [isPaidFilter, setIsPaidFilter] = useState("All")
  const [sortBy, setSortBy] = useState("recent")

  const filteredInternships = mockInternships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDomain = selectedDomain === "All" || internship.domain === selectedDomain
    
    const matchesPaid = isPaidFilter === "All" || 
                       (isPaidFilter === "Paid" && internship.isPaid) ||
                       (isPaidFilter === "Unpaid" && !internship.isPaid)
    
    return matchesSearch && matchesDomain && matchesPaid
  })

  const sortedInternships = [...filteredInternships].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case "stipend":
        return b.stipend - a.stipend
      case "rating":
        return b.rating - a.rating
      case "applicants":
        return a.applicants - b.applicants
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Internships</h1>
          <p className="text-muted-foreground">
            Discover skill-based internships that match your interests and career goals
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search internships, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(domain => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isPaidFilter} onValueChange={setIsPaidFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="stipend">Highest Stipend</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="applicants">Least Competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {sortedInternships.length} of {mockInternships.length} internships
          </p>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Internship Cards */}
        <div className="grid gap-6">
          {sortedInternships.map((internship) => (
            <Card key={internship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{internship.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="mr-1 h-4 w-4" />
                        {internship.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {internship.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {internship.duration} weeks
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {internship.isPaid ? (
                      <Badge className="bg-green-100 text-green-800">
                        <DollarSign className="mr-1 h-3 w-3" />
                        ${internship.stipend}/month
                      </Badge>
                    ) : (
                      <Badge variant="outline">Unpaid</Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {internship.rating}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {internship.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Mentor: {internship.mentor}</span>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {internship.applicants} applicants
                    </div>
                    <span>{internship.maxInterns} position{internship.maxInterns > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      Learn More
                    </Button>
                    <Button>
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {sortedInternships.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Load More Internships
            </Button>
          </div>
        )}

        {/* No Results */}
        {sortedInternships.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No internships found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setSelectedDomain("All")
              setIsPaidFilter("All")
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}