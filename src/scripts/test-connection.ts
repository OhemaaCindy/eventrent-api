import { prisma } from "../lib/prisma";

async function main() {
  const categoryCount = await prisma.category.count();
  console.log(`Connected! Category count: ${categoryCount}`);
}

main()
  .catch((e) => {
    console.error("Connection failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });