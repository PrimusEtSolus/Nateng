"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ShieldOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TwoFactorSetup } from "@/components/two-factor-setup"
import { toast } from "sonner"

export default function TwoFactorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [twoFactorStatus, setTwoFactorStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisabling, setIsDisabling] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    fetchTwoFactorStatus()
  }, [router])

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/two-factor/status')
      const data = await response.json()
      
      if (data.success) {
        setTwoFactorStatus(data.status)
      }
    } catch (error: any) {
      toast.error("Failed to fetch 2FA status", { description: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
      return
    }

    setIsDisabling(true)
    try {
      const response = await fetch('/api/two-factor/status', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        toast.success("2FA disabled successfully")
        setTwoFactorStatus({ enabled: false })
      } else {
        toast.error("Failed to disable 2FA", { description: data.error })
      }
    } catch (error: any) {
      toast.error("Failed to disable 2FA", { description: error.message })
    } finally {
      setIsDisabling(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetup(false)
    fetchTwoFactorStatus()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Two-Factor Authentication</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {twoFactorStatus?.enabled ? (
                  <>
                    <Shield className="w-6 h-6 text-green-600" />
                    2FA is Enabled
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-6 h-6 text-gray-400" />
                    2FA is Disabled
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {twoFactorStatus?.enabled 
                  ? "Your account is protected with two-factor authentication."
                  : "Your account is not protected with two-factor authentication."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {twoFactorStatus?.enabled ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Enhanced:</strong> Your account requires both your password and a verification code to sign in.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">2FA Active Since</p>
                      <p className="text-sm text-green-600">
                        {twoFactorStatus.createdAt 
                          ? new Date(twoFactorStatus.createdAt).toLocaleDateString()
                          : "Unknown"
                        }
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>

                  <Button
                    variant="destructive"
                    onClick={disableTwoFactor}
                    disabled={isDisabling}
                    className="w-full"
                  >
                    {isDisabling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Disable 2FA
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Risk:</strong> Your account is only protected by a password. Enable 2FA to add an extra layer of security.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">Account Not Protected</p>
                      <p className="text-sm text-red-600">Anyone with your password can access your account</p>
                    </div>
                    <ShieldOff className="w-8 h-8 text-red-600" />
                  </div>

                  <Button
                    onClick={() => setShowSetup(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How 2FA Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm">Enter your email and password as usual</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm">Enter the 6-digit verification code from your authenticator app</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm">Access your account with enhanced security</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup Codes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  When you enable 2FA, you'll receive 10 backup codes that you can use to access your account if you lose your authenticator device.
                </p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Save your backup codes in a secure location. Each code can only be used once.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Save backup codes securely</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Use a password manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Keep your authenticator app updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Never share your verification codes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 2FA Setup Modal */}
      {showSetup && (
        <TwoFactorSetup
          isOpen={showSetup}
          onClose={() => setShowSetup(false)}
          onComplete={handleSetupComplete}
        />
      )}
    </div>
  )
}
