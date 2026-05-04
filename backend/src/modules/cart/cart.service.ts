import { prisma } from "../../lib/prisma"
import { AppError } from "../../utils/AppError";

export const createCartService = async (userId: string) => {
  const createdCart = await prisma.cart.create({
    data: {
      userId,
    },
  });

  return createdCart;
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