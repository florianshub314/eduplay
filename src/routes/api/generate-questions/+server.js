import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const { subject, topic } = await request.json();

  const dummyQuestions = [
    {
      id: 1,
      type: "mc",
      question:
        subject === "english"
          ? "What is the translation of 'dog'?"
          : subject === "french"
          ? "Quelle est la traduction correcte de « chien » ?"
          : `Frage zum Thema ${topic || "Allgemein"}`,
      options: ["dog", "cat", "bird", "fish"],
      correctIndex: 0
    }
  ];

  return json({ questions: dummyQuestions });
}
