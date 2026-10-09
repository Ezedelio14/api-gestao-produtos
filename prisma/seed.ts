import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Subimagem PNG transparente genérica de 1x1 em Base64 para teste
const MOCK_BASE64_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSU\
UhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

// Dados auxiliares para gerar nomes de produtos realistas
const PRODUCT_PREFIXES = [
  "Super",
  "Ultra",
  "Pro",
  "Max",
  "Eco",
  "Premium",
  "Smart",
  "Plus",
];
const PRODUCT_NOUNS = [
  "Smartphone",
  "Notebook",
  "Fone Bluetooth",
  "Monitor 4K",
  "Teclado Mecânico",
  "Mouse Gamer",
  "Cadeira Ergonômica",
  "Camisa Polo",
  "Calça Jeans",
  "Tênis Esportivo",
  "Mochila Executiva",
  "Relógio Inteligente",
  "Cafeteira Express",
  "Liquidificador",
  "Luminária LED",
  "Caixa de Som",
  "Garrafa Térmica",
  "Livro de Arquitetura Software",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Iniciando o povoamento da base de dados (Seed)...");

  // 1. Limpar banco de dados existente (opcional)
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Banco de dados limpo.");

  // 2. Criar Senha Padrão Criptografada para todos os usuários de teste
  const defaultPasswordHash = await bcrypt.hash("123456", 6);

  // 3. Criar Usuários (1 Admin Principal + 19 Usuários/Admins variados)
  const usersData = [
    {
      name: "Admin Principal",
      email: "admin@empresa.com",
      password: defaultPasswordHash,
      role: Role.ADMIN,
    },
    ...Array.from({ length: 19 }).map((_, i) => ({
      name: `Usuário Teste ${i + 1}`,
      email: `user${i + 1}@empresa.com`,
      password: defaultPasswordHash,
      role: i % 4 === 0 ? Role.ADMIN : Role.USER, // 1 a cada 4 é ADMIN
    })),
  ];

  await prisma.user.createMany({ data: usersData });
  console.log("👤 20 Usuários criados com sucesso! (Senha padrão: 123456)");

  // 4. Criar Categorias
  const categoriesList = [
    { name: "Eletrônicos e Tecnologia", slug: "eletronicos-e-tecnologia" },
    { name: "Informática e Acessórios", slug: "informatica-e-acessorios" },
    { name: "Vestuário e Moda", slug: "vestuario-e-moda" },
    { name: "Casa e Decoração", slug: "casa-e-decoracao" },
    { name: "Eletrodomésticos", slug: "eletrodomesticos" },
    { name: "Esportes e Lazer", slug: "esportes-e-lazer" },
    { name: "Livros e Papelaria", slug: "livros-e-papelaria" },
    { name: "Saúde e Beleza", slug: "saude-e-beleza" },
    { name: "Ferramentas e Construção", slug: "ferramentas-e-construcao" },
    { name: "Automotivo", slug: "automotivo" },
  ];

  await prisma.category.createMany({ data: categoriesList });
  console.log("🏷️  10 Categorias criadas com sucesso!");

  // Buscar categorias inseridas para obter os IDs gerados
  const createdCategories = await prisma.category.findMany();

  // 5. Gerar 150 Produtos
  const productsData = Array.from({ length: 150 }).map((_, index) => {
    const prefix = getRandomItem(PRODUCT_PREFIXES);
    const noun = getRandomItem(PRODUCT_NOUNS);
    const category = getRandomItem(createdCategories);

    const name = `${prefix} ${noun} #${index + 1}`;
    const price = Number((Math.random() * 1500 + 10).toFixed(2)); // Preços entre 10.00 e 1510.00
    const stock = index % 7 === 0 ? 0 : getRandomNumber(5, 200); // Alguns produtos sem estoque

    return {
      name,
      description: `Esta é uma descrição detalhada e simulada para o produto ${name}. Excelente qualidade e garantia.`,
      price,
      stock,
      avatar: MOCK_BASE64_IMAGE,
      categoryId: category.id,
    };
  });

  await prisma.product.createMany({ data: productsData });
  console.log("📦 150 Produtos criados com sucesso!");

  console.log("✅ Povoamento da base de dados concluído com êxito!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o povoamento:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
