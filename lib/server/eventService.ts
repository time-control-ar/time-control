import { connectToDatabase } from "@/lib/mongodb";
import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";
import { BlobServiceClient } from "@azure/storage-blob";

export interface EventResponse {
 _id: string;
 name: string;
 date: string;
 startTime: string;
 endTime: string;
 location: string;
 description: string;
 maxParticipants: number;
 image: string;
 results: RaceCheckProps;
 createdBy: string;
 createdAt: string;
 updatedAt: string;
}

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

  console.log("blobs");
  console.log(blobs);

  const serializedEvents = events.map((event) => ({
   _id: event._id.toString(), // Convertir ObjectId a string
   name: event.name,
   date: event.date,
   startTime: event.startTime,
   endTime: event.endTime,
   location: event.location,
   description: event.description,
   maxParticipants: event.maxParticipants,
   image: event.image,
   results: event.results,
   createdBy: event.createdBy,
   createdAt: event.createdAt,
   updatedAt: event.updatedAt,
  }));

  return serializedEvents;
 } catch (e) {
  console.error("Error al obtener eventos:", e);
  return [];
 }
}
