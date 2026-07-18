import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { InventoryStatus, BorrowingStatus } from '@prisma/client';

const MAX_BORROW_LIMIT = 5;
const BORROW_DAYS = 14;
const FINE_PER_DAY = 1.5;

@Injectable()
export class BorrowingsService {
  constructor(private prisma: PrismaService) {}

  async borrow(userId: number, borrowBookDto: BorrowBookDto) {
    const activeBorrowingsCount = await this.prisma.borrowing.count({
      where: { userId, status: BorrowingStatus.ACTIVE },
    });

    if (activeBorrowingsCount >= MAX_BORROW_LIMIT) {
      throw new BadRequestException(`You have reached the maximum borrow limit of ${MAX_BORROW_LIMIT} books.`);
    }

    const availableItem = await this.prisma.inventoryItem.findFirst({
      where: {
        bookId: borrowBookDto.bookId,
        status: InventoryStatus.AVAILABLE,
      },
    });

    if (!availableItem) {
      throw new BadRequestException('No available copies of this book right now.');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id: availableItem.id },
        data: { status: InventoryStatus.BORROWED },
      });

      return tx.borrowing.create({
        data: {
          userId,
          inventoryItemId: availableItem.id,
          dueDate,
        },
      });
    });
  }

  async returnBook(userId: number, borrowingId: number) {
    const borrowing = await this.prisma.borrowing.findFirst({
      where: { id: borrowingId, userId, status: BorrowingStatus.ACTIVE },
    });

    if (!borrowing) {
      throw new NotFoundException('Active borrowing record not found for this user.');
    }

    const returnedAt = new Date();
    let fineAmount = 0;

    if (returnedAt > borrowing.dueDate) {
      const diffTime = Math.abs(returnedAt.getTime() - borrowing.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * FINE_PER_DAY;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedBorrowing = await tx.borrowing.update({
        where: { id: borrowingId },
        data: {
          status: BorrowingStatus.RETURNED,
          returnedAt,
        },
      });

      await tx.inventoryItem.update({
        where: { id: borrowing.inventoryItemId },
        data: { status: InventoryStatus.AVAILABLE },
      });

      if (fineAmount > 0) {
        await tx.fine.create({
          data: {
            borrowingId,
            amount: fineAmount,
          },
        });
      }

      return updatedBorrowing;
    });
  }

  async getMyBorrowings(userId: number) {
    return this.prisma.borrowing.findMany({
      where: { userId },
      include: {
        inventoryItem: { include: { book: true } },
        fines: true,
      },
    });
  }
}
