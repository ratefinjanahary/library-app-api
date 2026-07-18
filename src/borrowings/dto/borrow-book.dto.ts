import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const BorrowBookSchema = z.object({
  bookId: z.number().int().positive(),
});

export class BorrowBookDto extends createZodDto(BorrowBookSchema) {}
