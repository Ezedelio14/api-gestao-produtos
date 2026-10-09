import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaSuppliersRepository } from "../../../repositories/prisma/prisma-suppliers-repository.js";
import { ManageSuppliersUseCase } from "../../../use-cases/suppliers/manage-suppliers.js";

const getUseCase = () =>
  new ManageSuppliersUseCase(new PrismaSuppliersRepository());

export const SuppliersController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = z
      .object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        document: z.string().optional(),
      })
      .parse(req.body);

    const { supplier } = await getUseCase().create(body);
    return reply.status(201).send(supplier);
  },

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
        phone: z.string().optional(),
        document: z.string().optional(),
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
