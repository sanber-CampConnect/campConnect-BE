import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import controller from "../controllers/transaction.controller.js"
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";
import { imageOnly } from "../utils/multer.js";
import isTransactionOwner from "../middlewares/isTransactionOwner.js";

dotenv.config();
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        const basePath = path.join(process.env.STORAGE_PATH, "transactions")
        fs.access(basePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) fs.mkdir(basePath, () => callback(null, basePath))
            else callback(null, basePath)
        }); 
    },
    filename: function(req, file, callback) {
        const fileName = `${crypto.randomBytes(20).toString("hex")}.webp`
        req.imagePath = path.join( "transactions", fileName);
        console.log(req.imagePath)
        callback(null, fileName)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: imageOnly
})

const ROUTER = express.Router();
ROUTER.get("/", admin_only_middlewares, controller.index);
ROUTER.get("/:id", [...authenticated_only_middlewares, isTransactionOwner], controller.findOne);
ROUTER.patch("/:id/reject", admin_only_middlewares, controller.rejectEvidence);
ROUTER.patch("/:id/accept", admin_only_middlewares, controller.acceptEvidence);
ROUTER.patch("/:id/upload", [...authenticated_only_middlewares, isTransactionOwner, upload.single("image")], controller.updateEvidence)

export default ROUTER;
