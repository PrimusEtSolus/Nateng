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
      content: `Welcome to NatengHub! These Terms govern how you use our agricultural marketplace. By using NatengHub, you agree to these terms.

1. Account Registration & Eligibility
You need to be at least 18 to sign up. Provide accurate information when registering. Keep your account credentials safe and don't share them. One account per person or business unless we say otherwise. If signing up for a business, make sure you have the authority. Let us know right away if someone uses your account without permission.

2. Platform Usage & User Roles
NatengHub connects different people in the agricultural industry: Farmers (growers who list and sell products), Buyers (people who buy for personal use), Businesses (restaurants, hotels, and places needing bulk orders), Resellers (wholesale traders who buy from farmers and sell to buyers), Logistics (delivery coordination partners), Admin (people who run and moderate the platform).

Transaction rules: Farmers can sell to businesses, resellers, and buyers. Resellers can only sell to buyers. Businesses and resellers can buy from farmers. Buyers can purchase from farmers or resellers. Follow the rules that apply to your role.

3. What You Can't Do
Don't create fake listings or fraudulent transactions. Don't sell illegal or unauthorized agricultural products. Don't misrepresent product quality, origin, or freshness. Don't manipulate prices or engage in unfair trading. Don't try to avoid paying fees or break our rules. Don't use the platform for money laundering or illegal activities. Don't scrape or harvest user data. Don't interfere with how our platform works or its security. Don't pretend to be someone else. Don't break any laws, regulations, or local ordinances.

4. Product Listings
Describe your products accurately and honestly. Show prices in Philippine Pesos (₱). Keep your available quantities up to date. Use photos that show what you're actually selling. State where your products come from (Benguet, Philippines). Follow Philippine agricultural and food safety regulations. Clearly state minimum order quantities.

5. Payments, Transactions & Delivery
We process payments securely through our platform. Buyers need to pay within 48 hours of confirming an order. Sellers should fulfill orders within the agreed time. Delivery scheduling follows Benguet truck ban rules. Report any problems within 7 days of delivery. We might hold payments in escrow while resolving disputes. Refunds follow our dispute resolution process.

6. Your Responsibilities
Keep your contact information current. Reply to messages from other users within 24 hours. Follow Philippine agricultural, food safety, and trade laws. Follow Benguet local rules including truck bans. Report any suspicious activity or security issues immediately. Cooperate if we need to investigate something. Pay any taxes that apply to your transactions.

7. Account Suspension & Termination
We can suspend accounts that break these terms. Serious violations might lead to permanent account closure. Suspended users can appeal through our formal process. You can't create new accounts without our permission if you're suspended. We might terminate accounts at our discretion with or without notice. When your account ends, all your rights and permissions end too.

8. Changes to These Terms
We may update these terms from time to time. Keep using the platform means you accept any changes. We'll let you know about important changes by email or on the platform. If you don't agree with changes, your option is to stop using the platform.

9. Governing Law & Jurisdiction
These terms follow Philippine law. Any disputes go through Philippine courts. We comply with the Philippine Data Privacy Act of 2012 (RA 10173). We comply with the Consumer Act of the Philippines (RA 7394). We comply with the E-Commerce Act of the Philippines (RA 8792). International users must follow their local laws too.`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: `Your privacy matters to us. This policy explains how we collect, use, and protect your information, following the Philippine Data Privacy Act of 2012 (RA 10173).

1. Information We Collect
Personal Information: Your name, email, phone, and address. Profile photo if you choose to add one. Government ID only when we need to verify your identity. Tax ID for business accounts.

Business Information: Business type, registration details, tax ID. Where your stall is located, municipality, barangay. Delivery areas and logistics preferences. Payment methods and bank details encrypted.

Transaction Data: Your orders, payments, and shipping info. Your product listings, inventory, and pricing. Messages between you and other users. Delivery schedules and logistics.

Usage Data: When you log in and how you use the platform. Which pages you visit and features you use. Your device type and IP address. Your browser and operating system.

2. Why We Process Your Data
We use your data when you consent to share information with us. To provide our service and run the marketplace for you. When Philippine laws require it. To prevent fraud and make the platform better.

3. How We Use Your Information
To run and improve our marketplace. To process your transactions and payments. To verify who you are and prevent fraud. To communicate with you about orders and updates. To enforce our terms and resolve disputes. To analyze how people use the platform. To follow Philippine laws and help law enforcement when needed.

4. Who We Share Information With
We never sell your personal information. We only share what's necessary with payment processors with your encrypted payment info. Delivery and logistics partners. Cloud and security services. Law enforcement when they legally request it. Regulatory authorities as Philippine law requires. Courts when they issue valid requests. Contact info needed to complete transactions. Business details you choose to show publicly. Aggregated analytics to improve the platform. Statistics that don't identify you personally.

5. How We Protect Your Data
AES-256 encryption for stored data. TLS 1.3 encryption for data in transit. JWT tokens in httpOnly cookies for login security. Rate limiting to prevent password guessing attacks. Regular security checks and updates. Strict access controls and activity logging. Secure password hashing bcrypt with 10 rounds. We'll notify you within 72 hours if there's a data breach per RA 10173.

6. Your Rights RA 10173
You can ask for a copy of your personal information. Update inaccurate or incomplete information. Ask us to delete your information with some exceptions. Ask us to limit how we use your data. Receive your data in a structured format. Tell us if you don't agree with how we use your data. Take back your consent when you can. To use these rights, email our Data Protection Officer at privacy@natenghub.com.

7. How Long We Keep Your Data
We keep data while your account is active. Transaction records 7 years for Philippine tax compliance. Audit logs 3 years for security and compliance. Deleted accounts 30 days unless law requires us to keep it longer. Marketing data 2 years from your last interaction. Legal holds indefinitely if law or litigation requires it.

8. International Data Transfers
Your data is mostly processed and stored in the Philippines. If we transfer it internationally, we make sure it's protected under RA 10173 standards. We use Standard Contractual Clauses SCCs where needed. We check that destination countries have good data protection laws. We'll let you know about any international transfers.

9. Cookies and Tracking
Essential cookies needed for the platform to work. Authentication cookies with JWT tokens in httpOnly cookies. Analytics cookies for anonymous usage tracking you can turn these off. LocalStorage for cart data stored on your device not sensitive. You can manage cookies in your browser settings.

10. Children's Privacy
Our service is for people 18 and older. We don't knowingly collect information from minors. If we accidentally collect data from someone under 18, we'll delete it right away.

11. Privacy Policy Updates
We may update this policy sometimes. We'll tell you about important changes 30 days ahead. Keep using the platform means you accept the updated policy. Last updated April 2026.`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: `Here's what you should know about what we're responsible for and what you're responsible for.

1. What Our Platform Does
NatengHub connects people in the agricultural industry. We're not a seller, buyer, or guarantor of any transaction. We don't verify product quality, freshness, or farming practices. We don't guarantee delivery, quality, or that products are fit for any purpose. We're just the middleman connecting buyers and sellers.

2. Your Responsibility for Transactions
You're responsible for your own transactions and interactions. Check product quality, origin, and freshness before buying. Look at seller ratings and reviews when available. Do your homework before making big purchases. Use secure payment methods and safe practices. Report anything suspicious right away.

3. Service Availability
We try to keep the platform running 99.9% of the time but can't promise it'll never go down. Scheduled maintenance might interrupt service and we'll let you know ahead of time. We're not responsible for business losses from downtime. Third-party services like payment processors and delivery companies have their own limitations. Your internet connection and device are your responsibility.

4. Limiting Our Liability
To the extent the law allows, our total liability is limited to fees you paid in the last 12 months. We're not liable for indirect, consequential, or punitive damages. This includes lost profits, lost data, or lost business opportunities. This includes damages from business interruption or lost information. This applies no matter what kind of claim it is contract, tort, or otherwise. Nothing here limits your rights under the Consumer Act of the Philippines RA 7394. You keep all your statutory rights and remedies as a consumer.

5. Indemnification
You agree to protect NatengHub and its partners from claims from your violation of these Terms. Claims from infringing on other people's rights. Claims from fraudulent or illegal activities. Claims from product liability for items you sell. Claims from your interactions with other users. Reasonable legal fees and costs from defending these claims.

6. Things Beyond Our Control
We're not liable for failures or delays caused by events we can't control like natural disasters, extreme weather, agricultural disasters. Government actions, regulations, ordinances, or embargoes. Internet failures, power outages, telecom disruptions. Strikes, civil unrest, pandemics, or public health emergencies. Terrorism, war, or hostilities.

7. Product Liability
Sellers are responsible for product quality, safety, and compliance. Sellers must follow Philippine food safety and agricultural regulations. Buyers assume the risks of consuming products. NatengHub isn't liable for product-related injuries or illnesses. Product quality disputes go through our dispute resolution process.

8. No Warranties
To the extent the law allows, we provide the platform AS IS without warranties. We don't make any warranties express or implied. This includes that it's merchantable or fit for a particular purpose. That it doesn't infringe on third-party rights. About accuracy, reliability, or availability. About security or absence of viruses or harmful code. We don't guarantee the platform will meet your needs or expectations.

9. Consumer Protection
These limits follow the Consumer Act of the Philippines RA 7394. Consumers keep all their statutory rights under Philippine law. Nothing here waives mandatory consumer protections. For consumer disputes, Philippine consumer protection laws apply.`
    },
    {
      id: 'disputes',
      title: 'Dispute Resolution',
      content: `We have a fair process for resolving conflicts, following Philippine consumer protection laws.

1. Types of Disputes We Handle
Product quality, freshness, or description problems. Delivery failures, delays, or damages. Payment issues or refund requests. Communication problems or not responding. Terms of Service violations. Fraudulent or suspicious activities. Account suspension or termination appeals.

2. How We Resolve Disputes
Step 1 Talk It Out Days 1-3: Try to resolve directly through platform messaging. Keep records of all your communication. Respond within 24 hours.

Step 2 Platform Mediation Days 4-8: Submit a dispute through our form. A mediator helps you communicate. The mediator might suggest solutions.

Step 3 Submit Evidence Days 9-15: Both sides submit evidence supporting their claims. Evidence includes photos, screenshots, receipts, tracking info. We review everything you submit.

Step 4 Final Decision Days 16-20: We issue a decision based on our Terms and the evidence. The decision includes specific actions and timelines. Both parties must follow the decision.

3. What Evidence You Need
Clear photos with timestamps showing products or issues. Screenshots of all your communications. Delivery confirmations, tracking numbers, proof of delivery. Payment receipts, transaction records, bank statements. Product descriptions and original listing details. Any other relevant documentation.

4. Possible Outcomes
Full or partial refund to buyer from seller or our escrow. Return products to seller with shipping reimbursement. Account suspension or warning for rule violations. Permanent ban for serious or repeated violations. Compensation for damages in proven fraud cases. No action if evidence is insufficient or the claim is invalid.

5. How Long It Takes
Simple disputes resolved within 7 days. Complex disputes resolved within 14 days. Appeals reviewed within 7 days of submission. Legal matters referred to authorities immediately. Emergency suspensions get immediate action with review within 48 hours.

6. Fair Process
Both sides get to present evidence. Decisions are based on our Terms and the evidence submitted. Decisions are made by impartial mediators. You can appeal within 3 days of a decision. We provide written reasoning for all decisions. We keep records for audit and compliance.

7. How to Appeal
Submit appeal within 3 days of the decision. Provide new evidence that wasn't considered before. Explain specifically why you disagree with the decision. A different mediator reviews appeals. The appeal decision is final. Account ban appeals can be submitted through the banned user dashboard.

8. Your Consumer Rights RA 7394
You keep all rights under the Consumer Act of the Philippines. Our dispute process doesn't take away your statutory rights. You can escalate to DTI Department of Trade and Industry. You can file complaints with the National Consumer Affairs Council. We cooperate with all consumer protection investigations.

9. Taking It Further
If you're not happy with our resolution, you can file a complaint with DTI Department of Trade and Industry. Seek mediation through the National Consumer Affairs Council. File a case in Philippine courts. Report to law enforcement for criminal matters. We'll provide all documentation and evidence for legal proceedings.

10. Ban Appeals
Banned users can submit formal appeals through our system. Appeals should include a clear explanation of why we should lift the ban. Evidence supporting your case. Commitment to follow the Terms going forward. Admin team reviews appeals within 7 days. Approved appeals restore your account. Rejected appeals can be escalated for higher-level review.

11. Special Situations
Emergency suspensions for fraud get immediate action with review within 48 hours. Public health or safety concerns get immediate action with fast review. Multiple violations get stronger penalties and longer review. We share information immediately when cooperating with law enforcement.`
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      content: `This section explains who owns what and how content can be used.

1. What We Own
NatengHub owns all the intellectual property in the platform. This includes the software, designs, logos, trademarks, and branding. This includes the NatengHub name, tagline, and how everything looks. This includes our proprietary algorithms and business logic. All rights are reserved under Philippine Intellectual Property Code RA 8293.

2. Content You Create
You still own product photos and images you upload. Product descriptions and listings you create. Reviews and feedback you provide. Messages and communications you send. Business information and details you provide.

License you give us: Permission to use, display, and distribute your content. Right to modify content for formatting or to improve the platform. Right to use content for marketing with attribution. This license ends when you delete the content or close your account.

3. Content You Shouldn't Upload
Don't upload or share content that infringes on other people's intellectual property rights. Violates copyright, trademark, or patent laws. Uses logos, brands, or trademarks without permission. Includes counterfeit or unauthorized agricultural products. Contains defamatory or misleading information. Breaks Philippine laws or international treaties.

4. Product Images and Descriptions
Make sure you have rights to all images you upload. Get authorization if you're showing any brands or trademarks. Product descriptions should be original or properly attributed. Don't misrepresent where products come from or if they're authentic. You agree to protect us from IP claims related to your content.

5. Our Trademarks
The NatengHub name and logo are registered trademarks. You can't use our trademarks without written permission. Don't create misleading associations with our brand. Don't use our branding to endorse unauthorized products. All goodwill from using our trademarks belongs to NatengHub.

6. Third-Party IP
We might use third-party software or services under license. These licenses have restrictions on reverse engineering. Don't try to get around or violate these licenses. We respect third-party IP rights and expect you to do the same.

7. Copyright Issues
If someone is using your content without permission, send a notice to copyright@natenghub.com with your signature physical or electronic. What copyrighted work is being used. Where the infringing material is. Your contact information. A statement that you believe in good faith this is infringement. A statement that the information is accurate under penalty of perjury. We'll respond following Philippine law and international treaties.

8. Feedback and Suggestions
Any feedback you give us becomes our property. We might use feedback to improve the platform without paying you. You waive any claims to feedback you voluntarily provide. This doesn't apply to confidential information shared under an NDA.

9. Open Source Software
We might use open source software components. These are licensed under their respective licenses. You can ask to see the open source licenses. We follow all open source license requirements.

10. International IP
We respect international IP treaties and conventions. We follow the Berne Convention, TRIPS Agreement, and WIPO treaties. International users must follow their local IP laws. Cross-border IP disputes follow applicable treaties.

11. IP Disputes
IP disputes go through our dispute resolution process. Serious infringement might lead to immediate account suspension. We might remove infringing content without warning. Repeated infringement can result in a permanent ban.`
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
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
