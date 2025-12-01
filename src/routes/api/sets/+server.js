import { json } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getCollection } from "$lib/server/mongo";
import { supabaseServer } from "$lib/server/supabaseServer";

const COLLECTION = "question_sets";
const SUBJECT_LABELS = {
  math: "Mathematik",
  mathe: "Mathematik",
  german: "Deutsch",
  deutsch: "Deutsch",
  english: "Englisch",
  englisch: "Englisch",
  french: "Französisch",
  franzoesisch: "Französisch",
  andere: "Andere Fächer",
  other: "Andere Fächer"
};

function serializeSet(doc) {
  return {
    id: doc._id instanceof ObjectId ? doc._id.toString() : doc._id,
    title: doc.title,
    subject: doc.subject,
    createdAt: doc.createdAt,
    questions: doc.questions ?? [],
    userId: doc.userId
  };
}

function normalizeQuestion(entry, index) {
  const question =
    typeof entry?.question === "string" ? entry.question.trim() : "";
  const answers = Array.isArray(entry?.answers)
    ? entry.answers.map((answer) => String(answer))
    : [];
  const correct =
    typeof entry?.correct === "string" ? entry.correct.trim() : "";

  if (!question) {
    throw new Error(`Frage ${index + 1} hat keinen Text.`);
  }

  return { question, answers, correct };
}

async function requireAuth(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer", "").trim();
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

export async function GET({ request }) {
  const user = await requireAuth(request);
  if (!user) {
    return json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const collection = await getCollection(COLLECTION);
  const docs = await collection
    .find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const grouped = docs.reduce((acc, doc) => {
    const key = doc.subject?.trim().toLowerCase() || "general";
    const label = SUBJECT_LABELS[key] || doc.subject || "Allgemein";
    if (!acc[label]) acc[label] = [];
    acc[label].push(serializeSet(doc));
    return acc;
  }, {});

  return json({ groupedSets: grouped });
}

export async function POST({ request }) {
  const user = await requireAuth(request);
  if (!user) {
    return json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const payload = await request.json();
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  const subject =
    typeof payload?.subject === "string" ? payload.subject.trim() : "";
  const questions = Array.isArray(payload?.questions)
    ? payload.questions
    : [];

  if (!title) {
    return json({ error: "Titel fehlt." }, { status: 400 });
  }

  if (!subject) {
    return json({ error: "Fach (subject) fehlt." }, { status: 400 });
  }

  if (questions.length === 0) {
    return json({ error: "Mindestens eine Frage wird benötigt." }, { status: 400 });
  }

  let normalizedQuestions;
  try {
    normalizedQuestions = questions.map(normalizeQuestion);
  } catch (error) {
    return json({ error: error.message }, { status: 400 });
  }

  const doc = {
    title,
    subject,
    questions: normalizedQuestions,
    createdAt: new Date(),
    userId: user.id,
    userEmail: user.email
  };

  const collection = await getCollection(COLLECTION);
  const { insertedId } = await collection.insertOne(doc);
  const inserted = await collection.findOne({ _id: insertedId });

  return json({ set: serializeSet(inserted) }, { status: 201 });
}
