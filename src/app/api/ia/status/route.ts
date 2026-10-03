import { NextResponse } from "next/server";
import { probeAiStatus } from "@/lib/ai";

/**
 * Diagnóstico da IA: informa o provedor configurado, se exige chave e se o
 * endpoint está acessível. Util para testar um LLM local (KoboldCpp/Ollama/LM Studio).
 *
 * Uso: curl http://localhost:3000/api/ia/status
 */
export async function GET() {
  const status = await probeAiStatus();

  const hints: string[] = [];
  if (status.provider === "none") {
    hints.push(
      "Nenhum LLM configurado: o chat usará o assistente local por regras.",
      "Para usar LLM local, defina AI_PROVIDER=local e AI_BASE_URL=http://localhost:5001/v1 no .env.",
    );
  } else if (status.requiresKey && !status.hasKey) {
    hints.push("O modo openai exige AI_API_KEY no .env.");
  } else if (status.reachable === false) {
    hints.push(
      "O endpoint não respondeu. Verifique se o servidor do LLM está rodando e se a URL/porta estão corretas.",
      "Verifique também se o servidor está escutando em todas as interfaces (ex.: KoboldCpp com --host).",
    );
  } else if (status.reachable === true) {
    hints.push("Endpoint acessível. O chat usará o LLM configurado.");
  }

  return NextResponse.json({ ...status, hints });
}