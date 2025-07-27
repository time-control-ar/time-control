import { searchEvents } from "@/lib/server/eventService";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET() {
 try {
  const session = await auth();

  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const events = await searchEvents({ query: "" });

  return NextResponse.json({ success: true, data: events });
 } catch (error) {
  console.error("Error al obtener eventos:", error);
  return NextResponse.json({ success: false, data: [] }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
  const { db } = await connectToDatabase();
  const newEvent = await req.json();
  console.log("newEvent", newEvent);

  const result = await db.collection("events").insertOne(newEvent);

  // Get the created event to return it
  const createdEvent = await db.collection("events").findOne({
   _id: result.insertedId,
  });

  if (!createdEvent) {
   return NextResponse.json(
    { success: false, message: "Error al crear el evento" },
    { status: 500 }
   );
  }

  // Serializar el evento para evitar problemas con ObjectId
  const serializedEvent = {
   ...createdEvent,
   _id: createdEvent._id.toString(),
  };

  return NextResponse.json({
   success: true,
   data: serializedEvent,
  });
 } catch (error) {
  console.error("Error al crear evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}

export async function DELETE(req: Request) {
 try {
  const session = await auth();
  if (!session?.user)
   return NextResponse.json(
    { success: false, message: "No autorizado" },
    { status: 401 }
   );

  const eventId = req.url.split("/").pop();

  const { db } = await connectToDatabase();
  const result = await db.collection("events").deleteOne({
   _id: new ObjectId(eventId),
  });

  if (!result.deletedCount) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  return NextResponse.json({
   success: true,
   message: "Evento eliminado correctamente",
  });
 } catch (error) {
  console.error("Error al eliminar evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}
