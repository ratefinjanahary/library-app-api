import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BooksModule } from './books/books.module';
import { InventoryModule } from './inventory/inventory.module';
import { BorrowingsModule } from './borrowings/borrowings.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BooksModule,
    InventoryModule,
    BorrowingsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
