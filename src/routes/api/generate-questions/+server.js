import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

export async function POST({ request }) {
  const { topic = "", numQuestions = 5 } = await request.json();
  const trimmedTopic = topic.trim();

  if (!trimmedTopic) {
    return json({ error: "Bitte gib zuerst ein Thema ein." }, { status: 400 });
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
    const prompt = `Erstelle ${numQuestions} kurze Quizfragen zum Thema "${trimmedTopic}".
Für jede Frage den folgenden JSON verwenden: {"question":"...", "hint":"optional kurzer Tipp"}.
Es dürfen offene Fragen sein, keine Mehrfachauswahl. Antworten nicht mitsenden.`;

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

    const questions = parsed.map((item, index) => ({
      id: index + 1,
      question: item.question || item.prompt || `Frage ${index + 1}`,
      hint: item.hint || null
    }));

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
