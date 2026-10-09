import { prisma } from "../../lib/prisma.js";
import type { Prisma, User } from "@prisma/client";

export class PrismaUsersRepository {
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findMany(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return { users, total };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
