// Test script to verify marketplace rules
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMarketplaceRules() {
  console.log('🧪 Testing Marketplace Rules...\n');

  try {
    // Test 1: Buyer should see both farmer and reseller listings
    console.log('📋 Test 1: Buyer visibility (should see farmer + reseller listings)');
    const buyerResponse = await fetch(`${BASE_URL}/api/listings?available=true&userRole=buyer`);
    const buyerListings = await buyerResponse.json();
    console.log(`   Buyer can see ${buyerListings.length} listings`);
    buyerListings.forEach(listing => {
      console.log(`   - ${listing.product.name} from ${listing.seller.role} (${listing.seller.name})`);
    });

    // Test 2: Reseller should see only farmer listings (for wholesale)
    console.log('\n📋 Test 2: Reseller wholesale visibility (should see only farmer listings)');
    const resellerResponse = await fetch(`${BASE_URL}/api/listings?available=true&userRole=reseller`);
    const resellerListings = await resellerResponse.json();
    console.log(`   Reseller can see ${resellerListings.length} listings`);
    resellerListings.forEach(listing => {
      console.log(`   - ${listing.product.name} from ${listing.seller.role} (${listing.seller.name})`);
    });

    // Test 3: Business should see only farmer listings
    console.log('\n📋 Test 3: Business visibility (should see only farmer listings)');
    const businessResponse = await fetch(`${BASE_URL}/api/listings?available=true&userRole=business`);
    const businessListings = await businessResponse.json();
    console.log(`   Business can see ${businessListings.length} listings`);
    businessListings.forEach(listing => {
      console.log(`   - ${listing.product.name} from ${listing.seller.role} (${listing.seller.name})`);
    });

    // Verify expectations
    console.log('\n✅ Verification:');
    console.log(`   Buyer sees both farmer and reseller: ${buyerListings.some(l => l.seller.role === 'farmer') && buyerListings.some(l => l.seller.role === 'reseller') ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Reseller sees only farmers: ${resellerListings.every(l => l.seller.role === 'farmer') && resellerListings.some(l => l.seller.role === 'farmer') ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Business sees only farmers: ${businessListings.every(l => l.seller.role === 'farmer') && businessListings.some(l => l.seller.role === 'farmer') ? '✅ PASS' : '❌ FAIL'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMarketplaceRules();
