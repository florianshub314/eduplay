import { MongoClient } from "mongodb";
import { env } from "$env/dynamic/private";

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB || "eduplay";

let clientPromise;

async function getClient() {
  if (!clientPromise) {
    if (!uri) {
      throw new Error(
        "MONGODB_URI ist nicht gesetzt. Bitte .env ergänzen (z. B. mongodb+srv://user:pass@cluster/db)."
      );
    }
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(dbName);
}

export async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}
