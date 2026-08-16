import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createBookingSchema = z.object({
  listingId: z.uuid(),
  quantity: z.number().int().positive(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: "endDate must be on or after startDate", path: ["endDate"] }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;