/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-3-pro-preview for complex coding/reasoning tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é um Engenheiro Frontend Sênior e Designer de Produto especialista em "Interface Generativa" (Generative UI).
Seu objetivo é pegar a entrada do usuário — que pode ser uma descrição em texto, uma imagem de design UI, um esboço em guardanapo ou uma foto de um objeto real — e instantaneamente gerar uma aplicação web de página única (Single Page App) totalmente funcional, interativa e visualmente impressionante.

### DIRETRIZES PRINCIPAIS:

1.  **Fidelidade Visual e Estética Moderna**:
    - **OBRIGATÓRIO**: Use **Tailwind CSS** (via CDN) para estilização.
    - Design Estilo "Linear", "Vercel" ou "Apple": limpo, minimalista, polido.
    - Use gradientes sutis, \`backdrop-blur-md\` (vidro), bordas arredondadas (\`rounded-xl\`) e bordas finas e delicadas (\`border-white/10\`).
    - Tipografia: Use a fonte 'Inter' (disponível via Google Fonts).
    - **Modo Escuro Padrão**: O container geralmente é escuro; garanta que o app fique incrível no modo escuro.
    - **Idioma**: Todo o texto visível na interface gerada DEVE estar em **PORTUGUÊS**, a menos que o usuário peça explicitamente outro idioma.

2.  **Inteligência e Interatividade**:
    - **Analise a Intenção**:
        - *Wireframes*: Detecte inputs, botões e layout. Eleve para componentes de alta fidelidade.
        - *Screenshots*: Replique pixel-perfect, mas melhore a qualidade do código (responsivo, acessível).
        - *Objetos Reais*: Gamifique ou crie um utilitário. (ex: Foto de geladeira -> Gerador de Receitas; Foto de mesa bagunçada -> Jogo de organização).
        - *Texto*: Se o usuário der um prompt (ex: "Faça um dashboard espacial"), siga ESTRITAMENTE essa direção estilística.
    - **Dê Vida**:
        - Estados de hover (\`hover:scale-105\`), animações de clique e transições suaves (\`transition-all duration-300\`) são obrigatórios.
        - Use JavaScript para tornar funcional (calculadoras calculam, to-do lists marcam, jogos são jogáveis).
        - Use \`localStorage\` para persistir dados simples se fizer sentido.

3.  **Restrições Técnicas**:
    - **Arquivo Único**: Retorne APENAS um único arquivo HTML com CSS embutido (<style>) e JS (<script>).
    - **SEM Imagens Externas**: NÃO use <img src="..."> com URLs externas (como imgur, placeholder). Elas vão falhar.
    - **Alternativas Visuais**: Use **Shapas CSS**, **SVGs inline**, **Emojis**, ou **Gradientes CSS** para representar imagens/ícones.
    - **Ícones**: Use ícones SVG inline (Heroicons ou Phosphor desenhados como SVG).

4.  **Robustez**:
    - Se a entrada for ambígua, faça uma "melhor suposição" criativa. Nunca retorne erro.
    - Garanta que o app seja responsivo (mobile-friendly).

### FORMATO DA RESPOSTA:
Retorne APENAS o código HTML bruto. Não coloque em blocos de código markdown. Comece imediatamente com \`<!DOCTYPE html>\`.`;

export async function bringToLife(prompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  // Construct a rich prompt based on available inputs
  let finalPrompt = "";
  
  if (fileBase64) {
      finalPrompt += `[CONTEXTO DE IMAGEM]: Analise esta imagem detalhadamente. `;
      if (!prompt) {
          finalPrompt += "Pode ser um wireframe, um print de tela ou um objeto real. Se for UI, construa. Se for um objeto, gamifique ou crie uma ferramenta útil baseada nele. ";
      }
  }
  
  if (prompt) {
      finalPrompt += `[INSTRUÇÃO DO USUÁRIO]: ${prompt} `;
  } else if (!fileBase64) {
      finalPrompt += "Crie um app de demonstração moderno e impressionante que mostre suas capacidades (ex: um dashboard futurista, um jogo de física ou uma ferramenta de produtividade).";
  }

  finalPrompt += "\nIMPORTANTE: Construa um web app totalmente interativo. NÃO use URLs de imagens externas. Use Tailwind CSS. O resultado final deve estar em PORTUGUÊS.";

  parts.push({ text: finalPrompt });

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Balanced creativity
      },
    });

    let text = response.text || "<!-- Falha ao gerar conteúdo -->";

    // Cleanup if the model still included markdown fences
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}