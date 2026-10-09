import { prisma } from "../../lib/prisma.js";
import type { Prisma, Product } from "@prisma/client";

export class PrismaProductsRepository {
  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return await prisma.product.create({ data });
  }

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
  }

  async findManyWithFilter(
    search?: string,
    categoryId?: string,
    supplierId?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(supplierId ? { supplierId } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: true },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async update(
    id: string,
    data: Prisma.ProductUncheckedUpdateInput,
  ): Promise<Product> {
    return await prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async getMetrics() {
    const [totalProducts, outOfStockCount, totalValue, productsByCategory] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { stock: 0 } }),
        prisma.product.aggregate({ _sum: { price: true } }),
        prisma.category.findMany({
          select: {
            name: true,
            _count: { select: { products: true } },
          },
        }),
      ]);

    return {
      totalProducts,
      outOfStockCount,
      totalInventoryValue: totalValue._sum.price || 0,
      productsByCategory: productsByCategory.map((c) => ({
        category: c.name,
        count: c._count.products,
      })),
    };
  }
}
