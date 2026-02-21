import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@linheim.com' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    // Create admin user
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@linheim.com',
        password: hashedPassword,
        role: 'ADMIN',
        companyAccess: JSON.stringify([]),
      },
    });

    console.log('✅ Created admin user:', admin.email);
  }

  // Check if companies exist
  const existingCompanies = await prisma.company.count();

  if (existingCompanies > 0) {
    console.log('✅ Companies already exist');
  } else {
    // Create companies
    const companies = [
      {
        name: 'Deyou international GmbH',
        code: 'DEYOU',
        currency: 'EUR',
        country: 'Germany',
        type: 'warehouse',
      },
      {
        name: 'Wanling GmbH',
        code: 'WANLING',
        currency: 'EUR',
        country: 'Germany',
        type: 'hr',
      },
      {
        name: '江苏程辉商贸有限公司',
        code: 'JSCHENG',
        currency: 'CNY',
        country: 'China',
        type: 'billing',
      },
    ];

    for (const companyData of companies) {
      await prisma.company.create({
        data: companyData,
      });
    }

    console.log(`✅ Created ${companies.length} companies`);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
