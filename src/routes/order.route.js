/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *         - totalAmount
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, paid, shipped, delivered, canceled]
 */

/**
 * @swagger
 * /api/orders/create-order:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/orders/update-payment/{orderId}:
 *   post:
 *     summary: Update order payment status
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/orders/get-user-order:
 *   get:
 *     summary: Get orders for the logged-in user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/orders/get-order-by-admin:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/orders/get-single-order/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/orders/update-status/{orderId}:
 *   post:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, shipped, delivered, canceled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/orders/delete-order-by-admin/{orderId}:
 *   delete:
 *     summary: Delete an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/orders/request-otp/{orderId}:
 *   post:
 *     summary: Request OTP to cancel an order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/orders/cancel-order/{orderId}:
 *   post:
 *     summary: Cancel order with OTP verification
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *       400:
 *         description: Invalid OTP
 */


import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  updatedPayment,
  getOrdersForSpecificUser,
  getAllOrderByAdmin,
  getSingleOrderById,
  updateStatus,
  deleteOrderByAdmin,
  requestCancelOrder,
  cancelOrderWithOtp
} from "../controllers/order.controller.js";

const router = Router();

// Applying verifyJwt for all routes
router.use(verifyJWT);

router.route("/create-order").post(createOrder);
router.route("/update-payment/:orderId").post(updatedPayment);
router.route("/get-user-order").get(getOrdersForSpecificUser);
router.route("/get-order-by-admin").get(getAllOrderByAdmin);
router.route("/get-single-order/:orderId").get(getSingleOrderById);
router.route("/update-status/:orderId").post(updateStatus);
router.route("/delete-order-by-admin/:orderId").delete(deleteOrderByAdmin);
router.route("/request-otp/:orderId").post(requestCancelOrder);
router.route("/cancel-order/:orderId").post(cancelOrderWithOtp);

export default router;
