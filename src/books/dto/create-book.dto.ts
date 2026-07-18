import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().min(10),
  summary: z.string().optional(),
  categoryId: z.number().int().positive(),
});

export class CreateBookDto extends createZodDto(CreateBookSchema) {}
