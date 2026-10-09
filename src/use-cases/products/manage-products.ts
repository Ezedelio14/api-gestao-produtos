import { PrismaProductsRepository } from "../../repositories/prisma/prisma-products-repository.js";
import { PrismaCategoriesRepository } from "../../repositories/prisma/prisma-categories-repository.js";
import { AppError } from "../../errors/app-error.js";

export class ManageProductsUseCase {
  constructor(
    private productsRepository: PrismaProductsRepository,
    private categoriesRepository: PrismaCategoriesRepository,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: string;
    supplierId?: string;
    avatar?: string;
  }) {
    const category = await this.categoriesRepository.findById(data.categoryId);
    if (!category) throw new AppError("Categoria não encontrada.", 404);

    const product = await this.productsRepository.create(data);
    return { product };
  }

  async list({
    search,
    categoryId,
    supplierId,
    page,
    limit,
  }: {
    search?: string;
    categoryId?: string;
    supplierId?: string;
    page: number;
    limit: number;
  }) {
    const { products, total } =
      await this.productsRepository.findManyWithFilter(
        search,
        categoryId,
        supplierId,
        page,
        limit,
      );
    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new AppError("Produto não encontrado.", 404);
    return { product };
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      supplierId?: string;
      avatar?: string;
    },
  ) {
    await this.getById(id);

    if (data.categoryId) {
      const category = await this.categoriesRepository.findById(
        data.categoryId,
      );
      if (!category) throw new AppError("Categoria não encontrada.", 404);
    }

    const product = await this.productsRepository.update(id, data);
    return { product };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.productsRepository.delete(id);
  }
}
