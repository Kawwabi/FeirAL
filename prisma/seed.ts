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
      city: "Maceió",
      bio: "Equipe de administração do FeirAL.",
      notificationPref: { create: { weeklyDigest: true } },
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      name: "Maria Lima",
      email: "maria@feiral.app",
      passwordHash: password,
      role: "ORGANIZER",
      city: "Maceió",
      bio: "Organizo a feira de artesanato da orla de Pajuçara desde 2015.",
      notificationPref: { create: { preferredCategories: "artesanato,moda", preferredCity: "Maceió" } },
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: "João Pereira",
      email: "joao@feiral.app",
      passwordHash: password,
      role: "ORGANIZER",
      city: "Arapiraca",
      bio: "Produtor cultural e organizador de feiras gastronômicas no agreste alagoano.",
      notificationPref: { create: { preferredCategories: "alimentos,eventos-culturais", preferredCity: "Arapiraca" } },
    },
  });

  const visitor1 = await prisma.user.create({
    data: {
      name: "Carla Menezes",
      email: "carla@feiral.app",
      passwordHash: password,
      role: "VISITOR",
      city: "Maceió",
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

  console.log("Criando usuários...");
  const users = await seedUsers();

  console.log("Criando feirinhas...");
  const fairs = await seedFairs(categories, users);

  console.log("Criando avaliações, comentários, anúncios e notificações...");
  await seedEngagement(fairs, users);

  console.log("Seed concluído.");
  console.log("Usuários criados (senha: senha123):");
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
  organizer: "maria" | "joão";
  offerings: { name: string; kind: string; description?: string; priceRange?: string }[];
  events: { title: string; day: number; hour: number; endHour: number; address?: string }[];
}

const FAIRS: FairSeed[] = [
  {
    name: "Feira de Artesanato da Pajuçara",
    slug: "feira-de-artesanato-da-pajucara",
    city: "Maceió",
    address: "Av. Silvio Carlos Viana, Pajuçara",
    lat: -9.6658,
    lng: -35.7353,
    short: "Artesanato alagoano, renda de bilro e lembranças à beira-mar.",
    description:
      "Todos os sábados e domingos, artesãos de Maceió se reúnem na orla da Pajuçara para expor renda de bilro, cerâmica, esculturas em madeira e lembranças típicas de Alagoas. Ambiente familiar, com música ao vivo e vista para o mar.",
    cover: "/covers/artesanato.svg",
    cats: ["artesanato"],
    status: "PUBLISHED",
    featured: true,
    organizer: "maria",
    offerings: [
      { name: "Renda de bilro", kind: "PRODUCT", description: "Peças feitas a mão por artesãos locais.", priceRange: "R$ 40 - R$ 300" },
      { name: "Cerâmica de Capela", kind: "PRODUCT", description: "Loucas e enfeites em barro.", priceRange: "R$ 25 - R$ 150" },
      { name: "Personalização de lembranças", kind: "SERVICE", description: "Gravação de nomes em peças.", priceRange: "R$ 15" },
    ],
    events: [
      { title: "Feirinha de sábado na Pajuçara", day: 2, hour: 16, endHour: 22 },
      { title: "Feirinha de domingo na Pajuçara", day: 3, hour: 15, endHour: 21 },
    ],
  },
  {
    name: "Feira Gastronômica do Jaragua",
    slug: "feira-gastronomica-do-jaragua",
    city: "Maceió",
    address: "Praça Dois Irmãos, Jaragua",
    lat: -9.6416,
    lng: -35.7083,
    short: "Comida de rua, frutos do mar e doces típicos do litoral.",
    description:
      "A feira gastronômica do Jaragua reúne barracas de tapioca, sururu preparado, bolinho de goma, cocada e caldo de cana. Um passeio para toda a família, com espaço kids e apresentações musicais.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos", "eventos-culturais"],
    status: "PUBLISHED",
    featured: true,
    organizer: "joão",
    offerings: [
      { name: "Sururu preparado", kind: "PRODUCT", description: "Prato típico alagoano.", priceRange: "R$ 20 - R$ 45" },
      { name: "Tapioca artesanal", kind: "PRODUCT", priceRange: "R$ 10 - R$ 25" },
      { name: "Cocada e doces regionais", kind: "PRODUCT", priceRange: "R$ 8 - R$ 30" },
      { name: "Aula de culinária regional", kind: "SERVICE", description: "Oficina rápida com chefs locais.", priceRange: "R$ 50" },
    ],
    events: [
      { title: "Jaragua Food Fest", day: 5, hour: 18, endHour: 23 },
      { title: "Sábado gastronômico", day: 12, hour: 18, endHour: 23 },
    ],
  },
  {
    name: "Feira de Moda e Brechó do Centro",
    slug: "feira-de-moda-e-brecho-do-centro",
    city: "Maceió",
    address: "Rua do Comercio, Centro",
    lat: -9.6663,
    lng: -35.7359,
    short: "Roupas autorais, brechó e acessórios com estilo regional.",
    description:
      "Moda autoral, brechó curado, bijuterias artesanais e calçados produzidos por pequenos ateliers de Alagoas. Trocas de roupas e consultoria de estilo gratuita para visitantes.",
    cover: "/covers/moda.svg",
    cats: ["moda"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Roupas autorais", kind: "PRODUCT", priceRange: "R$ 60 - R$ 350" },
      { name: "Brechó curado", kind: "PRODUCT", priceRange: "R$ 20 - R$ 120" },
      { name: "Consultoria de estilo", kind: "SERVICE", priceRange: "Gratuito" },
    ],
    events: [{ title: "Feira de moda do centro", day: 9, hour: 10, endHour: 18 }],
  },
  {
    name: "Festival Cultural de Penedo",
    slug: "festival-cultural-de-penedo",
    city: "Penedo",
    address: "Praça Barão de Penedo",
    lat: -10.29,
    lng: -36.5861,
    short: "Forro, cordel e teatro no centro histórico de Penedo.",
    description:
      "O festival cultural de Penedo celebra a tradição do São Francisco com apresentações de forro pé de serra, literatura de cordel, grupos de teatro e artesanato ribeirinho.",
    cover: "/covers/eventos-culturais.svg",
    cats: ["eventos-culturais", "artesanato"],
    status: "PUBLISHED",
    featured: true,
    organizer: "joão",
    offerings: [
      { name: "Cordel e livros regionais", kind: "PRODUCT", priceRange: "R$ 10 - R$ 60" },
      { name: "Artesanato ribeirinho", kind: "PRODUCT", priceRange: "R$ 25 - R$ 200" },
      { name: "Apresentações de forro", kind: "SERVICE", description: "Shows ao vivo no palco principal." },
    ],
    events: [
      { title: "Noite de forro pé de serra", day: 7, hour: 20, endHour: 23, address: "Palco principal" },
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
      "Mudas de plantas nativas, flores tropicais, orquídeas e consultoria de paisagismo. Produtores da região metropolitana oferecem transporte para vasos grandes.",
    cover: "/covers/flores-e-plantas.svg",
    cats: ["flores-e-plantas"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Mudas nativas", kind: "PRODUCT", priceRange: "R$ 10 - R$ 80" },
      { name: "Orquídeas", kind: "PRODUCT", priceRange: "R$ 35 - R$ 250" },
      { name: "Consultoria de paisagismo", kind: "SERVICE", priceRange: "R$ 150" },
    ],
    events: [{ title: "Feira de plantas de sábado", day: 6, hour: 8, endHour: 14 }],
  },
  {
    name: "Feira de Antiguidades do Farol",
    slug: "feira-de-antiguidades-do-farol",
    city: "Maceió",
    address: "Av. Fernandes Lima, Farol",
    lat: -9.6555,
    lng: -35.7285,
    short: "Discos de vinil, livros usados e peças de coleção.",
    description:
      "Um ponto para colecionadores: discos de vinil, livros usados, moedas, selos, móveis antigos e objetos de decoração retro. Avaliação gratuita de peças trazidas pelos visitantes.",
    cover: "/covers/antiguidades.svg",
    cats: ["antiguidades", "moda"],
    status: "PUBLISHED",
    organizer: "joão",
    offerings: [
      { name: "Discos de vinil", kind: "PRODUCT", priceRange: "R$ 30 - R$ 300" },
      { name: "Livros usados", kind: "PRODUCT", priceRange: "R$ 5 - R$ 60" },
      { name: "Avaliação de coleção", kind: "SERVICE", priceRange: "Gratuito" },
    ],
    events: [{ title: "Encontro de colecionadores", day: 11, hour: 9, endHour: 16 }],
  },
  {
    name: "Feira da Agricultura Familiar de Arapiraca",
    slug: "feira-da-agricultura-familiar-de-arapiraca",
    city: "Arapiraca",
    address: "Mercado Público de Arapiraca",
    lat: -9.7525,
    lng: -36.6611,
    short: "Produtos da agricultura familiar do agreste alagoano.",
    description:
      "Feira semanal com produtos frescos da agricultura familiar: frutas, legumes, queijos artesanais, mel e derivados. Preços acessíveis e apoio direto ao produtor rural.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos"],
    status: "PUBLISHED",
    organizer: "joão",
    offerings: [
      { name: "Cesta de frutas e legumes", kind: "PRODUCT", priceRange: "R$ 25 - R$ 70" },
      { name: "Queijo coalho artesanal", kind: "PRODUCT", priceRange: "R$ 18 - R$ 40" },
      { name: "Mel de engenho", kind: "PRODUCT", priceRange: "R$ 22" },
    ],
    events: [
      { title: "Feira da agricultura familiar", day: 1, hour: 5, endHour: 12 },
      { title: "Feira da agricultura familiar (próxima semana)", day: 8, hour: 5, endHour: 12 },
    ],
  },
  {
    name: "Feira Cultural de União dos Palmares",
    slug: "feira-cultural-de-uniao-dos-palmares",
    city: "União dos Palmares",
    address: "Praça Basílica, Centro",
    lat: -9.1597,
    lng: -36.032,
    short: "Artesanato, gastronomia e memória quilombola da Zona da Mata.",
    description:
      "Feira que valoriza a cultura afro-brasileira da região: artesanato em palha, instrumentos de percussão, culinária quilombola e rodas de conversa sobre a história da Serra da Barriga.",
    cover: "/covers/artesanato.svg",
    cats: ["artesanato", "eventos-culturais", "alimentos"],
    status: "PUBLISHED",
    organizer: "maria",
    offerings: [
      { name: "Artesanato em palha", kind: "PRODUCT", priceRange: "R$ 15 - R$ 90" },
      { name: "Culinária quilombola", kind: "PRODUCT", priceRange: "R$ 12 - R$ 40" },
      { name: "Oficina de percussão", kind: "SERVICE", priceRange: "R$ 30" },
    ],
    events: [{ title: "Feira cultural de sábado", day: 4, hour: 15, endHour: 21 }],
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
      "Feira sazonal na orla de Maragogi com artesanato praiano, tapiocas recheadas e agenciamento de passeios às gales naturais. Cadastro em análise pela equipe de moderação.",
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
    address: "Praça Central de Coruripe",
    lat: -10.1253,
    lng: -36.1756,
    short: "Rascunho de feira noturna com gastronomia e música.",
    description:
      "Rascunho em construção: feira noturna com barracas gastronômicas, artistas locais e espaço para vendedores ambulantes ao longo de toda a praça central.",
    cover: "/covers/alimentos.svg",
    cats: ["alimentos", "eventos-culturais"],
    status: "DRAFT",
    organizer: "joão",
    offerings: [{ name: "Barracas gastronômicas", kind: "PRODUCT" }],
    events: [{ title: "Feira noturna (previsão)", day: 20, hour: 19, endHour: 23 }],
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
    { index: 0, author: users.visitor1.id, rating: 5, title: "Artesanato de ótima qualidade", content: "Encontrei peças de renda lindas e preços justos. Ambiente muito agradável." },
    { index: 0, author: users.visitor2.id, rating: 4, title: "Vale a visita", content: "Boa variedade de cerâmica. Só senti falta de mais opções de comida." },
    { index: 1, author: users.visitor1.id, rating: 5, title: "Melhor sururu da cidade", content: "A feira do Jaragua está muito bem organizada. Recomendo o sururu!" },
    { index: 3, author: users.visitor2.id, rating: 4, title: "Cultura viva em Penedo", content: "O forro pé de serra foi emocionante e o cordel é imperdível." },
    { index: 4, author: users.visitor1.id, rating: 5, title: "Comprei orquídeas maravilhosas", content: "Os produtores explicam tudo sobre o cuidado com as plantas." },
    { index: 6, author: users.visitor2.id, rating: 4, title: "Preços acessíveis", content: "Produtos fresquíssimos direto do produtor. Cheguei cedo e aproveitei." },
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
    { index: 0, author: users.visitor1.id, content: "A feira aceita cartão ou só dinheiro?" },
    { index: 0, author: users.organizer1.id, content: "Aceitamos Pix e cartão na maioria das barracas!" },
    { index: 1, author: users.visitor2.id, content: "Qual o melhor horário para ir com crianças?" },
    { index: 3, author: users.visitor1.id, content: "Vai ter programação especial no feriado?" },
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

  // Uma resposta aninhada ao primeiro comentário.
  if (createdComments.length > 0 && published[0]) {
    await prisma.comment.create({
      data: {
        fairId: published[0].id,
        authorId: users.organizer1.id,
        parentId: createdComments[0],
        content: "Sim! Todas as barracas aceitam Pix, e algumas aceitam cartão.",
      },
    });
  }

  const feedbackSeeds = [
    { index: 1, author: users.organizer1.id, experience: "Participamos da feira gastronômica e o fluxo de visitantes foi excelente. Organização impecável.", suggestions: "Aumentar o número de pontos de água e melhorar a sinalização.", wouldReturn: true, score: 5 },
    { index: 0, author: users.organizer2.id, experience: "Ambiente muito bom para expor. Público interessado em artesanato e cultura local.", suggestions: "Criar um mapa impresso das barracas para os visitantes.", wouldReturn: true, score: 4 },
    { index: 3, author: users.organizer1.id, experience: "O festival cultural de Penedo tem ótimo público, mas o espaço para barracas é limitado.", suggestions: "Ampliar a área de exposição no próximo ano.", wouldReturn: true, score: 4 },
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

  // Notificações para o visitante 1
  await prisma.notification.createMany({
    data: [
      {
        userId: users.visitor1.id,
        type: "NEW_EVENT",
        title: "Novo evento na Feira de Artesanato da Pajuçara",
        body: "Foi adicionada uma nova data na feirinha que você acompanha.",
        link: published[0] ? `/feirinhas/${published[0].slug}` : "/feirinhas",
      },
      {
        userId: users.visitor1.id,
        type: "REVIEW_REPLY",
        title: "Seu comentário recebeu uma resposta",
        body: "Maria Lima respondeu sua dúvida sobre pagamentos.",
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

  // Anúncios patrocinados
  const adSeeds = [
    { index: 0, tier: "PREMIUM", status: "ACTIVE", title: "Sábado tem feira na Pajuçara!", imp: 5400, clk: 312 },
    { index: 1, tier: "STANDARD", status: "ACTIVE", title: "Jaragua Food Fest: comida de rua imperdível", imp: 2100, clk: 143 },
    { index: 3, tier: "BASIC", status: "ACTIVE", title: "Festival cultural de Penedo", imp: 780, clk: 41 },
    { index: 2, tier: "BASIC", status: "PENDING", title: "Brechó do centro com até 50% off", imp: 0, clk: 0 },
  ];

  for (const ad of adSeeds) {
    const fair = published[ad.index];
    if (!fair) continue;
    await prisma.advertisement.create({
      data: {
        fairId: fair.id,
        ownerId: fair.organizerId,
        title: ad.title,
        description: "Anúncio patrocinado criado como exemplo pela equipe do FeirAL.",
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

  // Denúncia aberta de exemplo
  if (createdComments.length > 0) {
    await prisma.moderationReport.create({
      data: {
        targetType: "COMMENT",
        targetId: createdComments[0],
        reporterId: users.visitor2.id,
        reason: "Informação incorreta",
        details: "Acho que a informação sobre formas de pagamento mudou recentemente.",
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
      { conversationId: conversation.id, role: "user", content: "Quais feirinhas acontecem em Maceió?" },
      {
        conversationId: conversation.id,
        role: "assistant",
        content:
          "Em Maceió temos a Feira de Artesanato da Pajuçara, a Feira Gastronômica do Jaragua, a Feira de Moda e Brechó do Centro e a Feira de Antiguidades do Farol.",
      },
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
