// Database initialization script for Linheim Finance System
// This script checks if tables exist in Supabase and reports status

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function checkTable(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=id&limit=1`, {
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`  [OK] Table "${tableName}" exists (${data.length} sample rows)`);
      return true;
    } else {
      const text = await res.text();
      console.log(`  [MISSING] Table "${tableName}" - ${res.status}: ${text}`);
      return false;
    }
  } catch (err) {
    console.log(`  [ERROR] Table "${tableName}" - ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Linheim Finance System - Database Check ===');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');
  console.log('Checking tables...');

  const tables = ['users', 'companies', 'transactions', 'invoices', 'projects', 'exchange_rates'];
  const results = {};

  for (const table of tables) {
    results[table] = await checkTable(table);
  }

  const allExist = Object.values(results).every(Boolean);
  const missingTables = Object.entries(results).filter(([, exists]) => !exists).map(([name]) => name);

  console.log('');
  if (allExist) {
    console.log('All tables exist! Database is ready.');

    // Check if admin user exists
    const adminRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.admin@linheim.de&select=id,name,email,role`,
      { headers }
    );
    if (adminRes.ok) {
      const admins = await adminRes.json();
      if (admins.length > 0) {
        console.log(`Admin user found: ${admins[0].email} (${admins[0].role})`);
      } else {
        console.log('WARNING: No admin user found. You may need to seed the database.');
      }
    }

    // Check companies
    const companiesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/companies?select=id,name,code`,
      { headers }
    );
    if (companiesRes.ok) {
      const companies = await companiesRes.json();
      console.log(`Companies found: ${companies.length}`);
      companies.forEach(c => console.log(`  - ${c.name} (${c.code})`));
    }
  } else {
    console.log(`MISSING TABLES: ${missingTables.join(', ')}`);
    console.log('Tables need to be created. Will attempt to create them now...');
  }

  return { allExist, missingTables };
}

main().catch(console.error);
