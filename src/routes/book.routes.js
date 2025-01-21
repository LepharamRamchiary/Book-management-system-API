import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addBook } from "../controllers/book.controller.js";

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

export default router;
