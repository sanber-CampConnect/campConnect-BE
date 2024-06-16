import express from "express";
import controller from "../controllers/order.controller.js"
import isOrderOwner from "../middlewares/isOrderOwner.js";
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";

// TODO: Protect using RBAC
const ROUTER = express.Router();
ROUTER.get("/", admin_only_middlewares, controller.index);
ROUTER.post("/", authenticated_only_middlewares, controller.store);
ROUTER.get("/:id/items", [...authenticated_only_middlewares, isOrderOwner], controller.findOne);
ROUTER.get("/:id", [...authenticated_only_middlewares, isOrderOwner], controller.findOne);
// ROUTER.patch("/:id", [authenticated_only_middlewares, isOrderOwner], controller.updateStatus);
ROUTER.delete("/:id", [...authenticated_only_middlewares, isOrderOwner], controller.destroy);

export default ROUTER;
