import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BorrowingStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKpis() {
    const totalBooks = await this.prisma.book.count();
    const activeMembers = await this.prisma.user.count({ where: { role: 'MEMBER' } });
    const activeBorrowings = await this.prisma.borrowing.count({
      where: { status: BorrowingStatus.ACTIVE },
    });
    
    const finesAggregate = await this.prisma.fine.aggregate({
      _sum: { amount: true },
    });
    const totalFines = finesAggregate._sum.amount || 0;

    return {
      totalBooks,
      activeMembers,
      activeBorrowings,
      totalFines,
    };
  }

  async getTopBorrowedBooks() {
    const borrowingsGrouped = await this.prisma.borrowing.groupBy({
      by: ['inventoryItemId'],
      _count: {
        inventoryItemId: true,
      },
      orderBy: {
        _count: { inventoryItemId: 'desc' },
      },
      take: 5,
    });

    const inventoryItems = await Promise.all(
      borrowingsGrouped.map((b) =>
        this.prisma.inventoryItem.findUnique({
          where: { id: b.inventoryItemId },
          include: { book: true },
        })
      )
    );

    return inventoryItems.map((item, index) => ({
      book: item?.book,
      borrowCount: borrowingsGrouped[index]._count.inventoryItemId,
    }));
  }

  async getOverdueRate() {
    const totalBorrowings = await this.prisma.borrowing.count();
    const overdueBorrowings = await this.prisma.borrowing.count({
      where: {
        OR: [
          { status: BorrowingStatus.OVERDUE },
          {
            status: BorrowingStatus.ACTIVE,
            dueDate: { lt: new Date() },
          },
        ],
      },
    });

    const rate = totalBorrowings > 0 ? (overdueBorrowings / totalBorrowings) * 100 : 0;
    return {
      totalBorrowings,
      overdueBorrowings,
      overdueRate: parseFloat(rate.toFixed(2)),
    };
  }
}
