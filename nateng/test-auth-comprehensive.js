/**
 * Comprehensive Authentication Test Script
 * Tests registration and login for all user roles
 */

const BASE_URL = 'http://localhost:3000';

// Test users for each role
const testUsers = {
  farmer: {
    name: 'Test Farmer',
    email: `testfarmer${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'farmer'
  },
  buyer: {
    name: 'Test Buyer',
    email: `testbuyer${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'buyer'
  },
  business: {
    name: 'Test Business',
    email: `testbusiness${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'business'
  },
  reseller: {
    name: 'Test Reseller',
    email: `testreseller${Date.now()}@test.com`,
    password: 'testpass123',
    role: 'reseller'
  }
};

// Expected redirect paths
const expectedPaths = {
  farmer: '/farmer/dashboard',
  buyer: '/buyer/dashboard',
  business: '/business/dashboard',
  reseller: '/reseller/dashboard'
};

async function testRegistration(role, userData) {
  console.log(`\n📝 Testing REGISTRATION for ${role.toUpperCase()}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Registration failed: ${data.error}`);
      return null;
    }

    if (data.user && data.user.role === role) {
      console.log(`✅ Registration successful!`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}`);
      return data.user;
    } else {
      console.error(`❌ Registration returned invalid data`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Registration error: ${error.message}`);
    return null;
  }
}

async function testLogin(email, password, expectedRole) {
  console.log(`\n🔐 Testing LOGIN for ${expectedRole.toUpperCase()}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Login failed: ${data.error}`);
      return null;
    }

    if (data.user && data.user.role === expectedRole) {
      console.log(`✅ Login successful!`);
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}`);
      return data.user;
    } else {
      console.error(`❌ Login returned invalid data or wrong role`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Login error: ${error.message}`);
    return null;
  }
}

async function testSession(userId) {
  console.log(`\n🔍 Testing SESSION for user ID ${userId}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: { 'x-user-id': userId.toString() }
    });

    const data = await response.json();

    if (data.user) {
      console.log(`✅ Session check successful!`);
      console.log(`   User: ${data.user.name} (${data.user.role})`);
      return true;
    } else {
      console.error(`❌ Session check failed: No user returned`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Session error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Authentication Tests\n');
  console.log('='.repeat(60));

  const results = {
    registration: {},
    login: {},
    session: {}
  };

  // Test registration for each role
  for (const [role, userData] of Object.entries(testUsers)) {
    const registeredUser = await testRegistration(role, userData);
    results.registration[role] = registeredUser ? 'PASS' : 'FAIL';
    
    if (registeredUser) {
      // Test login with the newly registered user
      const loggedInUser = await testLogin(userData.email, userData.password, role);
      results.login[role] = loggedInUser ? 'PASS' : 'FAIL';
      
      if (loggedInUser) {
        // Test session
        const sessionOk = await testSession(loggedInUser.id);
        results.session[role] = sessionOk ? 'PASS' : 'FAIL';
      } else {
        results.session[role] = 'SKIP';
      }
    } else {
      results.login[role] = 'SKIP';
      results.session[role] = 'SKIP';
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n📝 Registration Tests:');
  for (const [role, result] of Object.entries(results.registration)) {
    const icon = result === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${role.toUpperCase()}: ${result}`);
  }

  console.log('\n🔐 Login Tests:');
  for (const [role, result] of Object.entries(results.login)) {
    const icon = result === 'PASS' ? '✅' : result === 'SKIP' ? '⏭️' : '❌';
    console.log(`   ${icon} ${role.toUpperCase()}: ${result}`);
  }

  console.log('\n🔍 Session Tests:');
  for (const [role, result] of Object.entries(results.session)) {
    const icon = result === 'PASS' ? '✅' : result === 'SKIP' ? '⏭️' : '❌';
    console.log(`   ${icon} ${role.toUpperCase()}: ${result}`);
  }

  // Calculate pass rate
  const totalTests = Object.keys(testUsers).length * 3;
  const passedTests = 
    Object.values(results.registration).filter(r => r === 'PASS').length +
    Object.values(results.login).filter(r => r === 'PASS').length +
    Object.values(results.session).filter(r => r === 'PASS').length;
  
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📈 Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log('='.repeat(60));

  if (passRate === '100.0') {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('❌ Server is not running at http://localhost:3000');
    console.error('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  await runTests();
})();

