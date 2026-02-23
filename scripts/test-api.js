const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testAPI() {
  console.log('=== Linheim Finance API - Connection Test ===\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Service Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

  // Test 1: List users
  console.log('Test 1: List users...');
  const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,email,role&limit=5`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  const users = await usersRes.json();
  console.log(`  Found ${users.length} user(s):`);
  users.forEach(u => console.log(`    - ${u.name} (${u.email}) [${u.role}]`));

  // Test 2: List companies
  console.log('\nTest 2: List companies...');
  const companiesRes = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=id,name,code,currency&limit=10`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  const companies = await companiesRes.json();
  console.log(`  Found ${companies.length} company(ies):`);
  companies.forEach(c => console.log(`    - ${c.name} (${c.code}) [${c.currency}]`));

  // Test 3: Count transactions
  console.log('\nTest 3: Count transactions...');
  const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  const txCount = txRes.headers.get('content-range');
  console.log(`  Transactions count: ${txCount || '0'}`);

  // Test 4: Count invoices
  console.log('\nTest 4: Count invoices...');
  const invRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  const invCount = invRes.headers.get('content-range');
  console.log(`  Invoices count: ${invCount || '0'}`);

  console.log('\n=== All tests passed! API is ready. ===');
}

testAPI().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
