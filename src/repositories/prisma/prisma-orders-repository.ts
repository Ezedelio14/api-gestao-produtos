import { prisma } from "../../lib/prisma.js";
import type { OrderStatus } from "@prisma/client";

interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderInput {
  userId: string;
  total: number;
  status?: OrderStatus;
  items: CreateOrderItemInput[];
}

export class PrismaOrdersRepository {
  async create({ userId, total, status, items }: CreateOrderInput) {
    return await prisma.order.create({
      data: {
        userId,
        total,
        status: status || "PENDING",
        items: { create: items },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
  }

  async findMany(page = 1, limit = 10, userId?: string) {
    const skip = (page - 1) * limit;
    const where = userId ? { userId } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.order.delete({ where: { id } });
  }
}
