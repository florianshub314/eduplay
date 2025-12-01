import { error } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import { getCollection } from "$lib/server/mongo";

const COLLECTION = "question_sets";

export async function load({ params }) {
  const { id } = params;
  if (!id) {
    throw error(400, "ID fehlt.");
  }

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw error(400, "Ungültige ID.");
  }

  const collection = await getCollection(COLLECTION);
  const doc = await collection.findOne({ _id: objectId });

  if (!doc) {
    throw error(404, "Fragen-Set nicht gefunden.");
  }

  return {
    set: {
      id,
      title: doc.title,
      subject: doc.subject,
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
      questions: doc.questions ?? []
    }
  };
}
