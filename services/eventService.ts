import { connectToDatabase } from "@/lib/mongodb";
import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";
import axios from "axios";
//import type { WithId, Document } from "mongodb";

export interface EventResponse {
 _id: string;
 name: string;
 date: string;
 time: string;
 location: string;
 description: string;
 maxParticipants: number;
 image: string;
 results: RaceCheckProps;
 createdBy: string;
 createdAt: string;
 updatedAt: string;
}

export async function createEvent(
 formData: FormData
): Promise<{ success: boolean; data: EventResponse[] }> {
 try {
  const res = await axios({
   method: "POST",
   url: `${process.env.NEXT_PUBLIC_API_URL}/api/events`,
   data: formData,
  });

  return res.data;
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function obtainEvents(): Promise<EventResponse[]> {
 try {
  const { db } = await connectToDatabase();
  const events = await db.collection("events").find({}).toArray();

  console.log("fetched events");
  console.log(events);

  // Convertir objetos de MongoDB a objetos planos de JavaScript
  const serializedEvents = events.map((event) => ({
   _id: event._id.toString(), // Convertir ObjectId a string
   name: event.name,
   date: event.date,
   time: event.time,
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
