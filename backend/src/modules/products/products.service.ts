import { prisma } from '../../lib/prisma';
import { Category } from '@prisma/client';
import { AppError } from '../../utils/AppError';

export const listProductsByCategory = async (
  category: Category | undefined,
) => {
  if (!category) {
    throw new AppError('Category is required', 400);
  }

  const productsByCategory = prisma.product.findMany({
    where: {
      category,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return productsByCategory;
};

export const listProductBySlug = async (slug: string | undefined) => {
  if (!slug) {
    throw new AppError('The search slug is required', 400);
  }
  const product = prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    throw new AppError('Product not Found', 404);
  }

  return product;
};

export const searchProducts = async (query: string | undefined) => {
  if (!query) {
    throw new AppError('Search query is required', 400);
  }

  const searchedProduct = prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!searchedProduct) {
    throw new AppError('Product not found', 404);
  }

  return searchedProduct;
};
