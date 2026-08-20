import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registerSchema = z.object({
  email: z.email().openapi({ example: "renter@example.com" }),
  password: z.string().min(10, "Password must be at least 10 characters").openapi({
    example: "correcthorsebatteries",
    description: "Minimum 10 characters",
  }),
  name: z.string().min(1).max(100).openapi({ example: "Jane Doe" }),
}).openapi("RegisterInput");

export const loginSchema = z.object({
  email: z.email().openapi({ example: "renter@example.com" }),
  password: z.string().min(1).openapi({ example: "correcthorsebatteries" }),
}).openapi("LoginInput");

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;