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
  return this.prisma.$transaction(async (tx) => {
    // Vérifier le nombre d'emprunts actifs une seule fois avant la boucle
    const activeBorrowingsCount = await tx.borrowing.count({
      where: {
        userId,
        status: BorrowingStatus.ACTIVE
      },
    });

    const totalRequested = borrowBookDto.bookIds.length;
    if (activeBorrowingsCount + totalRequested > MAX_BORROW_LIMIT) {
      throw new BadRequestException(
        `Vous avez déjà ${activeBorrowingsCount} emprunt(s) actif(s). Vous ne pouvez emprunter que ${MAX_BORROW_LIMIT - activeBorrowingsCount} livre(s) supplémentaire(s).`
      );
    }

    const borrowedBooks: any[] = [];
    
    // Vérifier la disponibilité de tous les livres avant de commencer l'emprunt
    const availableItems = await tx.inventoryItem.findMany({
      where: {
        bookId: { in: borrowBookDto.bookIds },
        status: InventoryStatus.AVAILABLE,
      },
    });

    // Vérifier que tous les livres demandés sont disponibles
    const availableBookIds = availableItems.map(item => item.bookId);
    const missingBooks = borrowBookDto.bookIds.filter(id => !availableBookIds.includes(id));
    
    if (missingBooks.length > 0) {
      throw new BadRequestException(
        `Les livres avec les IDs suivants ne sont pas disponibles: ${missingBooks.join(', ')}`
      );
    }

    // Pour chaque livre, effectuer l'emprunt
    for (const bookId of borrowBookDto.bookIds) {
      const availableItem = availableItems.find(item => item.bookId === bookId);
      
      if (!availableItem) {
        throw new BadRequestException(`Aucun exemplaire disponible pour le livre ID ${bookId}.`);
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

      await tx.inventoryItem.update({
        where: { id: availableItem.id },
        data: { status: InventoryStatus.BORROWED },
      });

      const borrowing = await tx.borrowing.create({
        data: {
          userId,
          inventoryItemId: availableItem.id,
          dueDate,
        },
        include: {
          inventoryItem: {
            include: {
              book: true
            }
          },
          fines: true
        }
      });
      borrowedBooks.push(borrowing);
    }
    
    return borrowedBooks;
  });
}

  async returnBook(userId: number, borrowingId: number) {
    const borrowing = await this.prisma.borrowing.findFirst({
      where: { 
        id: borrowingId, 
        userId, 
        status: BorrowingStatus.ACTIVE 
      },
      include: {
        inventoryItem: {
          include: {
            book: true
          }
        },
        fines: true
      }
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
        include: {
          inventoryItem: {
            include: {
              book: true
            }
          },
          fines: true
        }
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
    const borrowings = await this.prisma.borrowing.findMany({
      where: { userId },
      include: {
        inventoryItem: { 
          include: { 
            book: true 
          } 
        },
        fines: true,
      },
      orderBy: {
        borrowedAt: 'desc'
      }
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    return borrowings.map(borrowing => ({
      id: borrowing.id,
      userId: borrowing.userId,
      inventoryItemId: borrowing.inventoryItemId,
      borrowDate: borrowing.borrowedAt,
      dueDate: borrowing.dueDate,
      returnDate: borrowing.returnedAt,
      status: this.mapStatusToFrontend(borrowing.status),
      inventory: borrowing.inventoryItem,
      fines: borrowing.fines
    }));
  }

  private mapStatusToFrontend(status: BorrowingStatus): string {
    switch (status) {
      case BorrowingStatus.ACTIVE:
        return 'BORROWED';
      case BorrowingStatus.RETURNED:
        return 'RETURNED';
      case BorrowingStatus.OVERDUE:
        return 'OVERDUE';
      default:
        return status;
    }
  }

  // Nouvelle méthode pour récupérer un emprunt par ID
  async getBorrowingById(userId: number, borrowingId: number) {
    const borrowing = await this.prisma.borrowing.findFirst({
      where: { id: borrowingId, userId },
      include: {
        inventoryItem: { 
          include: { 
            book: true 
          } 
        },
        fines: true,
      }
    });

    if (!borrowing) {
      throw new NotFoundException('Borrowing not found');
    }

    return {
      id: borrowing.id,
      userId: borrowing.userId,
      inventoryItemId: borrowing.inventoryItemId,
      borrowDate: borrowing.borrowedAt,
      dueDate: borrowing.dueDate,
      returnDate: borrowing.returnedAt,
      status: this.mapStatusToFrontend(borrowing.status),
      inventory: borrowing.inventoryItem,
      fines: borrowing.fines
    };
  }
}