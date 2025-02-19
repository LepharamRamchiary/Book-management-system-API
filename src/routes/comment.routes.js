import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  editComment,
  getBookComments,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // Applying verifyJWT for all routes

router.route("/add-comment/:bookId").post(addComment);
router.route("/get-comment/:bookId").get(getBookComments);
router.route("/edit-comment/:id").patch(editComment);
router.route("/delete-comment/:id").delete(deleteComment);

export default router;
