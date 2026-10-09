import { prisma } from "../../lib/prisma.js";
import type { Prisma, Category } from "@prisma/client";

export class PrismaCategoriesRepository {
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return await prisma.category.create({ data });
  }

  async findById(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({ where: { id } });
  }

  async findMany(): Promise<Category[]> {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return await prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
