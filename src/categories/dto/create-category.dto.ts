import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
