import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationSchema } from '../../common/dto/pagination.dto';

export const BookQuerySchema = PaginationSchema.extend({
  search: z.string().optional(),
  categoryId: z.string().transform((val) => parseInt(val, 10)).optional(),
});

export class BookQueryDto extends createZodDto(BookQuerySchema) {}
