import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository.js";
import { AppError } from "../../errors/app-error.js";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export class ManageAuthUseCase {
  constructor(private usersRepository: PrismaUsersRepository) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    avatar?: string;
  }) {
    const userExists = await this.usersRepository.findByEmail(data.email);
    if (userExists) throw new AppError("E-mail já cadastrado.");

    const passwordHash = await bcrypt.hash(data.password, 6);
    const user = await this.usersRepository.create({
      ...data,
      password: passwordHash,
      role: data.role || "USER",
    });

    return { user };
  }

  async authenticate(data: { email: string; password: string }) {
    const user = await this.usersRepository.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError("Credenciais inválidas.", 400);
    }

    return { user };
  }
}
