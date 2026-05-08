import { Router } from "express";
import { validate } from "../../middleware/validate";
import { cartItemSchema, mergeCartSchema, productIdSchema, quantitySchema } from "./cart.schema";
import { addItemToCartController, clearCartController, getCartController, mergeCartController, removeItemFromCartController, updateCartItemQuantityController, verifyCartAndCheckoutController } from "./cart.controller";
import { protect } from "../../middleware/protect";

const router = Router()


router.use(protect)

router.get("/me", getCartController);

router.post('/merge', validate(mergeCartSchema, 'body'), mergeCartController)

router.post('/items/add/', validate(cartItemSchema, 'body'), addItemToCartController)

router.delete('/items/delete/:productId', validate(productIdSchema, 'params'), removeItemFromCartController)

router.patch('/items/update/:productId', validate(productIdSchema, 'params'),
    validate(quantitySchema, 'body'), updateCartItemQuantityController)

router.delete('/', clearCartController)

router.post('/checkout', verifyCartAndCheckoutController)

export default router;
