import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() request: CreateOrderRequest,
    @Req() req: any,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.createOrder(request, user);
  }

  @Get()
  async getOrders() {
    return this.ordersService.getOrders();
  }
}
