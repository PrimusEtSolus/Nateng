// Mock data for NatengHub - Agricultural Marketplace

export interface Crop {
  id: string
  farmerId: string
  name: string
  category: string
  harvestQuantity: number
  unit: string
  wholesalePrice: number
  minOrderQty: number
  description: string
  image: string
  harvestDate: string
  status: "available" | "low_stock" | "out_of_stock"
}

export interface WholesaleOrder {
  id: string
  buyerId: string
  buyerName: string
  buyerType: "business" | "reseller"
  farmerId: string
  farmerName: string
  crop: string
  cropId: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  status: "pending" | "confirmed" | "ready" | "completed" | "rejected"
  orderDate: string
  notes?: string
}

export interface RetailProduct {
  id: string
  cropId: string
  resellerId: string
  resellerName: string
  resellerLocation: string
  farmerId: string
  farmerName: string
  farmerLocation: string
  name: string
  category: string
  pricePerKg: number
  availableKg: number
  minOrderKg: number
  image: string
  rating: number
  soldCount: number
  description: string
}

export interface CartItem {
  productId: string
  quantity: number
  pricePerKg: number
}

export type UserRole = "farmer" | "buyer" | "business" | "reseller"

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  phone?: string
  address?: string
  municipality?: string
  businessName?: string
  businessType?: string // For business: "restaurant" | "hotel" | "institution" | "catering"
  avatar?: string
  joinedDate: string
  verified: boolean
}

export const mockUsers: User[] = [
  {
    id: "farmer-1",
    email: "farmer@email.com",
    password: "farmer",
    role: "farmer",
    name: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    address: "Brgy. Shilan, La Trinidad, Benguet",
    municipality: "La Trinidad",
    joinedDate: "2024-01-15",
    verified: true,
  },
  {
    id: "buyer-1",
    email: "buyer@email.com",
    password: "buyer",
    role: "buyer",
    name: "Maria Santos",
    phone: "+63 918 234 5678",
    address: "123 Main St, Baguio City",
    joinedDate: "2024-03-20",
    verified: true,
  },
  {
    id: "business-1",
    email: "business@email.com",
    password: "business",
    role: "business",
    name: "Chef Antonio",
    phone: "+63 919 345 6789",
    address: "Session Road, Baguio City",
    businessName: "Highland Restaurant",
    businessType: "restaurant",
    joinedDate: "2024-02-10",
    verified: true,
  },
  {
    id: "reseller-1",
    email: "reseller@email.com",
    password: "reseller",
    role: "reseller",
    name: "Pedro Reyes",
    phone: "+63 920 456 7890",
    address: "Baguio City Public Market, Stall 45",
    businessName: "Green Market Co",
    joinedDate: "2024-02-10",
    verified: true,
  },
]

export const mockCrops: Crop[] = [
  {
    id: "crop-1",
    farmerId: "farmer-1",
    name: "Tomatoes",
    category: "Vegetables",
    harvestQuantity: 500,
    unit: "kg",
    wholesalePrice: 60,
    minOrderQty: 50,
    description: "Fresh highland tomatoes from La Trinidad. Perfect for restaurants and retailers.",
    image: "/ripe-tomatoes.png",
    harvestDate: "2024-12-01",
    status: "available",
  },
  {
    id: "crop-2",
    farmerId: "farmer-1",
    name: "Cabbage",
    category: "Vegetables",
    harvestQuantity: 300,
    unit: "kg",
    wholesalePrice: 40,
    minOrderQty: 30,
    description: "Crisp Benguet cabbage, freshly harvested from cool highland farms.",
    image: "/fresh-cabbage.png",
    harvestDate: "2024-12-01",
    status: "available",
  },
  {
    id: "crop-3",
    farmerId: "farmer-1",
    name: "Carrots",
    category: "Root Vegetables",
    harvestQuantity: 200,
    unit: "kg",
    wholesalePrice: 45,
    minOrderQty: 25,
    description: "Sweet and crunchy highland carrots, rich in nutrients.",
    image: "/bunch-of-carrots.png",
    harvestDate: "2024-11-28",
    status: "available",
  },
  {
    id: "crop-4",
    farmerId: "farmer-1",
    name: "Lettuce",
    category: "Leafy Greens",
    harvestQuantity: 150,
    unit: "kg",
    wholesalePrice: 80,
    minOrderQty: 20,
    description: "Fresh iceberg lettuce, perfect for salads and restaurants.",
    image: "/fresh-lettuce.png",
    harvestDate: "2024-12-01",
    status: "low_stock",
  },
  {
    id: "crop-5",
    farmerId: "farmer-1",
    name: "Bell Peppers",
    category: "Vegetables",
    harvestQuantity: 100,
    unit: "kg",
    wholesalePrice: 120,
    minOrderQty: 15,
    description: "Colorful bell peppers - red, yellow, and green varieties available.",
    image: "/colorful-bell-peppers.png",
    harvestDate: "2024-11-30",
    status: "available",
  },
  {
    id: "crop-6",
    farmerId: "farmer-1",
    name: "Eggplant",
    category: "Vegetables",
    harvestQuantity: 180,
    unit: "kg",
    wholesalePrice: 55,
    minOrderQty: 20,
    description: "Fresh purple eggplants, perfect for Filipino dishes.",
    image: "/single-ripe-eggplant.png",
    harvestDate: "2024-12-01",
    status: "available",
  },
]

