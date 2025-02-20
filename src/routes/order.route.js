import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOrder, updatedPayment } from "../controllers/order.controller.js";

const router = Router();

// Applying verifyJwt for all routes
router.use(verifyJWT);

router.route("/create-order").post(createOrder)
router.route("/update-payment/:orderId").post(updatedPayment)

export default router;