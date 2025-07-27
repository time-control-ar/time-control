import { connectToDatabase } from "@/lib/mongodb";
import { BlobServiceClient } from "@azure/storage-blob";
import { EventResponse } from "../schemas/event.schema";

export async function searchEvents({
 query,
}: {
 query: string;
}): Promise<EventResponse[] | null> {
 try {
  const { db } = await connectToDatabase();
  const events = await db
   .collection("events")
   .find({
    $or: [
     { name: { $regex: query, $options: "i" } },
     { description: { $regex: query, $options: "i" } },
    ],
   })
   .toArray();

  // Convertir ObjectId a string para serialización
  const serializedEvents = events.map((event) => ({
   ...event,
   _id: event._id.toString(),
  })) as EventResponse[];

  const blobServiceClient = BlobServiceClient.fromConnectionString(
   process.env.AZURE_STORAGE_CONNECTION_STRING || ""
  );
  const containerName = "time-control";
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blobs = [];
  for await (const blob of containerClient.listBlobsFlat()) {
   const blobClient = containerClient.getBlobClient(blob.name);
   blobs.push(blobClient.url);
  }

  return serializedEvents;
 } catch (e) {
  console.error("Error al obtener eventos:", e);
  return null;
 }
}

export async function getEventById(id: string): Promise<EventResponse | null> {
 try {
  const { db } = await connectToDatabase();
  const { ObjectId } = await import("mongodb");

  const event = await db.collection("events").findOne({
   _id: new ObjectId(id),
  });

  if (!event) {
   return null;
  }

  // Convertir ObjectId a string para serialización
  const serializedEvent = {
   ...event,
   _id: event._id.toString(),
  } as EventResponse;

  return serializedEvent;
 } catch (e) {
  console.error("Error al obtener evento por ID:", e);
  return null;
 }
}
