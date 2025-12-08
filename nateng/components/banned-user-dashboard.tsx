"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Ban, LogOut, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function BannedUserDashboard() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appealSubmitted, setAppealSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    appealReason: '',
    appealDetails: ''
  })

  const user = getCurrentUser()

  const handleLogout = () => {
    localStorage.removeItem('natenghub_user')
    toast.success('Logged out successfully')
    router.push('/login')
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
                You can logout and check back later for updates.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
              <strong>Limited Access:</strong> You can only submit appeals or logout while your account is under review.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Welcome, {user?.name}. Your account is suspended but you can submit an appeal for review.
            </p>
            <p>
              The administrator will review your case and make a decision within 24-48 hours.
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => setFormData({
                userName: user?.name || '',
                userEmail: user?.email || '',
                appealReason: '',
                appealDetails: ''
              })}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Appeal
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {formData.userName && (
            <form onSubmit={handleSubmitAppeal} className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium">Appeal Reason</label>
                <input
                  type="text"
                  value={formData.appealReason}
                  onChange={(e) => setFormData({ ...formData, appealReason: e.target.value })}
                  placeholder="e.g., Wrongful suspension, Technical issue, etc."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Additional Details</label>
                <textarea
                  value={formData.appealDetails}
                  onChange={(e) => setFormData({ ...formData, appealDetails: e.target.value })}
                  placeholder="Please provide detailed explanation of why you believe this suspension should be reviewed..."
                  rows={4}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
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
                  onClick={() => setFormData({
                    userName: '',
                    userEmail: '',
                    appealReason: '',
                    appealDetails: ''
                  })}
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
