"use client"

import { BaseModal } from "../base/BaseModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Building, 
  Globe, 
  MapPin, 
  Users, 
  Calendar,
  Edit,
  ExternalLink
} from "lucide-react"

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  industry: string | null
  size: string | null
  location: string | null
  logo: string | null
  createdAt: Date
  _count?: {
    users: number
    internships: number
    jobPostings: number
  }
}

interface CompanyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company
  onEdit: () => void
}

export function CompanyDetailsModal({
  isOpen,
  onClose,
  company,
  onEdit
}: CompanyDetailsModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Company Header */}
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={company.logo || undefined} />
            <AvatarFallback className="text-lg">
              {company.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{company.name}</h2>
            {company.industry && (
              <Badge variant="secondary" className="mt-1">
                {company.industry}
              </Badge>
            )}
            {company.website && (
              <div className="flex items-center mt-2">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {company.website}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
          <Button onClick={onEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Company Information</h3>
              <div className="space-y-2">
                {company.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {company.location}
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {company.size} employees
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Founded {new Date(company.createdAt).getFullYear()}
                </div>
              </div>
            </div>

            {company._count && (
              <div>
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {company._count.users}
                    </div>
                    <div className="text-xs text-muted-foreground">Team Members</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {company._count.internships}
                    </div>
                    <div className="text-xs text-muted-foreground">Internships</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {company._count.jobPostings}
                    </div>
                    <div className="text-xs text-muted-foreground">Job Postings</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">About</h3>
            {company.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {company.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description available
              </p>
            )}
          </div>
        </div>

        {/* Company Logo Preview */}
        {company.logo && (
          <div>
            <h3 className="font-semibold mb-2">Company Logo</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`}
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  )
}