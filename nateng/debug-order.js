const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugOrder() {
  try {
    console.log('=== DEBUGGING ORDER CREATION ===');
    
    // Check listing 1
    const listing = await prisma.listing.findUnique({ 
      where: { id: 1 }, 
      include: { 
        seller: { select: { id: true, name: true, role: true, minimumOrderKg: true } }, 
        product: { include: { farmer: { select: { id: true, name: true, minimumOrderKg: true } } } } 
      }
    });
    
    console.log('Listing 1:');
    console.log(JSON.stringify(listing, null, 2));
    
    // Check buyers and sellers
    const buyer = await prisma.user.findUnique({ where: { id: 4 } });
    const seller = await prisma.user.findUnique({ where: { id: 1 } });
    
    console.log('\nBuyer (ID 4):');
    console.log(JSON.stringify(buyer, null, 2));
    
    console.log('\nSeller (ID 1):');
    console.log(JSON.stringify(seller, null, 2));
    
    // Try to create the order manually
    console.log('\n=== TRYING ORDER CREATION ===');
    const orderData = {
      buyerId: 4,
      sellerId: 1,
      items: [
        { listingId: 1, quantity: 100 }
      ]
    };
    
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrder();
