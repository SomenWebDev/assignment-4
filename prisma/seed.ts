// prisma/seed.ts
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import prisma from "../src/lib/prisma";
import {
  PaymentMethod,
  PaymentStatus,
  RentalStatus,
  Role,
} from "./generated/prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { email: "somensingha@gearup.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "somensingha@gearup.com",
      password,
      role: Role.ADMIN,
    },
  });

  const provider1 = await prisma.user.upsert({
    where: { email: "peter.parker@gmail.com" },
    update: {},
    create: {
      name: "Peter Parker",
      email: "peter.parker@gmail.com",
      password,
      role: Role.PROVIDER,
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: "clark.kent@gmail.com" },
    update: {},
    create: {
      name: "Clark Kent",
      email: "clark.kent@gmail.com",
      password,
      role: Role.PROVIDER,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "bruce.wayne@gmail.com" },
    update: {},
    create: {
      name: "Bruce Wayne",
      email: "bruce.wayne@gmail.com",
      password,
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "tony.stark@gmail.com" },
    update: {},
    create: {
      name: "Tony Stark",
      email: "tony.stark@gmail.com",
      password,
      role: Role.CUSTOMER,
    },
  });

  console.log("✅ Users seeded");

  // ── Categories ──
  const categoryNames = ["Camping", "Cycling", "Water Sports", "Fitness"];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // ── Gear Items ──
  const gearToCreate = [
    {
      id: "seed-gear-1",
      name: "4-Person Camping Tent",
      brand: "Coleman",
      pricePerDay: 1200,
      stock: 5,
      providerId: provider1.id,
      categoryId: categories[0]!.id,
    },
    {
      id: "seed-gear-2",
      name: "Mountain Bike Pro",
      brand: "Trek",
      pricePerDay: 800,
      stock: 3,
      providerId: provider2.id,
      categoryId: categories[1]!.id,
    },
    {
      id: "seed-gear-3",
      name: "Kayak Single Seater",
      brand: "Perception",
      pricePerDay: 1500,
      stock: 2,
      providerId: provider1.id,
      categoryId: categories[2]!.id,
    },
    {
      id: "seed-gear-4",
      name: "Adjustable Dumbbell Set",
      brand: "Bowflex",
      pricePerDay: 400,
      stock: 8,
      providerId: provider2.id,
      categoryId: categories[3]!.id,
    },
    {
      id: "seed-gear-5",
      name: "Sleeping Bag -10°C",
      brand: "Coleman",
      pricePerDay: 300,
      stock: 10,
      providerId: provider1.id,
      categoryId: categories[0]!.id,
    },
  ];

  const gearItems = [];
  for (const g of gearToCreate) {
    const gear = await prisma.gearItem.upsert({
      where: { id: g.id },
      update: {},
      create: g,
    });
    gearItems.push(gear);
  }
  console.log(`✅ ${gearItems.length} gear items seeded`);

  // ── Rental Orders + Payments (only if none exist yet) ──
  const existingOrders = await prisma.rentalOrder.count();

  if (existingOrders === 0) {
    const rentalsToCreate = [
      {
        gear: gearItems[0]!,
        customerId: customer1.id,
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-08-11"),
        rentalStatus: RentalStatus.PAID,
        paymentStatus: PaymentStatus.COMPLETED,
      },
      {
        gear: gearItems[1]!,
        customerId: customer2.id,
        startDate: new Date("2026-08-10"),
        endDate: new Date("2026-08-20"),
        rentalStatus: RentalStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
      },
      {
        gear: gearItems[3]!,
        customerId: customer1.id,
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-25"),
        rentalStatus: RentalStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
      },
    ];

    for (const r of rentalsToCreate) {
      const days = 10;
      const totalAmount = days * Number(r.gear.pricePerDay);

      const rentalOrder = await prisma.rentalOrder.create({
        data: {
          customerId: r.customerId,
          startDate: r.startDate,
          endDate: r.endDate,
          totalAmount,
          status: r.rentalStatus,
          items: {
            create: {
              gearItemId: r.gear.id,
              quantity: 1,
              price: r.gear.pricePerDay,
            },
          },
        },
      });

      if (r.paymentStatus !== PaymentStatus.PENDING) {
        await prisma.payment.create({
          data: {
            rentalOrderId: rentalOrder.id,
            amount: totalAmount,
            method: PaymentMethod.STRIPE,
            status: r.paymentStatus,
            transactionId: randomUUID(),
          },
        });
      }
    }
    console.log("✅ Rental orders + payments seeded");
  } else {
    console.log("↩︎ Rental orders already exist, skipping");
  }

  // ── Sample Review ──
  const existingReview = await prisma.review.findFirst({
    where: { customerId: customer1.id, gearItemId: gearItems[0]!.id },
  });

  if (!existingReview) {
    await prisma.review.create({
      data: {
        customerId: customer1.id,
        gearItemId: gearItems[0]!.id,
        rating: 5,
        comment: "Great tent, easy setup and kept us dry!",
      },
    });
    console.log("✅ Review seeded");
  }

  console.log("🌱 Seed finished:", {
    admin: admin.email,
    provider1: provider1.email,
    customer1: customer1.email,
  });
}

main()
  .catch((error) => {
    console.dir(error, { depth: null });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
