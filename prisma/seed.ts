import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

const now = new Date();
function at(days: number, hour = 9, minute = 0): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function daysAgo(days: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
}

async function clearDatabase() {
  await prisma.chatMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.moderationReport.deleteMany();
  await prisma.advertisement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.organizerFeedback.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.fairEvent.deleteMany();
  await prisma.offering.deleteMany();
  await prisma.fair.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedCategories() {
  const map = new Map<string, string>();
  for (const category of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
      },
    });
    map.set(created.slug, created.id);
  }
  return map;
}

async function seedUsers() {
  const password = await bcrypt.hash("senha123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Ana Souza (Admin)",
      email: "admin@feiral.app",
      passwordHash: password,
      role: "ADMIN",
      city: "Maceio",
      bio: "Equipe de administracao do FeirAL.",
      notificationPref: { create: { weeklyDigest: true } },
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      name: "Maria Lima",
      email: "maria@feiral.app",
      passwordHash: password,
      role: "ORGANIZER",
      city: "Maceio",
      bio: "Organizo a feira de artesanato da orla de Pajucara desde 2015.",
      notificationPref: { create: { preferredCategories: "artesanato,moda", preferredCity: "Maceio" } },
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: "Joao Pereira",
      email: "joao@feiral.app",
      passwordHash: password,
      role: "ORGANIZER",
      city: "Arapiraca",
      bio: "Produtor cultural e organizador de feiras gastronomicas no agreste alagoano.",
      notificationPref: { create: { preferredCategories: "alimentos,eventos-culturais", preferredCity: "Arapiraca" } },
    },
  });

  const visitor1 = await prisma.user.create({
    data: {
      name: "Carla Menezes",
      email: "carla@feiral.app",
      passwordHash: password,
      role: "VISITOR",
      city: "Maceio",
      notificationPref: { create: {} },
    },
  });

  const visitor2 = await prisma.user.create({
    data: {
      name: "Rafael Costa",
      email: "rafael@feiral.app",
      passwordHash: password,
      role: "VISITOR",
      city: "Penedo",
      notificationPref: { create: {} },
    },
  });

  return { admin, organizer1, organizer2, visitor1, visitor2 };
}

async function main() {
  console.log("Limpando banco de dados...");
  await clearDatabase();

  console.log("Criando categorias...");
  const categories = await seedCategories();

  console.log("Criando usuarios...");
  const users = await seedUsers();

  console.log("Criando feirinhas...");
  const fairs = await seedFairs(categories, users);

  console.log("Criando avaliacoes, comentarios, anuncios e notificacoes...");
  await seedEngagement(fairs, users);

  console.log("Seed concluido.");
  console.log("Usuarios criados (senha: senha123):");
  console.log("  admin@feiral.app  - administrador");
  console.log("  maria@feiral.app  - organizadora");
  console.log("  joao@feiral.app   - organizador");
  console.log("  carla@feiral.app  - visitante");
  console.log("  rafael@feiral.app - visitante");
  console.log(`Feirinhas criadas: ${fairs.length}`);
  console.log(`Categorias criadas: ${categories.size}`);
}

interface FairSeed {
  name: string;
  slug: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  short: string;
  description: string;
  cover: string;
  cats: string[];
  status: string;
  featured?: boolean;
  organizer: "maria" | "joao";
  offerings: { name: string; kind: string; description?: string; priceRange?: string }[];
  events: { title: string; day: number; hour: number; endHour: number; address?: string }[];
}

