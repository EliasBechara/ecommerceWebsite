import { vi, describe, expect, beforeEach, it } from 'vitest';
import {
  getProductBySlug,
  listProductsByCategory,
  findProductsByQuery,
} from '../../products.service';
import { Category } from '@prisma/client';
import { prisma } from '../../../../lib/prisma';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedPrisma = prisma as any;

describe('listProductsByCategory service function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return products by their category if provided the correct input', async () => {
    const fakeProducts = [
      { id: '1', name: 'RTX 4090', category: Category.GPU },
      { id: '2', name: 'RX 7900', category: Category.GPU },
    ];

    mockedPrisma.product.findMany.mockResolvedValue(fakeProducts);

    const result = await listProductsByCategory(Category.GPU);

    expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
      where: { category: Category.GPU },
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual(fakeProducts);
  });

  it('should throw if no category is provided', async () => {
    await expect(listProductsByCategory(undefined)).rejects.toThrow(
      'Category is required',
    );
  });

  it('should return empty array if no products are found', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([]);

    const result = await listProductsByCategory(Category.GPU);

    expect(result).toEqual([]);
  });
});

describe('getProductBySlug service function tests', () => {
  it('should return a product by its slug if provided the correct input', async () => {
    const fakeProduct = {
      id: '1',
      name: 'RTX 5090',
      slug: 'rtx-5090',
      category: Category.GPU,
    };

    mockedPrisma.product.findUnique.mockResolvedValue(fakeProduct);

    const result = await getProductBySlug(fakeProduct.slug);

    expect(mockedPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'rtx-5090' },
    });

    expect(result).toEqual(fakeProduct);
  });

  it('should return an error if the slug is missing', async () => {
    await expect(getProductBySlug('')).rejects.toThrow(
      'The search slug is required',
    );
  });

  it('should return an error if no product is found', async () => {
    mockedPrisma.product.findUnique.mockResolvedValue(null);

    await expect(getProductBySlug('rtx-5090')).rejects.toThrow(
      'Product not Found',
    );
  });
});

describe('findProductsByQuery function tests', () => {
  it('should return products if the search query is correct', async () => {
    const query = 'rtx 5090';

    const fakeProducts = [
      {
        id: '1',
        name: 'RTX 5090',
        slug: 'rtx-5090',
        category: Category.GPU,
      },
    ];

    mockedPrisma.product.findMany.mockResolvedValue(fakeProducts);

    const result = await findProductsByQuery(query);

    expect(mockedPrisma.product.findMany).toHaveBeenCalledWith({
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

    expect(result).toEqual(fakeProducts);
  });

  it('should return an error if no query is provided', async () => {
    await expect(findProductsByQuery('')).rejects.toThrow(
      'Search query is required',
    );
  });

  it('should return empty array if no products match the search', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([]);

    const result = await findProductsByQuery('rtx-5090');

    expect(result).toEqual([]);
  });
});
