import { z } from 'zod'
import type { UserRole } from '@/lib/types'

// Reusable base schemas
const idParam = z.coerce.number().int().positive()
const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional().default(() => 1),
  limit: z.coerce.number().int().positive().max(100).optional().default(() => 20),
})

// ─── User Schemas ─────────────────────────────────────────────────────────

export const UserCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
  // `admin` role is forbidden on self-registration; only privileged callers may set it
  role: z.enum(['farmer', 'buyer', 'bulkBuyer']).describe('Self-registration cannot create admin users'),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
})

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['farmer', 'buyer', 'bulkBuyer']).optional().describe('Role changes require admin privileges'),
  profilePhotoUrl: z.string().url().optional(),
  phone: z.string().optional(),
  minimumOrderKg: z.number().int().positive().optional(),
  deliveryAreas: z.string().optional(),
  paymentMethods: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

// ─── Product Schemas ────────────────────────────────────────────────────────

export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  farmerId: idParam,
})

export const ProductUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
})

// ─── Listing Schemas ───────────────────────────────────────────────────────

export const ListingCreateSchema = z.object({
  productId: idParam,
  sellerId: idParam,
  priceCents: z.number().int().positive('Price must be a positive integer'),
  quantity: z.number().int().nonnegative('Quantity must be zero or more'),
  available: z.boolean().optional(),
})

export const ListingUpdateSchema = z.object({
  quantity: z.number().int().nonnegative().optional(),
  priceCents: z.number().int().positive().optional(),
  available: z.boolean().optional(),
})

// ─── Order Schemas ──────────────────────────────────────────────────────────

const OrderItemSchema = z.object({
  listingId: idParam,
  quantity: z.number().int().positive('Quantity must be a positive integer'),
})

export const OrderCreateSchema = z.object({
  buyerId: idParam,
  sellerId: idParam,
  items: z.array(OrderItemSchema).min(1, 'At least one order item is required'),
  deliveryAddress: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  route: z.string().optional(),
  isCBD: z.boolean().optional(),
  truckWeightKg: z.number().int().positive().optional(),
  isExempt: z.boolean().optional(),
  exemptionType: z.string().optional(),
})

export const OrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

// ─── Delivery Schedule Schemas ──────────────────────────────────────────────

export const DeliveryScheduleSchema = z.object({
  scheduledDate: z.string().refine((s) => !isNaN(new Date(s).getTime()), 'Invalid date format'),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Time must be in HH:mm format'),
  route: z.string().optional(),
  isCBD: z.boolean().optional(),
  truckWeightKg: z.number().int().positive(),
  deliveryAddress: z.string().optional(),
  isExempt: z.boolean().optional(),
  exemptionType: z.string().optional(),
})

export const DeliveryScheduleCreateSchema = z.object({
  orderId: idParam,
  scheduledDate: z.string().refine((s) => !isNaN(new Date(s).getTime()), 'Invalid date format'),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, 'Time must be in HH:mm format'),
  route: z.string().optional(),
  isCBD: z.boolean().optional(),
  truckWeightKg: z.number().int().positive().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
})

// ─── Message Schemas ──────────────────────────────────────────────────────

export const MessageCreateSchema = z.object({
  receiverId: idParam,
  content: z.string().min(1, 'Message content is required').max(5000),
  orderId: idParam.optional(),
})

// ─── Notification Schemas ──────────────────────────────────────────────────

export const NotificationUpdateSchema = z.object({
  notificationId: idParam,
  read: z.boolean(),
})

// ─── Favorite Schemas ──────────────────────────────────────────────────────

export const FavoriteCreateSchema = z.object({
  listingId: idParam,
})

// ─── Contact Message Schemas ───────────────────────────────────────────────

export const ContactMessageCreateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(3, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
  type: z.enum(['general', 'appeal', 'support', 'business']),
})

export const ContactMarkReviewedSchema = z.object({
  messageId: idParam,
})

// ─── Appeal Schemas ────────────────────────────────────────────────────────

export const AppealCreateSchema = z.object({
  appealReason: z.string().min(10, 'Appeal reason must be at least 10 characters').max(500),
  appealDetails: z.string().max(5000).optional(),
})

// ─── Auth Schemas ──────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().min(1, 'Email or mobile number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['farmer', 'buyer', 'bulkBuyer']).describe('Admin self-registration is forbidden'),
  location: z.string().optional(),
  municipality: z.string().optional(),
  businessType: z.string().optional(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
})

// ─── Admin Schemas ─────────────────────────────────────────────────────────

export const AdminUserDeleteSchema = z.object({
  userId: idParam,
})

export const AdminBanSchema = z.object({
  userId: idParam,
  reason: z.string().min(1, 'Ban reason is required').max(500),
  userEmail: z.string().email(),
})

export const AdminUnbanSchema = z.object({
  userId: idParam,
  userEmail: z.string().email(),
})

export const AdminAppealUpdateSchema = z.object({
  appealId: idParam,
  status: z.enum(['approved', 'rejected']),
  adminEmail: z.string().email(),
  adminNotes: z.string().optional(),
})

export const AdminProductDeleteSchema = z.object({
  productId: idParam,
})

// ─── Delivery Schedule Confirm Schema ──────────────────────────────────────

export const DeliveryScheduleConfirmSchema = z.object({
  action: z.enum(['confirm', 'reject']),
  notes: z.string().optional(),
  orderId: idParam.optional(),
})

// ─── Utility Types ─────────────────────────────────────────────────────────

export type { UserRole }
