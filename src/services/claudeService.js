const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT =
  'Você é uma nutricionista simpática, direta e motivadora chamada Dra. Nutri. Fale em português brasileiro informal mas profissional. Use emojis com moderação. Recebe o plano alimentar e o relato transcrito do áudio do paciente. Faça uma análise completa: liste o que foi relatado por refeição, compare com o plano prescrito refeição a refeição, calcule adesão estimada em %, aponte o que foi bem e o que fugiu, estime impacto calórico/macro se possível, e dê 2-3 dicas motivadoras para o próximo dia. Use markdown simples (##, •, **negrito**).';

export async function analyzeDay(apiKey, planoAlimentar, relato) {
  if (!apiKey?.trim()) {
    throw new Error('API Key da Anthropic não configurada. Vá em Configurações.');
  }
  if (!planoAlimentar?.trim()) {
    throw new Error('Plano alimentar não cadastrado. Vá em "Meu Plano" e salve o seu plano.');
  }
  if (!relato?.trim()) {
    throw new Error('Nenhum relato para analisar. Grave ou escreva seu relato antes.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `**Plano alimentar prescrito:**\n${planoAlimentar}\n\n**Relato do dia:**\n${relato}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    let errMsg = `Erro na API (${response.status})`;
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.content[0].text;
}
