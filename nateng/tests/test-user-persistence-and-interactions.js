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
  farmer: [],
  buyer: [],
  bulkBuyer: []
};

// User tokens for authenticated requests
let userTokens = {
  farmer: [],
  buyer: [],
  bulkBuyer: []
};

let testProducts = [];
let testListings = [];
let testOrders = [];
let testMessages = [];

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
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
  
  const results = {};
  
  // Create 5 users for each role with different names
  // Register 5 farmers
  for (let i = 1; i <= 5; i++) {
    const mobileNumber = `09${String(Math.floor(Math.random() * 900000000) + 100000000)}`;
    const result = await apiCall('/api/auth/register', 'POST', {
      name: `atokfarmer${i}`,
      email: mobileNumber, // Farmers use mobile number as email
      password: 'atokfarmer',
      role: 'farmer',
      municipality: 'La Trinidad'
    });
    
    if (result.ok && result.data.user) {
      testUsers.farmer.push(result.data.user);
      results[`farmer${i}`] = 'PASS';
      console.log(`   ✅ atokfarmer${i} registered successfully!`);
      console.log(`      ID: ${result.data.user.id}, Mobile: ${result.data.user.email}, Role: ${result.data.user.role}`);
    } else {
      results[`farmer${i}`] = 'FAIL';
      console.log(`   ❌ atokfarmer${i} registration failed: ${result.data?.error || result.error}`);
    }
  }
  
  // Register 5 buyers
  for (let i = 1; i <= 5; i++) {
    const result = await apiCall('/api/auth/register', 'POST', {
      name: `buyer${i}`,
      email: `buyer${i}${Date.now()}@test.com`,
      password: 'atokfarmer',
      role: 'buyer'
    });
    
    if (result.ok && result.data.user) {
      testUsers.buyer.push(result.data.user);
      results[`buyer${i}`] = 'PASS';
      console.log(`   ✅ buyer${i} registered successfully!`);
      console.log(`      ID: ${result.data.user.id}, Email: ${result.data.user.email}, Role: ${result.data.user.role}`);
    } else {
      results[`buyer${i}`] = 'FAIL';
      console.log(`   ❌ buyer${i} registration failed: ${result.data?.error || result.error}`);
    }
  }
  
  // Register 5 bulkBuyers
  for (let i = 1; i <= 5; i++) {
    const result = await apiCall('/api/auth/register', 'POST', {
      name: `bulkBuyer${i}`,
      email: `bulkBuyer${i}${Date.now()}@test.com`,
      password: 'atokfarmer',
      role: 'bulkBuyer',
      businessName: 'Test Restaurant'
    });
    
    if (result.ok && result.data.user) {
      testUsers.bulkBuyer.push(result.data.user);
      results[`bulkBuyer${i}`] = 'PASS';
      console.log(`   ✅ bulkBuyer${i} registered successfully!`);
      console.log(`      ID: ${result.data.user.id}, Email: ${result.data.user.email}, Role: ${result.data.user.role}`);
    } else {
      results[`bulkBuyer${i}`] = 'FAIL';
      console.log(`   ❌ bulkBuyer${i} registration failed: ${result.data?.error || result.error}`);
    }
  }
  
  // Verify user persistence
  console.log('\n🔍 Verifying user persistence...');
  
  // Check farmers
  for (const user of testUsers.farmer) {
    const result = await apiCall(`/api/users/${user.id}`);
    if (result.ok && result.data.id === user.id) {
      console.log(`   ✅ ${user.name} (ID: ${user.id}) found in database`);
    } else {
      console.log(`   ❌ ${user.name} (ID: ${user.id}) NOT found in database`);
    }
  }
  
  // Check buyers
  for (const user of testUsers.buyer) {
    const result = await apiCall(`/api/users/${user.id}`);
    if (result.ok && result.data.id === user.id) {
      console.log(`   ✅ ${user.name} (ID: ${user.id}) found in database`);
    } else {
      console.log(`   ❌ ${user.name} (ID: ${user.id}) NOT found in database`);
    }
  }
  
  // Check bulkBuyers
  for (const user of testUsers.bulkBuyer) {
    const result = await apiCall(`/api/users/${user.id}`);
    if (result.ok && result.data.id === user.id) {
      console.log(`   ✅ ${user.name} (ID: ${user.id}) found in database`);
    } else {
      console.log(`   ❌ ${user.name} (ID: ${user.id}) NOT found in database`);
    }
  }
  
  return { results, testUsers };
}

