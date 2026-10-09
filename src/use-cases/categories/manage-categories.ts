import { PrismaCategoriesRepository } from "../../repositories/prisma/prisma-categories-repository.js";
import { AppError } from "../../errors/app-error.js";

export class ManageCategoriesUseCase {
  constructor(private categoriesRepository: PrismaCategoriesRepository) {}

  async create(data: { name: string; slug: string }) {
    const category = await this.categoriesRepository.create(data);
    return { category };
  }

  async listAll() {
    const categories = await this.categoriesRepository.findMany();
    return { categories };
  }

  async getById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new AppError("Categoria não encontrada.", 404);
    return { category };
  }

  async update(id: string, data: { name?: string; slug?: string }) {
    await this.getById(id);
    const category = await this.categoriesRepository.update(id, data);
    return { category };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.categoriesRepository.delete(id);
  }
}
