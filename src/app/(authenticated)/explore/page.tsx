"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InternshipApplicationModal } from "@/components/internship-application-modal"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Filter,
  Star,
  Building,
  AlertTriangle
} from "lucide-react"

interface Internship {
  id: string
  title: string
  description: string
  domain: string
  duration: number
  isPaid: boolean
  stipend: number | null
  maxInterns: number
  skills?: string[]
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  createdAt: string
  mentor: {
    name: string | null
  }
  _count: {
    applications: number
  }
}

const domains = ["All", "Web Development", "Data Science", "Design", "Backend Development", "Mobile Development", "DevOps", "Cybersecurity", "Artificial Intelligence"]

export default function ExplorePage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("All")
  const [isPaidFilter, setIsPaidFilter] = useState("All")
  const [sortBy, setSortBy] = useState("recent")
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'apply'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch internships from API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/internships')
        if (!response.ok) {
          throw new Error('Failed to fetch internships')
        }
        const data = await response.json()
        setInternships(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [])

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = debouncedSearchTerm === "" || 
                         internship.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         internship.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         internship.domain.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesDomain = selectedDomain === "All" || internship.domain === selectedDomain
    
    const matchesPaid = isPaidFilter === "All" || 
                       (isPaidFilter === "Paid" && internship.isPaid) ||
                       (isPaidFilter === "Unpaid" && !internship.isPaid)
    
    return matchesSearch && matchesDomain && matchesPaid
  })

  const sortedInternships = [...filteredInternships].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "stipend":
        return (b.stipend || 0) - (a.stipend || 0)
      case "applicants":
        return a._count.applications - b._count.applications
      default:
        return 0
    }
  })

  const handleLearnMore = (internship: Internship) => {
    setSelectedInternship(internship)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleApplyNow = (internship: Internship) => {
    setSelectedInternship(internship)
    setModalMode('apply')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedInternship(null)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
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
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
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
          {loading ? "Loading..." : `Showing ${sortedInternships.length} of ${internships.length} internships`}
        </p>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setSelectedDomain("All")
              setIsPaidFilter("All")
            }}
          >
            Reset Filters
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Internships</h3>
            <p>{error}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Internship Cards */}
      {!loading && !error && (
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
                        {internship.domain}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {internship.duration} weeks
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {internship.isPaid && internship.stipend ? (
                      <Badge className="bg-green-100 text-green-800">
                        <DollarSign className="mr-1 h-3 w-3" />
                        ${internship.stipend}/month
                      </Badge>
                    ) : (
                      <Badge variant="outline">Unpaid</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {internship.description}
                </CardDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Mentor: {internship.mentor.name || 'TBD'}</span>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {internship._count.applications} applicants
                    </div>
                    <span>{internship.maxInterns} position{internship.maxInterns > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex space-x-2">
                    {/* <Button 
                      variant="outline"
                      onClick={() => handleLearnMore(internship)}
                    >
                      Learn More
                    </Button> */}
                    {session?.user?.role === 'INTERN' ? (
                      <Button
                        onClick={() => handleApplyNow(internship)}
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleLearnMore(internship)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {sortedInternships.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Internships
          </Button>
        </div>
      )}

      {/* No Results */}
      {sortedInternships.length === 0 && !loading && !error && (
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

      {/* Application Modal */}
      <InternshipApplicationModal
        internship={selectedInternship}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
      />
    </div>
    </div>
  )
}