const FAIRS: FairSeed[] = [
  {
    name: "Feira de Artesanato da Pajucara",
    slug: "feira-de-artesanato-da-pajucara",
    city: "Maceio",
    address: "Av. Silvio Carlos Viana, Pajucara",
    lat: -9.6658,
    lng: -35.7353,
    short: "Artesanato alagoano, renda de bilro e lembrancas a beira-mar.",
    description:
      "Todos os sabados e domingos, artesaos de Maceio se reúnem na orla da Pajucara para expor renda de bilro, ceramica, esculturas em madeira e lembrancas tipicas de Alagoas. Ambiente familiar, com musica ao vivo e vista para o mar.",
    cover: "/covers/artesanato.svg",
    cats: ["artesanato"],
    status: "PUBLISHED",
    featured: true,
    organizer: "maria",
    offerings: [
      { name: "Renda de bilro", kind: "PRODUCT", description: "Pecas feitas a mao por artesaos locais.", priceRange: "R$ 40 - R$ 300" },
      { name: "Ceramica de Capela", kind: "PRODUCT", description: "Loucas e enfeites em barro.", priceRange: "R$ 25 - R$ 150" },
      { name: "Personalizacao de lembrancas", kind: "SERVICE", description: "Gravacao de nomes em pecas.", priceRange: "R$ 15" },
    ],
    events: [
      { title: "Feirinha de sabado na Pajucara", day: 2, hour: 16, endHour: 22 },
      { title: "Feirinha de domingo na Pajucara", day: 3, hour: 15, endHour: 21 },
    ],
  },
  {
    name: "Feira Gastronomica do Jaragua",
    slug: "feira-gastronomica-do-jaragua",
    city: "Maceio",
    address: "Praca Dois Irmaos, Jaragua",
    lat: -9.6416,
    lng: -35.7083,
    short: "Comida de rua, frutos do mar e doces tipicos do litoral.",
    description:
      "A feira gastronomica do Jaragua reune barracas de tapioca, sururu preparado, bolinho de goma, cocada e caldo de cana. Um passeio para toda a familia, com espaco kids e apresentacoes musicais.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos", "eventos-culturais"],
    status: "PUBLISHED",
    featured: true,
    organizer: "joao",
    offerings: [
      { name: "Sururu preparado", kind: "PRODUCT", description: "Prato tipico alagoano.", priceRange: "R$ 20 - R$ 45" },
      { name: "Tapioca artesanal", kind: "PRODUCT", priceRange: "R$ 10 - R$ 25" },
      { name: "Cocada e doces regionais", kind: "PRODUCT", priceRange: "R$ 8 - R$ 30" },
      { name: "Aula de culinaria regional", kind: "SERVICE", description: "Oficina rapida com chefs locais.", priceRange: "R$ 50" },
    ],
    events: [
      { title: "Jaragua Food Fest", day: 5, hour: 18, endHour: 23 },
      { title: "Sabado gastronomico", day: 12, hour: 18, endHour: 23 },
    ],
  },
  {
    name: "Feira de Moda e Brecho do Centro",
    slug: "feira-de-moda-e-brecho-do-centro",
    city: "Maceio",
    address: "Rua do Comercio, Centro",
    lat: -9.6663,
    lng: -35.7359,
    short: "Roupas autorais, brecho e acessorios com estilo regional.",
    description:
      "Moda autoral, brecho curado, bijuterias artesanais e calcados produzidos por pequenos atelies de Alagoas. Trocas de roupas e consultoria de estilo gratuita para visitantes.",
    cover: "/covers/moda.svg",
    cats: ["moda"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Roupas autorais", kind: "PRODUCT", priceRange: "R$ 60 - R$ 350" },
      { name: "Brecho curado", kind: "PRODUCT", priceRange: "R$ 20 - R$ 120" },
      { name: "Consultoria de estilo", kind: "SERVICE", priceRange: "Gratuito" },
    ],
    events: [{ title: "Feira de moda do centro", day: 9, hour: 10, endHour: 18 }],
  },
  {
    name: "Festival Cultural de Penedo",
    slug: "festival-cultural-de-penedo",
    city: "Penedo",
    address: "Praca Barao de Penedo",
    lat: -10.29,
    lng: -36.5861,
    short: "Forro, cordel e teatro no centro historico de Penedo.",
    description:
      "O festival cultural de Penedo celebra a tradicao do Sao Francisco com apresentacoes de forro pe de serra, literatura de cordel, grupos de teatro e artesanato ribeirinho.",
    cover: "/covers/eventos-culturais.svg",
    cats: ["eventos-culturais", "artesanato"],
    status: "PUBLISHED",
    featured: true,
    organizer: "joao",
    offerings: [
      { name: "Cordel e livros regionais", kind: "PRODUCT", priceRange: "R$ 10 - R$ 60" },
      { name: "Artesanato ribeirinho", kind: "PRODUCT", priceRange: "R$ 25 - R$ 200" },
      { name: "Apresentacoes de forro", kind: "SERVICE", description: "Shows ao vivo no palco principal." },
    ],
    events: [
      { title: "Noite de forro pe de serra", day: 7, hour: 20, endHour: 23, address: "Palco principal" },
      { title: "Feira de cordel", day: 8, hour: 16, endHour: 22 },
    ],
  },
  {
    name: "Feira de Flores e Plantas de Marechal Deodoro",
    slug: "feira-de-flores-e-plantas-de-marechal-deodoro",
    city: "Marechal Deodoro",
    address: "Rodovia AL-101 Sul, Km 20",
    lat: -9.7103,
    lng: -35.895,
    short: "Mudas, flores tropicais e paisagismo para sua casa.",
    description:
      "Mudas de plantas nativas, flores tropicais, orquideas e consultoria de paisagismo. Produtores da regiao metropolitana oferecem transporte para vasos grandes.",
    cover: "/covers/flores-e-plantas.svg",
    cats: ["flores-e-plantas"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Mudas nativas", kind: "PRODUCT", priceRange: "R$ 10 - R$ 80" },
      { name: "Orquideas", kind: "PRODUCT", priceRange: "R$ 35 - R$ 250" },
      { name: "Consultoria de paisagismo", kind: "SERVICE", priceRange: "R$ 150" },
    ],
    events: [{ title: "Feira de plantas de sabado", day: 6, hour: 8, endHour: 14 }],
  },
  {
    name: "Feira de Antiguidades do Farol",
    slug: "feira-de-antiguidades-do-farol",
    city: "Maceio",
    address: "Av. Fernandes Lima, Farol",
    lat: -9.6555,
    lng: -35.7285,
    short: "Discos de vinil, livros usados e pecas de colecao.",
    description:
      "Um ponto para colecionadores: discos de vinil, livros usados, moedas, selos, moveis antigos e objetos de decoracao retro. Avaliacao gratuita de pecas trazidas pelos visitantes.",
    cover: "/covers/antiguidades.svg",
    cats: ["antiguidades", "moda"],
    status: "PUBLISHED",
    organizer: "joao",
    offerings: [
      { name: "Discos de vinil", kind: "PRODUCT", priceRange: "R$ 30 - R$ 300" },
      { name: "Livros usados", kind: "PRODUCT", priceRange: "R$ 5 - R$ 60" },
      { name: "Avaliacao de colecao", kind: "SERVICE", priceRange: "Gratuito" },
    ],
    events: [{ title: "Encontro de colecionadores", day: 11, hour: 9, endHour: 16 }],
  },
  {
    name: "Feira da Agricultura Familiar de Arapiraca",
    slug: "feira-da-agricultura-familiar-de-arapiraca",
    city: "Arapiraca",
    address: "Mercado Publico de Arapiraca",
    lat: -9.7525,
    lng: -36.6611,
    short: "Produtos da agricultura familiar do agreste alagoano.",
    description:
      "Feira semanal com produtos frescos da agricultura familiar: frutas, legumes, queijos artesanais, mel e derivados. Precos acessiveis e apoio direto ao produtor rural.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos"],
    status: "PUBLISHED",
    organizer: "joao",
    offerings: [
      { name: "Cesta de frutas e legumes", kind: "PRODUCT", priceRange: "R$ 25 - R$ 70" },
      { name: "Queijo coalho artesanal", kind: "PRODUCT", priceRange: "R$ 18 - R$ 40" },
      { name: "Mel de engenho", kind: "PRODUCT", priceRange: "R$ 22" },
    ],
    events: [
      { title: "Feira da agricultura familiar", day: 1, hour: 5, endHour: 12 },
      { title: "Feira da agricultura familiar (proxima semana)", day: 8, hour: 5, endHour: 12 },
    ],
  },
  {
    name: "Feira Cultural de Uniao dos Palmares",
    slug: "feira-cultural-de-uniao-dos-palmares",
    city: "Uniao dos Palmares",
    address: "Praca Basilica, Centro",
    lat: -9.1597,
    lng: -36.032,
    short: "Artesanato, gastronomia e memoria quilombola da Zona da Mata.",
    description:
      "Feira que valoriza a cultura afro-brasileira da regiao: artesanato em palha, instrumentos de percussao, culinaria quilombola e rodas de conversa sobre a historia da Serra da Barriga.",
    cover: "/covers/artesanato.svg",
    cats: ["artesanato", "eventos-culturais", "alimentos"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Artesanato em palha", kind: "PRODUCT", priceRange: "R$ 15 - R$ 90" },
      { name: "Culinaria quilombola", kind: "PRODUCT", priceRange: "R$ 12 - R$ 40" },
      { name: "Oficina de percussao", kind: "SERVICE", priceRange: "R$ 30" },
    ],
    events: [{ title: "Feira cultural de sabado", day: 4, hour: 15, endHour: 21 }],
  },
  {
    name: "Feira de Inverno de Maragogi",
    slug: "feira-de-inverno-de-maragogi",
    city: "Maragogi",
    address: "Orla de Maragogi",
    lat: -9.0122,
    lng: -35.2225,
    short: "Artesanato praiano, tapiocas e passeios guiados.",
    description:
      "Feira sazonal na orla de Maragogi com artesanato praiano, tapiocas recheadas e agenciamento de passeios as gales naturais. Cadastro em analise pela equipe de moderacao.",
    cover: "/covers/moda.svg",
    cats: ["artesanato", "alimentos"],
    status: "PENDING_REVIEW",
    organizer: "maria",
    offerings: [{ name: "Artesanato praiano", kind: "PRODUCT", priceRange: "R$ 20 - R$ 120" }],
    events: [{ title: "Feira de inverno", day: 15, hour: 16, endHour: 22 }],
  },
  {
    name: "Feira Noturna de Coruripe",
    slug: "feira-noturna-de-coruripe",
    city: "Coruripe",
    address: "Praca Central de Coruripe",
    lat: -10.1253,
    lng: -36.1756,
    short: "Rascunho de feira noturna com gastronomia e musica.",
    description:
      "Rascunho em construcao: feira noturna com barracas gastronomicas, artistas locais e espaco para vendedores ambulantes ao longo de toda a praca central.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos", "eventos-culturais"],
    status: "DRAFT",
    organizer: "joao",
    offerings: [{ name: "Barracas gastronomicas", kind: "PRODUCT" }],
    events: [{ title: "Feira noturna (previsao)", day: 20, hour: 19, endHour: 23 }],
  },
];

