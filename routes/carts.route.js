import express from "express";
import controller from "../controllers/carts.controller.js";
import isCartOwner from "../middlewares/isCartOwner.js";
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";

const ROUTER = express.Router();
ROUTER.get("/", admin_only_middlewares, controller.index);
ROUTER.get("/:id", [...authenticated_only_middlewares, isCartOwner], controller.findOne); 
ROUTER.post("/", authenticated_only_middlewares, controller.store); 
ROUTER.put("/:id", [...authenticated_only_middlewares, isCartOwner], controller.edit);
ROUTER.delete("/:id", [...authenticated_only_middlewares, isCartOwner], controller.destroy);

export default ROUTER;
