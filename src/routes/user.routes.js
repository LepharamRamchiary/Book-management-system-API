import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/changed-password").post(verifyJWT, changePassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);

export default router;
