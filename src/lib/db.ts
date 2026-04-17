import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

type GlobalMongoose = typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

const globalMongoose = globalThis as GlobalMongoose;

export async function connectDB(): Promise<typeof mongoose> {
  if (globalMongoose._mongoosePromise) {
    return globalMongoose._mongoosePromise;
  }

  globalMongoose._mongoosePromise = mongoose
    .connect(uri, {
      dbName: process.env.MONGODB_DB || "ai-chatbot-builder",
    })
    .then(() => mongoose);

  return globalMongoose._mongoosePromise;
}
