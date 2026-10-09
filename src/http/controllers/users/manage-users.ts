import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaUsersRepository } from "../../../repositories/prisma/prisma-users-repository.js";
import { ManageUsersUseCase } from "../../../use-cases/users/manage-users.js";

const getUseCase = () => new ManageUsersUseCase(new PrismaUsersRepository());

export const UsersController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const query = z
      .object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      })
      .parse(req.query);
    return reply.send(await getUseCase().list(query.page, query.limit));
  },
  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return reply.send(await getUseCase().getById(id));
  },
  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(["SUPERADMIN", "ADMIN", "MANAGER", "USER"]).optional(),
        avatar: z.any().optional(),
      })
      .parse(req.body);

    return reply.send(await getUseCase().update(id, body));
  },
  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await getUseCase().delete(id);
    return reply.status(204).send();
  },
};
