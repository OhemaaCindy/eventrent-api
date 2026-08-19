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

export const updateListingSchema = z.object({
  categoryId: z.uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(200).optional(),
  quantityTotal: z.number().int().positive().optional(),
  pricePerDay: z.number().positive().optional(),
  depositAmount: z.number().nonnegative().optional(),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY", "BOTH"]).optional(),
  status: z.enum(["LIVE", "PAUSED"]).optional(),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;

export const browseListingsSchema = z.object({
  categoryId: z.uuid().optional(),
  location: z.string().min(1).optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
}).refine(
  (data) => (data.startDate == null) === (data.endDate == null),
  { message: "startDate and endDate must be provided together", path: ["endDate"] }
).refine(
  (data) => !data.startDate || !data.endDate || new Date(data.endDate) >= new Date(data.startDate),
  { message: "endDate must be on or after startDate", path: ["endDate"] }
);

export type BrowseListingsInput = z.infer<typeof browseListingsSchema>;