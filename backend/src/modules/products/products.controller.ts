import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { Category } from '@prisma/client';
import {
  getProductBySlug,
  listProductsByCategory,
  findProductsByQuery,
} from './products.service';

import {
  SearchForProductsInput,
  SlugInput,
} from './products.schema';



export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { sort } = req.query;
  const products = await listProductsByCategory(
    category as Category,
    sort as string
  );
  res.status(200).json(products);
});

export const getSingleProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as SlugInput;
    const product = await getProductBySlug(slug);
    res.status(200).json(product);
  },
);

export const searchForProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const { q } = req.query as SearchForProductsInput;

    const products = await findProductsByQuery(q || undefined);

    res.status(200).json(products);
  },
);

