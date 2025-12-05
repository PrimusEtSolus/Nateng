// Analytics tracking utility

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
      // Get or create session ID
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      this.sessionId = sessionId
    }
  }

  async track(event: AnalyticsEvent) {
    try {
      // Add session ID if not provided
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
      console.error('Failed to track analytics event:', error)
    }
  }

  // Convenience methods for common events
  trackPageView(page: string, userId?: number) {
    return this.track({
      eventType: 'page_view',
      userId,
      metadata: { page },
    })
  }

  trackProductView(productId: number, productName: string, userId?: number) {
    return this.track({
      eventType: 'product_view',
      userId,
      metadata: { productId, productName },
    })
  }

  trackAddToCart(productId: number, productName: string, quantity: number, userId?: number) {
    return this.track({
      eventType: 'add_to_cart',
      userId,
      metadata: {.
      productId.
      .
     })
  }

iat
  Tru
 1. 1 1.
 1 1 \
 1 1, 1与管理
  p
 .
 1.
  ..
  1.
  1iq
 .
  '.
 .
  .
.Sub
 S
 .
  .
.
 .</think>
<think></think>
<tool_call>write_to_file
<arg_key>CodeContent</arg_key>
<arg_value>// Analytics tracking utility

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
      // Get or create session ID
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      this.sessionId = sessionId
    }
  }

  async track(event: AnalyticsEvent) {
    try {
      // Add session ID if not provided
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
      console.error('Failed to track analytics event:', error)
    }
  }

  // Convenience methods for common events
  trackPageView(page: string, userId?: number) {
    return this.track({
      eventType: 'page_view',
      userId,
      metadata: { page },
    })
  }

  trackProductView(productId: number, productName: string, userId?: number) {
    return this.track({
      eventType: 'product_view',
      userId,
      metadata: { productId, productName },
    })
  }

  trackAddToCart(productId: number, productName: string, quantity: number, userId?: number) {
    return this.track({
      eventType: 'add_to_cart',
      userId,
      metadata: { productId, productName, quantity },
    })
  }

  trackOrderPlaced(orderId: number, totalAmount: number, userId?: number) {
    return this.track({
      eventType: 'order_placed',
      userId,
      metadata: { orderId, totalAmount },
    })
  }

  trackSearch(searchTerm: string, resultsCount: number, userId?: number) {
    return this.track({
      eventType: 'search',
      userId,
      metadata: { searchTerm, resultsCount },
    })
  }

  trackUserLogin(userId: number, userRole: string) {
    return this.track({
      eventType: 'user_login',
      userId,
      metadata: { userRole },
    })
  }

  trackUserRegister(userId: number, userRole: string) {
    return this.track({
      eventType: 'user_register',
      userId,
      metadata: { userRole },
    })
  }
}

// Export singleton instance
export const analytics = new Analytics()
