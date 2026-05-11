import { Request, Response } from 'express';

import { checkStockBySlug, decrementProductStock } from './stock.service';
import { StockSlugInput, DecrementStockInput } from './stock.schema';
import { asyncHandler } from '../../middleware/asyncHandler';

export const validateStock = asyncHandler(
    async (req: Request, res: Response) => {
        const { slug } = req.params as StockSlugInput;
        const { quantity } = req.query as unknown as DecrementStockInput;
        const result = await checkStockBySlug(slug, Number(quantity));
        res.status(200).json(result);
    },
);

export const decrementStock = asyncHandler(
    async (req: Request, res: Response) => {
        const { slug } = req.params as StockSlugInput;
        const { quantity } = req.body as DecrementStockInput;
        const result = await decrementProductStock(slug, quantity);
        res.status(200).json(result);
    },
);