""/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - book
 *         - owner
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *         book:
 *           type: string
 *           description: The ID of the book associated with the comment
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: List of users who liked the comment
 *         numberOfLikes:
 *           type: number
 *           default: 0
 *           description: Number of likes on the comment
 *         owner:
 *           type: string
 *           description: The ID of the user who owns the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the comment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the comment was last updated
 */



/**
 * @swagger
 * /api/comments/add-comment/{bookId}:
 *   post:
 *     summary: Add a comment to a book
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid book ID
 *       401:
 *         description: Unauthorized access
 */

/**
 * @swagger
 * /api/comments/get-comment/{bookId}:
 *   get:
 *     summary: Retrieve comments for a specific book
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the book
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of comments per page
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *       400:
 *         description: Invalid book ID
 */

/**
 * @swagger
 * /api/comments/edit-comment/{id}:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid comment ID
 */

/**
 * @swagger
 * /api/comments/delete-comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized access
 *       400:
 *         description: Invalid comment ID
 */

/**
 * @swagger
 * /api/comments/like-comment/{cid}:
 *   put:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to like/unlike
 *     responses:
 *       200:
 *         description: Comment liked/unliked successfully
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: Comment not found
 */




import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  editComment,
  getBookComments,
  deleteComment,
  likeComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // Applying verifyJWT for all routes

router.route("/add-comment/:bookId").post(addComment);
router.route("/get-comment/:bookId").get(getBookComments);
router.route("/edit-comment/:id").patch(editComment);
router.route("/delete-comment/:id").delete(deleteComment);
router.route("/like-comment/:cid").put(likeComment);

export default router;
