import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema } from "../types/auth";

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Create a new account with email/password",
  request: {
    body: {
      content: { "application/json": { schema: registerSchema } },
    },
  },
  responses: {
    201: { description: "Account created, access token returned" },
    409: { description: "Email already in use" },
    400: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Log in with email/password",
  request: {
    body: {
      content: { "application/json": { schema: loginSchema } },
    },
  },
  responses: {
    200: { description: "Login successful, access token returned" },
    401: { description: "Invalid email or password" },
    429: { description: "Too many attempts" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Exchange a valid refresh token cookie for a new access token",
  responses: {
    200: { description: "New access token issued" },
    401: { description: "Missing or invalid refresh token" },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Clear the refresh token cookie",
  responses: {
    204: { description: "Logged out" },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "EventRent API",
      version: "1.0.0",
      description: "Marketplace API for renting party/event equipment",
    },
    servers: [{ url: "http://localhost:4000", description: "Local development" }],
  });
}