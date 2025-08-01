"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Users, 
  Briefcase, 
  MapPin,
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { AddCompanyModal } from "@/components/admin/add-company-modal"
import { EditCompanyModal } from "@/components/admin/edit-company-modal"
import { ViewCompanyModal } from "@/components/admin/view-company-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

interface Company {
  id: string
  name: string
  description?: string
  website?: string
  industry?: string
  size?: string
  location?: string
  logo?: string
  createdAt: string
  updatedAt: string
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }>
  internships: Array<{
    id: string
    title: string
    status: string
    isActive: boolean
    applications: Array<{
      id: string
      status: string
    }>
  }>
  jobPostings: Array<{
    id: string
    title: string
    isActive: boolean
  }>
  stats: {
    totalUsers: number
    activeInternships: number
    totalInternships: number
    totalJobPostings: number
    totalApplications: number
    pendingApplications: number
  }
}

interface CompaniesResponse {
  companies: Company[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function CompanyManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push("/dashboard")
      return
    }

    fetchCompanies()
  }, [session, status, router, currentPage, searchTerm])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/companies?${params}`)
      if (response.ok) {
        const data: CompaniesResponse = await response.json()
        setCompanies(data.companies)
        setTotalPages(data.pagination.pages)
        setTotalCompanies(data.pagination.total)
      } else {
        console.error('Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleDeleteCompany = async (companyId: string) => {
    setActionLoading(companyId)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCompanies()
        setDeletingCompany(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('Failed to delete company')
    } finally {
      setActionLoading(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6 mb-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Company Management</h1>
              <p className="text-muted-foreground">
                Manage companies, their internships, and tasks
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((acc, company) => acc + company.stats.totalUsers, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((acc, company) => acc + company.stats.activeInternships, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((acc, company) => acc + company.stats.pendingApplications, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setViewingCompany(company)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      {company.industry && (
                        <Badge variant="secondary" className="mt-1">
                          {company.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCompany(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingCompany(company)}
                      disabled={actionLoading === company.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {company.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {company.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {company.location}
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        Website
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{company.stats.totalUsers}</div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{company.stats.activeInternships}</div>
                      <div className="text-xs text-muted-foreground">Active Internships</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{company.stats.totalJobPostings}</div>
                      <div className="text-xs text-muted-foreground">Job Postings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{company.stats.pendingApplications}</div>
                      <div className="text-xs text-muted-foreground">Pending Apps</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {companies.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No companies match your search criteria." : "Get started by adding your first company."}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCompanyModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchCompanies}
      />

      <ViewCompanyModal
        companyId={viewingCompany?.id || null}
        open={!!viewingCompany}
        onOpenChange={(open) => !open && setViewingCompany(null)}
        onSuccess={fetchCompanies}
      />

      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onSuccess={fetchCompanies}
        />
      )}

      {deletingCompany && (
        <DeleteConfirmationModal
          open={!!deletingCompany}
          onOpenChange={(open) => !open && setDeletingCompany(null)}
          onConfirm={() => handleDeleteCompany(deletingCompany.id)}
          title="Delete Company"
          description={`Are you sure you want to delete "${deletingCompany.name}"? This action cannot be undone and will remove all associated data.`}
          loading={actionLoading === deletingCompany.id}
        />
      )}
    </div>
  )
}