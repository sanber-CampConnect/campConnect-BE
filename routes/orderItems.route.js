import express from "express";
import controller from "../controllers/oderItems.controller.js";
import isOrderItemOwner from "../middlewares/isOrderItemOwner.js";
import { authenticated_only_middlewares, admin_only_middlewares } from "../configs/accessMiddlewares.js";

const ROUTER = express.Router({ mergeParams: true });

ROUTER.get("/", authenticated_only_middlewares, controller.index);
ROUTER.get("/:id", authenticated_only_middlewares, controller.findOne);
ROUTER.post("/", authenticated_only_middlewares, controller.store);
ROUTER.put("/:id", authenticated_only_middlewares, controller.edit);
ROUTER.delete("/:id", authenticated_only_middlewares, controller.destroy);

export default ROUTER;
