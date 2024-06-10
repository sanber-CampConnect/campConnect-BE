import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs"

import dotenv from "dotenv";
import multer from "multer";
import express from 'express';
import { getProfile, updateProfile, updatePassword, deleteAccount } from '../controllers/profile.controller.js';
import { authenticated_only_middlewares } from "../configs/accessMiddlewares.js";
import { imageOnly } from "../utils/multer.js";


dotenv.config();
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        const basePath = path.join(process.env.STORAGE_PATH, "users")
        console.log(basePath)
        fs.access(basePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) fs.mkdir(basePath, () => callback(null, basePath))
            else callback(null, basePath)
        }); 
    },
    filename: function(req, file, callback) {
        const fileName = `${crypto.randomBytes(20).toString("hex")}.webp`
        console.log(fileName)
        req.imagePath = path.join("users", fileName);
        callback(null, fileName)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: imageOnly
})

const router = express.Router();
router.get('/', authenticated_only_middlewares, getProfile);
router.put('/edit', [...authenticated_only_middlewares, upload.single("image")], updateProfile);
router.put('/changePassword', authenticated_only_middlewares, updatePassword);
router.delete('/delete', authenticated_only_middlewares, deleteAccount);

export default router;
