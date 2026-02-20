"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"

interface TermsAndConditionsProps {
  onAccept: () => void
  onDecline: () => void
  isOpen: boolean
  userRole: string
}

export function TermsAndConditions({ onAccept, onDecline, isOpen, userRole }: TermsAndConditionsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleAccept = () => {
    if (isCheckboxChecked) {
      onAccept()
    }
  }

  const termsSections = [
    {
      id: 'terms',
      title: 'Terms of Service',
      content: `Welcome to NatengHub! These Terms of Service govern your use of our agricultural marketplace platform.

1. **Account Registration**
   - You must provide accurate, complete information when registering
   - You are responsible for maintaining the confidentiality of your account credentials
   - You must be at least 18 years old to use this service
   - One account per person or business entity

2. **Platform Usage**
   - NatengHub connects farmers, resellers, businesses, and buyers
   - All transactions must follow our marketplace rules:
     • Farmers may sell to businesses, resellers, and buyers
     • Resellers may sell to buyers only
     • Businesses and resellers may buy from farmers only
     • Buyers may purchase from farmers or resellers

3. **Prohibited Activities**
   - Fraudulent listings or transactions
   - Sale of illegal or unauthorized agricultural products
   - Misrepresentation of product quality or origin
   - Price manipulation or unfair trading practices
   - Circumventing marketplace fees or rules

4. **Product Listings**
   - All products must be accurately described
   - Prices must be in Philippine Pesos (₱)
   - Available quantities must be accurate and up-to-date
   - Product images must be representative of actual items

5. **Payment and Transactions**
   - All payments are processed through our secure platform
   - Buyers must pay for orders within 48 hours of confirmation
   - Sellers must ship orders within agreed timeframes
   - Disputes must be raised within 7 days of delivery

6. **User Responsibilities**
   - Maintain accurate contact information
   - Respond to communications within 24 hours
   - Follow all applicable agricultural and food safety regulations
   - Report any suspicious activity immediately

7. **Account Suspension**
   - We reserve the right to suspend accounts for violations
   - Serious violations may result in permanent termination
   - Suspended users cannot create new accounts without permission`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: `Your privacy is important to us. This policy explains how we collect, use, and protect your information.

1. **Information We Collect**
   - Personal information: name, email, phone, address
   - Business information: business type, tax ID, registration details
   - Transaction data: orders, payments, shipping information
   - Usage data: login history, page visits, feature usage

2. **How We Use Your Information**
   - To provide and maintain our marketplace service
   - To process transactions and communicate with users
   - To verify user identities and prevent fraud
   - To improve our platform and develop new features
   - To send important notifications about your account

3. **Information Sharing**
   - We never sell your personal information to third parties
   - We share information only as necessary for:
     • Transaction processing with payment providers
     • Shipping and delivery coordination
     • Legal compliance and law enforcement requests
     • Platform analytics and improvement (aggregated, anonymous data)

4. **Data Security**
   - We use industry-standard encryption for data transmission
   - Payment information is tokenized and secure
   - Regular security audits and vulnerability assessments
   - Access to user data is strictly controlled and logged

5. **Your Rights**
   - Access, correct, or delete your personal information
   - Opt-out of non-essential communications
   - Request a copy of your data
   - Close your account at any time

6. **Data Retention**
   - We retain data only as long as necessary for service provision
   - Transaction records are kept for 7 years for tax compliance
   - Deleted accounts are removed within 30 days (except legal requirements)

7. **International Transfers**
   - Your data may be processed outside the Philippines
   - We ensure adequate protection under applicable laws
   - Standard contractual clauses protect your data rights`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: `Please understand the limitations of our service.

1. **Platform Role**
   - NatengHub is a marketplace platform, not a seller or buyer
   - We facilitate connections between agricultural stakeholders
   - We are not responsible for product quality or delivery

2. **Transaction Risks**
   - Users assume responsibility for their transactions
   - Verify product quality before making large purchases
   - Check seller ratings and reviews when available
   - Use secure payment methods only

3. **Service Availability**
   - We strive for 99.9% uptime but cannot guarantee it
   - Scheduled maintenance may temporarily interrupt service
   - We are not liable for business losses from downtime

4. **Damages Limitation**
   - Our total liability is limited to fees paid by you
   - We are not liable for indirect, consequential, or punitive damages
   - This includes lost profits, data, or business opportunities

5. **Indemnification**
   - You agree to indemnify us for claims arising from your:
     • Violation of these terms
     • Infringement of third-party rights
     • Fraudulent or illegal activities

6. **Force Majeure**
   - We are not liable for events beyond our control:
     • Natural disasters, weather events
     • Government actions, regulations
     • Internet infrastructure failures
     • Labor strikes or civil unrest`
    },
    {
      id: 'disputes',
      title: 'Dispute Resolution',
      content: `We provide a structured process for resolving conflicts.

1. **Dispute Types**
   - Product quality issues
   - Delivery problems
   - Payment discrepancies
   - Communication failures
   - Rule violations

2. **Resolution Process**
   - Step 1: Direct communication between parties (3 days)
   - Step 2: Platform mediation (5 days)
   - Step 3: Evidence submission and review (7 days)
   - Step 4: Final decision and implementation

3. **Evidence Requirements**
   - Clear photos of products or issues
   - Communication screenshots or records
   - Delivery confirmations and tracking
   - Payment receipts and transaction records

4. **Possible Outcomes**
   - Full or partial refund to buyer
   - Return of products to seller
   - Account suspension for rule violations
   - Permanent ban for serious offenses

5. **Timeline Standards**
   - Simple disputes: resolved within 7 days
   - Complex disputes: resolved within 14 days
   - Legal matters: referred to appropriate authorities

6. **Fair Process**
   - Both parties have opportunity to present evidence
   - Decisions are based on platform terms and evidence
   - Appeals can be requested within 3 days of decision`
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6" />
            Terms and Conditions for {userRole.charAt(0).toUpperCase() + userRole.slice(1)}s
          </DialogTitle>
          <DialogDescription>
            Please read and accept the following terms to create your {userRole} account
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6 pr-4">
              {termsSections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left font-semibold text-lg hover:text-muted-foreground transition-colors"
                  >
                    {section.title}
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <div className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t p-6 flex-shrink-0">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="accept-terms" 
                className="mt-1"
                checked={isCheckboxChecked}
                onCheckedChange={(checked) => {
                  setIsCheckboxChecked(checked as boolean)
                }}
              />
              <label htmlFor="accept-terms" className="text-sm text-muted-foreground">
                I have read, understood, and agree to the Terms and Conditions, Privacy Policy, 
                and Dispute Resolution process. I understand that this agreement is legally binding 
                and that violating these terms may result in account suspension or termination.
              </label>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onDecline}>
                Decline
              </Button>
              <Button 
                onClick={handleAccept}
                disabled={!isCheckboxChecked}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
