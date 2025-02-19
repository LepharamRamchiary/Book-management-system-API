import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  editComment,
  getBookComments,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // Applying verifyJWT for all routes

router.route("/add-comment/:bookId").post(addComment);
router.route("/get-comment/:bookId").get(getBookComments);
router.route("/edit-comment/:id").patch(editComment);

export default router;
