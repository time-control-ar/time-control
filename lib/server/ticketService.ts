"use server";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "../mongodb";
import { RaceCheckProps, Runner } from "../schemas/racecheck.schema";
import { EventResponse } from "./eventService";

export async function obtainTicketServer(
 eventId: string,
 dorsal: string
): Promise<{ ticket: Runner; event: EventResponse } | null> {
 try {
  const db = await connectToDatabase();
  const event = (await db.db
   .collection("events")
   .findOne({ _id: new ObjectId(eventId) })) as EventResponse & {
   _id: ObjectId;
  };

  if (!event) {
   return null;
  }

  const results: RaceCheckProps = event.results;

  const ticket = results.participants.find(
   (result: Runner) => result.dorsal === parseInt(dorsal)
  );
  if (!ticket) {
   return null;
  }

  // Serializar el evento para que sea compatible con Server Components
  const serializedEvent: EventResponse = {
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
  };

  return { ticket, event: serializedEvent };
 } catch (error) {
  console.error(error);
  return null;
 }
}
