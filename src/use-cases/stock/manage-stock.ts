import { PrismaStockRepository } from "../../repositories/prisma/prisma-stock-repository.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type { MovementType } from "@prisma/client";

export class ManageStockUseCase {
  constructor(private stockRepository: PrismaStockRepository) {}

  async adjust(data: {
    productId: string;
    userId: string;
    type: MovementType;
    quantity: number;
    reason: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) throw new AppError("Produto não encontrado.");

    const newStock =
      data.type === "IN"
        ? product.stock + data.quantity
        : product.stock - data.quantity;
    if (newStock < 0)
      throw new AppError("A movimentação resulta em estoque negativo.");

    await this.stockRepository.updateProductStock(data.productId, newStock);
    const movement = await this.stockRepository.createMovement(data);

    return { movement, currentStock: newStock };
  }

  async getMovements(productId: string) {
    return await this.stockRepository.findByProduct(productId);
  }
}
