import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, login, logout } from "../controllers/user.controller.js";
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

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout)


export default router;
