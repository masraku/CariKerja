
const BASE_URL = 'http://localhost:3000/api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest(name, endpoint, method, body = null, expectedStatuses = [400], headers = {}) {
  console.log(`\n🧪 ${name}`);
  console.log(`   ${method} ${endpoint}`);

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    const statusIcon = expectedStatuses.includes(res.status) ? '✅' : '❌';
    console.log(`   ${statusIcon} Status: ${res.status} | ${data.error || 'OK'}`);

    return expectedStatuses.includes(res.status);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testZodValidation() {
  console.log('\n' + '='.repeat(50));
  console.log('📋 ZOD VALIDATION TESTS');
  console.log('='.repeat(50));

  let passed = 0, failed = 0;

  // Auth
  if (await runTest('Login - Empty Body', '/auth/login', 'POST', {}, [400, 429])) passed++; else failed++;
  await delay(300);
  if (await runTest('Login - Invalid Email', '/auth/login', 'POST', { email: 'bad', password: '123' }, [400, 429])) passed++; else failed++;
  
  // Jobs Query
  if (await runTest('Jobs - Invalid Page', '/jobs?page=abc', 'GET', null, [400])) passed++; else failed++;
  if (await runTest('Jobs - Negative Limit', '/jobs?limit=-5', 'GET', null, [400])) passed++; else failed++;
  
  // Protected (expect 401/403)
  if (await runTest('Admin News GET', '/admin/news', 'GET', null, [401])) passed++; else failed++;
  if (await runTest('Job Create (no auth)', '/profile/recruiter/jobs/create', 'POST', {}, [401, 403])) passed++; else failed++;
  if (await runTest('Interview Respond (no auth)', '/profile/jobseeker/interviews/test/respond', 'PATCH', { status: 'ACCEPTED' }, [401, 403])) passed++; else failed++;

  return { passed, failed };
}

async function testRateLimiter() {
  console.log('\n' + '='.repeat(50));
  console.log('⏱️  RATE LIMITER TESTS');
  console.log('='.repeat(50));

  console.log('\n🔄 Testing rate limit (5 rapid requests to /auth/login)...');
  
  let rateLimitHit = false;
  
  for (let i = 1; i <= 7; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test${i}@test.com`, password: '123' })
    });
    const data = await res.json();
    
    if (res.status === 429) {
      rateLimitHit = true;
      console.log(`   ✅ Request ${i}: Rate limited (429) - EXPECTED`);
    } else {
      console.log(`   📝 Request ${i}: Status ${res.status}`);
    }
  }

  return rateLimitHit;
}

async function main() {
  console.log('🚀 FINAL ZOD & RATE LIMITER TEST');
  console.log('⚠️  Make sure server is running (npm run dev)\n');

  const zodResults = await testZodValidation();
  const rateLimitWorking = await testRateLimiter();

  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(50));
  
  console.log(`\n📋 Zod Validation: ${zodResults.passed}/${zodResults.passed + zodResults.failed} passed`);
  console.log(`⏱️  Rate Limiter: ${rateLimitWorking ? '✅ Working' : '❌ Not triggered'}`);
  
  const allPass = zodResults.failed === 0 && rateLimitWorking;
  console.log(`\n${allPass ? '🎉 ALL TESTS PASSED!' : '⚠️  Some issues detected'}`);
}

main();
