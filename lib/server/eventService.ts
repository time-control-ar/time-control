import { connectToDatabase } from "@/lib/mongodb";
import { BlobServiceClient } from "@azure/storage-blob";
import { ObjectId } from "mongodb";
import { EventResponse } from "../schemas/event.schema";

export async function obtainEventsServer(): Promise<EventResponse[]> {
 try {
  const { db } = await connectToDatabase();
  const events = await db.collection("events").find({}).toArray();

  console.log("events", events);
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
   results: event.results,
   createdBy: event.createdBy,
   createdAt: event.createdAt,
   updatedAt: event.updatedAt,
   type: event.type || [],
   locationName: event.locationName || "",
   categories: event.categories || [],
   modalities: event.modalities || [],
   runners: event.runners || [],
  }));

  return serializedEvents;
 } catch (e) {
  console.error("Error al obtener eventos:", e);
  return [];
 }
}

export async function getEventServer(
 id: string
): Promise<{ event: EventResponse | null }> {
 try {
  console.log("id", id);

  const { db } = await connectToDatabase();
  const event = (await db
   .collection("events")
   .findOne({ _id: new ObjectId(id) })) as EventResponse | null;

  return { event };
 } catch (e) {
  console.error("Error al obtener evento:", e);
  return { event: null };
 }
}
