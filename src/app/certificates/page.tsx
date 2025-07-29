"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { 
  Award, 
  Download, 
  Share2, 
  ExternalLink, 
  Calendar,
  Building,
  User,
  Zap,
  Shield
} from "lucide-react"

// Mock certificate data
const mockCertificates = [
  {
    id: "1",
    title: "Frontend Development Mastery",
    description: "Successfully completed a comprehensive frontend development internship",
    internship: "Frontend Developer Intern",
    company: "TechCorp",
    mentor: "Sarah Johnson",
    issueDate: "2024-01-15",
    creditsEarned: 250,
    skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    status: "issued",
    certificateUrl: "/certificates/cert-1.pdf",
    nftTokenId: null,
    verificationId: "CERT-2024-001"
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    description: "Demonstrated proficiency in data analysis and machine learning",
    internship: "Data Science Intern",
    company: "DataFlow Inc",
    mentor: "Dr. Michael Chen",
    issueDate: "2023-12-20",
    creditsEarned: 300,
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
    status: "minted",
    certificateUrl: "/certificates/cert-2.pdf",
    nftTokenId: "0x1234567890abcdef",
    verificationId: "CERT-2023-045"
  },
  {
    id: "3",
    title: "UX Design Excellence",
    description: "Created outstanding user experiences and interface designs",
    internship: "UX Design Intern",
    company: "DesignStudio",
    mentor: "Emma Wilson",
    issueDate: "2023-11-30",
    creditsEarned: 200,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    status: "issued",
    certificateUrl: "/certificates/cert-3.pdf",
    nftTokenId: null,
    verificationId: "CERT-2023-032"
  }
]

export default function CertificatesPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "minted":
        return "bg-purple-100 text-purple-800"
      case "issued":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "minted":
        return <Zap className="h-4 w-4" />
      case "issued":
        return <Shield className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground">
            Your verified achievements and blockchain-backed credentials
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCertificates.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {new Set(mockCertificates.map(c => c.company)).size} companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFT Certificates</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCertificates.filter(c => c.status === 'minted').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Blockchain verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockCertificates.reduce((sum, c) => sum + c.creditsEarned, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Skill credits earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Verified</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(mockCertificates.flatMap(c => c.skills)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique skills
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        <div className="grid gap-6">
          {mockCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">{certificate.title}</CardTitle>
                      <Badge className={getStatusColor(certificate.status)}>
                        {getStatusIcon(certificate.status)}
                        <span className="ml-1 capitalize">{certificate.status}</span>
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {certificate.description}
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {certificate.creditsEarned}
                    </div>
                    <div className="text-sm text-muted-foreground">Credits</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.company}</p>
                      <p className="text-muted-foreground">{certificate.internship}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.mentor}</p>
                      <p className="text-muted-foreground">Mentor</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.issueDate}</p>
                      <p className="text-muted-foreground">Issue Date</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Skills Verified:</p>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p>Verification ID: {certificate.verificationId}</p>
                    {certificate.nftTokenId && (
                      <p>NFT Token: {certificate.nftTokenId.slice(0, 10)}...</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                    {certificate.status === "issued" && (
                      <Button size="sm">
                        <Zap className="mr-2 h-4 w-4" />
                        Mint NFT
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockCertificates.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete internships to earn verified certificates
            </p>
            <Button asChild>
              <a href="/explore">Explore Internships</a>
            </Button>
          </div>
        )}

        {/* Certificate Preview Modal would go here */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Certificate Preview</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedCertificate(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg text-center">
                  <div className="mb-6">
                    <Award className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Certificate of Completion</h2>
                    <p className="text-muted-foreground">This certifies that</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-primary mb-2">John Doe</h3>
                    <p className="text-lg">has successfully completed</p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold mb-2">Frontend Development Internship</h4>
                    <p className="text-muted-foreground">at TechCorp</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                      <p>Mentor: Sarah Johnson</p>
                      <p>Date: January 15, 2024</p>
                    </div>
                    <div>
                      <p>Credits Earned: 250</p>
                      <p>Verification: CERT-2024-001</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}