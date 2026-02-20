"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, AlertCircle, CheckCircle, Loader2, Copy, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { generateFormattedMockAuthCode, verifyMockAuthCode } from "@/lib/mock-auth"

interface MockAuthenticationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userName: string
}

export function MockAuthentication({ isOpen, onClose, onSuccess, userName }: MockAuthenticationProps) {
  const [inputCode, setInputCode] = useState("")
  const [expectedCode, setExpectedCode] = useState<{ code: string; formatted: string } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateNewCode = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const newCode = generateFormattedMockAuthCode()
      setExpectedCode(newCode)
      setInputCode("")
      setAttempts(0)
      setIsGenerating(false)
      toast.success("New authentication code generated")
    }, 500)
  }

  const verifyCode = () => {
    if (!expectedCode || !inputCode) {
      toast.error("Please enter the authentication code")
      return
    }

    if (inputCode.length !== 8) {
      toast.error("Authentication code must be 8 characters")
      return
    }

    setIsVerifying(true)
    setTimeout(() => {
      if (verifyMockAuthCode(inputCode, expectedCode.code)) {
        toast.success("Authentication successful!")
        onSuccess()
        onClose()
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        if (newAttempts >= 3) {
          toast.error("Too many failed attempts. Please generate a new code.", {
            description: "For security reasons, you need a new code after 3 failed attempts."
          })
          setTimeout(generateNewCode, 2000)
        } else {
          toast.error(`Invalid code. ${3 - newAttempts} attempts remaining.`, {
            description: "Please check the code carefully and try again."
          })
        }
      }
      setIsVerifying(false)
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
    toast.success("Code copied to clipboard")
  }

  const handleDialogOpen = (open: boolean) => {
    console.log('Mock authentication dialog opening:', open)
    if (open && !expectedCode) {
      console.log('Generating new mock authentication code...')
      generateNewCode()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication Required
          </DialogTitle>
          <DialogDescription>
            Enter the 8-character authentication code to continue for <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-muted-foreground mt-2">Generating authentication code...</p>
          </div>
        ) : expectedCode ? (
          <div className="space-y-6 p-6">
            {/* Debug Info */}
            <div className="text-xs text-gray-500">
              Debug: expectedCode={expectedCode ? 'exists' : 'null'}, formatted={expectedCode?.formatted}
            </div>
            {/* Code Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-5 h-5" />
                  Your Authentication Code
                </CardTitle>
                <CardDescription>
                  Enter this code to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-primary tracking-widest mb-2">
                    {expectedCode.formatted}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(expectedCode.code)}
                      disabled={copiedCode}
                    >
                      {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCode ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateNewCode}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      New Code
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Code expires in 10 minutes for security
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enter Authentication Code</CardTitle>
                <CardDescription>
                  Type the 8-character code shown above
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-code">8-Character Code</Label>
                  <Input
                    id="auth-code"
                    placeholder="Enter code (e.g., A1B2C3D4)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8))}
                    maxLength={8}
                    className="text-center text-lg font-mono uppercase"
                    autoFocus
                  />
                </div>

                {attempts > 0 && (
                  <div className="text-sm text-orange-600">
                    {attempts}/3 attempts used. {3 - attempts} remaining.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Button */}
            <Button
              onClick={verifyCode}
              disabled={isVerifying || inputCode.length !== 8}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            {/* Skip Option */}
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.setItem(`2fa-setup-${userName}`, 'skipped')
                  onSuccess()
                  onClose()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> This is a mock authentication system for testing purposes. 
                Each code can be used multiple times within the time limit.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No authentication code available.</p>
            <Button onClick={generateNewCode} className="mt-4">
              Generate Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
