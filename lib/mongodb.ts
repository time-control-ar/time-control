import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
 throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
 // In global scope, this is needed because of the development server
 const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
 };

 if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
 }
 clientPromise = globalWithMongo._mongoClientPromise;
} else {
 // In production mode, it's best to not use a global variable.
 client = new MongoClient(uri, options);
 clientPromise = client.connect();
}

export async function connectToDatabase() {
 const client = await clientPromise;
 const db = client.db(process.env.MONGODB_DB || "timecontrol");
 return { client, db };
}
