import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  getProductBySlug,
  listProductsByCategory,
  findProductsByQuery,
} from './products.service';

import {
  GetProductsInput,
  SearchForProductsInput,
  SlugInput,
} from './products.schema';

export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.params as GetProductsInput;

    const products = await listProductsByCategory(category);

    res.status(200).json(products);
  },
);

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
