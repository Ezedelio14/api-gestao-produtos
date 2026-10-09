import { PrismaSuppliersRepository } from "../../repositories/prisma/prisma-suppliers-repository.js";
import { AppError } from "../../errors/app-error.js";

export class ManageSuppliersUseCase {
  constructor(private suppliersRepository: PrismaSuppliersRepository) {}

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
  }) {
    const supplier = await this.suppliersRepository.create(data);
    return { supplier };
  }

  async list(page: number, limit: number) {
    const { suppliers, total } = await this.suppliersRepository.findMany(
      page,
      limit,
    );
    return { suppliers, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const supplier = await this.suppliersRepository.findById(id);
    if (!supplier) throw new AppError("Fornecedor não encontrado.", 404);
    return { supplier };
  }

  async update(
    id: string,
    data: { name?: string; email?: string; phone?: string; document?: string },
  ) {
    await this.getById(id);
    const supplier = await this.suppliersRepository.update(id, data);
    return { supplier };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.suppliersRepository.delete(id);
  }
}
