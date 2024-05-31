import express from 'express';
import { getProfile, updateProfile, updatePassword } from '../controllers/userController.js';
import authJWT from '../middlewares/authJwt.js';

const router = express.Router();

router.get('/profile', authJWT, getProfile);
router.put('/profile', authJWT, updateProfile);
router.put('/profile/password', authJWT, updatePassword);

export default router;
