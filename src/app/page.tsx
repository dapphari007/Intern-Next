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

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineering Intern",
    company: "TechCorp",
    content: "The skill-based matching helped me find the perfect internship. I earned 150 credits and got a full-time offer!",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "Data Science Mentor",
    company: "DataFlow Inc",
    content: "Mentoring through this platform has been incredibly rewarding. The credit system motivates interns to excel.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "UX Design Intern",
    company: "DesignStudio",
    content: "The Web3 certificates gave me a competitive edge in job interviews. Employers love the verified credentials.",
    rating: 5
  }
]

const stats = [
  { label: "Active Internships", value: "500+" },
  { label: "Successful Placements", value: "2,000+" },
  { label: "Industry Partners", value: "150+" },
  { label: "Skill Credits Earned", value: "50K+" }
]

export default function HomePage() {
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
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
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
            ))}
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