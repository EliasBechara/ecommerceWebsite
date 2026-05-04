import { Router } from "express";
import { validate } from "../../middleware/validate";
import { cartItemSchema, productIdSchema, quantitySchema } from "./cart.schema";
import { addItemToCartController, clearCartController, removeItemFromCartController, updateCartItemQuantityController, verifyCartAndCheckoutController } from "./cart.controller";
import { protect } from "../../middleware/protect";

const router = Router()


router.use(protect)


router.post('/items', validate(cartItemSchema, 'body'), addItemToCartController)

router.delete('/items/:productId', validate(productIdSchema, 'params'), removeItemFromCartController)

router.patch('/items/:productId', validate(quantitySchema, 'params'), updateCartItemQuantityController)

router.delete('/', clearCartController)

router.post('/checkout', verifyCartAndCheckoutController)

export default router;