interface SeededFair {
  id: string;
  slug: string;
  name: string;
  organizerId: string;
  status: string;
}

async function seedFairs(
  categories: Map<string, string>,
  users: { organizer1: { id: string }; organizer2: { id: string } },
): Promise<SeededFair[]> {
  const created: SeededFair[] = [];

  for (const seed of FAIRS) {
    const organizerId = seed.organizer === "maria" ? users.organizer1.id : users.organizer2.id;
    const fair = await prisma.fair.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        shortDescription: seed.short,
        description: seed.description,
        address: seed.address,
        city: seed.city,
        state: "AL",
        latitude: seed.lat,
        longitude: seed.lng,
        coverImageUrl: seed.cover,
        contactEmail: `${seed.slug}@feiral.app`,
        contactPhone: "(82) 99999-0000",
        websiteUrl: `https://feiral.app/${seed.slug}`,
        instagramUrl: `@${seed.slug.slice(0, 18)}`,
        status: seed.status,
        isFeatured: Boolean(seed.featured),
        publishedAt: seed.status === "PUBLISHED" ? daysAgo(10) : null,
        organizerId,
        categories: { connect: seed.cats.map((slug) => ({ slug })) },
        offerings: { create: seed.offerings },
        events: {
          create: seed.events.map((event) => ({
            title: event.title,
            startsAt: at(event.day, event.hour),
            endsAt: at(event.day, event.endHour),
            address: event.address ?? seed.address,
            latitude: seed.lat,
            longitude: seed.lng,
          })),
        },
      },
    });

    created.push({
      id: fair.id,
      slug: fair.slug,
      name: fair.name,
      organizerId: fair.organizerId,
      status: fair.status,
    });
  }

  void categories;
  return created;
}

