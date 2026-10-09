import { PrismaOrdersRepository } from "../../repositories/prisma/prisma-orders-repository.js";
import { PrismaStockRepository } from "../../repositories/prisma/prisma-stock-repository.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type { OrderStatus } from "@prisma/client";

export class ManageOrdersUseCase {
  constructor(
    private ordersRepository: PrismaOrdersRepository,
    private stockRepository: PrismaStockRepository,
  ) {}

  async create(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    if (items.length === 0)
      throw new AppError("O pedido deve conter produtos.");

    let calculatedTotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product)
        throw new AppError(`Produto ${item.productId} não encontrado.`);
      if (product.stock < item.quantity)
        throw new AppError(`Estoque insuficiente: ${product.name}`);

      calculatedTotal += product.price * item.quantity;
      orderItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        currentStock: product.stock,
      });
    }

    const order = await this.ordersRepository.create({
      userId,
      total: calculatedTotal,
      items: orderItemsToCreate.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    for (const item of orderItemsToCreate) {
      await this.stockRepository.updateProductStock(
        item.productId,
        item.currentStock - item.quantity,
      );
      await this.stockRepository.createMovement({
        productId: item.productId,
        userId,
        type: "OUT",
        quantity: item.quantity,
        reason: `Venda - Pedido #${order.id}`,
      });
    }

    return { order };
  }

  async list(page: number, limit: number, userId?: string) {
    const { orders, total } = await this.ordersRepository.findMany(
      page,
      limit,
      userId,
    );
    return { orders, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new AppError("Pedido não encontrado.", 404);
    return { order };
  }

  async updateStatus(id: string, status: OrderStatus, userId: string) {
    const { order } = await this.getById(id);

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await this.stockRepository.updateProductStock(
          item.productId,
          item.product.stock + item.quantity,
        );
        await this.stockRepository.createMovement({
          productId: item.productId,
          userId,
          type: "IN",
          quantity: item.quantity,
          reason: `Cancelamento - Pedido #${id}`,
        });
      }
    }

    const updatedOrder = await this.ordersRepository.updateStatus(id, status);
    return { order: updatedOrder };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.ordersRepository.delete(id);
  }
}
