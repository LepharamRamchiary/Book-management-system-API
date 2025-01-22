/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - price
 *         - quantity
 *       properties:
 *         title:
 *           type: string
 *         author:
 *           type: string
 *         isbn:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: number
 *         publishedDate:
 *           type: string
 *           format: date
 *         genre:
 *           type: string
 *           enum: [Fiction, Non-Fiction, Mystery, Fantasy, Science Fiction, Biography]
 *         description:
 *           type: string
 *         image:
 *           type: string
 */

/**
 * @swagger
 * /api/books/add-book:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400: 
 *         description: Field are required
 *       409:
 *         description: Book with title or isbn already exists
 * 
 */

/**
 * @swagger
 * /api/books/get-all-book:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Failed to fetch book
 */

/**
 * @swagger
 * /api/books/get-book-by-id/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid book ID
 *       404:
 *         description: Book not found
 *       500:
 *         description: Failed to fetch book
 * 
 */

/**
 * @swagger
 * /api/books/update/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               genre:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid book ID
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /api/books/delete/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       400:
 *          description: Invalid book ID
 *       404:
 *          description: Book not found
 */

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books by title, auther, genre
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request, query parameter is required
 *       500:
 *         description: Server error
 */


import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBook
} from "../controllers/book.controller.js";

const router = Router();


router.route("/add-book").post(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  addBook
);

router.route("/update/:id").put(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  updateBook
);

router.route("/get-all-book").get(getAllBooks);

router.route("/get-book-by-id/:id").get(getBookById);
router.route("/delete/:id").delete(deleteBook);
router.route("/search").get(searchBook)

export default router;
