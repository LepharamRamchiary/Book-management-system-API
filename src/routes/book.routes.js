import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  addBook,
  getAllBooks,
  getBookById,
  updateBook
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

router.route("/get-all-book").get(getAllBooks);
router.route("/get-book-by-id/:id").get(getBookById);
router.route("/update/:id").put(
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  updateBook
);

export default router;
