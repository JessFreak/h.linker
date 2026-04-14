import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing in .env');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full-stack Developer',
    'UI/UX Designer',
    'Project Manager',
    'QA Engineer',
    'Team Lead',
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const categories = [
    'Web',
    'Mobile',
    'AI/ML',
    'Blockchain',
    'GameDev',
    'IoT',
    'Cybersecurity',
  ];

  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
