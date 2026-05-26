import { Router } from 'express';
import { protect } from '../../middleware/protect';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from './users.schema';
import {
    getProfileController,
    updateProfileController,
    getAddressesController,
    createAddressController,
    updateAddressController,
    deleteAddressController,
} from './users.controller';

const router = Router();

router.use(protect);

// ─── Profile ────────────────────────────────────────────────────────────────
router.get('/me', getProfileController);
router.patch('/me/profile', validate(updateProfileSchema, 'body'), updateProfileController);

// ─── Addresses ──────────────────────────────────────────────────────────────
router.get('/me/addresses', getAddressesController);
router.post('/me/addresses', validate(createAddressSchema, 'body'), createAddressController);
router.patch('/me/addresses/:addressId', validate(updateAddressSchema, 'body'), updateAddressController);
router.delete('/me/addresses/:addressId', deleteAddressController);

export default router;