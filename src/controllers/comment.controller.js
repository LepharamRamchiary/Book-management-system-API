import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new ApiError(400, "Invalid book ID");
  }

  const comment = await Comment.create({
    content,
    book: new mongoose.Types.ObjectId(bookId),
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const getBookComments = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    throw new ApiError(400, "Invalid book ID");
  }

  const comments = await Comment.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: parseInt(page) } },
        ],
        data: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],
      },
    },
    {
      $unwind: "$metadata",
    },
  ]);

  const response = {
    comments: comments.length > 0 ? comments[0].data : [],
    totalPages:
      comments.length > 0 ? Math.ceil(comments[0].metadata.total / limit) : 0,
    currentPage: parseInt(page),
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Comments retrieved successfully"));
});

export { addComment, getBookComments };
