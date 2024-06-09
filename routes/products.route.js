import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import controller from "../controllers/product.controller.js"
import { admin_only_middlewares, authenticated_only_middlewares } from "../configs/accessMiddlewares.js";

dotenv.config();
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        const basePath = path.join(process.env.STORAGE_PATH, "products")
        fs.access(basePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) fs.mkdir(basePath, () => callback(null, basePath))
            else callback(null, basePath)
        }); 
    },
    filename: function(req, file, callback) {
        const fileName = `${crypto.randomBytes(20).toString("hex")}.webp`
        req.imagePath = path.join( "products", fileName);
        console.log(req.imagePath)
        callback(null, fileName)
    }
})

const upload = multer({storage: storage})

const ROUTER = express.Router();
ROUTER.get("/", authenticated_only_middlewares, controller.index);
ROUTER.get("/:id", authenticated_only_middlewares, controller.findOne);
ROUTER.post("/", [...admin_only_middlewares, upload.single("image")], controller.store);
ROUTER.put("/:id", [...admin_only_middlewares, upload.single("image")], controller.edit);
ROUTER.delete("/:id", admin_only_middlewares, controller.destroy);

export default ROUTER;
