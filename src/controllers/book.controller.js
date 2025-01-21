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

const getAllBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const books = await Book.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Book.countDocuments();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page, 10),
          books,
        },
        "Books fetched successfully"
      )
    );
  } catch (error) {
    console.log("error", error);
    throw new ApiError(500, "Failed to fetch books");
  }
});

const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid book ID");
    }

    const book = await Book.findById(id);

    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, book, "Book fetched successfully"));
  } catch (error) {
    console.log("Error fetching book by id", error);
    throw new ApiError(500, "Failed to fetch book");
  }
});
export { addBook, getAllBooks, getBookById };