interface SeedUsers {
  admin: { id: string };
  organizer1: { id: string };
  organizer2: { id: string };
  visitor1: { id: string };
  visitor2: { id: string };
}

async function seedEngagement(fairs: SeededFair[], users: SeedUsers) {
  const published = fairs.filter((f) => f.status === "PUBLISHED");

  const reviewSeeds = [
    { index: 0, author: users.visitor1.id, rating: 5, title: "Artesanato de otima qualidade", content: "Encontrei pecas de renda lindas e preços justos. Ambiente muito agradavel." },
    { index: 0, author: users.visitor2.id, rating: 4, title: "Vale a visita", content: "Boa variedade de ceramica. So senti falta de mais opcoes de comida." },
    { index: 1, author: users.visitor1.id, rating: 5, title: "Melhor sururu da cidade", content: "A feira do Jaragua esta muito bem organizada. Recomendo o sururu!" },
    { index: 3, author: users.visitor2.id, rating: 4, title: "Cultura viva em Penedo", content: "O forro pe de serra foi emocionante e o cordel e imperdivel." },
    { index: 4, author: users.visitor1.id, rating: 5, title: "Comprei orquideas maravilhosas", content: "Os produtores explicam tudo sobre o cuidado com as plantas." },
    { index: 6, author: users.visitor2.id, rating: 4, title: "Precos acessiveis", content: "Produtos fresquissimos direto do produtor. Cheguei cedo e aproveitei." },
  ];

  for (const review of reviewSeeds) {
    const fair = published[review.index];
    if (!fair) continue;
    await prisma.review.create({
      data: {
        fairId: fair.id,
        authorId: review.author,
        rating: review.rating,
        title: review.title,
        content: review.content,
        visitedAt: daysAgo(5),
      },
    });
  }

  const commentSeeds = [
    { index: 0, author: users.visitor1.id, content: "A feira aceita cartao ou so dinheiro?" },
    { index: 0, author: users.organizer1.id, content: "Aceitamos Pix e cartao na maioria das barracas!" },
    { index: 1, author: users.visitor2.id, content: "Qual o melhor horario para ir com criancas?" },
    { index: 3, author: users.visitor1.id, content: "Vai ter programacao especial no feriado?" },
  ];

  const createdComments: string[] = [];
  for (const comment of commentSeeds) {
    const fair = published[comment.index];
    if (!fair) continue;
    const created = await prisma.comment.create({
      data: { fairId: fair.id, authorId: comment.author, content: comment.content },
    });
    createdComments.push(created.id);
  }

  // Uma resposta aninhada ao primeiro comentario.
  if (createdComments.length > 0 && published[0]) {
    await prisma.comment.create({
      data: {
        fairId: published[0].id,
        authorId: users.organizer1.id,
        parentId: createdComments[0],
        content: "Sim! Todas as barracas aceitam Pix, e algumas aceitam cartao.",
      },
    });
  }

  const feedbackSeeds = [
    { index: 1, author: users.organizer1.id, experience: "Participamos da feira gastronomica e o fluxo de visitantes foi excelente. Organizacao impecavel.", suggestions: "Aumentar o numero de pontos de agua e melhorar a sinalizacao.", wouldReturn: true, score: 5 },
    { index: 0, author: users.organizer2.id, experience: "Ambiente muito bom para expor. Publico interessado em artesanato e cultura local.", suggestions: "Criar um mapa impresso das barracas para os visitantes.", wouldReturn: true, score: 4 },
    { index: 3, author: users.organizer1.id, experience: "O festival cultural de Penedo tem otimo publico, mas o espaco para barracas e limitado.", suggestions: "Ampliar a area de exposicao no proximo ano.", wouldReturn: true, score: 4 },
  ];

  for (const feedback of feedbackSeeds) {
    const fair = published[feedback.index];
    if (!fair) continue;
    await prisma.organizerFeedback.create({
      data: {
        fairId: fair.id,
        authorId: feedback.author,
        experience: feedback.experience,
        suggestions: feedback.suggestions,
        wouldParticipateAgain: feedback.wouldReturn,
        organizationScore: feedback.score,
      },
    });
  }

  const followSeeds = [
    { index: 0, userId: users.visitor1.id },
    { index: 1, userId: users.visitor1.id },
    { index: 3, userId: users.visitor1.id },
    { index: 2, userId: users.visitor2.id },
    { index: 4, userId: users.visitor2.id },
  ];

  for (const follow of followSeeds) {
    const fair = published[follow.index];
    if (!fair) continue;
    await prisma.follow.create({ data: { userId: follow.userId, fairId: fair.id } }).catch(() => undefined);
  }

  // Notificacoes para o visitante 1
  await prisma.notification.createMany({
    data: [
      {
        userId: users.visitor1.id,
        type: "NEW_EVENT",
        title: "Novo evento na Feira de Artesanato da Pajucara",
        body: "Foi adicionada uma nova data na feirinha que voce acompanha.",
        link: published[0] ? `/feirinhas/${published[0].slug}` : "/feirinhas",
      },
      {
        userId: users.visitor1.id,
        type: "REVIEW_REPLY",
        title: "Seu comentario recebeu uma resposta",
        body: "Maria Lima respondeu sua duvida sobre pagamentos.",
        link: published[0] ? `/feirinhas/${published[0].slug}` : "/feirinhas",
        readAt: daysAgo(1),
      },
      {
        userId: users.visitor1.id,
        type: "SYSTEM",
        title: "Bem-vindo ao FeirAL",
        body: "Explore as feirinhas e acompanhe suas favoritas.",
        link: "/feirinhas",
      },
    ],
  });

  // Anuncios patrocinados
  const adSeeds = [
    { index: 0, tier: "PREMIUM", status: "ACTIVE", title: "Sabado tem feira na Pajucara!", imp: 5400, clk: 312 },
    { index: 1, tier: "STANDARD", status: "ACTIVE", title: "Jaragua Food Fest: comida de rua imperdivel", imp: 2100, clk: 143 },
    { index: 3, tier: "BASIC", status: "ACTIVE", title: "Festival cultural de Penedo", imp: 780, clk: 41 },
    { index: 2, tier: "BASIC", status: "PENDING", title: "Brecho do centro com ate 50% off", imp: 0, clk: 0 },
  ];

  for (const ad of adSeeds) {
    const fair = published[ad.index];
    if (!fair) continue;
    await prisma.advertisement.create({
      data: {
        fairId: fair.id,
        ownerId: fair.organizerId,
        title: ad.title,
        description: "Anuncio patrocinado criado como exemplo pela equipe do FeirAL.",
        tier: ad.tier,
        status: ad.status,
        startsAt: daysAgo(2),
        endsAt: at(20, 23),
        dailyBudgetCents: ad.tier === "PREMIUM" ? 29900 : ad.tier === "STANDARD" ? 12900 : 4900,
        impressions: ad.imp,
        clicks: ad.clk,
      },
    });
  }

  // Denuncia aberta de exemplo
  if (createdComments.length > 0) {
    await prisma.moderationReport.create({
      data: {
        targetType: "COMMENT",
        targetId: createdComments[0],
        reporterId: users.visitor2.id,
        reason: "Informacao incorreta",
        details: "Acho que a informacao sobre formas de pagamento mudou recentemente.",
      },
    });
  }

  // Registros de auditoria
  await prisma.auditLog.createMany({
    data: [
      { actorId: users.admin.id, action: "FAIR_APPROVED", entityType: "Fair", entityId: published[0]?.id ?? null, metadata: JSON.stringify({ source: "seed" }) },
      { actorId: users.organizer1.id, action: "FAIR_CREATED", entityType: "Fair", entityId: published[0]?.id ?? null, metadata: JSON.stringify({ source: "seed" }) },
      { actorId: users.organizer2.id, action: "AD_CREATED", entityType: "Advertisement", metadata: JSON.stringify({ tier: "STANDARD" }) },
      { actorId: users.visitor1.id, action: "REVIEW_UPSERTED", entityType: "Fair", entityId: published[0]?.id ?? null },
      { actorId: users.admin.id, action: "FAIR_FEATURED_TOGGLED", entityType: "Fair", entityId: published[3]?.id ?? null },
    ],
  });

  // Conversa de exemplo com a FeiraIA
  const conversation = await prisma.conversation.create({
    data: { sessionKey: "seed-conversation", userId: users.visitor1.id },
  });
  await prisma.chatMessage.createMany({
    data: [
      { conversationId: conversation.id, role: "user", content: "Quais feirinhas acontecem em Maceio?" },
      {
        conversationId: conversation.id,
        role: "assistant",
        content:
          "Em Maceio temos a Feira de Artesanato da Pajucara, a Feira Gastronomica do Jaragua, a Feira de Moda e Brecho do Centro e a Feira de Antiguidades do Farol.",
      },
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
