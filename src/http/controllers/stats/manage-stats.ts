import type { FastifyRequest, FastifyReply } from "fastify";
import { PrismaProductsRepository } from "../../../repositories/prisma/prisma-products-repository.js";
import { ManageStatsUseCase } from "../../../use-cases/stats/manage-stats.js";

export const StatsController = {
  async getDashboard(_: FastifyRequest, reply: FastifyReply) {
    const useCase = new ManageStatsUseCase(new PrismaProductsRepository());
    const { stats } = await useCase.getDashboard();
    return reply.send(stats);
  },
};
