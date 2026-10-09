import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "@prisma/client";

export function verifyUserRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user;

    if (!allowedRoles.includes(role)) {
      return reply
        .status(403)
        .send({ message: "Acesso negado: Nível de permissão insuficiente." });
    }
  };
}
