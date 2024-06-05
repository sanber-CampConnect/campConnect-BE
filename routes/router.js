import express from "express";
import authJWT from "../middlewares/authJwt.js";

// CRUD (Direct access for admins only)
import userRouter from "./user.route.js";
import categoriesRouter from "./categories.route.js";

// Frontend
import authRouter from "./auth.route.js"
import profileRouter from "./profile.route.js"

const ROUTER = express.Router();
const BASE_MIDDLEWARES = [authJWT]

ROUTER.use("/auth", authRouter);
ROUTER.use("/profile", BASE_MIDDLEWARES, profileRouter);
ROUTER.use("/users", BASE_MIDDLEWARES, userRouter);
ROUTER.use("/categories", BASE_MIDDLEWARES, categoriesRouter);
ROUTER.use("/", (req, res) => res.send({msg: "hello from CampConnect"}));

export default ROUTER;