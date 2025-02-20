import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerSetup from "./utils/swagger.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//json data
app.use(express.json({ limit: "20kb" }));
//url data
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

app.use(express.static("public"));
app.use(cookieParser());

// routes import
import bookRouter from "./routes/book.routes.js";
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import orderRouter from "./routes/order.route.js";

// routes declaration
app.use("/api/books", bookRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);
app.use("/api/orders", orderRouter);

// Swagger
swaggerSetup(app);

export { app };
