import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, getBookComments } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // Applying verifyJWT for all routes

router.route("/add-comment/:bookId").post(addComment);
router.route("/get-comment/:bookId").get(getBookComments);

export default router;
