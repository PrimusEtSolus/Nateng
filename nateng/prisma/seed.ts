import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.deliverySchedule.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.appeal.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords for seed users
  const defaultPassword = await bcrypt.hash("password123", 10);

  // ============================================
  // CREATE USERS
  // ============================================
  console.log("  👤 Creating users...");

  // Farmers
  const farmer1 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "farmer1@email.com",
      phone: "09171234567",
      password: defaultPassword,
      role: "farmer",
      minimumOrderKg: 50,
      deliveryAreas: JSON.stringify(["Baguio City", "La Trinidad", "Itogon", "Tuba", "Sablan"]),
      paymentMethods: JSON.stringify(["cash_on_delivery", "bank_transfer"]),
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: "Juan Dela Cruz",
      email: "farmer2@email.com",
      phone: "09187654321",
      password: defaultPassword,
      role: "farmer",
      minimumOrderKg: 100,
      deliveryAreas: JSON.stringify(["Baguio City", "La Trinidad", "Bokod", "Kabayan"]),
      paymentMethods: JSON.stringify(["cash_on_delivery", "gcash"]),
    },
  });

  const farmer3 = await prisma.user.create({
    data: {
      name: "Pedro Reyes",
      email: "farmer3@email.com",
      phone: "09199876543",
      password: defaultPassword,
      role: "farmer",
      minimumOrderKg: 50,
      deliveryAreas: JSON.stringify(["Baguio City", "La Trinidad", "Mankayan", "Bakun"]),
      paymentMethods: JSON.stringify(["cash_on_delivery", "bank_transfer", "gcash"]),
    },
  });

  // Businesses
  const business1 = await prisma.user.create({
    data: {
      name: "Green Valley Restaurant",
      email: "business1@email.com",
      password: defaultPassword,
      role: "business",
      address: "123 Session Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const business2 = await prisma.user.create({
    data: {
      name: "Mountain View Hotel",
      email: "business2@email.com",
      password: defaultPassword,
      role: "business",
      address: "456 Magsaysay Avenue",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const business3 = await prisma.user.create({
    data: {
      name: "Benguet Fresh Market",
      email: "business3@email.com",
      password: defaultPassword,
      role: "business",
      address: "789 Harrison Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  // Resellers
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

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: "Alberto Garcia",
      email: "buyer1@email.com",
      password: defaultPassword,
      role: "buyer",
      address: "101 Abanao Street",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Carmen Reyes",
      email: "buyer2@email.com",
      password: defaultPassword,
      role: "buyer",
      address: "202 Governor Pack Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const buyer3 = await prisma.user.create({
    data: {
      name: "Roberto Tan",
      email: "buyer3@email.com",
      password: defaultPassword,
      role: "buyer",
      address: "303 Kisad Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  const buyer4 = await prisma.user.create({
    data: {
      name: "Elena Santos",
      email: "buyer4@email.com",
      password: defaultPassword,
      role: "buyer",
      address: "404 Leonard Wood Road",
      city: "Baguio",
      province: "Benguet",
      country: "Philippines",
    },
  });

  // ============================================
  // CREATE PRODUCTS
  // ============================================
  console.log("  🥬 Creating products...");

  const tomatoes = await prisma.product.create({
    data: {
      name: "Highland Tomatoes",
      description: "Fresh, locally-grown tomatoes from the highlands of Benguet. Perfect for salads and cooking.",
      farmerId: farmer1.id,
    },
  });

  const cabbage = await prisma.product.create({
    data: {
      name: "Highland Cabbage",
      description: "Organic cabbage perfect for restaurants and retail. Crisp and nutritious.",
      farmerId: farmer1.id,
    },
  });

  const carrots = await prisma.product.create({
    data: {
      name: "Fresh Carrots",
      description: "Orange, crunchy carrots grown in highland soil. Rich in beta-carotene.",
      farmerId: farmer2.id,
    },
  });

  const lettuce = await prisma.product.create({
    data: {
      name: "Organic Lettuce",
      description: "Crispy green lettuce, pesticide-free. Perfect for sandwiches and salads.",
      farmerId: farmer2.id,
    },
  });

  const potatoes = await prisma.product.create({
    data: {
      name: "Highland Potatoes",
      description: "Premium quality potatoes ideal for bulk orders. Great for fries and mashed potatoes.",
      farmerId: farmer1.id,
    },
  });

  const strawberries = await prisma.product.create({
    data: {
      name: "La Trinidad Strawberries",
      description: "Sweet and juicy strawberries from La Trinidad, Benguet. Perfect for desserts.",
      farmerId: farmer3.id,
    },
  });

  const beans = await prisma.product.create({
    data: {
      name: "String Beans",
      description: "Fresh green beans, crunchy and flavorful. Great for stir-fry dishes.",
      farmerId: farmer2.id,
    },
  });

  const peppers = await prisma.product.create({
    data: {
      name: "Bell Peppers",
      description: "Colorful bell peppers - red, green, and yellow. Adds flavor to any dish.",
      farmerId: farmer3.id,
    },
  });

  const squash = await prisma.product.create({
    data: {
      name: "Squash",
      description: "Fresh squash, perfect for soups and stews. Rich in vitamins.",
      farmerId: farmer1.id,
    },
  });

  const broccoli = await prisma.product.create({
    data: {
      name: "Broccoli",
      description: "Fresh broccoli, high in nutrients. Great for healthy meals.",
      farmerId: farmer3.id,
    },
  });

  // ============================================
  // CREATE LISTINGS (Farmer - Wholesale)
  // ============================================
  console.log("  📋 Creating farmer listings...");

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

  const listing6 = await prisma.listing.create({
    data: {
      productId: strawberries.id,
      sellerId: farmer3.id,
      priceCents: 12000, // ₱120/kg
      quantity: 150,
      available: true,
    },
  });

  const listing7 = await prisma.listing.create({
    data: {
      productId: beans.id,
      sellerId: farmer2.id,
      priceCents: 7000, // ₱70/kg
      quantity: 250,
      available: true,
    },
  });

  const listing8 = await prisma.listing.create({
    data: {
      productId: peppers.id,
      sellerId: farmer3.id,
      priceCents: 9000, // ₱90/kg
      quantity: 180,
      available: true,
    },
  });

  const listing9 = await prisma.listing.create({
    data: {
      productId: squash.id,
      sellerId: farmer1.id,
      priceCents: 4500, // ₱45/kg
      quantity: 350,
      available: true,
    },
  });

  const listing10 = await prisma.listing.create({
    data: {
      productId: broccoli.id,
      sellerId: farmer3.id,
      priceCents: 10000, // ₱100/kg
      quantity: 120,
      available: true,
    },
  });

  // ============================================
  // CREATE LISTINGS (Reseller - Retail)
  // ============================================
  console.log("  📋 Creating reseller listings...");

  const resellerListing1 = await prisma.listing.create({
    data: {
      productId: tomatoes.id,
      sellerId: reseller1.id,
      priceCents: 8000, // ₱80/kg (retail price)
      quantity: 100,
      available: true,
    },
  });

  const resellerListing2 = await prisma.listing.create({
    data: {
      productId: cabbage.id,
      sellerId: reseller1.id,
      priceCents: 6000, // ₱60/kg (retail price)
      quantity: 80,
      available: true,
    },
  });

  const resellerListing3 = await prisma.listing.create({
    data: {
      productId: carrots.id,
      sellerId: reseller2.id,
      priceCents: 7500, // ₱75/kg (retail price)
      quantity: 60,
      available: true,
    },
  });

  const resellerListing4 = await prisma.listing.create({
    data: {
      productId: strawberries.id,
      sellerId: reseller2.id,
      priceCents: 15000, // ₱150/kg (retail price)
      quantity: 50,
      available: true,
    },
  });

  const resellerListing5 = await prisma.listing.create({
    data: {
      productId: lettuce.id,
      sellerId: reseller3.id,
      priceCents: 9500, // ₱95/kg (retail price)
      quantity: 40,
      available: true,
    },
  });

  const resellerListing6 = await prisma.listing.create({
    data: {
      productId: potatoes.id,
      sellerId: reseller3.id,
      priceCents: 5000, // ₱50/kg (retail price)
      quantity: 120,
      available: true,
    },
  });

  // ============================================
  // CREATE ORDERS
  // ============================================
  console.log("  📦 Creating orders...");

  // Order 1: Business to Farmer (CONFIRMED)
  const order1 = await prisma.order.create({
    data: {
      buyerId: business1.id,
      sellerId: farmer1.id,
      totalCents: 0,
      status: "CONFIRMED",
      scheduledDate: new Date("2026-04-25"),
      scheduledTime: "09:00",
      route: "Kennon Road",
      isCBD: false,
      truckWeightKg: 3000,
      deliveryAddress: "123 Session Road, Baguio City",
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

  // Order 2: Business to Farmer (DELIVERED)
  const order2 = await prisma.order.create({
    data: {
      buyerId: business2.id,
      sellerId: farmer2.id,
      totalCents: 0,
      status: "DELIVERED",
      scheduledDate: new Date("2026-04-15"),
      scheduledTime: "08:00",
      route: "Quirino Highway",
      isCBD: true,
      truckWeightKg: 2500,
      deliveryAddress: "456 Magsaysay Avenue, Baguio City",
      items: {
        create: [
          {
            listingId: listing3.id,
            quantity: 40,
            priceCents: 5500,
          },
          {
            listingId: listing7.id,
            quantity: 25,
            priceCents: 7000,
          },
        ],
      },
    },
  });

  // Order 3: Buyer to Reseller (PENDING)
  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      sellerId: reseller1.id,
      totalCents: 0,
      status: "PENDING",
      items: {
        create: [
          {
            listingId: resellerListing1.id,
            quantity: 5,
            priceCents: 8000,
          },
          {
            listingId: resellerListing2.id,
            quantity: 3,
            priceCents: 6000,
          },
        ],
      },
    },
  });

  // Order 4: Business to Farmer (SHIPPED)
  const order4 = await prisma.order.create({
    data: {
      buyerId: business3.id,
      sellerId: farmer3.id,
      totalCents: 0,
      status: "SHIPPED",
      scheduledDate: new Date("2026-04-22"),
      scheduledTime: "10:00",
      route: "Marcos Highway",
      isCBD: false,
      truckWeightKg: 4000,
      deliveryAddress: "789 Harrison Road, Baguio City",
      items: {
        create: [
          {
            listingId: listing6.id,
            quantity: 20,
            priceCents: 12000,
          },
          {
            listingId: listing10.id,
            quantity: 15,
            priceCents: 10000,
          },
        ],
      },
    },
  });

  // Order 5: Buyer to Reseller (DELIVERED)
  const order5 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      sellerId: reseller2.id,
      totalCents: 0,
      status: "DELIVERED",
      items: {
        create: [
          {
            listingId: resellerListing3.id,
            quantity: 8,
            priceCents: 7500,
          },
          {
            listingId: resellerListing4.id,
            quantity: 5,
            priceCents: 15000,
          },
        ],
      },
    },
  });

  // Order 6: Business to Farmer (PENDING)
  const order6 = await prisma.order.create({
    data: {
      buyerId: business1.id,
      sellerId: farmer2.id,
      totalCents: 0,
      status: "PENDING",
      items: {
        create: [
          {
            listingId: listing3.id,
            quantity: 60,
            priceCents: 5500,
          },
          {
            listingId: listing4.id,
            quantity: 40,
            priceCents: 8000,
          },
        ],
      },
    },
  });

  // Update order totals
  for (const order of [order1, order2, order3, order4, order5, order6]) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.priceCents, 0);
    await prisma.order.update({
      where: { id: order.id },
      data: { totalCents: total },
    });
  }

  // ============================================
  // CREATE DELIVERY SCHEDULES
  // ============================================
  console.log("  🚚 Creating delivery schedules...");

  await prisma.deliverySchedule.create({
    data: {
      orderId: order1.id,
      proposedBy: farmer1.id,
      scheduledDate: new Date("2026-04-25"),
      scheduledTime: "09:00",
      status: "confirmed",
      route: "Kennon Road",
      isCBD: false,
      truckWeightKg: 3000,
      deliveryAddress: "123 Session Road, Baguio City",
      notes: "Delivery via Kennon Road, early morning to avoid traffic",
      confirmedBy: business1.id,
    },
  });

  await prisma.deliverySchedule.create({
    data: {
      orderId: order4.id,
      proposedBy: farmer3.id,
      scheduledDate: new Date("2026-04-22"),
      scheduledTime: "10:00",
      status: "confirmed",
      route: "Marcos Highway",
      isCBD: false,
      truckWeightKg: 4000,
      deliveryAddress: "789 Harrison Road, Baguio City",
      notes: "Large truck, Marcos Highway route",
      confirmedBy: business3.id,
    },
  });

  await prisma.deliverySchedule.create({
    data: {
      orderId: order6.id,
      proposedBy: farmer2.id,
      scheduledDate: new Date("2026-04-26"),
      scheduledTime: "08:30",
      status: "proposed",
      route: "Quirino Highway",
      isCBD: true,
      truckWeightKg: 3500,
      deliveryAddress: "123 Session Road, Baguio City",
      notes: "Proposed schedule for CBD delivery",
    },
  });

  // ============================================
  // CREATE MESSAGES
  // ============================================
  console.log("  💬 Creating messages...");

  await prisma.message.create({
    data: {
      senderId: business1.id,
      receiverId: farmer1.id,
      orderId: order1.id,
      content: "Hello, I would like to confirm the delivery time for my order.",
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: farmer1.id,
      receiverId: business1.id,
      orderId: order1.id,
      content: "Good morning! Yes, your order is scheduled for April 25 at 9:00 AM via Kennon Road.",
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: buyer1.id,
      receiverId: reseller1.id,
      orderId: order3.id,
      content: "Hi, when can I pick up my order?",
      read: false,
    },
  });

  await prisma.message.create({
    data: {
      senderId: business2.id,
      receiverId: farmer2.id,
      content: "Thank you for the previous delivery. The quality was excellent!",
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: farmer3.id,
      receiverId: business3.id,
      orderId: order4.id,
      content: "Your order has been shipped and is on the way!",
      read: true,
    },
  });

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================
  console.log("  🔔 Creating notifications...");

  await prisma.notification.create({
    data: {
      userId: business1.id,
      type: "order_confirmed",
      title: "Order Confirmed",
      message: "Your order #1 has been confirmed by the seller.",
      link: "/business/orders",
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: business2.id,
      type: "order_delivered",
      title: "Order Delivered",
      message: "Your order #2 has been delivered successfully.",
      link: "/business/orders",
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmer1.id,
      type: "order_placed",
      title: "New Order Received",
      message: "You have received a new order from Green Valley Restaurant.",
      link: "/farmer/orders",
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: buyer1.id,
      type: "message",
      title: "New Message",
      message: "You have a new message from Highland Markets Reseller.",
      link: "/buyer/messages",
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: business3.id,
      type: "order_shipped",
      title: "Order Shipped",
      message: "Your order #4 has been shipped and is on the way.",
      link: "/business/orders",
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: farmer2.id,
      type: "order_placed",
      title: "New Order Received",
      message: "You have received a new order from Green Valley Restaurant.",
      link: "/farmer/orders",
      read: false,
    },
  });

  // ============================================
  // CREATE FAVORITES
  // ============================================
  console.log("  ⭐ Creating favorites...");

  await prisma.favorite.create({
    data: {
      userId: buyer1.id,
      listingId: resellerListing1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer1.id,
      listingId: resellerListing4.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer2.id,
      listingId: resellerListing3.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer3.id,
      listingId: resellerListing5.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer3.id,
      listingId: resellerListing6.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: business1.id,
      listingId: listing1.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: business2.id,
      listingId: listing3.id,
    },
  });

  // ============================================
  // CREATE CONTACT MESSAGES
  // ============================================
  console.log("  📧 Creating contact messages...");

  await prisma.contactMessage.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      subject: "Inquiry about bulk orders",
      message: "I would like to inquire about placing bulk orders for my restaurant chain.",
      type: "business",
      status: "pending",
    },
  });

  await prisma.contactMessage.create({
    data: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      subject: "Partnership opportunity",
      message: "We are interested in partnering with your platform for vegetable sourcing.",
      type: "general",
      status: "reviewed",
    },
  });

  await prisma.contactMessage.create({
    data: {
      name: "Carlos Mendoza",
      email: "carlos@example.com",
      subject: "Technical support needed",
      message: "I'm having trouble with my account login.",
      type: "support",
      status: "resolved",
      userId: buyer1.id,
    },
  });

  // ============================================
  // CREATE APPEAL (for banned user scenario)
  // ============================================
  console.log("  📋 Creating sample appeal...");

  const bannedUser = await prisma.user.create({
    data: {
      name: "Test Banned User",
      email: "banned@email.com",
      password: defaultPassword,
      role: "buyer",
      isBanned: true,
      bannedAt: new Date(),
      banReason: "Violated terms of service",
    },
  });

  await prisma.appeal.create({
    data: {
      userId: bannedUser.id,
      appealReason: "request_unban",
      appealDetails: "I believe my ban was a mistake. I have not violated any terms of service.",
      status: "pending",
    },
  });

  // ============================================
  // CREATE AUDIT LOGS
  // ============================================
  console.log("  📝 Creating audit logs...");

  await prisma.auditLog.create({
    data: {
      userId: bannedUser.id,
      action: "ban",
      actor: "admin@nateng.com",
      reason: "Violated terms of service",
      metadata: JSON.stringify({ banDuration: "permanent" }),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "system_cleanup",
      actor: "system",
      reason: "Scheduled database maintenance",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`  👤 Users: ${14} created (3 farmers, 3 businesses, 3 resellers, 4 buyers, 1 banned)`);
  console.log(`  🥬 Products: ${10} created`);
  console.log(`  📋 Listings: ${16} created (10 farmer, 6 reseller)`);
  console.log(`  📦 Orders: ${6} created (various statuses)`);
  console.log(`  🚚 Delivery Schedules: ${3} created`);
  console.log(`  💬 Messages: ${5} created`);
  console.log(`  🔔 Notifications: ${6} created`);
  console.log(`  ⭐ Favorites: ${7} created`);
  console.log(`  📧 Contact Messages: ${3} created`);
  console.log(`  📋 Appeals: ${1} created`);
  console.log(`  📝 Audit Logs: ${2} created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