export const mockWholesaleOrders: WholesaleOrder[] = [
  {
    id: "order-1",
    buyerId: "reseller-1",
    buyerName: "Green Market Co",
    buyerType: "reseller",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    crop: "Tomatoes",
    cropId: "crop-1",
    quantity: 100,
    unit: "kg",
    pricePerUnit: 60,
    total: 6000,
    status: "pending",
    orderDate: "2024-12-01",
    notes: "Please deliver before 8am",
  },
  {
    id: "order-2",
    buyerId: "business-1",
    buyerName: "Highland Restaurant",
    buyerType: "business",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    crop: "Cabbage",
    cropId: "crop-2",
    quantity: 50,
    unit: "kg",
    pricePerUnit: 40,
    total: 2000,
    status: "confirmed",
    orderDate: "2024-11-30",
  },
  {
    id: "order-3",
    buyerId: "reseller-1",
    buyerName: "Green Market Co",
    buyerType: "reseller",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    crop: "Carrots",
    cropId: "crop-3",
    quantity: 75,
    unit: "kg",
    pricePerUnit: 45,
    total: 3375,
    status: "ready",
    orderDate: "2024-11-29",
  },
  {
    id: "order-4",
    buyerId: "business-1",
    buyerName: "Highland Restaurant",
    buyerType: "business",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    crop: "Lettuce",
    cropId: "crop-4",
    quantity: 30,
    unit: "kg",
    pricePerUnit: 80,
    total: 2400,
    status: "completed",
    orderDate: "2024-11-25",
  },
]

export const mockRetailProducts: RetailProduct[] = [
  {
    id: "retail-1",
    cropId: "crop-1",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Fresh Highland Tomatoes",
    category: "Vegetables",
    pricePerKg: 85,
    availableKg: 200,
    minOrderKg: 1,
    image: "/ripe-tomatoes.png",
    rating: 4.8,
    soldCount: 156,
    description: "Farm-fresh tomatoes from the highlands of Benguet. Perfect for cooking and salads.",
  },
  {
    id: "retail-2",
    cropId: "crop-2",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Crisp Benguet Cabbage",
    category: "Vegetables",
    pricePerKg: 55,
    availableKg: 150,
    minOrderKg: 1,
    image: "/fresh-cabbage.png",
    rating: 4.9,
    soldCount: 203,
    description: "Fresh cabbage grown in the cool climate of Benguet. Great for stir-fry and salads.",
  },
  {
    id: "retail-3",
    cropId: "crop-3",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Sweet Highland Carrots",
    category: "Root Vegetables",
    pricePerKg: 60,
    availableKg: 100,
    minOrderKg: 0.5,
    image: "/bunch-of-carrots.png",
    rating: 4.7,
    soldCount: 89,
    description: "Naturally sweet carrots from Benguet highlands. Rich in beta-carotene.",
  },
  {
    id: "retail-4",
    cropId: "crop-4",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Fresh Iceberg Lettuce",
    category: "Leafy Greens",
    pricePerKg: 100,
    availableKg: 80,
    minOrderKg: 0.5,
    image: "/fresh-lettuce.png",
    rating: 4.6,
    soldCount: 67,
    description: "Crisp and fresh lettuce, perfect for salads and sandwiches.",
  },
  {
    id: "retail-5",
    cropId: "crop-5",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Colorful Bell Peppers",
    category: "Vegetables",
    pricePerKg: 150,
    availableKg: 60,
    minOrderKg: 0.5,
    image: "/colorful-bell-peppers.png",
    rating: 4.9,
    soldCount: 45,
    description: "Mixed bell peppers - red, yellow, and green. Perfect for cooking.",
  },
  {
    id: "retail-6",
    cropId: "crop-6",
    resellerId: "reseller-1",
    resellerName: "Green Market Co",
    resellerLocation: "Baguio City Public Market",
    farmerId: "farmer-1",
    farmerName: "Juan Dela Cruz",
    farmerLocation: "La Trinidad, Benguet",
    name: "Purple Eggplant",
    category: "Vegetables",
    pricePerKg: 70,
    availableKg: 120,
    minOrderKg: 1,
    image: "/single-ripe-eggplant.png",
    rating: 4.5,
    soldCount: 112,
    description: "Fresh eggplants perfect for grilling and cooking Filipino dishes.",
  },
]

// Helper function to get crops available for wholesale (for business/reseller portal)
export function getWholesaleCrops(): (Crop & { farmerName: string })[] {
  return mockCrops.map((crop) => ({
    ...crop,
    farmerName: mockUsers.find((u) => u.id === crop.farmerId)?.name || "Unknown Farmer",
  }))
}

// Categories for filtering
export const productCategories = ["All", "Vegetables", "Leafy Greens", "Root Vegetables", "Fruits"]

export const benguetMunicipalities = [
  "Atok",
  "Bakun",
  "Bokod",
  "Buguias",
  "Itogon",
  "Kabayan",
  "Kapangan",
  "Kibungan",
  "La Trinidad",
  "Mankayan",
  "Sablan",
  "Tuba",
  "Tublay",
]

// Business types for the business registration
export const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "institution", label: "Institution (School, Hospital, etc.)" },
  { value: "catering", label: "Catering Service" },
  { value: "cafeteria", label: "Cafeteria" },
  { value: "other", label: "Other" },
]
