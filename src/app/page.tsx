"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Award, BookOpen, Users, Zap, Star, CheckCircle } from "lucide-react"

const valuePropositions = [
  {
    icon: BookOpen,
    title: "Skill-Based Internships",
    description: "Find internships that match your skills and career goals. Work on real projects with industry mentors.",
    features: ["Real-world projects", "Industry mentors", "Skill matching"]
  },
  {
    icon: Zap,
    title: "Earn Skill Credits",
    description: "Complete tasks and earn credits that showcase your abilities. Build a portfolio of verified achievements.",
    features: ["Task completion rewards", "Skill verification", "Achievement tracking"]
  },
  {
    icon: Award,
    title: "Web3 Certificates",
    description: "Receive blockchain-verified certificates that prove your skills and accomplishments to future employers.",
    features: ["Blockchain verification", "Tamper-proof credentials", "Global recognition"]
  }
]

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface Stat {
  label: string;
  value: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stat[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Set empty stats on error
        setStats([])
      } finally {
        setLoading(false)
      }
    }

    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        if (response.ok) {
          const data = await response.json()
          setTestimonials(data.slice(0, 3)) // Only show first 3
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        // Set empty testimonials on error
        setTestimonials([])
      } finally {
        setTestimonialsLoading(false)
      }
    }

    fetchStats()
    fetchTestimonials()
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            <Badge variant="secondary" className="mb-4">
              🚀 Now with Web3 Certificates
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Launch Your Career with
              <span className="text-primary block">Skill-Based Internships</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with industry mentors, work on real projects, earn skill credits, 
              and receive blockchain-verified certificates that prove your expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/explore">
                  Explore Internships
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {loading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="space-y-2 animate-pulse">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                </div>
              ))
            ) : (
              stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose InternHub?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing internships with skill-based matching, 
              gamified learning, and blockchain-verified achievements.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {valuePropositions.map((prop, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <prop.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{prop.title}</CardTitle>
                  <CardDescription className="text-base">
                    {prop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prop.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of successful interns and mentors
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonialsLoading ? (
              [...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-4 bg-muted rounded"></div>
                      ))}
                    </div>
                    <div className="h-16 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              testimonials.map((testimonial, index) => (
                <Card key={testimonial.id || index}>
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and professionals building their careers 
            through skill-based internships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">
                <Users className="mr-2 h-4 w-4" />
                Join as Intern
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">
                <Award className="mr-2 h-4 w-4" />
                Become a Mentor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">InternHub</h3>
              <p className="text-sm text-muted-foreground">
                Connecting talent with opportunity through skill-based internships 
                and blockchain-verified achievements.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-foreground">Explore Internships</Link></li>
                <li><Link href="/auth/signup" className="hover:text-foreground">Join as Intern</Link></li>
                <li><Link href="/auth/signup" className="hover:text-foreground">Become Mentor</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 InternHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}