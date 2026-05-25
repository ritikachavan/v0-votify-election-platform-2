import Link from "next/link"
import { Shield, Vote, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-foreground">Votify</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="text-foreground hover:bg-accent"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Secure Election Monitoring Platform
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Votify provides real-time election monitoring with tamper-proof data verification and public transparency. Participate with confidence knowing your vote counts.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              <Link href="/signup">Create Voter Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border px-8"
            >
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Secure Voting</h3>
            <p className="text-sm text-muted-foreground">
              Your vote is encrypted and securely stored with industry-standard security protocols.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Data Integrity</h3>
            <p className="text-sm text-muted-foreground">
              Blockchain-verified voting records prevent tampering and ensure transparency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Real-Time Results</h3>
            <p className="text-sm text-muted-foreground">
              Monitor election results as they happen with live dashboard and detailed analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to participate?
          </h2>
          <p className="text-muted-foreground">
            Join thousands of voters using Votify for secure and transparent elections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="px-8"
            >
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
