import { prisma } from "../../lib/prisma.js";
import type { Prisma, Supplier } from "@prisma/client";

export class PrismaSuppliersRepository {
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return await prisma.supplier.create({ data });
  }

  async findById(id: string): Promise<Supplier | null> {
    return await prisma.supplier.findUnique({ where: { id } });
  }

  async findMany(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({ take: limit, skip, orderBy: { name: "asc" } }),
      prisma.supplier.count(),
    ]);
    return { suppliers, total };
  }

  async update(
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return await prisma.supplier.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.supplier.delete({ where: { id } });
  }
}
