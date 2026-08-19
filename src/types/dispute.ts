import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const openDisputeSchema = z.object({
  reason: z.string().min(10).max(1000),
});

export const resolveDisputeSchema = z.object({
  resolution: z.enum(["REFUND_RENTER", "RETAIN_DEPOSIT"]),
});

export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;