// Cdw-Spm: Minimal seed for SPYMEO V1
// Execute with: npm run db:seed:min
//
// This seed creates:
// 1. Admin account (cindy-dorbane@spymeo.fr)
// 2. Initial PASS resources (example)
// 3. No test data (production-ready)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting minimal seed...')

  // 1. Create admin account cindy-dorbane@spymeo.fr
  console.log('📝 Creating admin account...')

  // Pre-hashed password for "ChangeMe2025!" (bcryptjs, 10 rounds)
  const adminPassword = '$2b$10$x8Az4M1s2fTb84JZzgvnCOZnBjf/dsmNdKMkCMFNBdD6jGLc41ukm'

  const admin = await prisma.user.upsert({
    where: { email: 'cindy-dorbane@spymeo.fr' },
    update: {
      // Update existing admin if already exists
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
    create: {
      email: 'cindy-dorbane@spymeo.fr',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      firstName: 'Cindy',
      lastName: 'Dorbane',
      name: 'Cindy Dorbane',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`✅ Admin created: ${admin.email} (ID: ${admin.id})`)

  // 2. Create initial PASS resources (example for January 2025)
  console.log('📚 Creating initial PASS resources...')

  const passResource = await prisma.passResource.upsert({
    where: { id: 'pass-resource-2025-01-podcast' },
    update: {},
    create: {
      id: 'pass-resource-2025-01-podcast',
      title: 'Podcast Janvier 2025 - Bien-être hivernal',
      type: 'PODCAST',
      month: '2025-01',
      description: 'Découvrez nos conseils pour traverser l\'hiver en pleine forme',
      url: null, // To be filled by admin later
      availableFrom: new Date('2025-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`✅ PASS resource created: ${passResource.title}`)

  // 3. Create initial PASS discount (example)
  console.log('💰 Creating initial PASS discount...')

  const passDiscount = await prisma.passDiscount.upsert({
    where: { id: 'pass-discount-example' },
    update: {},
    create: {
      id: 'pass-discount-example',
      kind: 'Praticien',
      name: 'Exemple Praticien',
      city: 'Paris',
      rate: 10.0, // 10% discount
      href: '/praticiens',
      active: false, // Disabled by default, admin will activate real discounts
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`✅ PASS discount created: ${passDiscount.name} (${passDiscount.rate}%)`)

  console.log('\n✨ Minimal seed completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`   - Admin account: cindy-dorbane@spymeo.fr`)
  console.log(`   - Initial password: ChangeMe2025!`)
  console.log(`   - PASS resources: 1`)
  console.log(`   - PASS discounts: 1 (example, disabled)`)
  console.log(`\n⚠️  IMPORTANT: Change admin password immediately after first login!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
