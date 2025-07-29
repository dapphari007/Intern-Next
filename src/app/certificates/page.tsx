"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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

interface Certificate {
  id: string
  title: string
  description: string
  issueDate: string
  certificateUrl: string | null
  nftTokenId: string | null
  status: string
}

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch certificates from API
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!session?.user?.id) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/certificates')
        if (!response.ok) {
          throw new Error('Failed to fetch certificates')
        }
        const data = await response.json()
        setCertificates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [session?.user?.id])

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

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view your certificates
            </p>
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
              <div className="text-2xl font-bold">{loading ? "..." : certificates.length}</div>
              <p className="text-xs text-muted-foreground">
                Your achievements
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
                {loading ? "..." : certificates.filter(c => c.status === 'MINTED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Blockchain verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : certificates.filter(c => c.status === 'ISSUED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to mint
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : certificates.length > 0 ? "Active" : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                Certificate status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6">
            {[...Array(2)].map((_, i) => (
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
              <Award className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Certificates</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Certificates Grid */}
        {!loading && !error && (
          <div className="grid gap-6">
            {certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-xl">{certificate.title}</CardTitle>
                      <Badge className={getStatusColor(certificate.status)}>
                        {getStatusIcon(certificate.status)}
                        <span className="ml-1 capitalize">{certificate.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {certificate.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">Issue Date</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{certificate.status}</p>
                      <p className="text-muted-foreground">Status</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {certificate.nftTokenId && (
                      <p>NFT Token: {certificate.nftTokenId.slice(0, 10)}...</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {certificate.certificateUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                    {certificate.status === "ISSUED" && (
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

        )}

        {/* Empty State */}
        {!loading && !error && certificates.length === 0 && (
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