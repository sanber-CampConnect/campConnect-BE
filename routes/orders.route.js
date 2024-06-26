import express from "express";
import controller from "../controllers/order.controller.js"
import isOrderOwner from "../middlewares/isOrderOwner.js";
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";

// TODO: Protect using RBAC
const ROUTER = express.Router();
ROUTER.get("/", admin_only_middlewares, controller.index);
ROUTER.post("/", authenticated_only_middlewares, controller.store);
ROUTER.get("/my", authenticated_only_middlewares, controller.findByUserId);
ROUTER.get("/:id", [...authenticated_only_middlewares, isOrderOwner], controller.findOne);
ROUTER.patch("/:id/cancel", [...authenticated_only_middlewares, isOrderOwner], controller.cancelOrder);
ROUTER.patch("/:id", admin_only_middlewares, controller.completeOrder);
ROUTER.delete("/:id", [...authenticated_only_middlewares, isOrderOwner], controller.destroy);

export default ROUTER;
