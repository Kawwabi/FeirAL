import { Badge } from "@/components/ui";
import { FAIR_STATUS_LABELS } from "@/lib/constants";

const FAIR_TONES: Record<string, "brand" | "neutral" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  ARCHIVED: "neutral",
};

export function FairStatusBadge({ status }: { status: string }) {
  return <Badge tone={FAIR_TONES[status] ?? "neutral"}>{FAIR_STATUS_LABELS[status] ?? status}</Badge>;
}

const AD_TONES: Record<string, "brand" | "neutral" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  ACTIVE: "success",
  PAUSED: "info",
  EXPIRED: "neutral",
  REJECTED: "danger",
};

const AD_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  EXPIRED: "Expirado",
  REJECTED: "Rejeitado",
};

export function AdStatusBadge({ status }: { status: string }) {
  return <Badge tone={AD_TONES[status] ?? "neutral"}>{AD_LABELS[status] ?? status}</Badge>;
}

const REPORT_TONES: Record<string, "brand" | "neutral" | "success" | "warning" | "danger" | "info"> = {
  OPEN: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

const REPORT_LABELS: Record<string, string> = {
  OPEN: "Aberta",
  RESOLVED: "Resolvida",
  DISMISSED: "Arquivada",
};

export function ReportStatusBadge({ status }: { status: string }) {
  return <Badge tone={REPORT_TONES[status] ?? "neutral"}>{REPORT_LABELS[status] ?? status}</Badge>;
}