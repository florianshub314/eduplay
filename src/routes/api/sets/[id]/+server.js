import { json } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getCollection } from "$lib/server/mongo";

const COLLECTION = "question_sets";

function serializeSet(doc) {
  return {
    id: doc._id instanceof ObjectId ? doc._id.toString() : doc._id,
    title: doc.title,
    subject: doc.subject,
    createdAt: doc.createdAt,
    questions: doc.questions ?? []
  };
}

export async function GET({ params }) {
  const { id } = params;
  if (!id) {
    return json({ error: "ID fehlt." }, { status: 400 });
  }

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return json({ error: "Ungültige ID." }, { status: 400 });
  }

  const collection = await getCollection(COLLECTION);
  const doc = await collection.findOne({ _id: objectId });

  if (!doc) {
    return json({ error: "Fragen-Set nicht gefunden." }, { status: 404 });
  }

  return json({ set: serializeSet(doc) });
}
