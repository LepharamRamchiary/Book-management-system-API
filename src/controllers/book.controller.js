import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Book } from "../models/book.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { cacheData, getCachedData, deleteCacheKey } from "../utils/redis.js";
import mongoose from "mongoose";

const CACHE_EXPIRATION = 2000;

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

  const user = req.user;

  if (!user?.isAdmin) {
    throw new ApiError(403, "Access denied. Only admins can add Books");
  }

  if ([title, author, price, quantity].some((field) => field?.trim() === "")) {
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

  // Invalidate all cached book lists
  let allKeys = await getCachedData("all_books_keys");
  if (!allKeys || !Array.isArray(allKeys)) {
    allKeys = [];
  }

  for (const key of allKeys) {
    console.log(`Deleting cache key: ${key}`);
    await deleteCacheKey(key);
  }

  // Also invalidate single book cache
  await deleteCacheKey(`book_${book._id}`);

  return res
    .status(201)
    .json(new ApiResponse(201, book, "Book add sucessfully"));
});

const getAllBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const cacheKey = `all_books_page_${page}_limit_${limit}`;

  const cachedBooks = await getCachedData(cacheKey);
  if (cachedBooks) {
    return res
      .status(200)
      .json(new ApiResponse(200, cachedBooks, "Books fetched from cache"));
  }

  try {
    const books = await Book.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Book.countDocuments();

    const responseData = {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
      books,
    };

    // Store paginated cache key for future invalidation
    let existingKeys = await getCachedData("all_books_keys");
    if (!existingKeys || !Array.isArray(existingKeys)) {
      existingKeys = [];
    }

    if (!existingKeys.includes(cacheKey)) {
      existingKeys.push(cacheKey);
      await cacheData("all_books_keys", existingKeys, CACHE_EXPIRATION);
      console.log("Updated cache keys:", existingKeys);
    }

    // Cache the response
    console.log(`Storing data in cache: ${cacheKey}`);
    await cacheData(cacheKey, responseData, CACHE_EXPIRATION);

    return res
      .status(200)
      .json(new ApiResponse(200, responseData, "Books fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch books");
  }
});

const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const cacheKey = `book_${id}`;

  // Try to get cached data
  const cachedBook = await getCachedData(cacheKey);
  if (cachedBook) {
    return res
      .status(200)
      .json(new ApiResponse(200, cachedBook, "Book fetched from cache"));
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid book ID");
    }
    const book = await Book.findById(id);

    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    // Cache the book
    await cacheData(cacheKey, book, CACHE_EXPIRATION);

    return res
      .status(200)
      .json(new ApiResponse(200, book, "Book fetched successfully"));
  } catch (error) {
    console.log("Error fetching book by id", error);
    throw new ApiError(500, "Failed to fetch book");
  }
});

const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
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

  const user = req.user;

  if(!user.isAdmin){
    throw new ApiError(403, "Only admin can update the book")
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid book ID");
  }

  const book = await Book.findById(id);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  let updatedImageUrl = book.image;
  if (req.files?.image?.[0]?.path) {
    const imageLocalPath = req.files.image[0].path;

    if (book.image) {
      const publicId = book.image.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    const imageCloudinary = await uploadOnCloudinary(imageLocalPath);
    updatedImageUrl = imageCloudinary.url;
  }

  const updatedBook = await Book.findByIdAndUpdate(
    id,
    {
      title,
      author,
      isbn,
      price,
      quantity,
      publishedDate,
      genre,
      description,
      image: updatedImageUrl,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  // Invalidate cache for this specific book
  console.log(`Deleting cache key: book_${id}`);
  await deleteCacheKey(`book_${id}`);

  // Get all cached book list keys
  let allKeys = await getCachedData("all_books_keys");
  if (!allKeys || !Array.isArray(allKeys)) {
    allKeys = [];
  }

  console.log("Cached book list keys:", allKeys);

  // Delete each paginated cache key
  for (const key of allKeys) {
    console.log(`Deleting cache key: ${key}`);
    await deleteCacheKey(key);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBook, "Book updated successfully"));
});

const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = req.user;

  if(!user.isAdmin){
    throw new ApiError(403,"Only admin can delete the book")
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid book ID");
  }

  const deletedBook = await Book.findByIdAndDelete(id);

  if (!deletedBook) {
    throw new ApiError(404, "Book not found");
  }

  // Invalidate cache for this specific book and book list
  await deleteCacheKey(`book_${id}`);

  // Invalidate all cached book lists
  let allKeys = await getCachedData("all_books_keys");
  if (!allKeys || !Array.isArray(allKeys)) {
    allKeys = [];
  }

  for (const key of allKeys) {
    console.log(`Deleting cache key: ${key}`);
    await deleteCacheKey(key);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Book deleted successfully"));
});

const searchBook = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Create a unique cache key for the search query
  const cacheKey = `search_${query}`;

  // Try to get cached data
  const cachedResults = await getCachedData(cacheKey);

  if (cachedResults) {
    return res.json(
      new ApiResponse(200, cachedResults, "Books fetched from cache")
    );
  }

  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
    });

    // Cache search results
    await cacheData(cacheKey, books, CACHE_EXPIRATION);

    return res.json(new ApiResponse(200, books, "Books fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching books");
  }
});

export {
  addBook,
  deleteBook,
  updateBook,
  getAllBooks,
  getBookById,
  searchBook,
};
