import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import redisClient from "./utils/redis.js";

dotenv.config({
  path: ".env",
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
      console.log(`Swagger docs available at http://localhost:${process.env.PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!", err);
  });
