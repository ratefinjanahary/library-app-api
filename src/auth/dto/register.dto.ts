import { createZodDto } from 'nestjs-zod';
import { CreateUserSchema } from '../../users/dto/create-user.dto';

export const RegisterSchema = CreateUserSchema;

export class RegisterDto extends createZodDto(RegisterSchema) {}
