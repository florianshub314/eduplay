import { supabase } from "$lib/supabaseClient";
import { cleanQuestionText } from "./questionFormatter.js";

export function normalizeQuestionsForSet(questions = []) {
  return questions.map((entry) => {
    const questionText = cleanQuestionText(
      typeof entry === "string"
        ? entry
        : typeof entry?.question === "string"
          ? entry.question
          : ""
    );

    const answers = Array.isArray(entry?.answers)
      ? entry.answers.map((answer) => String(answer))
      : [];

    const correct =
      typeof entry?.correct === "string"
        ? entry.correct
        : entry?.answer !== undefined && entry?.answer !== null
          ? String(entry.answer)
          : "";

    return {
      question: questionText,
      answers,
      correct
    };
  });
}

export async function saveQuestionSet({ title, subject, questions }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    throw new Error("Bitte melde dich zuerst an, um Sets zu speichern.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Es sind keine Fragen zum Speichern vorhanden.");
  }

  const payload = {
    title: title?.trim() || "Neues Set",
    subject: subject?.trim() || "allgemein",
    questions: normalizeQuestionsForSet(questions)
  };

  const response = await fetch("/api/sets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Fragen-Set konnte nicht gespeichert werden.");
  }
  return result.set;
}
