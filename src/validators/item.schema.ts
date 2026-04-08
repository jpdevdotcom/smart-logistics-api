import { StorageRequirement } from "@prisma/client";
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  storageRequirement: z.nativeEnum(StorageRequirement),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
