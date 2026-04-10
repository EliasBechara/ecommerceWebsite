import 'dotenv/config';
import { PrismaClient, Category } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.createMany({
    data: [
      // Intel CPUs (i3, i5, i7)
      {
        name: 'Core i3-14100',
        slug: 'core-i3-14100',
        description: 'Entry-level 14th Gen Intel CPU',
        price: 129.99,
        category: Category.CPU,
        image: '/images/i3-14100.png',
        stock: 15,
      },
      {
        name: 'Core i5-14600K',
        slug: 'core-i5-14600k',
        description:
          'High-performance 14th Gen Intel CPU with unlocked multiplier',
        price: 299.99,
        category: Category.CPU,
        image: '/images/i5-14600k.png',
        stock: 10,
      },
      {
        name: 'Core i7-14700K',
        slug: 'core-i7-14700k',
        description: 'Powerful 14th Gen Intel CPU for gaming and productivity',
        price: 399.99,
        category: Category.CPU,
        image: '/images/i7-14700k.png',
        stock: 7,
      },

      // NVIDIA RTX 50-series GPUs
      {
        name: 'RTX 5060',
        slug: 'rtx-5060',
        description: 'Entry-level 50-series GPU - Great for 1080p gaming',
        price: 299.99,
        category: Category.GPU,
        image: '/images/rtx5060.png',
        stock: 20,
      },
      {
        name: 'RTX 5070',
        slug: 'rtx-5070',
        description: 'Mid-range 50-series GPU - Excellent 1440p performance',
        price: 549.99,
        category: Category.GPU,
        image: '/images/rtx5070.png',
        stock: 14,
      },
      {
        name: 'RTX 5080',
        slug: 'rtx-5080',
        description: 'High-end 50-series GPU - Powerful 4K gaming',
        price: 999.99,
        category: Category.GPU,
        image: '/images/rtx5080.png',
        stock: 6,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
