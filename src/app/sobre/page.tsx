import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, Calendar, Star, Sparkles, Shield, Megaphone, Users, MessageSquare } from "lucide-react";
import { Card, PageHeader, buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sobre o FeirAL",
  description: "Conheca a plataforma que reune, organiza e divulga as feirinhas de Alagoas.",
};

const FEATURES = [
  {
    icon: <MapPinned size={20} />,
    title: "Mapa interativo",
    text: "Visualize todas as feirinhas no mapa e filtre por localizacao, data e tipo de feira.",
  },
  {
    icon: <Calendar size={20} />,
    title: "Agenda com Google",
    text: "Agenda completa de eventos futuros com filtros e integracao com o Google Agenda (.ics).",
  },
  {
    icon: <Star size={20} />,
    title: "Avaliacoes e comentarios",
    text: "Avalie as feirinhas que voce visitou e ajude outras pessoas a escolherem melhor.",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Feedback dos organizadores",
    text: "Organizadores compartilham a experiencia de participar e sugerem melhorias.",
  },
  {
    icon: <Users size={20} />,
    title: "Perfis e preferencias",
    text: "Acompanhe feirinhas de interesse e gerencie suas preferencias de notificacao.",
  },
  {
    icon: <Megaphone size={20} />,
    title: "Anuncios patrocinados",
    text: "Organizadores podem promover suas feirinhas e ganhar visibilidade na plataforma.",
  },
  {
    icon: <Shield size={20} />,
    title: "Administracao e moderacao",
    text: "Ferramentas para gerenciar conteudo, resolver denuncias e monitorar a atividade.",
  },
  {
    icon: <Sparkles size={20} />,
    title: "FeiraIA",
    text: "Assistente virtual que conversa com os visitantes e ajuda a encontrar a feirinha ideal.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PageHeader
        eyebrow="Sobre"
        title="O que e o FeirAL?"
        description="O FeirAL e uma plataforma web que cadastra, gerencia e divulga as feirinhas de Alagoas. Reunimos artesanato, gastronomia, moda e eventos culturais em um so lugar, com ferramentas para organizadores, visitantes e administradores."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
              {feature.icon}
            </span>
            <h2 className="mt-3 text-base font-semibold text-ink-900">{feature.title}</h2>
            <p className="mt-1 text-sm text-ink-500">{feature.text}</p>
          </Card>
        ))}
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-ink-900">Como comecar</h2>
        <ol className="space-y-3 text-sm text-ink-600">
          <li className="rounded-lg border border-ink-200 bg-white p-4">
            <strong className="text-ink-800">Visitantes:</strong> crie uma conta gratuita para acompanhar
            feirinhas, avaliar, comentar e receber notificacoes.
          </li>
          <li className="rounded-lg border border-ink-200 bg-white p-4">
            <strong className="text-ink-800">Organizadores:</strong> cadastre sua feirinha com nome, descricao,
            local, categorias, produtos e agenda de eventos, e envie para aprovacao.
          </li>
          <li className="rounded-lg border border-ink-200 bg-white p-4">
            <strong className="text-ink-800">Destaque:</strong> contrate anuncios patrocinados para aparecer em
            evidencia na pagina inicial.
          </li>
        </ol>
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl bg-ink-900 p-8 text-white">
        <h2 className="text-xl font-bold">Pronto para comecar?</h2>
        <p className="mt-2 max-w-xl text-white/70">
          Explore as feirinhas, monte sua agenda ou cadastre a sua propria feirinha em poucos minutos.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/feirinhas" className={buttonClass("primary", "lg")}>
            Explorar feirinhas
          </Link>
          <Link
            href="/cadastrar"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Criar conta
          </Link>
        </div>
      </section>
    </div>
  );
}