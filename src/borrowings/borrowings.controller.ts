import { Controller, Post, Body, Param, UseGuards, Get, ParseIntPipe } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Post("borrow")
  async borrowBook(@CurrentUser() user: any, @Body() borrowBookDto: BorrowBookDto) {
    return this.borrowingsService.borrow(user.userId, borrowBookDto);
  }

  @Post('return/:id')
  returnBook(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    // L'endpoint est /borrowings/return/:id
    // Le frontend appelle /borrowings/:id/return
    return this.borrowingsService.returnBook(user.userId, id);
  }

  @Get('my')
  getMyBorrowings(@CurrentUser() user: any) {
    return this.borrowingsService.getMyBorrowings(user.userId);
  }
}