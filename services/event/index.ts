"use server";

import { EventFormData, EventResponse } from "@/lib/schemas/event.schema";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function createEvent(
 newEvent: EventFormData
): Promise<{ success: boolean; data: EventResponse }> {
 try {
  const { db } = await connectToDatabase();
  const result = await db.collection("events").insertOne(newEvent);

  const createdEvent = await db.collection("events").findOne({
   _id: result.insertedId,
  });

  if (!createdEvent) {
   throw new Error("Error al crear el evento");
  }

  const serializedEvent = {
   ...createdEvent,
   _id: createdEvent._id.toString(),
  } as EventResponse;

  return { success: true, data: serializedEvent };
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function updateEvent(
 id: string,
 newEvent: EventFormData
): Promise<{ success: boolean; data: EventResponse }> {
 try {
  console.log(newEvent);
  const { db } = await connectToDatabase();

  // Check if event exists
  const existingEvent = await db.collection("events").findOne({
   _id: new ObjectId(id),
  });

  if (!existingEvent) {
   throw new Error("Evento no encontrado");
  }

  const result = await db
   .collection("events")
   .updateOne({ _id: new ObjectId(id) }, { $set: newEvent });

  if (result.matchedCount === 0) {
   throw new Error("Evento no encontrado");
  }

  // Get the updated event
  const updatedEvent = await db.collection("events").findOne({
   _id: new ObjectId(id),
  });

  if (!updatedEvent) {
   throw new Error("Evento no encontrado");
  }

  const serializedEvent = {
   ...updatedEvent,
   _id: updatedEvent._id.toString(),
  } as EventResponse;

  return { success: true, data: serializedEvent };
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function deleteEvent(
 id: string
): Promise<{ success: boolean; message: string }> {
 try {
  const { db } = await connectToDatabase();
  const session = await auth();
  if (!session?.user?.email) throw new Error("Usuario no autorizado");

  const result = await db.collection("events").updateOne(
   { _id: new ObjectId(id) },
   {
    $set: {
     deleted: true,
     deletedAt: new Date(),
     deletedBy: session.user.email,
    },
   }
  );
  if (result.matchedCount === 0) {
   throw new Error("Evento no encontrado");
  }

  return { success: true, message: "Evento eliminado correctamente" };
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

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
    deletedAt: { $exists: false },
   })
   .toArray();

  const serializedEvents = events.map((event) => ({
   ...event,
   _id: event._id.toString(),
  })) as EventResponse[];

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
