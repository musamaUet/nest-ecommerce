import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from './constants/services';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest, user: any) {
    try {
      const order = await this.ordersRepository.create(request);
      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
          Authentication: user.token,
        }),
      );
      return order;
    } catch (err) {
      throw err;
    }
  }

  async getOrders() {
    return this.ordersRepository.find({});
  }
}
