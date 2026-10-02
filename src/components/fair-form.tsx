"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2, Loader2, Check, Save, Send, MapPin } from "lucide-react";
import { fieldClass, Field } from "@/components/ui";
import { CITIES_AL, OFFERING_KINDS } from "@/lib/constants";
import { initialActionState, type ActionState } from "@/lib/action-state";

export interface OfferingDraft {
  name: string;
  kind: string;
  description: string;
  priceRange: string;
}

export interface EventDraft {
  title: string;
  startsAt: string;
  endsAt: string;
  address: string;
  notes: string;
}

export interface FairFormValues {
  id?: string;
  name: string;
  shortDescription: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  coverImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  instagramUrl: string;
  categorySlugs: string[];
  offerings: OfferingDraft[];
  events: EventDraft[];
}

const EMPTY: FairFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  address: "",
  city: "Maceio",
  state: "AL",
  zipCode: "",
  latitude: "",
  longitude: "",
  coverImageUrl: "",
  contactEmail: "",
  contactPhone: "",
  websiteUrl: "",
  instagramUrl: "",
  categorySlugs: [],
  offerings: [],
  events: [],
};

export function FairForm({
  action,
  categories,
  initial,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  categories: { slug: string; name: string; icon: string | null }[];
  initial?: Partial<FairFormValues>;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const value: FairFormValues = { ...EMPTY, ...initial };

  const [selectedCats, setSelectedCats] = useState<string[]>(value.categorySlugs);
  const [offerings, setOfferings] = useState<OfferingDraft[]>(value.offerings);
  const [events, setEvents] = useState<EventDraft[]>(value.events);

  function toggleCategory(slug: string) {
    setSelectedCats((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  return (
    <form action={formAction} className="space-y-6">
      {value.id ? <input type="hidden" name="fairId" value={value.id} /> : null}
      <input type="hidden" name="categories" value={JSON.stringify(selectedCats)} />
      <input type="hidden" name="offerings" value={JSON.stringify(offerings)} />
      <input type="hidden" name="events" value={JSON.stringify(events)} />

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              : "rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <fieldset className="card-surface space-y-4 p-5">
        <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-600">
          Informacoes principais
        </legend>

        <Field label="Nome da feirinha" required error={state.errors?.name}>
          <input
            name="name"
            defaultValue={value.name}
            required
            className={fieldClass}
            placeholder="Ex.: Feira de Artesanato da Pajucara"
          />
        </Field>

        <Field label="Resumo curto" hint="Aparece nos cards de listagem (ate 180 caracteres).">
          <input name="shortDescription" defaultValue={value.shortDescription} className={fieldClass} maxLength={180} />
        </Field>

        <Field label="Descricao completa" required error={state.errors?.description}>
          <textarea
            name="description"
            defaultValue={value.description}
            required
            rows={5}
            className={`${fieldClass} min-h-0`}
            placeholder="Descreva a feirinha, sua historia, publico e diferenciais."
          />
        </Field>

        <Field label="Categorias" hint="Selecione uma ou mais categorias.">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={
                  selectedCats.includes(cat.slug)
                    ? "inline-flex items-center gap-1.5 rounded-full border border-brand-400 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700"
                    : "inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
                }
              >
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </button>
            ))}
          </div>
        </Field>
      </fieldset>

      <LocationFields value={value} errors={state.errors} />
      <ContactFields value={value} errors={state.errors} />
      <OfferingsEditor offerings={offerings} setOfferings={setOfferings} />
      <EventsEditor events={events} setEvents={setEvents} />
      <SubmitRow pending={pending} ok={state.ok} message={state.message} />
    </form>
  );
}

function LocationFields({ value, errors }: { value: FairFormValues; errors?: Record<string, string> }) {
  const [lat, setLat] = useState(value.latitude);
  const [lng, setLng] = useState(value.longitude);

  return (
    <fieldset className="card-surface space-y-4 p-5">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-600">Localizacao</legend>

      <Field label="Endereco" required error={errors?.address}>
        <input name="address" defaultValue={value.address} required className={fieldClass} placeholder="Rua, numero, bairro" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cidade" required error={errors?.city}>
          <input name="city" defaultValue={value.city} required list="cidades-al" className={fieldClass} />
        </Field>
        <datalist id="cidades-al">
          {CITIES_AL.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Field label="Estado">
          <input name="state" defaultValue={value.state} className={fieldClass} />
        </Field>
        <Field label="CEP">
          <input name="zipCode" defaultValue={value.zipCode} className={fieldClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Latitude" hint="Usada no mapa interativo. Ex.: -9.6658">
          <input name="latitude" value={lat} onChange={(e) => setLat(e.target.value)} className={fieldClass} placeholder="-9.6658" />
        </Field>
        <Field label="Longitude" hint="Ex.: -35.7353">
          <input name="longitude" value={lng} onChange={(e) => setLng(e.target.value)} className={fieldClass} placeholder="-35.7353" />
        </Field>
      </div>

      <p className="inline-flex items-center gap-1.5 text-xs text-ink-500">
        <MapPin size={13} /> Dica: copie as coordenadas do Google Maps (botao direito no local).
      </p>
    </fieldset>
  );
}

function ContactFields({ value, errors }: { value: FairFormValues; errors?: Record<string, string> }) {
  return (
    <fieldset className="card-surface space-y-4 p-5">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-600">
        Contato e redes
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail de contato" error={errors?.contactEmail}>
          <input name="contactEmail" type="email" defaultValue={value.contactEmail} className={fieldClass} />
        </Field>
        <Field label="Telefone / WhatsApp">
          <input name="contactPhone" defaultValue={value.contactPhone} className={fieldClass} placeholder="(82) 9xxxx-xxxx" />
        </Field>
        <Field label="Site">
          <input name="websiteUrl" defaultValue={value.websiteUrl} className={fieldClass} placeholder="https://..." />
        </Field>
        <Field label="Instagram">
          <input name="instagramUrl" defaultValue={value.instagramUrl} className={fieldClass} placeholder="@perfil" />
        </Field>
      </div>
      <Field label="Imagem de capa (URL ou caminho)" hint="Ex.: /covers/artesanato.svg ou uma URL https.">
        <input name="coverImageUrl" defaultValue={value.coverImageUrl} className={fieldClass} />
      </Field>
    </fieldset>
  );
}

function OfferingsEditor({
  offerings,
  setOfferings,
}: {
  offerings: OfferingDraft[];
  setOfferings: (next: OfferingDraft[]) => void;
}) {
  function update(index: number, patch: Partial<OfferingDraft>) {
    setOfferings(offerings.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  return (
    <fieldset className="card-surface space-y-4 p-5">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-600">
        Produtos e servicos oferecidos
      </legend>

      {offerings.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhum item adicionado ainda.</p>
      ) : (
        <div className="space-y-3">
          {offerings.map((offering, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-ink-200 p-3 sm:grid-cols-12">
              <input
                value={offering.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="Nome do produto/servico"
                className={`${fieldClass} sm:col-span-4`}
              />
              <select
                value={offering.kind}
                onChange={(e) => update(index, { kind: e.target.value })}
                className={`${fieldClass} sm:col-span-2`}
              >
                {Object.entries(OFFERING_KINDS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={offering.priceRange}
                onChange={(e) => update(index, { priceRange: e.target.value })}
                placeholder="Faixa de preco"
                className={`${fieldClass} sm:col-span-2`}
              />
              <input
                value={offering.description}
                onChange={(e) => update(index, { description: e.target.value })}
                placeholder="Descricao breve"
                className={`${fieldClass} sm:col-span-3`}
              />
              <button
                type="button"
                onClick={() => setOfferings(offerings.filter((_, i) => i !== index))}
                className="grid place-items-center rounded-lg border border-ink-200 text-ink-400 hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                aria-label="Remover item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          setOfferings([...offerings, { name: "", kind: "PRODUCT", description: "", priceRange: "" }])
        }
        className="inline-flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        <Plus size={15} /> Adicionar item
      </button>
    </fieldset>
  );
}

function EventsEditor({
  events,
  setEvents,
}: {
  events: EventDraft[];
  setEvents: (next: EventDraft[]) => void;
}) {
  function update(index: number, patch: Partial<EventDraft>) {
    setEvents(events.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  return (
    <fieldset className="card-surface space-y-4 p-5">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-brand-600">
        Agenda de eventos
      </legend>
      <p className="-mt-2 text-xs text-ink-500">
        Cadastre as datas em que a feirinha acontece. Os eventos aparecem na agenda publica e podem ser
        adicionados ao Google Agenda.
      </p>

      {events.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhum evento agendado ainda.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-ink-200 p-3 sm:grid-cols-12">
              <input
                value={event.title}
                onChange={(e) => update(index, { title: e.target.value })}
                placeholder="Titulo do evento (ex.: Feirinha de sabado)"
                className={`${fieldClass} sm:col-span-12`}
              />
              <label className="sm:col-span-3">
                <span className="mb-1 block text-[11px] font-medium text-ink-500">Inicio</span>
                <input
                  type="datetime-local"
                  value={event.startsAt}
                  onChange={(e) => update(index, { startsAt: e.target.value })}
                  className={fieldClass}
                />
              </label>
              <label className="sm:col-span-3">
                <span className="mb-1 block text-[11px] font-medium text-ink-500">Termino</span>
                <input
                  type="datetime-local"
                  value={event.endsAt}
                  onChange={(e) => update(index, { endsAt: e.target.value })}
                  className={fieldClass}
                />
              </label>
              <input
                value={event.address}
                onChange={(e) => update(index, { address: e.target.value })}
                placeholder="Local (opcional)"
                className={`${fieldClass} sm:col-span-4`}
              />
              <button
                type="button"
                onClick={() => setEvents(events.filter((_, i) => i !== index))}
                className="grid place-items-center rounded-lg border border-ink-200 text-ink-400 hover:bg-red-50 hover:text-red-600 sm:col-span-1"
                aria-label="Remover evento"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setEvents([...events, { title: "", startsAt: "", endsAt: "", address: "", notes: "" }])}
        className="inline-flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        <Plus size={15} /> Adicionar evento
      </button>
    </fieldset>
  );
}

function SubmitRow({ pending, ok, message }: { pending: boolean; ok: boolean; message?: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-ink-200 pt-5">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar rascunho
        </button>
        <button
          type="submit"
          name="intent"
          value="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          Enviar para aprovacao
        </button>
      </div>
      {ok && message ? (
        <p className="text-sm font-medium text-leaf-700">
          <Check size={14} className="mr-1 inline" /> {message}
        </p>
      ) : null}
    </>
  );
}