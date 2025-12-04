const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixListing() {
  try {
    console.log('=== FIXING LISTING QUANTITY ===');
    
    // Update listing 1 to have sufficient quantity
    const updated = await prisma.listing.update({
      where: { id: 1 },
      data: { quantity: 500 }
    });
    
    console.log('Updated listing 1:');
    console.log(JSON.stringify(updated, null, 2));
    
    // Check all listings
    const allListings = await prisma.listing.findMany({
      include: { 
        seller: { select: { name: true, role: true } }, 
        product: { select: { name: true } }
      }
    });
    
    console.log('\nAll listings:');
    allListings.forEach(l => {
      console.log(`ID ${l.id}: ${l.product.name} from ${l.seller.name} - ${l.quantity}kg available`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixListing();
