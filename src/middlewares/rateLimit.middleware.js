import rateLimit from "express-rate-limit";

// General rate limiter for less-sensitive endpoints
export const apiLimiter = rateLimit({
  windowMs: 10 * 60, // 1 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
  windowMs: 10 * 60, // 1 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    status: 429,
    message: "Too many requests to this endpoint. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
