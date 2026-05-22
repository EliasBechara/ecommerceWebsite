import { prisma } from '../../lib/prisma';
import { Category } from '@prisma/client';
import { AppError } from '../../utils/AppError';

type SortOption = "price_asc" | "price_desc" | "newest";

const orderByMap: Record<SortOption, object> = {
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  newest: { createdAt: "desc" },
};

export const listProductsByCategory = async (
  category: Category | undefined,
  sort: string = "newest",
) => {
  if (!category) throw new AppError("Category is required", 400);

  const orderBy = orderByMap[sort as SortOption] ?? { createdAt: "desc" };

  return prisma.product.findMany({
    where: { category },
    orderBy,
  });
};

export const getProductBySlug = async (slug: string | undefined) => {
  if (!slug) {
    throw new AppError('The search slug is required', 400);
  }
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    throw new AppError('Product not Found', 404);
  }

  return product;
};

export const findProductsByQuery = async (query: string | undefined) => {
  if (!query) throw new AppError('Search query is required', 400);

  const tokens = query.trim().split(/\s+/).filter(Boolean);

  const searchedProduct = await prisma.product.findMany({
    where: {
      AND: tokens.map((token) => ({
        OR: [
          { name: { contains: token, mode: 'insensitive' } },
          { description: { contains: token, mode: 'insensitive' } },
        ],
      })),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return searchedProduct;
};