import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerSchema, loginSchema } from "../types/auth";
import { z } from "zod";
import { createOwnerProfileSchema } from "../types/owner";
import { createListingSchema } from "../types/listing";
import { createBookingSchema } from "../types/booking";

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
    200: {
      description:
        "If the email exists, a magic link has been sent (generic response either way)",
    },
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
  summary:
    "Google OAuth callback — exchanges code for tokens, logs in or creates the user",
  request: {
    query: z.object({ code: z.string(), state: z.string() }),
  },
  responses: {
    302: {
      description: "Redirects to frontend after setting refresh token cookie",
    },
    401: {
      description: "OAuth state mismatch (possible CSRF) or invalid code",
    },
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

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

registry.registerPath({
  method: "post",
  path: "/owners/me",
  tags: ["Owners"],
  summary: "Create an owner profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createOwnerProfileSchema } },
    },
  },
  responses: {
    201: { description: "Owner profile created" },
    401: { description: "Missing or invalid access token" },
    409: { description: "Owner profile already exists" },
  },
});

registry.registerPath({
  method: "post",
  path: "/listings",
  tags: ["Listings"],
  summary: "Create a new listing (requires an owner profile)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createListingSchema } },
    },
  },
  responses: {
    201: {
      description:
        "Listing created (LIVE if owner is verified, PENDING_REVIEW otherwise)",
    },
    400: { description: "Invalid category" },
    403: { description: "User has no owner profile" },
  },
});

registry.registerPath({
  method: "get",
  path: "/categories",
  tags: ["Categories"],
  summary: "List all equipment categories",
  responses: {
    200: { description: "Array of categories" },
  },
});

registry.registerPath({
  method: "get",
  path: "/listings",
  tags: ["Listings"],
  summary: "Browse all live listings",
  responses: {
    200: {
      description:
        "Array of live listings, with category/images/pricingTiers included",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/listings/{id}",
  tags: ["Listings"],
  summary: "Get a single listing by ID",
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: { description: "Listing detail" },
    404: { description: "Listing not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/bookings",
  tags: ["Bookings"],
  summary:
    "Create a booking (concurrency-safe: checks live availability inside a Serializable transaction)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createBookingSchema } },
    },
  },
  responses: {
    201: { description: "Booking created with status PAYMENT_PENDING" },
    400: { description: "Listing not found or not currently bookable" },
    404: { description: "Listing not found" },
    409: {
      description:
        "Either insufficient stock for the requested dates, or a conflicting concurrent booking — client should retry on conflict",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/listings/{id}/images",
  tags: ["Listings"],
  summary: "Upload an image for a listing (owner only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              image: {
                type: "string",
                format: "binary",
              },
            },
            required: ["image"],
          },
        },
      },
    },
  },
  responses: {
    201: { description: "Image uploaded and attached to listing" },
    400: { description: "No file provided, or invalid file type/size" },
    403: { description: "You do not own this listing" },
    404: { description: "Listing not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/webhooks/paystack",
  tags: ["Webhooks"],
  summary: "Paystack webhook receiver (signature-verified, not called directly by clients)",
  responses: {
    200: { description: "Event received and processed (or safely ignored)" },
    400: { description: "Missing signature" },
    401: { description: "Invalid signature" },
  },
});

registry.registerPath({
  method: "post",
  path: "/admin/owners/{id}/verify",
  tags: ["Admin"],
  summary: "Approve a business owner's verification (admin only) — also publishes their pending listings",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.uuid() }),
  },
  responses: {
    200: { description: "Owner approved, pending listings published" },
    400: { description: "Owner is not a business (individuals don't need approval)" },
    403: { description: "Requires admin privileges" },
    404: { description: "Owner profile not found" },
    409: { description: "Owner already approved" },
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
    servers: [
      { url: "http://localhost:4000", description: "Local development" },
    ],
  });
}
