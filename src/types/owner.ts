import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createOwnerProfileSchema = z.object({
  type: z.enum(["INDIVIDUAL", "BUSINESS"]),
  businessName: z.string().min(1).max(200).optional(),
}).refine(
  (data) => data.type !== "BUSINESS" || !!data.businessName,
  { message: "businessName is required for business owners", path: ["businessName"] }
);

export type CreateOwnerProfileInput = z.infer<typeof createOwnerProfileSchema>;