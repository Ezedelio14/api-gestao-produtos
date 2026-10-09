import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaOrdersRepository } from "../../../repositories/prisma/prisma-orders-repository.js";
import { PrismaStockRepository } from "../../../repositories/prisma/prisma-stock-repository.js";
import { ManageOrdersUseCase } from "../../../use-cases/orders/manage-orders.js";

const getUseCase = () =>
  new ManageOrdersUseCase(
    new PrismaOrdersRepository(),
    new PrismaStockRepository(),
  );

export const OrdersController = {
  async create(req: FastifyRequest, reply: FastifyReply) {
    const body = z
      .object({
        items: z
          .array(
            z.object({
              productId: z.string().uuid(),
              quantity: z.number().int().positive(),
            }),
          )
          .min(1),
      })
      .parse(req.body);

    const { order } = await getUseCase().create(req.user.sub, body.items);
    return reply.status(201).send(order);
  },

  async list(req: FastifyRequest, reply: FastifyReply) {
    const query = z
      .object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
      })
      .parse(req.query);
    const userId = req.user.role === "USER" ? req.user.sub : undefined;
    return reply.send(await getUseCase().list(query.page, query.limit, userId));
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    return reply.send(await getUseCase().getById(id));
  },

  async updateStatus(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const { status } = z
      .object({ status: z.enum(["PENDING", "PAID", "CANCELLED"]) })
      .parse(req.body);

    return reply.send(
      await getUseCase().updateStatus(id, status, req.user.sub),
    );
  },

  async delete(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    await getUseCase().delete(id);
    return reply.status(204).send();
  },
};
