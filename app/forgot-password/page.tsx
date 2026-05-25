'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
        setEmail('')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Forgot Password</CardTitle>
            <CardDescription>
              We will send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-success/10 border-success/20">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Check your email for a password reset link. It will expire in 24 hours.
                  </AlertDescription>
                </Alert>
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voter@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    disabled={loading}
                    className="bg-background border-input"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Your account security is our priority
        </p>
      </div>
    </div>
  )
}
