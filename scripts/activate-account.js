/**
 * Script to activate a practitioner account
 * Usage: node scripts/activate-account.js <email>
 * Example: node scripts/activate-account.js cindy.chafai@gmail.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateAccount(email) {
  try {
    console.log(`\n🔍 Recherche du compte: ${email}...`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 Compte trouvé:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nom: ${user.firstName} ${user.lastName}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Status actuel: ${user.status}`);
    console.log(`   Abonnement: ${user.subscriptionStart || 'Non défini'} → ${user.subscriptionEnd || 'Non défini'}`);

    if (user.status === 'ACTIVE') {
      console.log('\n✅ Le compte est déjà actif!');
      process.exit(0);
    }

    // Update the user to ACTIVE
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    console.log('\n🔄 Activation du compte...');
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        status: 'ACTIVE',
        subscriptionStart: now,
        subscriptionEnd: oneYearFromNow,
        updatedAt: now,
      },
    });

    console.log('\n✅ Compte activé avec succès!');
    console.log(`   Nouveau status: ${updatedUser.status}`);
    console.log(`   Abonnement du: ${updatedUser.subscriptionStart?.toLocaleDateString('fr-FR')}`);
    console.log(`   Abonnement jusqu'au: ${updatedUser.subscriptionEnd?.toLocaleDateString('fr-FR')}`);
    console.log('\n🎉 L\'utilisateur peut maintenant accéder à l\'espace pro!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'activation:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Usage: node scripts/activate-account.js <email>');
  console.error('   Example: node scripts/activate-account.js cindy.chafai@gmail.com\n');
  process.exit(1);
}

// Run the activation
activateAccount(email);
