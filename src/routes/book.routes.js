import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addBook, getAllBooks } from "../controllers/book.controller.js";

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

export default router;
