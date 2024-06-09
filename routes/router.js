import express from "express";
import dotenv from "dotenv";

import authRouter from "./auth.route.js"
import categoriesRouter from "./categories.route.js";
import profileRouter from "./profile.route.js"
import userRouter from "./user.route.js";
import variantsRouter from "./variants.route.js";
import productsRouter from "./products.route.js";

dotenv.config();
const ROUTER = express.Router();
ROUTER.use("/auth", authRouter);
ROUTER.use("/profile", profileRouter);
ROUTER.use("/users", userRouter);
ROUTER.use("/categories", categoriesRouter);
ROUTER.use("/variants", variantsRouter);
ROUTER.use("/products", productsRouter);
ROUTER.use("/assets", express.static(process.env.STORAGE_PATH))
ROUTER.use("/", (req, res) => res.send({msg: "hello from CampConnect"}));

export default ROUTER;