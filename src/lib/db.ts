import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

type GlobalMongoose = typeof globalThis & {
  _mongoosePromise?: Promise<typeof mongoose>;
};

const globalMongoose = globalThis as GlobalMongoose;

export async function connectDB(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

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
