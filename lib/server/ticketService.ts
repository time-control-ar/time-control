"use server";

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { parseRacechecks, Runner } from "../utils";
import { EventResponse } from "../schemas/event.schema";

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

  const { runners } = parseRacechecks(
   event.racecheck || "",
   event.categories || [],
   event.modalities || []
  );

  const ticket = runners?.find(
   (result: Runner) => result.dorsal === parseInt(dorsal)
  );

  if (!ticket) {
   return null;
  }

  const serializedEvent: EventResponse = {
   _id: event._id.toString(),
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
  };

  return { ticket, event: serializedEvent };
 } catch (error) {
  console.error(error);
  return null;
 }
}
