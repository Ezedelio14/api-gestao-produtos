import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { PrismaStockRepository } from "../../../repositories/prisma/prisma-stock-repository.js";
import { ManageStockUseCase } from "../../../use-cases/stock/manage-stock.js";

const getUseCase = () => new ManageStockUseCase(new PrismaStockRepository());

export const StockController = {
  async adjust(req: FastifyRequest, reply: FastifyReply) {
    const body = z
      .object({
        productId: z.string().uuid(),
        type: z.enum(["IN", "OUT"]),
        quantity: z.number().int().positive(),
        reason: z.string().min(3),
      })
      .parse(req.body);

    const result = await getUseCase().adjust({ ...body, userId: req.user.sub });
    return reply.status(201).send(result);
  },

  async getMovements(req: FastifyRequest, reply: FastifyReply) {
    const { productId } = z
      .object({ productId: z.string().uuid() })
      .parse(req.params);
    return reply.send(await getUseCase().getMovements(productId));
  },
};