// Test 2: Login with registered users
async function testUserLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: User Login After Registration');
  console.log('='.repeat(70));
  
  const results = {};
  
  for (const [role, users] of Object.entries(testUsers)) {
    for (const user of users) {
      console.log(`\n🔐 Testing login for ${role}...`);
      const result = await apiCall('/api/auth/login', 'POST', {
        email: user.email,
        password: 'atokfarmer'
      });
      
      if (result.ok && result.data.user) {
        const loggedInUser = result.data.user;
        const token = result.data.token;
        if (loggedInUser.id === user.id && loggedInUser.email === user.email) {
          // Store the token for authenticated requests
          userTokens[role].push(token);
          results[`${role}_${user.id}`] = 'PASS';
          console.log(`   ✅ ${role} logged in successfully!`);
          console.log(`      Verified: ID ${loggedInUser.id}, Email: ${loggedInUser.email}`);
          console.log(`      Token stored for authenticated requests`);
        } else {
          results[`${role}_${user.id}`] = 'FAIL';
          console.log(`   ❌ Login returned different user data`);
        }
      } else {
        results[role] = 'FAIL';
        console.log(`   ❌ Login failed: ${result.data?.error || result.error}`);
      }
    }
  }
  
  return results;
}

// Test 3: Users creating products and listings
async function testProductAndListingCreation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: Product and Listing Creation');
  console.log('='.repeat(70));
  
  if (!testUsers.farmer || testUsers.farmer.length === 0) {
    console.log('   ⏭️  Skipping - No farmer registered');
    return { status: 'SKIP' };
  }
  
  // Use the first farmer for product creation
  const firstFarmer = testUsers.farmer[0];
  const farmerToken = userTokens.farmer[0];
  
  console.log('\n🌾 Farmer creating product...');
  const productResult = await apiCall('/api/products', 'POST', {
    name: 'Test Tomatoes',
    description: 'Fresh tomatoes from test farm',
    farmerId: firstFarmer.id
  }, farmerToken);
  
  if (productResult.ok && productResult.data.id) {
    testProducts.push(productResult.data);
    console.log(`   ✅ Product created! ID: ${productResult.data.id}`);
    
    console.log('\n📋 Farmer creating listing...');
    const listingResult = await apiCall('/api/listings', 'POST', {
      productId: productResult.data.id,
      sellerId: firstFarmer.id,
      priceCents: 5000, // ₱50.00
      quantity: 100
    }, farmerToken);
    
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

// Test 4: BulkBuyer creating order from farmer (user interaction)
async function testOrderCreation() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: Order Creation (BulkBuyer-Farmer Interaction)');
  console.log('='.repeat(70));
  
  if (!testUsers.bulkBuyer || testUsers.bulkBuyer.length === 0 || !testUsers.farmer || testUsers.farmer.length === 0 || testListings.length === 0) {
    console.log('   ⏭️  Skipping - Missing bulkBuyer, farmer, or listings');
    return { status: 'SKIP' };
  }
  
  const listing = testListings[0];
  const firstBulkBuyer = testUsers.bulkBuyer[0];
  const firstFarmer = testUsers.farmer[0];
  const bulkBuyerToken = userTokens.bulkBuyer[0];
  
  console.log(`\n🛒 BulkBuyer (ID: ${firstBulkBuyer.id}) creating order from Farmer (ID: ${firstFarmer.id})...`);
  
  const orderResult = await apiCall('/api/orders', 'POST', {
    buyerId: firstBulkBuyer.id, // BulkBuyer acts as buyer
    sellerId: firstFarmer.id,
    items: [
      {
        listingId: listing.id,
        quantity: 50
      }
    ]
  }, bulkBuyerToken);
  
  if (orderResult.ok && orderResult.data.id) {
    testOrders.push(orderResult.data);
    console.log(`   ✅ Order created! ID: ${orderResult.data.id}`);
    console.log(`      Buyer: ${orderResult.data.buyer?.name || 'N/A'}`);
    console.log(`      Seller: ${orderResult.data.seller?.name || 'N/A'}`);
    console.log(`      Total: ₱${(orderResult.data.totalCents / 100).toFixed(2)}`);
    console.log(`      Status: ${orderResult.data.status}`);
    
    // Verify order can be retrieved
    console.log('\n🔍 Verifying order persistence...');
    const retrieveResult = await apiCall(`/api/orders/${orderResult.data.id}`, 'GET', null, bulkBuyerToken);
    if (retrieveResult.ok && retrieveResult.data.id === orderResult.data.id) {
      console.log(`   ✅ Order found in database`);
      return { status: 'PASS', orderId: orderResult.data.id };
    } else {
      console.log(`   ❌ Order NOT found in database`);
      console.log(`   Error: ${retrieveResult.data?.error || retrieveResult.error}`);
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
  
  if (!testUsers.bulkBuyer || testUsers.bulkBuyer.length === 0 || !testUsers.farmer || testUsers.farmer.length === 0) {
    console.log('   ⏭️  Skipping - Missing bulkBuyer or farmer');
    return { status: 'SKIP' };
  }
  
  const firstBulkBuyer = testUsers.bulkBuyer[0];
  const firstFarmer = testUsers.farmer[0];
  const bulkBuyerToken = userTokens.bulkBuyer[0];
  
  console.log(`\n💬 BulkBuyer (ID: ${firstBulkBuyer.id}) sending message to Farmer (ID: ${firstFarmer.id})...`);
  
  const messageResult = await apiCall('/api/messages', 'POST', {
    senderId: firstBulkBuyer.id,
    receiverId: firstFarmer.id,
    content: 'Hello! When will my order be delivered?',
    orderId: testOrders.length > 0 ? testOrders[0].id : null
  }, bulkBuyerToken);
  
  if (messageResult.ok && messageResult.data.id) {
    testMessages.push(messageResult.data);
    console.log(`   ✅ Message sent! ID: ${messageResult.data.id}`);
    console.log(`      From: ${messageResult.data.sender?.name || 'N/A'}`);
    console.log(`      To: ${messageResult.data.receiver?.name || 'N/A'}`);
    console.log(`      Content: "${messageResult.data.content}"`);
    
    // Verify message can be retrieved
    console.log('\n🔍 Verifying message retrieval...');
    const retrieveResult = await apiCall(`/api/messages?userId=${firstBulkBuyer.id}&conversationWith=${firstFarmer.id}`, 'GET', null, bulkBuyerToken);
    if (retrieveResult.ok && Array.isArray(retrieveResult.data) && retrieveResult.data.length > 0) {
      console.log(`   ✅ Message found in conversation!`);
      console.log(`      Total messages: ${retrieveResult.data.length}`);
      return { status: 'PASS', messageId: messageResult.data.id };
    } else {
      console.log(`   ❌ Message NOT found in conversation`);
      console.log(`   Error: ${retrieveResult.data?.error || retrieveResult.error}`);
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
  for (const [role, users] of Object.entries(testUsers)) {
    for (const user of users) {
      const result = await apiCall(`/api/users/${user.id}`);
      if (result.ok && result.data.id === user.id) {
        results[`${role}_${user.id}_persists`] = 'PASS';
        console.log(`   ✅ ${user.name} (ID: ${user.id}) still exists`);
      } else {
        results[`${role}_${user.id}_persists`] = 'FAIL';
        console.log(`   ❌ ${user.name} (ID: ${user.id}) NOT found`);
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
      const bulkBuyerToken = userTokens.bulkBuyer[0];
      const result = await apiCall(`/api/orders/${order.id}`, 'GET', null, bulkBuyerToken);
      if (result.ok && result.data.id === order.id) {
        results[`order_${order.id}_persists`] = 'PASS';
        console.log(`   ✅ Order ${order.id} still exists`);
      } else {
        results[`order_${order.id}_persists`] = 'FAIL';
        console.log(`   ❌ Order ${order.id} NOT found`);
        console.log(`   Error: ${result.data?.error || result.error}`);
      }
    }
  }
  
  return results;
}

// Test 7: Users transacting with each other (buying and selling)
async function testUserTransactions() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 7: User Transactions (Buying & Selling)');
  console.log('='.repeat(70));
  
  // Test 1: BulkBuyer buying from Farmer
  console.log('\n🏢 BulkBuyer buying from Farmer...');
  if (!testUsers.bulkBuyer || testUsers.bulkBuyer.length === 0 || !testUsers.farmer || testUsers.farmer.length === 0 || testListings.length === 0) {
    console.log('   ⏭️  Skipping - Missing bulkBuyer, farmer, or listings');
    return { status: 'SKIP' };
  }
  
  const firstBulkBuyer = testUsers.bulkBuyer[0];
  const firstFarmer = testUsers.farmer[0];
  const bulkBuyerToken = userTokens.bulkBuyer[0];
  
  const bulkBuyerOrderResult = await apiCall('/api/orders', 'POST', {
    buyerId: firstBulkBuyer.id,
    sellerId: firstFarmer.id,
    items: [
      {
        listingId: testListings[0].id,
        quantity: 10 // Use smaller quantity to avoid conflicts
      }
    ]
  }, bulkBuyerToken);
  
  if (bulkBuyerOrderResult.ok && bulkBuyerOrderResult.data.id) {
    console.log(`   ✅ BulkBuyer order created! ID: ${bulkBuyerOrderResult.data.id}`);
    console.log(`      Total: ₱${(bulkBuyerOrderResult.data.totalCents / 100).toFixed(2)}`);
  } else {
    console.log(`   ❌ BulkBuyer order failed: ${bulkBuyerOrderResult.data?.error || bulkBuyerOrderResult.error}`);
  }
  
  // Test 2: Buyer buying from BulkBuyer (need bulkBuyer listing)
  console.log('\n🛍️  Buyer buying from BulkBuyer...');
  
  // First create a bulkBuyer product and listing (bulkBuyers need to create products differently)
  // Since only farmers can create products, we'll have the bulkBuyer create a listing for an existing farmer product
  const bulkBuyerListingResult = await apiCall('/api/listings', 'POST', {
    productId: testProducts[0].id, // Use existing farmer product
    sellerId: firstBulkBuyer.id,
    priceCents: 6000, // ₱60.00
    quantity: 50 // Use 'quantity' not 'quantityKg'
  }, bulkBuyerToken);
  
  if (bulkBuyerListingResult.ok && bulkBuyerListingResult.data.id) {
    // Now buyer can purchase from bulkBuyer
    if (!testUsers.buyer || testUsers.buyer.length === 0) {
      console.log('   ⏭️  Skipping - No buyer registered');
      return { status: 'SKIP' };
    }
    
    const firstBuyer = testUsers.buyer[0];
    const buyerToken = userTokens.buyer[0];
    
    const buyerOrderResult = await apiCall('/api/orders', 'POST', {
      buyerId: firstBuyer.id,
      sellerId: firstBulkBuyer.id,
      items: [
        {
          listingId: bulkBuyerListingResult.data.id,
          quantity: 5
        }
      ]
    }, buyerToken);
    
    if (buyerOrderResult.ok && buyerOrderResult.data.id) {
      console.log(`   ✅ Buyer order created! ID: ${buyerOrderResult.data.id}`);
      console.log(`      Total: ₱${(buyerOrderResult.data.totalCents / 100).toFixed(2)}`);
    } else {
      console.log(`   ❌ Buyer order failed: ${buyerOrderResult.data?.error || buyerOrderResult.error}`);
    }
  } else {
    console.log(`   ❌ Reseller listing creation failed: ${resellerListingResult.data?.error || resellerListingResult.error}`);
  }
  
  // Test 4: Verify all orders can be retrieved
  console.log('\n🔍 Verifying all transactions persist...');
  const businessToken2 = userTokens.business[0];
  const allOrdersResult = await apiCall('/api/orders', 'GET', null, businessToken2);
  if (allOrdersResult.ok && Array.isArray(allOrdersResult.data)) {
    console.log(`   ✅ Found ${allOrdersResult.data.length} orders in system`);
    allOrdersResult.data.forEach(order => {
      console.log(`      Order ${order.id}: ${order.buyer?.name} → ${order.seller?.name} (₱${(order.totalCents / 100).toFixed(2)})`);
    });
    return { status: 'PASS', orderCount: allOrdersResult.data.length };
  } else {
    // Try with admin token if business token doesn't work
    const adminOrdersResult = await apiCall('/api/orders', 'GET', null, businessToken2);
    if (adminOrdersResult.ok && Array.isArray(adminOrdersResult.data)) {
      console.log(`   ✅ Found ${adminOrdersResult.data.length} orders in system`);
      adminOrdersResult.data.forEach(order => {
        console.log(`      Order ${order.id}: ${order.buyer?.name} → ${order.seller?.name} (₱${(order.totalCents / 100).toFixed(2)})`);
      });
      return { status: 'PASS', orderCount: adminOrdersResult.data.length };
    } else {
      console.log(`   ❌ Failed to retrieve orders: ${adminOrdersResult.data?.error || adminOrdersResult.error}`);
      return { status: 'FAIL' };
    }
  }
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
  
  // Run all tests
  const registrationResult = await testUserRegistration();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const loginResult = await testUserLogin();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const productsResult = await testProductAndListingCreation();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const ordersResult = await testOrderCreation();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const messagingResult = await testMessaging();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const persistenceResult = await testDataPersistence();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const transactionsResult = await testUserTransactions();
  
  const allResults = {
    registration: registrationResult.results,
    login: loginResult,
    products: productsResult,
    orders: ordersResult,
    messaging: messagingResult,
    persistence: persistenceResult,
    transactions: transactionsResult
  };
  
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
  
  console.log('\n✅ Transaction Tests:');
  const transactionIcon = allResults.transactions.status === 'PASS' ? '✅' : allResults.transactions.status === 'SKIP' ? '⏭️' : '❌';
  console.log(`   ${transactionIcon} User Transactions: ${allResults.transactions.status}`);
  if (allResults.transactions.orderCount) {
    console.log(`      Total orders created: ${allResults.transactions.orderCount}`);
  }
  
  // Calculate pass rate
  const totalTests = 
    Object.values(allResults.registration).length +
    Object.values(allResults.login).length +
    1 + // products
    1 + // orders
    1 + // messaging
    Object.values(allResults.persistence).length +
    1; // transactions
    
  const passedTests = 
    Object.values(allResults.registration).filter(r => r === 'PASS').length +
    Object.values(allResults.login).filter(r => r === 'PASS').length +
    (allResults.products.status === 'PASS' ? 1 : 0) +
    (allResults.orders.status === 'PASS' ? 1 : 0) +
    (allResults.messaging.status === 'PASS' ? 1 : 0) +
    Object.values(allResults.persistence).filter(r => r === 'PASS').length +
    (allResults.transactions.status === 'PASS' ? 1 : 0);
  
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

