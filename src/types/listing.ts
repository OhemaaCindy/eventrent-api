import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createListingSchema = z.object({
  categoryId: z.uuid(),
  title: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  quantityTotal: z.number().int().positive(),
  pricePerDay: z.number().positive(),
  depositAmount: z.number().nonnegative(),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY", "BOTH"]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;