import path from "node:path";
import express from "express";
import dotenv from "dotenv";

import authRouter from "./auth.route.js"
import categoriesRouter from "./categories.route.js";
import profileRouter from "./profile.route.js"
import userRouter from "./user.route.js";
import variantsRouter from "./variants.route.js";
import productsRouter from "./products.route.js";
import carts from "./carts.route.js";
import cartItems from "./cartItems.route.js";
import orderItems from "./orderItems.route.js";
import orders from "./orders.route.js";

dotenv.config();
const ROUTER = express.Router();
ROUTER.use("/auth", authRouter);
ROUTER.use("/profile", profileRouter);
ROUTER.use("/users", userRouter);
ROUTER.use("/categories", categoriesRouter);
ROUTER.use("/variants", variantsRouter);
ROUTER.use("/products", productsRouter);
ROUTER.use("/carts", carts);
ROUTER.use("/cartItems", cartItems);
ROUTER.use("/orderItems", orderItems);
ROUTER.use("/orders", orders);
ROUTER.use("/assets", express.static(process.env.STORAGE_PATH))
ROUTER.use("/assets/default", express.static(path.join("public", "img")));
ROUTER.use("/", (req, res, next) => next( {
    code: "not_found", 
    msg: "Hello from campConnect! We can't find the path you requested"
}));

export default ROUTER;