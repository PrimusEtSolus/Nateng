"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Smartphone, Key, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TwoFactorVerificationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: number
  userName: string
}

export function TwoFactorVerification({ isOpen, onClose, onSuccess, userId, userName }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const verifyCode = async () => {
    const code = useBackupCode ? backupCode : verificationCode
    
    if (!code) {
      toast.error(`Please enter the ${useBackupCode ? 'backup' : 'verification'} code`)
      return
    }

    if (useBackupCode && backupCode.length !== 8) {
      toast.error("Backup code must be 8 characters")
      return
    }

    if (!useBackupCode && verificationCode.length !== 6) {
      toast.error("Verification code must be 6 digits")
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch('/api/two-factor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code,
          useBackupCode
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("Verification successful!")
        onSuccess()
        onClose()
      } else {
        toast.error("Verification failed", { description: data.error })
      }
    } catch (error: any) {
      toast.error("Verification failed", { description: error.message })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerificationCodeChange = (value: string) => {
    setVerificationCode(value.replace(/\D/g, '').substring(0, 6))
  }

  const handleBackupCodeChange = (value: string) => {
    setBackupCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter your verification code to complete sign in for <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Verification Method Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!useBackupCode ? "default" : "outline"}
              onClick={() => setUseBackupCode(false)}
              className="flex-1"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Verification Code
            </Button>
            <Button
              variant={useBackupCode ? "default" : "outline"}
              onClick={() => setUseBackupCode(true)}
              className="flex-1"
            >
              <Key className="w-4 h-4 mr-2" />
              Backup Code
            </Button>
          </div>

          {!useBackupCode ? (
            /* Verification Code Input */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5" />
                  Enter Verification Code
                </CardTitle>
                <CardDescription>
                  Open your authenticator app and enter the 6-digit code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">6-Digit Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => handleVerificationCodeChange(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg font-mono"
                    autoFocus
                  />
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    For testing: Use the code generated during 2FA setup or check your saved backup codes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            /* Backup Code Input */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-5 h-5" />
                  Enter Backup Code
                </CardTitle>
                <CardDescription>
                  Use one of your backup codes if you can't access your authenticator app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-code">8-Character Backup Code</Label>
                  <Input
                    id="backup-code"
                    placeholder="ABCD1234"
                    value={backupCode}
                    onChange={(e) => handleBackupCodeChange(e.target.value)}
                    maxLength={8}
                    className="text-center text-lg font-mono uppercase"
                    autoFocus
                  />
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Each backup code can only be used once. Keep them secure!
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={verifyCode} 
              disabled={isVerifying || (!useBackupCode ? verificationCode.length !== 6 : backupCode.length !== 8)}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          {/* Emergency Access */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.info("Contact support at support@nateng.com for account recovery")
              }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Lost access to your authenticator?
            </Button>
          </div>

          {/* Help Section */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="text-sm text-muted-foreground"
            >
              {showBackupCodes ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showBackupCodes ? "Hide" : "Show"} Backup Code Help
            </Button>
            
            {showBackupCodes && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Backup codes were generated when you enabled 2FA. They look like: ABCD1234, EF5678GH, etc.
                  Check where you saved them during setup.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
