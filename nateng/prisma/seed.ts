import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords for seed users
  const defaultPassword = await bcrypt.hash("password123", 10);

  // Create farmers
  const farmer1 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "farmer1@email.com",
      password: defaultPassword,
      role: "farmer",
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: "Juan Dela Cruz",
      email: "farmer2@email.com",
      password: defaultPassword,
      role: "farmer",
    },
  });

  // Create business/resellers
  const business1 = await prisma.user.create({
    data: {
      name: "Green Valley Restaurant",
      email: "business1@email.com",
      password: defaultPassword,
      role: "business",
    },
  });

  const reseller1 = await prisma.user.create({
    data: {
      name: "Highland Markets Reseller",
      email: "reseller1@email.com",
      password: defaultPassword,
      role: "reseller",
      address: "123 Session Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  // Create buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: "Alberto Garcia",
      email: "buyer1@email.com",
      password: defaultPassword,
      role: "buyer",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Carmen Reyes",
      email: "buyer2@email.com",
      password: defaultPassword,
      role: "buyer",
    },
  });

  const buyer3 = await prisma.user.create({
    data: {
      name: "Roberto Tan",
      email: "buyer3@email.com",
      password: defaultPassword,
      role: "buyer",
    },
  });

  const reseller2 = await prisma.user.create({
    data: {
      name: "Market Stall 2",
      email: "reseller2@email.com",
      password: defaultPassword,
      role: "reseller",
      address: "456 Magsaysay Avenue",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const reseller3 = await prisma.user.create({
    data: {
      name: "Market Stall 3",
      email: "reseller3@email.com",
      password: defaultPassword,
      role: "reseller",
      address: "789 Harrison Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  // Create products (crops from highlands)
  const tomatoes = await prisma.product.create({
    data: {
      name: "Highland Tomatoes",
      description: "Fresh, locally-grown tomatoes from the highlands of Benguet",
      farmerId: farmer1.id,
    },
  });

  const cabbage = await prisma.product.create({
    data: {
      name: "Highland Cabbage",
      description: "Organic cabbage perfect for restaurants and retail",
      farmerId: farmer1.id,
    },
  });

  const carrots = await prisma.product.create({
    data: {
      name: "Fresh Carrots",
      description: "Orange, crunchy carrots grown in highland soil",
      farmerId: farmer2.id,
    },
  });

  const lettuce = await prisma.product.create({
    data: {
      name: "Organic Lettuce",
      description: "Crispy green lettuce, pesticide-free",
      farmerId: farmer2.id,
    },
  });

  const potatoes = await prisma.product.create({
    data: {
      name: "Highland Potatoes",
      description: "Premium quality potatoes ideal for bulk orders",
      farmerId: farmer1.id,
    },
  });

  // Create listings (wholesale prices in cents)
  const listing1 = await prisma.listing.create({
    data: {
      productId: tomatoes.id,
      sellerId: farmer1.id,
      priceCents: 6000, // ₱60/kg
      quantity: 500,
      available: true,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      productId: cabbage.id,
      sellerId: farmer1.id,
      priceCents: 4000, // ₱40/kg
      quantity: 300,
      available: true,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      productId: carrots.id,
      sellerId: farmer2.id,
      priceCents: 5500, // ₱55/kg
      quantity: 400,
      available: true,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      productId: lettuce.id,
      sellerId: farmer2.id,
      priceCents: 8000, // ₱80/kg
      quantity: 200,
      available: true,
    },
  });

  const listing5 = await prisma.listing.create({
    data: {
      productId: potatoes.id,
      sellerId: farmer1.id,
      priceCents: 3500, // ₱35/kg
      quantity: 1000,
      available: true,
    },
  });

  // Create sample order
  const order1 = await prisma.order.create({
    data: {
      buyerId: business1.id,
      sellerId: farmer1.id,
      totalCents: 0,
      status: "CONFIRMED",
      items: {
        create: [
          {
            listingId: listing1.id,
            quantity: 50,
            priceCents: 6000,
          },
          {
            listingId: listing2.id,
            quantity: 30,
            priceCents: 4000,
          },
        ],
      },
    },
  });

  // Update order total
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order1.id },
  });

  const total = orderItems.reduce((sum, item) => sum + item.quantity * item.priceCents, 0);
  await prisma.order.update({
    where: { id: order1.id },
    data: { totalCents: total },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`  - ${5} products created`);
  console.log(`  - ${5} listings created`);
  console.log(`  - ${1} sample order created`);
  console.log(`  - ${5} users created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
