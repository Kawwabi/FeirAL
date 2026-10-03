import Link from "next/link";
import { Ticket, MapPin, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-ink-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <Ticket size={20} />
            </span>
            Feir<span className="-ml-1.5 text-brand-500">AL</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-ink-500">
            Plataforma que reúne, organiza e divulga as feirinhas de Alagoas. Descubra artesanato,
            gastronomia, moda e cultura perto de você.
          </p>
          <p className="mt-4 text-xs text-ink-400">
            Projeto Integrador VI - Desenvolvimento de uma plataforma web de feirinhas.{" "}
            <span className="font-medium text-ink-600">
              Desenvolvido por Vinícius Stanley &middot; CESMAC.
            </span>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-800">Explorar</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link className="hover:text-brand-600" href="/feirinhas">Todas as feirinhas</Link></li>
            <li><Link className="hover:text-brand-600" href="/mapa">Mapa interativo</Link></li>
            <li><Link className="hover:text-brand-600" href="/agenda">Agenda de eventos</Link></li>
            <li><Link className="hover:text-brand-600" href="/categorias">Categorias</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-800">Participe</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link className="hover:text-brand-600" href="/organizador/feirinhas/nova">Cadastrar feirinha</Link></li>
            <li><Link className="hover:text-brand-600" href="/organizador/anuncios">Anunciar (patrocinado)</Link></li>
            <li><Link className="hover:text-brand-600" href="/sobre">Sobre o projeto</Link></li>
            <li><Link className="hover:text-brand-600" href="/cadastrar">Criar conta</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-ink-400 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} /> Alagoas, Brasil
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail size={13} /> contato@feiral.app
          </span>
          <span>&copy; {new Date().getFullYear()} FeirAL</span>
        </div>
      </div>
    </footer>
  );
}