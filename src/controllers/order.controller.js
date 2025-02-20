import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { books, paymentMethod, deliveryAddress } = req.body;
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

    const isPaid = paymentMethod === "Cash on Delivery" ? false : true;

    const order = await Order.create({
      user: userId,
      books: orderBooks,
      totalPrice,
      paymentMethod,
      deliveryAddress,
      isPaid,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    throw new ApiError(400, error?.message, "Failed to create order");
  }
});

export { createOrder };
