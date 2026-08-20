import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Tables & Chairs", slug: "tables-chairs" },
  { name: "Tents & Canopies", slug: "tents-canopies" },
  { name: "Sound & Lighting", slug: "sound-lighting" },
  { name: "Decor", slug: "decor" },
  { name: "Catering Equipment", slug: "catering-equipment" },
  { name: "Other", slug: "other" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Seeded category: ${category.name}`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });