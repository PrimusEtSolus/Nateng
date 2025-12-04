const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({ 
      select: { id: true, name: true, role: true, email: true, minimumOrderKg: true } 
    });
    console.log('Existing users:');
    users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Email: ${u.email}, MinOrderKg: ${u.minimumOrderKg}`));
    
    console.log('\nCreating a buyer user for testing...');
    const existingBuyer = await prisma.user.findFirst({ where: { role: 'buyer' } });
    if (!existingBuyer) {
      const newBuyer = await prisma.user.create({
        data: {
          name: 'testbuyer',
          email: 'testbuyer@email.com',
          password: '$2b$10$3c33ivUkF7vORdAJOhLvqes35DfpEFDkBmqm5tPqBY69B3SzeZfIC', // same hash for testing
          role: 'buyer',
          minimumOrderKg: 10
        }
      });
      console.log(`Created buyer: ID ${newBuyer.id}, Name: ${newBuyer.name}`);
    } else {
      console.log(`Buyer already exists: ID ${existingBuyer.id}, Name: ${existingBuyer.name}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
