import { PrismaProductsRepository } from "../../repositories/prisma/prisma-products-repository.js";

export class ManageStatsUseCase {
  constructor(private productsRepository: PrismaProductsRepository) {}

  async getDashboard() {
    const stats = await this.productsRepository.getMetrics();
    return { stats };
  }
}
