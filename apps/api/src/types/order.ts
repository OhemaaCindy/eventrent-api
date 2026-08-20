import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const orderItemSchema = z
  .object({
    listingId: z.uuid(),
    quantity: z.number().int().positive(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createRecurringOrderSchema = z
  .object({
    listingId: z.uuid(),
    quantity: z.number().int().positive(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    frequency: z.enum(["WEEKLY", "MONTHLY"]),
    occurrences: z.number().int().min(2).max(52),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export type CreateRecurringOrderInput = z.infer<typeof createRecurringOrderSchema>;
