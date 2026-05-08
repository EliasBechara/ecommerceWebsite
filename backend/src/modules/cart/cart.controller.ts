import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from "../../middleware/asyncHandler";
import { addItemToCartService, clearCartService, getCartService, mergeCartService, removeItemFromCartService, updateCartItemQuantityService, verifyCartAndCheckoutService } from "./cart.service";



export const getCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;

    const cart = await getCartService(userId);

    res.status(200).json({
      items: cart.items,
    });
  }
);


export const mergeCartController = async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).id;
  const { items } = req.body;

  const updatedCart = await mergeCartService(userId, items);

  res.status(200).json(updatedCart);
};


// ---------------------- CART OPERATIONS -----------------------

export const addItemToCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;
    const { productId, quantity } = req.body

    const cart = await addItemToCartService(userId, productId, quantity);

    res.status(200).json(cart);
  }
)

export const removeItemFromCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;
    const productId = req.params.productId as string

    const cart = await removeItemFromCartService(userId, productId);

    res.status(200).json(cart);
  }
)

export const updateCartItemQuantityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;
    const productId = req.params.productId as string
    const { quantity } = req.body

    const cart = await updateCartItemQuantityService(userId, productId, quantity);

    res.status(200).json(cart);
  }
)

export const clearCartController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;

    const cart = await clearCartService(userId);

    res.status(200).json(cart);
  }
)

// -------- CHECKOUT ------------------

export const verifyCartAndCheckoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).id;

    const cart = await verifyCartAndCheckoutService(userId);

    res.status(200).json(cart);
  }
)
