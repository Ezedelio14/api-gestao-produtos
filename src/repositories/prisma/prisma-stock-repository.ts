import { prisma } from "../../lib/prisma.js";
import type { MovementType } from "@prisma/client";

interface CreateMovementInput {
  productId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}

export class PrismaStockRepository {
  async createMovement(data: CreateMovementInput) {
    return await prisma.stockMovement.create({
      data,
      include: {
        product: true,
        user: { select: { id: true, name: true } },
      },
    });
  }

  async updateProductStock(productId: string, newStock: number) {
    return await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
  }

  async findByProduct(productId: string) {
    return await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });
  }
}
