import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '@prisma/client';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
