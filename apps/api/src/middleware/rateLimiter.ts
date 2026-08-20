import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many attempts. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});