import { OrderService } from '../classes/OrderService';
import { OrderRepository } from '../interfaces/OrderRepository';
import { PaymentService } from '../interfaces/PaymentService';
import { Order } from '../classes/Order';
import { mock, instance, when, verify } from 'ts-mockito';

describe('OrderService', () => {
  let orderRepository: OrderRepository;
  let paymentService: PaymentService;
  let orderService: OrderService;

  beforeEach(() => {
    orderRepository = mock<OrderRepository>();
    paymentService = mock<PaymentService>();
    orderService = new OrderService(instance(orderRepository), instance(paymentService));
  });

  it('should place an order successfully', async () => {
    const order = new Order(1, 100);
    when(paymentService.processPayment(order.amount)).thenResolve(true);

    const result = await orderService.placeOrder(order);

    expect(result).toBe(true);
    verify(orderRepository.save(order)).once();
  });

  it('should not place an order if payment fails', async () => {
    const order = new Order(1, 100);
    when(paymentService.processPayment(order.amount)).thenResolve(false);

    const result = await orderService.placeOrder(order);

    expect(result).toBe(false);
    verify(orderRepository.save(order)).never();
  });

  it('should return an order by id', async () => {
    const order = new Order(1, 100);
    when(orderRepository.findById(1)).thenResolve(order);

    const result = await orderService.getOrderById(1);

    expect(result).toBe(order);
  });

  it('should return null if order not found by id', async () => {
    when(orderRepository.findById(1)).thenResolve(null);

    const result = await orderService.getOrderById(1);

    expect(result).toBeNull();
  });

  it('should cancel an order', async () => {
    const order = new Order(1, 100);
    when(orderRepository.findById(1)).thenResolve(order);

    await orderService.cancelOrder(1);

    verify(orderRepository.delete(order)).once();
  });

  it('should throw error if canceling an order that does not exist', async () => {
    when(orderRepository.findById(1)).thenResolve(null);

    await expect(orderService.cancelOrder(1)).rejects.toThrow("Order not found");
  });

  it('should list all orders', async () => {
    const orders = [new Order(1, 100), new Order(2, 200)];
    when(orderRepository.findAll()).thenResolve(orders);

    const result = await orderService.listAllOrders();

    expect(result).toBe(orders);
  });
});
