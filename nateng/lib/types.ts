// Centralized type definitions for the application

export type UserRole = 'farmer' | 'buyer' | 'business' | 'reseller' | 'admin' | 'logistics'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  profilePhotoUrl?: string
  createdAt?: string
  businessName?: string
  isBanned?: boolean
}

export interface Product {
  id: number
  name: string
  description: string | null
  farmerId: number
  createdAt: string
  farmer?: {
    id: number
    name: string
    email: string
  }
  listings?: Listing[]
}

export interface Listing {
  id: number
  productId: number
  sellerId: number
  priceCents: number
  quantity: number
  available: boolean
  createdAt: string
  product?: Product & {
    farmer?: {
      id: number
      name: string
      email: string
    }
  }
  seller?: {
    id: number
    name: string
    role: string
    email?: string
  }
}

export interface OrderItem {
  id: number
  orderId: number
  listingId: number
  quantity: number
  priceCents: number
  listing?: {
    id: number
    product: {
      id: number
      name: string
    }
  }
}

export interface Order {
  id: number
  buyerId: number
  sellerId: number
  totalCents: number
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  deliveryOption?: 'delivery' | 'pickup' | null
  scheduledDate?: string | null
  scheduledTime?: string | null
  route?: string | null
  isCBD?: boolean | null
  truckWeightKg?: number | null
  deliveryAddress?: string | null
  isExempt?: boolean | null
  exemptionType?: string | null
  items: OrderItem[]
  buyer?: User | null
  seller: {
    id: number
    name: string
    email?: string
    role?: string
  }
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  orderId?: number | null
  content: string
  read: boolean
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  link?: string | null
  read: boolean
  createdAt: string
}

export interface ApiError {
  error: string
  message?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

