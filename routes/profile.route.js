import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/profile.controller.js';
import authJWT from '../middlewares/authJwt.js';

const router = express.Router();

router.get('/', authJWT, getProfile);
router.put('/edit', authJWT, updateProfile);
router.put('/changePassword', authJWT, updatePassword);

export default router;
