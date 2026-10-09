import "dotenv/config";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3333;

app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📚 Swagger UI disponível em http://localhost:${port}/docs`);
});
