import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  getKpis() {
    return this.analyticsService.getDashboardKpis();
  }

  @Get('top-books')
  getTopBooks() {
    return this.analyticsService.getTopBorrowedBooks();
  }

  @Get('overdue-rate')
  getOverdueRate() {
    return this.analyticsService.getOverdueRate();
  }
}
