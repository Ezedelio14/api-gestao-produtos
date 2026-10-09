import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository.js";
import { AppError } from "../../errors/app-error.js";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export class ManageUsersUseCase {
  constructor(private usersRepository: PrismaUsersRepository) {}

  async list(page: number, limit: number) {
    const { users, total } = await this.usersRepository.findMany(page, limit);
    return { users, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado.", 404);
    return { user };
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
      avatar?: string;
    },
  ) {
    await this.getById(id);
    const updateData: Record<string, unknown> = { ...data };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 6);
    }

    const user = await this.usersRepository.update(id, updateData);
    return { user };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.usersRepository.delete(id);
  }
}
