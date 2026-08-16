import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema } from "../types/auth";
import { z } from "zod";

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
  path: "/auth/magic-link",
  tags: ["Auth"],
  summary: "Request a magic link email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({ email: z.email() }),
        },
      },
    },
  },
  responses: {
    200: { description: "If the email exists, a magic link has been sent (generic response either way)" },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/magic-link/verify",
  tags: ["Auth"],
  summary: "Verify a magic link token and log in",
  request: {
    query: z.object({ token: z.string() }),
  },
  responses: {
    200: { description: "Login successful, access token returned" },
    401: { description: "Invalid, expired, or already-used token" },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["Auth"],
  summary: "Redirect to Google's OAuth consent screen",
  responses: {
    302: { description: "Redirects to Google" },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["Auth"],
  summary: "Google OAuth callback — exchanges code for tokens, logs in or creates the user",
  request: {
    query: z.object({ code: z.string(), state: z.string() }),
  },
  responses: {
    302: { description: "Redirects to frontend after setting refresh token cookie" },
    401: { description: "OAuth state mismatch (possible CSRF) or invalid code" },
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