import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET(
 req: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 const resolvedParams = await params;
 const { db } = await connectToDatabase();
 const event = await db
  .collection("events")
  .findOne({ _id: new ObjectId(resolvedParams.id) });

 if (!event) {
  return NextResponse.json({ success: false, data: [] }, { status: 404 });
 }

 return NextResponse.json({ success: true, data: [event] });
}
export async function PUT(
 req: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
  console.log("editing event", req.body);
  const session = await auth();
  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const resolvedParams = await params;
  const newEvent = await req.json();

  const { db } = await connectToDatabase();

  // Check if event exists
  const existingEvent = await db.collection("events").findOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (!existingEvent) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  const result = await db
   .collection("events")
   .updateOne({ _id: new ObjectId(resolvedParams.id) }, { $set: newEvent });

  if (result.matchedCount === 0) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  // Get the updated event
  const updatedEvent = await db.collection("events").findOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (!updatedEvent) {
   return NextResponse.json(
    { success: false, message: "Error al recuperar el evento actualizado" },
    { status: 500 }
   );
  }

  return NextResponse.json({
   success: true,
   data: [updatedEvent],
  });
 } catch (error) {
  console.error("Error al actualizar evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}

export async function DELETE(
 req: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
  const session = await auth();
  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const resolvedParams = await params;
  const { db } = await connectToDatabase();

  // Obtener el evento antes de eliminarlo para poder eliminar sus imágenes
  const eventToDelete = await db.collection("events").findOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (!eventToDelete) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  // Eliminar el evento de la base de datos
  const result = await db.collection("events").deleteOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (result.deletedCount === 0) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  return NextResponse.json({
   success: true,
   message: "Evento eliminado exitosamente",
  });
 } catch (error) {
  console.error("Error al eliminar evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}
