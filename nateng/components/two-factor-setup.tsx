"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Shield, Key, Smartphone, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth"

interface TwoFactorSetupProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function TwoFactorSetup({ isOpen, onClose, onComplete }: TwoFactorSetupProps) {
  const [user, setUser] = useState<any>(null)
  const [setupData, setSetupData] = useState<any>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isEnabling, setIsEnabling] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  useEffect(() => {
    if (isOpen && user && !setupData) {
      setupTwoFactor()
    }
  }, [isOpen, user])

  const setupTwoFactor = async () => {
    if (!user) return

    setIsSettingUp(true)
    try {
      const response = await fetch('/api/two-factor/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (data.success) {
        setSetupData(data.setup)
      } else {
        toast.error("Failed to setup 2FA", { description: data.error })
      }
    } catch (error: any) {
      toast.error("Failed to setup 2FA", { description: error.message })
    } finally {
      setIsSettingUp(false)
    }
  }

  const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    }
    toast.success("Copied to clipboard")
  }

  const enableTwoFactor = async () => {
    if (!verificationCode || !setupData) {
      toast.error("Please enter the verification code")
      return
    }

    setIsEnabling(true)
    try {
      const response = await fetch('/api/two-factor/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("2FA enabled successfully!")
        onComplete()
        onClose()
      } else {
        toast.error("Failed to enable 2FA", { description: data.error })
      }
    } catch (error: any) {
      toast.error("Failed to enable 2FA", { description: error.message })
    } finally {
      setIsEnabling(false)
    }
  }

  const generateCurrentCode = () => {
    if (!setupData) return "------"
    
    // Mock implementation - in real app, this would be time-based
    // For browser compatibility, we'll use a simple hash-based approach
    const timestamp = Date.now().toString()
    const hash = timestamp.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const code = (Math.abs(hash) % 900000 + 100000).toString().substring(0, 6)
    return code
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Setup Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account with 2FA
          </DialogDescription>
        </DialogHeader>

        {isSettingUp ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : setupData ? (
          <div className="space-y-6">
            {/* Secret Key */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-5 h-5" />
                  Your Secret Key
                </CardTitle>
                <CardDescription>
                  Save this secret key in a secure location. You'll need it to restore access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input 
                    value={setupData.secret} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  >
                    {copiedSecret ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Verification Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5" />
                  Current Verification Code
                </CardTitle>
                <CardDescription>
                  Enter this 6-digit code to enable 2FA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-primary mb-4">
                    {generateCurrentCode()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This code changes every 30 seconds (mock implementation)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <div className="space-y-4">
              <Label htmlFor="verification-code">Enter Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>

            {/* Backup Codes */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Save your backup codes below. You can use them to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup Codes</CardTitle>
                <CardDescription>
                  Save these codes in a secure location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {setupData.backupCodes.map((code: string, index: number) => (
                    <div key={index} className="font-mono text-sm bg-muted p-2 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
                  className="w-full"
                >
                  {copiedCodes ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy All Backup Codes
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={enableTwoFactor} 
                disabled={!verificationCode || verificationCode.length !== 6 || isEnabling}
                className="flex-1"
              >
                {isEnabling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>

            {/* Skip Option */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.setItem(`2fa-setup-${user?.id}`, 'skipped')
                  onComplete()
                  onClose()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
