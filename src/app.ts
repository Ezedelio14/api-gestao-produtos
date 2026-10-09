import fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import { setupSwagger } from "./lib/swagger.js";
import { setupErrorHandler } from "./errors/handler.js";
import { appRoutes } from "./http/routes.js";

export const app = fastify({ bodyLimit: 10485760 });

app.register(fastifyCors, { origin: true });

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "secret-fallback",
});

app.register(fastifyMultipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

setupErrorHandler(app);

await setupSwagger(app);
await app.register(appRoutes);
