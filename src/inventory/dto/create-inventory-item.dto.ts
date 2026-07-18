import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { InventoryStatus } from '@prisma/client';

export const CreateInventoryItemSchema = z.object({
  bookId: z.number().int().positive(),
  barcode: z.string().min(1),
  condition: z.string().optional(),
  status: z.nativeEnum(InventoryStatus).optional().default(InventoryStatus.AVAILABLE),
});

export class CreateInventoryItemDto extends createZodDto(CreateInventoryItemSchema) {}
