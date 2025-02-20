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
    // {
    //   $unwind: "$metadata",
    // },
  ]);

  const totalComments =
    comments.length > 0 && comments[0].metadata.length > 0
      ? comments[0].metadata[0].total
      : 0;

  const response = {
    comments: comments.length > 0 ? comments[0].data : [],
    total: totalComments,
    totalPages:
      comments.length > 0 ? Math.ceil(comments[0].metadata.total / limit) : 0,
    currentPage: parseInt(page),
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Comments retrieved successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // console.log("user id:", userId.toString());

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  console.log(comment.owner.toString());

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { $set: { content } },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment update successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const user = req.user;

  console.log("comment id", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // console.log("owner id", comment.owner.toString());
  // console.log("user id", userId);
  // console.log("admin", user.isAdmin);

  if (!user.isAdmin && comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  const deleteComment = await Comment.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, deleteComment, "Comment deleted successfully"));
});

const likeComment = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const userId = req.user._id;
  // console.log(cid);

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(cid);
  // console.log("commentid:", comment);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userIndex = comment.likes.indexOf(userId);

  if (userIndex === -1) {
    comment.numberOfLikes += 1;
    comment.likes.push(userId);
  } else {
    comment.numberOfLikes -= 1;
    comment.likes.splice(userIndex, 1);
  }

  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment liked successfully"));
});

export { addComment, getBookComments, editComment, deleteComment, likeComment };
