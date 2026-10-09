import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { verifyJWT } from "../middlewares/verify-jwt.js";
import { verifyUserRole } from "../middlewares/verify-role.js";

// Controllers Refatorados
import { AuthController } from "./controllers/auth/manage-auth.js";
import { UsersController } from "./controllers/users/manage-users.js";
import { SuppliersController } from "./controllers/suppliers/manage-suppliers.js";
import { CategoriesController } from "./controllers/categories/manage-categories.js";
import { ProductsController } from "./controllers/products/manage-products.js";
import { OrdersController } from "./controllers/orders/manage-orders.js";
import { StockController } from "./controllers/stock/manage-stock.js";
import { StatsController } from "./controllers/stats/manage-stats.js";
import { parseMultipartFormData } from "../middlewares/multipart-parser.js";

export async function appRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // ==========================================
  // 1. AUTENTICAÇÃO
  // ==========================================
  typedApp.post(
    "/sessions",
    { schema: { tags: ["Auth"], summary: "Login" } },
    AuthController.authenticate,
  );
  typedApp.post(
    "/users",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Usuários"], security: [{ bearerAuth: [] }] },
    },
    AuthController.register,
  );

  // ==========================================
  // 2. USUÁRIOS
  // ==========================================
  typedApp.get(
    "/users",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Usuários"], security: [{ bearerAuth: [] }] },
    },
    UsersController.list,
  );
  typedApp.get(
    "/users/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Usuários"], security: [{ bearerAuth: [] }] },
    },
    UsersController.getById,
  );
  typedApp.put(
    "/users/:id",
    {
      preValidation: [
        verifyJWT,
        verifyUserRole("ADMIN", "SUPERADMIN"),
        parseMultipartFormData,
      ],
      schema: {
        tags: ["Usuários"],
        summary: "Atualizar Usuário (Suporta Form-Data para envio de foto)",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data", "application/json"],
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
          role: z.enum(["SUPERADMIN", "ADMIN", "MANAGER", "USER"]).optional(),
          avatar: z
            .any()
            .optional()
            .describe("Envie um arquivo de imagem (JPEG/PNG)"),
        }),
      },
    },
    UsersController.update,
  );
  typedApp.delete(
    "/users/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("SUPERADMIN")],
      schema: { tags: ["Usuários"], security: [{ bearerAuth: [] }] },
    },
    UsersController.delete,
  );

  // ==========================================
  // 3. FORNECEDORES
  // ==========================================
  typedApp.post(
    "/suppliers",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Fornecedores"], security: [{ bearerAuth: [] }] },
    },
    SuppliersController.create,
  );
  typedApp.get(
    "/suppliers",
    {
      onRequest: [verifyJWT],
      schema: { tags: ["Fornecedores"], security: [{ bearerAuth: [] }] },
    },
    SuppliersController.list,
  );
  typedApp.get(
    "/suppliers/:id",
    {
      onRequest: [verifyJWT],
      schema: { tags: ["Fornecedores"], security: [{ bearerAuth: [] }] },
    },
    SuppliersController.getById,
  );
  typedApp.put(
    "/suppliers/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Fornecedores"], security: [{ bearerAuth: [] }] },
    },
    SuppliersController.update,
  );
  typedApp.delete(
    "/suppliers/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Fornecedores"], security: [{ bearerAuth: [] }] },
    },
    SuppliersController.delete,
  );

  // ==========================================
  // 4. CATEGORIAS
  // ==========================================
  typedApp.post(
    "/categories",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Categorias"], security: [{ bearerAuth: [] }] },
    },
    CategoriesController.create,
  );
  typedApp.get(
    "/categories",
    { schema: { tags: ["Categorias"] } },
    CategoriesController.listAll,
  );
  typedApp.get(
    "/categories/:id",
    { schema: { tags: ["Categorias"] } },
    CategoriesController.getById,
  );
  typedApp.put(
    "/categories/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Categorias"], security: [{ bearerAuth: [] }] },
    },
    CategoriesController.update,
  );
  typedApp.delete(
    "/categories/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Categorias"], security: [{ bearerAuth: [] }] },
    },
    CategoriesController.delete,
  );

  // ==========================================
  // 5. PRODUTOS
  // ==========================================
  typedApp.post(
    "/products",
    {
      preValidation: [
        verifyJWT,
        verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN"),
        parseMultipartFormData,
      ],
      schema: {
        tags: ["Produtos"],
        summary: "Cadastrar Produto com Foto",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data", "application/json"],
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
          price: z.coerce.number().positive(),
          stock: z.coerce.number().int().nonnegative().default(0),
          categoryId: z.string().uuid(),
          supplierId: z.string().uuid().optional(),
          avatar: z.any().optional().describe("Envie a foto do produto"),
        }),
      },
    },
    ProductsController.create,
  );
  typedApp.put(
    "/products/:id",
    {
      preValidation: [
        verifyJWT,
        verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN"),
        parseMultipartFormData,
      ],
      schema: {
        tags: ["Produtos"],
        summary: "Atualizar Produto com Foto",
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data", "application/json"],
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.coerce.number().positive().optional(),
          stock: z.coerce.number().int().nonnegative().optional(),
          categoryId: z.string().uuid().optional(),
          supplierId: z.string().uuid().optional(),
          avatar: z.any().optional().describe("Nova foto do produto"),
        }),
      },
    },
    ProductsController.update,
  );
  typedApp.get(
    "/products",
    { schema: { tags: ["Produtos"] } },
    ProductsController.list,
  );
  typedApp.get(
    "/products/:id",
    { schema: { tags: ["Produtos"] } },
    ProductsController.getById,
  );

  typedApp.delete(
    "/products/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Produtos"], security: [{ bearerAuth: [] }] },
    },
    ProductsController.delete,
  );

  // ==========================================
  // 6. VENDAS / PEDIDOS
  // ==========================================
  typedApp.post(
    "/orders",
    {
      onRequest: [verifyJWT],
      schema: { tags: ["Vendas / Pedidos"], security: [{ bearerAuth: [] }] },
    },
    OrdersController.create,
  );
  typedApp.get(
    "/orders",
    {
      onRequest: [verifyJWT],
      schema: { tags: ["Vendas / Pedidos"], security: [{ bearerAuth: [] }] },
    },
    OrdersController.list,
  );
  typedApp.get(
    "/orders/:id",
    {
      onRequest: [verifyJWT],
      schema: { tags: ["Vendas / Pedidos"], security: [{ bearerAuth: [] }] },
    },
    OrdersController.getById,
  );
  typedApp.patch(
    "/orders/:id/status",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Vendas / Pedidos"], security: [{ bearerAuth: [] }] },
    },
    OrdersController.updateStatus,
  );
  typedApp.delete(
    "/orders/:id",
    {
      onRequest: [verifyJWT, verifyUserRole("ADMIN", "SUPERADMIN")],
      schema: { tags: ["Vendas / Pedidos"], security: [{ bearerAuth: [] }] },
    },
    OrdersController.delete,
  );

  // ==========================================
  // 7. ESTOQUE & PAINEL DE ESTATÍSTICAS
  // ==========================================
  typedApp.post(
    "/stock/adjust",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Estoque"], security: [{ bearerAuth: [] }] },
    },
    StockController.adjust,
  );
  typedApp.get(
    "/stock/movements/:productId",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Estoque"], security: [{ bearerAuth: [] }] },
    },
    StockController.getMovements,
  );
  typedApp.get(
    "/stats",
    {
      onRequest: [verifyJWT, verifyUserRole("MANAGER", "ADMIN", "SUPERADMIN")],
      schema: { tags: ["Estatísticas"], security: [{ bearerAuth: [] }] },
    },
    StatsController.getDashboard,
  );
}
