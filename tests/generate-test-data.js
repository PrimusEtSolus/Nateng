const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function generateTestData() {
  try {
    console.log('Generating test data for analytics...')

    // Create test users with different roles
    const testUsers = [
      { name: 'John Farmer', email: 'john@farmer.com', role: 'farmer', minimumOrderKg: 50 },
      { name: 'Jane Farmer', email: 'jane@farmer.com', role: 'farmer', minimumOrderKg: 100 },
      { name: 'Bob Buyer', email: 'bob@buyer.com', role: 'buyer' },
      { name: 'Alice Buyer', email: 'alice@buyer.com', role: 'buyer' },
      { name: 'Charlie Business', email: 'charlie@business.com', role: 'business' },
      { name: 'Diana Reseller', email: 'diana@reseller.com', role: 'reseller' },
      { name: 'Eve Buyer', email: 'eve@buyer.com', role: 'buyer' },
      { name: 'Frank Business', email: 'frank@business.com', role: 'business' }
    ]

    const createdUsers = []
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash('password123', 10)
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
          address: 'Test Address',
          city: 'Baguio',
          province: 'Benguet',
          country: 'Philippines'
        }
      })
      createdUsers.push(user)
      console.log(`Created user: ${user.name} (${user.role})`)
    }

    // Create test products for farmers
    const products = [
      { name: 'Fresh Strawberries', description: 'Sweet and juicy strawberries from Benguet', farmerId: createdUsers[0].id },
      { name: 'Organic Lettuce', description: 'Crisp organic lettuce', farmerId: createdUsers[0].id },
      { name: 'Highland Potatoes', description: 'Premium quality potatoes', farmerId: createdUsers[1].id },
      { name: 'Fresh Carrots', description: 'Orange and crunchy carrots', farmerId: createdUsers[1].id },
      { name: 'Bell Peppers', description: 'Colorful bell peppers', farmerId: createdUsers[0].id }
    ]

    const createdProducts = []
    for (const productData of products) {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: productData.name,
          farmerId: productData.farmerId
        }
      })

      let product
      if (existingProduct) {
        product = existingProduct
      } else {
        product = await prisma.product.create({
          data: {
            ...productData,
            imageUrl: `https://example.com/${productData.name.toLowerCase().replace(' ', '-')}.jpg`
          }
        })
      }
      createdProducts.push(product)
      console.log(`Created product: ${product.name}`)
    }

    // Create listings for products
    const listings = []
    for (const product of createdProducts) {
      const listing = await prisma.listing.create({
        data: {
          productId: product.id,
          sellerId: product.farmerId,
          priceCents: Math.floor(Math.random() * 5000) + 1000, // 10-60 PHP per kg in cents
          quantity: Math.floor(Math.random() * 500) + 100, // 100-600 kg
          available: true
        }
      })
      listings.push(listing)
      console.log(`Created listing for ${product.name}`)
    }

    // Generate orders over different times (last 6 months)
    const buyerUsers = createdUsers.filter(u => u.role === 'buyer' || u.role === 'business' || u.role === 'reseller')
    const sellerUsers = createdUsers.filter(u => u.role === 'farmer' || u.role === 'reseller')

    for (let i = 0; i < 50; i++) {
      const buyer = buyerUsers[Math.floor(Math.random() * buyerUsers.length)]
      const seller = sellerUsers[Math.floor(Math.random() * sellerUsers.length)]
      const availableListings = listings.filter(l => l.sellerId === seller.id && l.available)
      
      if (availableListings.length === 0) continue

      const listing = availableListings[Math.floor(Math.random() * availableListings.length)]
      const quantity = Math.min(Math.floor(Math.random() * 100) + 10, listing.quantity)
      
      // Create random date within last 6 months
      const date = new Date()
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6))
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))
      
      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          totalCents: quantity * listing.priceCents,
          status: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 4)],
          createdAt: date,
          items: {
            create: {
              listingId: listing.id,
              quantity: quantity,
              priceCents: listing.priceCents
            }
          }
        }
      })

      // Update listing quantity
      await prisma.listing.update({
        where: { id: listing.id },
        data: { quantity: listing.quantity - quantity }
      })

      console.log(`Created order #${order.id}: ${buyer.name} -> ${seller.name} (${new Date(date).toLocaleDateString()})`)
    }

    console.log('Test data generation completed!')
    console.log('\nTest users created:')
    createdUsers.forEach(user => {
      console.log(`  ${user.name} (${user.email}) - ${user.role}`)
    })

  } catch (error) {
    console.error('Error generating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateTestData()
