export interface AnalyticsEvent {
  eventType: string
  userId?: number
  sessionId?: string
  metadata?: Record<string, any>
}

class Analytics {
  private sessionId: string | null = null

  constructor() {
    this.initSession()
  }

  private initSession() {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      this.sessionId = sessionId
    }
  }

  async track(event: AnalyticsEvent) {
    try {
      // Only track on client-side
      if (typeof window === 'undefined') return
      
      const eventData = {
        ...event,
        sessionId: event.sessionId || this.sessionId,
      }

      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      // Silently fail to avoid breaking the application
      console.debug('Analytics tracking failed (non-critical):', error)
    }
  }

  trackPageView(page: string, userId?: number) {
    return this.track({
      eventType: 'page_view',
      userId,
      metadata: { page },
    })
  }

  trackSearch(searchTerm: string, resultsCount: number, userId?: number) {
    return this.track({
      eventType: 'search',
      userId,
      metadata: { searchTerm, resultsCount },
    })
  }

  trackOrderPlaced(orderId: number, totalAmount: number, userId?: number) {
    return this.track({
      eventType: 'order_placed',
      userId,
      metadata: { orderId, totalAmount },
    })
  }
}

export const analytics = new Analytics()
