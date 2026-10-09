import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../../repositories/prisma/prisma-users-repository.js";
import { ManageAuthUseCase } from "../../../use-cases/auth/manage-auth.js";

export const AuthController = {
  async register(req: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["SUPERADMIN", "ADMIN", "MANAGER", "USER"]).optional(),
    });
    const useCase = new ManageAuthUseCase(new PrismaUsersRepository());
    const { user } = await useCase.register(bodySchema.parse(req.body));
    return reply
      .status(201)
      .send({ id: user.id, name: user.name, role: user.role });
  },

  async authenticate(req: FastifyRequest, reply: FastifyReply) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });
    const useCase = new ManageAuthUseCase(new PrismaUsersRepository());
    const { user } = await useCase.authenticate(bodySchema.parse(req.body));

    const token = await reply.jwtSign(
      { role: user.role },
      { sign: { sub: user.id, expiresIn: "7d" } },
    );
    return reply.send({ token, role: user.role });
  },
};
