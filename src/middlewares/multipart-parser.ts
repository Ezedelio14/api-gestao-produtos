import type { FastifyRequest, FastifyReply } from "fastify";

export async function parseMultipartFormData(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (!req.isMultipart()) {
    return;
  }

  const parts = req.parts();
  const parsedBody: Record<string, any> = {};

  for await (const part of parts) {
    if (part.type === "file") {
      const buffer = await part.toBuffer();
      if (buffer.length > 0) {
        parsedBody[part.fieldname] =
          `data:${part.mimetype};base64,${buffer.toString("base64")}`;
      }
    } else {
      parsedBody[part.fieldname] = part.value;
    }
  }

  req.body = parsedBody;
}
