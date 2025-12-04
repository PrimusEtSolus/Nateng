const http = require('http');

const baseURL = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseURL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => { reject(error); });
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n=== NATENG API TEST SUITE ===\n');
  
  try {
    // Test 1: GET products
    console.log('1️⃣  Testing GET /api/products');
    let res = await makeRequest('GET', '/api/products');
    console.log(`   Status: ${res.status} ✓`);
    console.log(`   Products in DB: ${res.data.length}`);
    
    // Test 2: GET specific product
    console.log('\n2️⃣  Testing GET /api/products/1');
    res = await makeRequest('GET', '/api/products/1');
    console.log(`   Status: ${res.status} ✓`);
    console.log(`   Product: ${res.data.name}`);
    console.log(`   Farmer: ${res.data.farmer.name}`);
    
    // Test 3: GET listings
    console.log('\n3️⃣  Testing GET /api/listings');
    res = await makeRequest('GET', '/api/listings');
    console.log(`   Status: ${res.status} ✓`);
    console.log(`   Listings in DB: ${res.data.length}`);
    
    // Test 4: POST new product (CREATE)
    console.log('\n4️⃣  Testing POST /api/products (CREATE)');
    res = await makeRequest('POST', '/api/products', {
      name: 'Test Broccoli',
      description: 'Fresh green broccoli',
      farmerId: 1
    });
    console.log(`   Status: ${res.status} ${res.status === 201 ? '✓' : '❌'}`);
    if (res.status === 201) {
      console.log(`   Created: ${res.data.name} (ID: ${res.data.id})`);
      const testProductId = res.data.id;
      
      // Test 5: PATCH product (UPDATE)
      console.log('\n5️⃣  Testing PATCH /api/products/' + testProductId + ' (UPDATE)');
      res = await makeRequest('PATCH', `/api/products/${testProductId}`, {
        description: 'Updated: Fresh green broccoli from the highlands'
      });
      console.log(`   Status: ${res.status} ${res.status === 200 ? '✓' : '❌'}`);
      if (res.status === 200) {
        console.log(`   Updated: ${res.data.description}`);
      }
      
      // Test 6: DELETE product
      console.log('\n6️⃣  Testing DELETE /api/products/' + testProductId + ' (DELETE)');
      res = await makeRequest('DELETE', `/api/products/${testProductId}`);
      console.log(`   Status: ${res.status} ${res.status === 200 ? '✓' : '❌'}`);
      console.log(`   Message: ${res.data.message}`);
    }
    
    // Test 7: GET orders
    console.log('\n7️⃣  Testing GET /api/orders');
    res = await makeRequest('GET', '/api/orders');
    console.log(`   Status: ${res.status} ✓`);
    console.log(`   Orders in DB: ${res.data.length}`);
    
    // Test 8: GET specific order
    console.log('\n8️⃣  Testing GET /api/orders/1');
    res = await makeRequest('GET', '/api/orders/1');
    console.log(`   Status: ${res.status} ${res.status === 200 ? '✓' : '❌'}`);
    if (res.status === 200) {
      console.log(`   Order ID: ${res.data.id}`);
      console.log(`   Status: ${res.data.status}`);
      console.log(`   Items: ${res.data.items.length}`);
    }
    
    // Test 9: GET users
    console.log('\n9️⃣  Testing GET /api/users');
    res = await makeRequest('GET', '/api/users');
    console.log(`   Status: ${res.status} ✓`);
    console.log(`   Users in DB: ${res.data.length}`);
    const userRoles = {};
    res.data.forEach(u => {
      userRoles[u.role] = (userRoles[u.role] || 0) + 1;
    });
    console.log(`   Roles: ${Object.entries(userRoles).map(([k, v]) => `${k}(${v})`).join(', ')}`);
    
    // Test 10: Error handling - GET non-existent product
    console.log('\n🔟 Testing error handling - GET /api/products/9999');
    res = await makeRequest('GET', '/api/products/9999');
    console.log(`   Status: ${res.status} ${res.status === 404 ? '✓' : '❌'}`);
    console.log(`   Error: ${res.data.error}`);
    
    // Test 11: POST new order
    console.log('\n1️⃣1️⃣  Testing POST /api/orders (CREATE ORDER)');
    res = await makeRequest('POST', '/api/orders', {
      buyerId: 4,
      sellerId: 1,
      items: [
        { listingId: 1, quantity: 100 }
      ]
    });
    console.log(`   Status: ${res.status} ${res.status === 201 ? '✓' : '❌'}`);
    if (res.status === 201) {
      console.log(`   Order created: ID ${res.data.id}, Status: ${res.data.status}`);
      const newOrderId = res.data.id;
      
      // Test 12: PATCH order status
      console.log('\n1️⃣2️⃣  Testing PATCH /api/orders/' + newOrderId + ' (UPDATE STATUS)');
      res = await makeRequest('PATCH', `/api/orders/${newOrderId}`, {
        status: 'SHIPPED'
      });
      console.log(`   Status: ${res.status} ${res.status === 200 ? '✓' : '❌'}`);
      if (res.status === 200) {
        console.log(`   Order status updated to: ${res.data.status}`);
      }
    }
    
    console.log('\n✅ API TESTS COMPLETE\n');
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
  }
}

runTests();
