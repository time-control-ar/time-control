import { connectToDatabase } from "@/lib/mongodb";
import { BlobServiceClient } from "@azure/storage-blob";
import { EventResponse } from "../schemas/event.schema";

export async function obtainEventsServer(): Promise<EventResponse[]> {
 try {
  const { db } = await connectToDatabase();
  const events = await db.collection("events").find({}).toArray();

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

  const serializedEvents = events.map((event) => ({
   _id: event._id.toString(), // Convertir ObjectId a string
   name: event.name,
   date: event.date,
   startTime: event.startTime,
   endTime: event.endTime,
   location:
    event.location &&
    typeof event.location === "object" &&
    "lat" in event.location &&
    "lng" in event.location
     ? event.location
     : { lat: -34.397, lng: 150.644 },
   description: event.description,
   maxParticipants: event.maxParticipants,
   image: event.image,
   createdBy: event.createdBy,
   createdAt: event.createdAt,
   updatedAt: event.updatedAt,
   type: event.type || "",
   locationName: event.locationName || "",
   categories: event.categories || [],
   modalities: event.modalities || [],
   racecheck: event.racecheck || null,
  }));

  return serializedEvents;
 } catch (e) {
  console.error("Error al obtener eventos:", e);
  return [];
 }
}
