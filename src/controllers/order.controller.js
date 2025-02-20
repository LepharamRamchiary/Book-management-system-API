import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/nodemailer.js";
import crypto from "crypto";

const createOrder = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isAdmin) {
    throw new ApiError(403, "Admin can not access this route");
  }
  try {
    const { books, deliveryAddress } = req.body;
    const userId = req.user._id;

    if (!books || books.length === 0) {
      throw new ApiError(400, "No books in order");
    }

    let totalPrice = 0;

    const orderBooks = await Promise.all(
      books.map(async (item) => {
        const book = await Book.findById(item.book);
        if (!book) {
          throw new ApiError(404, "Book not found");
        }
        totalPrice += book.price * item.quantity;
        return {
          book: book._id,
          quantity: item.quantity,
          price: book.price,
        };
      })
    );

    const order = await Order.create({
      user: userId,
      books: orderBooks,
      totalPrice,
      deliveryAddress,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Failed to create order");
  }
});

const updatedPayment = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const validMethods = [
      "Credit Card",
      "Debit Card",
      "PayPal",
      "Cash on Delivery",
    ];
    if (!validMethods.includes(paymentMethod)) {
      throw new ApiError(400, "Invalid payment method");
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, "Invalid order ID");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    order.paymentMethod = paymentMethod;
    order.isPaid = paymentMethod === "Cash on Delivery" ? false : true;

    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Payment update sucessfully"));
  } catch (error) {
    throw new ApiError(500, "Server Error");
  }
});

const getOrdersForSpecificUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isAdmin) {
    throw new ApiError(403, "Admin can not access this route");
  }

  const orders = await Order.find({ user: user }).populate(
    "books.book",
    "title genre author isbn"
  );

  const count = await Order.countDocuments({ user: user });

  const resData = {
    orders,
    total: count,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, resData, "Orders fetched successfully"));
});

const getAllOrderByAdmin = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.isAdmin) {
    throw new ApiError(403, "Admin only access this route");
  }

  const orders = await Order.find()
    .populate("user", "fullname username email")
    .populate("books.book", "title genre author isbn");

  const count = await Order.countDocuments();

  const resData = {
    orders,
    total: count,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, resData, "Orders fetched successfully"));
});

const getSingleOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("user", "fullname username email")
    .populate("books.book", "title genre author isbn");

  //   console.log("order id", orderId);
  //   console.log("order", order);
  //   console.log("user id", req.user._id);
  //   console.log("order user id", order.user._id);
  //   console.log("is admin", req.user.isAdmin);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    !req.user.isAdmin &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Unauthorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const user = req.user;
  const { status } = req.body;

  if (!user.isAdmin) {
    throw new ApiError(403, "Only Admin can access this route");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Status update successfully"));
});

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const user = req.user;
  const { orderId } = req.params;

  if (user.isAamin) {
    throw new ApiError(403, "Only admin can access this route");
  }

  const orderDelete = await Order.findByIdAndDelete(orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Order deleted successfully"));
});

const requestCancelOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { orderId } = req.params;

  if (user.isAdmin) {
    throw new ApiError(403, "Admin can not access this route");
  }

  const order = await Order.findById(orderId).populate(
    "user",
    "email fullname"
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user._id.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if (order.status === "Cancelled") {
    throw new ApiError(400, "Order already cancelled");
  }

  // generate otp
  const otp = crypto.randomInt(100000, 999999).toString();
  order.otp = otp;
  order.otpExpires = Date.now() + 10 * 60 * 1000;
  await order.save();

  const sendOtp = await sendEmail({
    email: order.user.email,
    subject: "Order Cancellation",
    message: `<p>Your OTP for order cancellation is: <b>${otp}</b></p>`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const cancelOrderWithOtp = asyncHandler(async (req, res) => {
  const user = req.user;
  const { orderId } = req.params;
  const { otp } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user._id.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if (!order.otp || !order.otpExpires || order.otpExpires < Date.now()) {
    throw new ApiError(400, "OTP expired");
  }

  if (order.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // update status
  order.status = "Cancelled";
  order.otp = undefined;
  order.otpExpires = undefined;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export {
  createOrder,
  updatedPayment,
  getOrdersForSpecificUser,
  getAllOrderByAdmin,
  getSingleOrderById,
  updateStatus,
  deleteOrderByAdmin,
  requestCancelOrder,
  cancelOrderWithOtp,
};
