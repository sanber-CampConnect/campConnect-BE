import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller.js';
import { authenticated_only_middlewares } from "../configs/accessMiddlewares.js";

const router = express.Router();

router.get('/', authenticated_only_middlewares, getProfile);
router.put('/edit', authenticated_only_middlewares, updateProfile);
router.put('/changePassword', authenticated_only_middlewares, updatePassword);

export default router;
