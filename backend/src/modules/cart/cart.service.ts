import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError";

export const getCartService = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  return cart;
};

export type GuestCartItem = {
  productId: string;
  quantity: number;
};

export const mergeCartService = async (
  userId: string,
  guestCart: GuestCartItem[],
) => {
  return prisma.$transaction(async (tx) => {
    // 1. ensure cart exists
    let cart = await tx.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await tx.cart.create({
        data: { userId },
      });
    }

    // 2. get products
    const productIds = guestCart.map((i) => i.productId);

    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. merge
    for (const item of guestCart) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const safeQuantity = Math.min(item.quantity, product.stock);
      if (safeQuantity <= 0) continue;

      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: item.productId,
          },
        },
        update: {
          quantity: safeQuantity,
          price: product.price,
        },
        create: {
          cartId: cart.id,
          productId: item.productId,
          quantity: safeQuantity,
          price: product.price,
        },
      });
    }

    // 4. return full cart
    const updatedCart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!updatedCart) {
      throw new AppError("Cart not found after merge", 500);
    }

    return updatedCart;
  });
};

// ---------------------- CART OPERATIONS -----------------------
export const addItemToCartService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  const [product, cart] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.cart.findUnique({ where: { userId } }),
  ]);

  if (!product) throw new AppError('Product not found', 404);
  if (!cart) throw new AppError('Cart not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity, price: product.price },
  });

  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
};

export const removeItemFromCartService = async (userId: string, productId: string) => {
  const result = await prisma.cartItem.deleteMany({
    where: { cart: { userId }, productId },
  });

  if (result.count === 0) {
    throw new AppError('Item not found in cart', 404);
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) throw new AppError('Cart not found', 404);

  return cart;
};


export const updateCartItemQuantityService = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  let result;

  if (quantity <= 0) {
    result = await prisma.cartItem.deleteMany({
      where: { cart: { userId }, productId },
    });
  } else {
    result = await prisma.cartItem.updateMany({
      where: { cart: { userId }, productId },
      data: { quantity },
    });
  }

  if (result.count === 0) {
    throw new AppError('Item not found in cart', 404);
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) throw new AppError('Cart not found', 404);

  return cart;
};

export const clearCartService = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) throw new AppError('Cart not found', 404);

  await prisma.cartItem.deleteMany({
    where: { cart: { userId } },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  return updatedCart;
};

// -------- CHECKOUT ------------------
export const verifyCartAndCheckoutService = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) throw new AppError('Cart not found', 404);
  if (cart.items.length === 0) throw new AppError('Cart is empty', 400);

  await Promise.all(
    cart.items.map(async (item) => {
      if (!item.product) throw new AppError(`Product no longer exists`, 404);


      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }

      if (item.price !== item.product.price) {
        throw new AppError(`Price changed for ${item.product.name}, please review your cart`, 400);
      }
    })
  );

  return cart;
};