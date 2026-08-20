import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  eventDate: z.iso.date(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
