import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaProductsRepository } from "../../../repositories/prisma/prisma-products-repository.js";
import { PrismaCategoriesRepository } from "../../../repositories/prisma/prisma-categories-repository.js";
import { ManageProductsUseCase } from "../../../use-cases/products/manage-products.js";

const getUseCase = () =>
  new ManageProductsUseCase(
    new PrismaProductsRepository(),
    new PrismaCategoriesRepository(),
  );

export const ProductsController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = z
      .object({
        name: z.string(),
        description: z.string().optional(),
        price: z.coerce.number().positive(),
        stock: z.coerce.number().int().nonnegative().default(0),
        categoryId: z.string().uuid(),
        supplierId: z.string().uuid().optional(),
        avatar: z.any().optional(),
      })
      .parse(req.body);

    const { product } = await getUseCase().create(body);
    return reply.status(201).send(product);
  },

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.coerce.number().positive().optional(),
        stock: z.coerce.number().int().nonnegative().optional(),
        categoryId: z.string().uuid().optional(),
        supplierId: z.string().uuid().optional(),
        avatar: z.any().optional(),
      })
      .parse(req.body);

    return reply.send(await getUseCase().update(id, body));
  },

  async list(req: FastifyRequest, reply: FastifyReply) {
    const query = z
      .object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        supplierId: z.string().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      })
      .parse(req.query);

    return reply.send(await getUseCase().list(query));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return reply.send(await getUseCase().getById(id));
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await getUseCase().delete(id);
    return reply.status(204).send();
  },
};
