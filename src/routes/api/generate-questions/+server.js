import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const OPENAI_API_KEY =
  env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

function normalizeEntry(item, index) {
  if (typeof item === "string") {
    let text = item.trim();

    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        return normalizeEntry(JSON.parse(text), index);
      } catch {
        // ignore parse errors and handle as plain text
      }
    }

    text = text.replace(/^["']?question["']?\s*[:=]\s*/i, "").trim();
    text = text.replace(/^\d+[\.\)\-:]\s*/, "").trim();

    return { question: text || `Frage ${index + 1}`, hint: null };
  }

  if (item && typeof item === "object") {
    const base = normalizeEntry(item.question || item.prompt || "", index);
    const hint =
      typeof item.hint === "string" && item.hint.trim().length > 0
        ? item.hint.trim()
        : base.hint;

    return {
      question: base.question,
      hint
    };
  }

  return { question: `Frage ${index + 1}`, hint: null };
}

export async function POST({ request }) {
  const {
    topic = "",
    material = "",
    instructions = "",
    fileName = "",
    numQuestions = 5
  } = await request.json();

  const trimmedTopic = topic.trim();
  const trimmedMaterial =
    typeof material === "string" ? material.trim() : "";
  const trimmedInstructions =
    typeof instructions === "string" ? instructions.trim() : "";
  const limitedMaterial = trimmedMaterial.slice(0, 6000);

  if (!trimmedTopic && !limitedMaterial) {
    return json(
      { error: "Bitte gib ein Thema ein oder lade Unterrichtsmaterial hoch." },
      { status: 400 }
    );
  }

  if (!OPENAI_API_KEY) {
    return json(
      {
        error:
          "Kein OPENAI_API_KEY gesetzt. Bitte füge ihn in deiner .env Datei hinzu."
      },
      { status: 500 }
    );
  }

  try {
    const contextParts = [];
    if (trimmedTopic) {
      contextParts.push(`Thema: "${trimmedTopic}".`);
    }
    if (limitedMaterial) {
      contextParts.push(
        `Unterrichtsmaterial${fileName ? ` (${fileName})` : ""}:\n${limitedMaterial}`
      );
    }
    if (trimmedInstructions) {
      contextParts.push(`Hinweise:\n${trimmedInstructions}`);
    }

    const prompt = `Erstelle ${numQuestions} kurze Quizfragen passend zu folgendem Kontext.
Für jede Frage den folgenden JSON verwenden: {"question":"...", "hint":"optional kurzer Tipp"}.
Es dürfen offene Fragen sein, keine Mehrfachauswahl. Antworten nicht mitsenden.

${contextParts.join("\n\n")}

Halte dich eng an die Inhalte und Hinweise.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Assistent für Lehrerinnen und Lehrer und erstellst abwechslungsreiche Quizfragen in deutscher Sprache."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Fehler: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim();

    if (!rawText) {
      throw new Error("Antwort von OpenAI war leer.");
    }

    // Versuche JSON zu parsen, ansonsten fallback
    let parsed;
    try {
      parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed)) throw new Error("Not array");
    } catch (error) {
      // Fallback: naive Zeilenaufteilung
      parsed = rawText
        .split("\n")
        .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
        .filter(Boolean)
        .map((question) => ({ question }));
    }

    const questions = parsed.map((item, index) => {
      const normalized = normalizeEntry(item, index);
      return {
        id: index + 1,
        question: normalized.question,
        hint: normalized.hint
      };
    });

    return json({ questions });
  } catch (error) {
    console.error("AI generation failed:", error);
    return json(
      {
        error:
          "Die KI konnte keine Fragen generieren. Bitte versuche es später erneut.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
