import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalMongo = globalThis as GlobalMongo;

const clientPromise =
  globalMongo._mongoClientPromise ??
  new MongoClient(uri).connect().then((client) => {
    if (process.env.NODE_ENV !== "production") {
      globalMongo._mongoClientPromise = Promise.resolve(client);
    }
    return client;
  });

if (process.env.NODE_ENV !== "production") {
  globalMongo._mongoClientPromise = clientPromise;
}

export async function connectDB(dbName = process.env.MONGODB_DB): Promise<Db> {
  const client = await clientPromise;
  return dbName ? client.db(dbName) : client.db();
}

export { clientPromise };
