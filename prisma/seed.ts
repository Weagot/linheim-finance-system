import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@linheim.de' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@linheim.de',
      password: hashedPassword,
      role: 'ADMIN',
      companyAccess: '[]',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create companies
  const companies = [
    {
      name: 'Deyou international GmbH',
      code: 'DEYOU',
      currency: 'EUR',
      country: 'Germany',
      type: 'WAREHOUSE',
      initialBalance: 0,
    },
    {
      name: 'Wanling GmbH',
      code: 'WANLING',
      currency: 'EUR',
      country: 'Germany',
      type: 'HR',
      initialBalance: 0,
    },
    {
      name: '江苏程辉商贸有限公司',
      code: 'JSCH',
      currency: 'CNY',
      country: 'China',
      type: 'INVOICE',
      initialBalance: 0,
    },
  ];

  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { code: companyData.code },
      update: {},
      create: companyData,
    });
    console.log('✅ Company created:', company.name);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
