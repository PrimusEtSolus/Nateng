"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Ban, Mail, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

function BannedPageContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Your account has been suspended'
  const [showAppealForm, setShowAppealForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appealSubmitted, setAppealSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    appealReason: '',
    appealDetails: ''
  })

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setAppealSubmitted(true)
        toast.success('Appeal submitted successfully. Your case is under review.')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit appeal')
      }
    } catch (error) {
      toast.error('Error submitting appeal')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (appealSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Appeal Submitted</CardTitle>
            <CardDescription>
              Your appeal has been submitted for review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your appeal is now under review. The administrator will review your case and respond within 24-48 hours.
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                You will be notified once a decision has been made. If approved, your account access will be restored.
              </p>
              <p>
                You can check back later or contact the administrator for updates.
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Ban className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been suspended by an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <Ban className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Reason:</strong> {reason}
            </AlertDescription>
          </Alert>
          
          {!showAppealForm ? (
            <>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  If you believe this is an error, you can submit an appeal for review.
                </p>
                <p>
                  The administrator will review your case and make a decision within 24-48 hours.
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setShowAppealForm(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Appeal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:admin@nateng.com'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Administrator
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="userEmail">Email Address</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="appealReason">Appeal Reason</Label>
                <Input
                  id="appealReason"
                  value={formData.appealReason}
                  onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                  placeholder="e.g., Wrongful suspension, Technical issue, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="appealDetails">Additional Details</Label>
                <Textarea
                  id="appealDetails"
                  value={formData.appealDetails}
                  onChange={(e) => setFormData({ ...formData, appealDetails: e.target.value })}
                  placeholder="Please provide detailed explanation of why you believe this suspension should be reviewed..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAppealForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BannedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <BannedPageContent />
    </Suspense>
  )
}
