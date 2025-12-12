// Mock data for NatengHub - Agricultural Marketplace
// NOTE: These interfaces are for legacy compatibility. New code should use types.ts

export interface LegacyCrop {
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

export interface LegacyWholesaleOrder {
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

export interface LegacyRetailProduct {
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
  status: "available" | "low_stock" | "out_of_stock"
  lastUpdated: string
  rating: number
  soldCount: number
  description: string
}

// Legacy mock data - these should be migrated to database in production
export const mockCrops: LegacyCrop[] = [
  {
    id: "1",
    farmerId: "farmer1",
    name: "Fresh Lettuce",
    category: "Vegetables",
    harvestQuantity: 500,
    unit: "kg",
    wholesalePrice: 50,
    minOrderQty: 50,
    description: "Fresh green lettuce from Benguet highlands",
    image: "/images/lettuce.jpg",
    harvestDate: "2025-12-10",
    status: "available"
  },
  {
    id: "2", 
    farmerId: "farmer1",
    name: "Carrots",
    category: "Vegetables",
    harvestQuantity: 300,
    unit: "kg",
    wholesalePrice: 60,
    minOrderQty: 50,
    description: "Sweet and crunchy carrots",
    image: "/images/carrots.jpg", 
    harvestDate: "2025-12-09",
    status: "available"
  }
];

export const mockOrders: LegacyWholesaleOrder[] = [];
export const mockRetailProducts: LegacyRetailProduct[] = [];

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

// Helper function to get crops available for wholesale (for business/reseller portal)
export function getWholesaleCrops(): (LegacyCrop & { farmerName: string })[] {
  return mockCrops.map((crop) => ({
    ...crop,
    farmerName: `Farmer ${crop.farmerId}`, // Simple farmer name generation
  }))
}
