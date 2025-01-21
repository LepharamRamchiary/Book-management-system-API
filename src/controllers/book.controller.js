import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const addBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    isbn,
    price,
    quantity,
    publishedDate,
    genre,
    description,
  } = req.body;

  if (
    [title, author, isbn, price, quantity].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "The title, author, isbn, price, and quantity fields are required"
    );
  }

  const existedBook = await Book.findOne({
    $or: [{ title }, { isbn }],
  });

  if (existedBook) {
    throw new ApiError(409, "Book with title or isbn already exists");
  }

  const imageLocalPath = req.files?.image[0]?.path;
  

  if (!imageLocalPath) {
    throw new ApiError(400, "Image file is required");
  }

  const imageCloudinary = await uploadOnCloudinary(imageLocalPath);
//   console.log("Cloudinary upload response:", imageCloudinary);

  const book = await Book.create({
    title,
    author,
    isbn,
    price,
    quantity,
    publishedDate,
    genre,
    description,
    image: imageCloudinary.url,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, book, "Book add sucessfully"));
});

export { addBook };
