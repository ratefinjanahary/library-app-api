import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BorrowBookSchema = z.object({
  bookIds: z.array(z.number().int().positive()).min(1),
});

export class BorrowBookDto extends createZodDto(BorrowBookSchema) {}
