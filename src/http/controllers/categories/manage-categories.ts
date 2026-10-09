import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaCategoriesRepository } from "../../../repositories/prisma/prisma-categories-repository.js";
import { ManageCategoriesUseCase } from "../../../use-cases/categories/manage-categories.js";

const getUseCase = () =>
  new ManageCategoriesUseCase(new PrismaCategoriesRepository());

export const CategoriesController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = z
      .object({ name: z.string(), slug: z.string() })
      .parse(req.body);
    const { category } = await getUseCase().create(body);
    return reply.status(201).send(category);
  },

  async listAll(_: FastifyRequest, reply: FastifyReply) {
    return reply.send(await getUseCase().listAll());
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return reply.send(await getUseCase().getById(id));
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({ name: z.string().optional(), slug: z.string().optional() })
      .parse(req.body);
    return reply.send(await getUseCase().update(id, body));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await getUseCase().delete(id);
    return reply.status(204).send();
  },
};
