"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Truck, User, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface ProposalsListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  user: any
  onProposalAgreed: (schedule: any) => void
}

export function ProposalsListDialog({ 
  open, 
  onOpenChange, 
  orderId, 
  user, 
  onProposalAgreed 
}: ProposalsListDialogProps) {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null)
  const [notes, setNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      fetchProposals()
    }
  }, [open, orderId])

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/delivery-schedule?orderId=${orderId}&status=proposed`)
      if (response.ok) {
        const data = await response.json()
        setProposals(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgreeToProposal = async (proposal: any) => {
    setSelectedProposal(proposal)
  }

  const handleSubmitAgreement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProposal) return

    setActionLoading(true)
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`/api/delivery-schedule/${selectedProposal.id}/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer token_${currentUser.id}_${Date.now()}`
        },
        body: JSON.stringify({
          action: 'confirm',
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to agree to proposal')
      }

      const updatedSchedule = await response.json()
      toast.success("Schedule agreed upon")
      onProposalAgreed(updatedSchedule)
      onOpenChange(false)
      setSelectedProposal(null)
      setNotes("")
    } catch (error: any) {
      toast.error(error.message || "Failed to agree to proposal")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectProposal = async (proposal: any) => {
    if (!confirm("Are you sure you want to reject this proposal?")) return

    setActionLoading(true)
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`/api/delivery-schedule/${proposal.id}/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer token_${currentUser.id}_${Date.now()}`
        },
        body: JSON.stringify({
          action: 'reject',
          notes: 'Proposal rejected'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject proposal')
      }

      toast.success("Proposal rejected")
      fetchProposals() // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to reject proposal")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Delivery Schedule Proposals</DialogTitle>
        </DialogHeader>
        
        {selectedProposal ? (
          // Agreement view for selected proposal
          <div className="space-y-6 mt-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Proposed by: {selectedProposal.proposer.name}</span>
                  <p className="text-sm text-gray-600">{selectedProposal.proposer.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedProposal.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProposal.scheduledTime}</p>
                  </div>
                </div>
              </div>

              {selectedProposal.deliveryAddress && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Address</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProposal.deliveryAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedProposal.notes && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Notes from proposer:</p>
                <p className="text-sm text-blue-700">{selectedProposal.notes}</p>
              </div>
            )}

            <form onSubmit={handleSubmitAgreement} className="space-y-6">
              <div>
                <Label htmlFor="agreementNotes" className="text-sm font-medium text-gray-900">
                  Your Notes (Optional)
                </Label>
                <Textarea
                  id="agreementNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or conditions for your agreement..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProposal(null)}
                  disabled={actionLoading}
                  className="flex-1 h-11"
                >
                  Back to List
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 h-11 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {actionLoading ? "Processing..." : "Agree to This Proposal"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // List view of all proposals
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-gray-900"></div>
                <p className="text-sm text-gray-600 mt-2">Loading proposals...</p>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No proposals yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to propose a schedule</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{proposal.proposer.name}</span>
                        <p className="text-sm text-gray-600">{proposal.proposer.role}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(proposal.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(proposal.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{proposal.scheduledTime}</span>
                    </div>
                  </div>

                  {proposal.deliveryAddress && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{proposal.deliveryAddress}</span>
                    </div>
                  )}

                  {proposal.notes && (
                    <p className="text-sm text-gray-600 mb-3 italic">"{proposal.notes}"</p>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleAgreeToProposal(proposal)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Agree
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectProposal(proposal)}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
