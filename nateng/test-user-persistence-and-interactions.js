/**
 * Comprehensive Test: User Persistence and Interactions
 * 
 * Tests:
 * 1. User registration and persistence in database
 * 2. User login after registration
 * 3. Users creating products/listings
 * 4. Users creating orders (buyer-seller interaction)
 * 5. Users sending messages to each other
 * 6. Data persistence across multiple requests
 */

const BASE_URL = 'http://localhost:3000';

// Test users - will be created during test
let testUsers = {
  farmer: null,
  buyer: null,
  business: null,
  reseller: null
};

let testProducts = [];
let testListings = [];
let testOrders = [];
let testMessages = [];

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Test 1: Register users and verify persistence
async function testUserRegistration() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: User Registration and Persistence');
  console.log('='.repeat(70));
  
  const timestamp = Date.now();
  const usersToRegister = [
    {
      name: 'Test Farmer',
      email: `testfarmer${timestamp}@test.com`,
      password: 'testpass123',
      role: 'farmer'
    },
    {
      name: 'Test Buyer',
      email: `testbuyer${timestamp}@test.com`,
      password: 'testpass123',
      role: 'buyer'
    },
    {
      name: 'Test Business',
      email: `testbusiness${timestamp}@test.com`,
      password: 'testpass123',
      role: 'business'
    },
    {
      name: 'Test Reseller',
      email: `testreseller${timestamp}@test.com`,
      password: 'testpass123',
      role: 'reseller'
    }
  ];
  
  const results = {};
  
  for (const userData of usersToRegister) {
    console.log(`\n📝 Registering ${userData.role}...`);
    const result = await apiCall('/api/auth/register', 'POST', userData);
    
    if (result.ok && result.data.user) {
      const user = result.data.user;
      testUsers[userData.role] = user;
      results[userData.role] = 'PASS';
      console.log(`   ✅ ${userData.role} registered successfully!`);
      console.log(`      ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    } else {
      results[userData.role] = 'FAIL';
      console.log(`   ❌ Registration failed: ${result.data?.error || result.error}`);
    }
  }
  
  // Verify users can be retrieved
  console.log('\n🔍 Verifying user persistence...');
  for (const [role, user] of Object.entries(testUsers)) {
    if (user) {
      const result = await apiCall(`/api/users/${user.id}`);
      if (result.ok && result.data.id === user.id) {
        console.log(`   ✅ ${role} (ID: ${user.id}) found in database`);
      } else {
        console.log(`   ❌ ${role} (ID: ${user.id}) NOT found in database`);
        results[`${role}_retrieval`] = 'FAIL';
      }
    }
  }
  
  return results;
}

// Test 2: Login with registered users
async function testUserLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: User Login After Registration');
  console.log('='.repeat(70));
  
  const results = {};
  
  for (const [role, user] of Object.entries(testUsers)) {
    if (!user) {
      results[role] = 'SKIP';
      continue;
    }
    
    console.log(`\n🔐 Testing login for ${role}...`);
    const result = await apiCall('/api/auth/login', 'POST', {
      email: user.email,
      password: 'testpass123'
    });
    
    if (result.ok && result.data.user) {
      const loggedInUser = result.data.user;
      if (loggedInUser.id === user.id && loggedInUser.email === user.email) {
        results[role] = 'PASS';
        console.log(`   ✅ ${role} logged in successfully!`);
        console.log(`      Verified: ID ${loggedInUser.id}, Email: ${loggedInUser.email}`);
      } else {
        results[role] = 'FAIL';
        console.log(`   ❌ Login returned different user data`);
      }
    } else {
      results[role] = 'FAIL';
      console.log(`   ❌ Login failed: ${result.data?.error || result.error}`);
    }
  }
  
  return results;
}

// Test 3: Users creating products and listings
async function testProductAndListingCreation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: Product and Listing Creation');
  console.log('='.repeat(70));
  
  if (!testUsers.farmer) {
    console.log('   ⏭️  Skipping - No farmer registered');
    return { status: 'SKIP' };
  }
  
  console.log('\n🌾 Farmer creating product...');
  const productResult = await apiCall('/api/products', 'POST', {
    name: 'Test Tomatoes',
    description: 'Fresh tomatoes from test farm',
    farmerId: testUsers.farmer.id
  });
  
  if (productResult.ok && productResult.data.id) {
    testProducts.push(productResult.data);
    console.log(`   ✅ Product created! ID: ${productResult.data.id}`);
    
    console.log('\n📋 Farmer creating listing...');
    const listingResult = await apiCall('/api/listings', 'POST', {
      productId: productResult.data.id,
      sellerId: testUsers.farmer.id,
      priceCents: 5000, // ₱50.00
      quantity: 100
    });
    
    if (listingResult.ok && listingResult.data.id) {
      testListings.push(listingResult.data);
      console.log(`   ✅ Listing created! ID: ${listingResult.data.id}`);
      console.log(`      Price: ₱${(listingResult.data.priceCents / 100).toFixed(2)}`);
      console.log(`      Quantity: ${listingResult.data.quantity}kg`);
      return { status: 'PASS', productId: productResult.data.id, listingId: listingResult.data.id };
    } else {
      console.log(`   ❌ Listing creation failed: ${listingResult.data?.error || listingResult.error}`);
      return { status: 'FAIL' };
    }
  } else {
    console.log(`   ❌ Product creation failed: ${productResult.data?.error || productResult.error}`);
    return { status: 'FAIL' };
  }
}

// Test 4: Buyer creating order (user interaction)
async function testOrderCreation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: Order Creation (Buyer-Seller Interaction)');
  console.log('='.repeat(70));
  
  if (!testUsers.buyer || !testUsers.farmer || testListings.length === 0) {
    console.log('   ⏭️  Skipping - Missing buyer, farmer, or listings');
    return { status: 'SKIP' };
  }
  
  const listing = testListings[0];
  console.log(`\n🛒 Buyer (ID: ${testUsers.buyer.id}) creating order from Farmer (ID: ${testUsers.farmer.id})...`);
  
  const orderResult = await apiCall('/api/orders', 'POST', {
    buyerId: testUsers.buyer.id,
    sellerId: testUsers.farmer.id,
    items: [
      {
        listingId: listing.id,
        quantity: 10
      }
    ]
  });
  
  if (orderResult.ok && orderResult.data.id) {
    testOrders.push(orderResult.data);
    console.log(`   ✅ Order created! ID: ${orderResult.data.id}`);
    console.log(`      Buyer: ${orderResult.data.buyer?.name || 'N/A'}`);
    console.log(`      Seller: ${orderResult.data.seller?.name || 'N/A'}`);
    console.log(`      Total: ₱${(orderResult.data.totalCents / 100).toFixed(2)}`);
    console.log(`      Status: ${orderResult.data.status}`);
    
    // Verify order can be retrieved
    console.log('\n🔍 Verifying order persistence...');
    const retrieveResult = await apiCall(`/api/orders/${orderResult.data.id}`);
    if (retrieveResult.ok && retrieveResult.data.id === orderResult.data.id) {
      console.log(`   ✅ Order found in database`);
      return { status: 'PASS', orderId: orderResult.data.id };
    } else {
      console.log(`   ❌ Order NOT found in database`);
      return { status: 'FAIL' };
    }
  } else {
    console.log(`   ❌ Order creation failed: ${orderResult.data?.error || orderResult.error}`);
    return { status: 'FAIL' };
  }
}

// Test 5: Users sending messages to each other
async function testMessaging() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 5: User-to-User Messaging');
  console.log('='.repeat(70));
  
  if (!testUsers.buyer || !testUsers.farmer) {
    console.log('   ⏭️  Skipping - Missing buyer or farmer');
    return { status: 'SKIP' };
  }
  
  console.log(`\n💬 Buyer (ID: ${testUsers.buyer.id}) sending message to Farmer (ID: ${testUsers.farmer.id})...`);
  
  const messageResult = await apiCall('/api/messages', 'POST', {
    senderId: testUsers.buyer.id,
    receiverId: testUsers.farmer.id,
    content: 'Hello! When will my order be delivered?',
    orderId: testOrders.length > 0 ? testOrders[0].id : null
  });
  
  if (messageResult.ok && messageResult.data.id) {
    testMessages.push(messageResult.data);
    console.log(`   ✅ Message sent! ID: ${messageResult.data.id}`);
    console.log(`      From: ${messageResult.data.sender?.name || 'N/A'}`);
    console.log(`      To: ${messageResult.data.receiver?.name || 'N/A'}`);
    console.log(`      Content: "${messageResult.data.content}"`);
    
    // Verify message can be retrieved
    console.log('\n🔍 Verifying message retrieval...');
    const retrieveResult = await apiCall(`/api/messages?userId=${testUsers.buyer.id}&conversationWith=${testUsers.farmer.id}`);
    if (retrieveResult.ok && Array.isArray(retrieveResult.data) && retrieveResult.data.length > 0) {
      console.log(`   ✅ Message found in conversation!`);
      console.log(`      Total messages: ${retrieveResult.data.length}`);
      return { status: 'PASS', messageId: messageResult.data.id };
    } else {
      console.log(`   ❌ Message NOT found in conversation`);
      return { status: 'FAIL' };
    }
  } else {
    console.log(`   ❌ Message sending failed: ${messageResult.data?.error || messageResult.error}`);
    return { status: 'FAIL' };
  }
}

// Test 6: Verify data persistence across requests
async function testDataPersistence() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 6: Data Persistence Verification');
  console.log('='.repeat(70));
  
  const results = {};
  
  // Verify users still exist
  console.log('\n👥 Verifying users persist...');
  for (const [role, user] of Object.entries(testUsers)) {
    if (user) {
      const result = await apiCall(`/api/users/${user.id}`);
      if (result.ok && result.data.id === user.id) {
        results[`${role}_persists`] = 'PASS';
        console.log(`   ✅ ${role} (ID: ${user.id}) still exists`);
      } else {
        results[`${role}_persists`] = 'FAIL';
        console.log(`   ❌ ${role} (ID: ${user.id}) NOT found`);
      }
    }
  }
  
  // Verify products persist
  if (testProducts.length > 0) {
    console.log('\n🌾 Verifying products persist...');
    for (const product of testProducts) {
      const result = await apiCall(`/api/products/${product.id}`);
      if (result.ok && result.data.id === product.id) {
        results[`product_${product.id}_persists`] = 'PASS';
        console.log(`   ✅ Product ${product.id} still exists`);
      } else {
        results[`product_${product.id}_persists`] = 'FAIL';
        console.log(`   ❌ Product ${product.id} NOT found`);
      }
    }
  }
  
  // Verify orders persist
  if (testOrders.length > 0) {
    console.log('\n🛒 Verifying orders persist...');
    for (const order of testOrders) {
      const result = await apiCall(`/api/orders/${order.id}`);
      if (result.ok && result.data.id === order.id) {
        results[`order_${order.id}_persists`] = 'PASS';
        console.log(`   ✅ Order ${order.id} still exists`);
      } else {
        results[`order_${order.id}_persists`] = 'FAIL';
        console.log(`   ❌ Order ${order.id} NOT found`);
      }
    }
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting Comprehensive User Persistence and Interaction Tests');
  console.log('='.repeat(70));
  
  // Check if server is running
  console.log('\nChecking server connection...');
  const healthCheck = await apiCall('/api/health');
  if (!healthCheck.ok) {
    console.error('❌ Server is not running at http://localhost:3000');
    console.error('   Please start the server with: npm run dev');
    process.exit(1);
  }
  console.log('✅ Server is running!\n');
  
  const allResults = {};
  
  // Run all tests
  allResults.registration = await testUserRegistration();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  allResults.login = await testUserLogin();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  allResults.products = await testProductAndListingCreation();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  allResults.orders = await testOrderCreation();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  allResults.messaging = await testMessaging();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  allResults.persistence = await testDataPersistence();
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  console.log('\n✅ Registration Tests:');
  for (const [role, result] of Object.entries(allResults.registration)) {
    const icon = result === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${role}: ${result}`);
  }
  
  console.log('\n✅ Login Tests:');
  for (const [role, result] of Object.entries(allResults.login)) {
    const icon = result === 'PASS' ? '✅' : result === 'SKIP' ? '⏭️' : '❌';
    console.log(`   ${icon} ${role}: ${result}`);
  }
  
  console.log('\n✅ Product/Listing Tests:');
  const productIcon = allResults.products.status === 'PASS' ? '✅' : allResults.products.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`   ${productIcon} Product & Listing Creation: ${allResults.products.status}`);
  
  console.log('\n✅ Order Tests:');
  const orderIcon = allResults.orders.status === 'PASS' ? '✅' : allResults.orders.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`   ${orderIcon} Order Creation: ${allResults.orders.status}`);
  
  console.log('\n✅ Messaging Tests:');
  const messageIcon = allResults.messaging.status === 'PASS' ? '✅' : allResults.messaging.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`   ${messageIcon} User Messaging: ${allResults.messaging.status}`);
  
  console.log('\n✅ Persistence Tests:');
  for (const [key, result] of Object.entries(allResults.persistence)) {
    const icon = result === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${key}: ${result}`);
  }
  
  // Calculate pass rate
  const totalTests = 
    Object.values(allResults.registration).length +
    Object.values(allResults.login).length +
    1 + // products
    1 + // orders
    1 + // messaging
    Object.values(allResults.persistence).length;
    
  const passedTests = 
    Object.values(allResults.registration).filter(r => r === 'PASS').length +
    Object.values(allResults.login).filter(r => r === 'PASS').length +
    (allResults.products.status === 'PASS' ? 1 : 0) +
    (allResults.orders.status === 'PASS' ? 1 : 0) +
    (allResults.messaging.status === 'PASS' ? 1 : 0) +
    Object.values(allResults.persistence).filter(r => r === 'PASS').length;
  
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  
  console.log('\n' + '='.repeat(70));
  console.log(`📈 Overall Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log('='.repeat(70));
  
  if (passRate === '100.0') {
    console.log('\n🎉 All tests passed! Users are persisted and can interact with each other!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});

