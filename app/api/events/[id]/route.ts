import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { EventResponse } from "@/services/eventService";
import { NextResponse } from "next/server";
import { uploadFile } from "../../upload/route";
import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";
import { ObjectId } from "mongodb";

export async function PUT(
 req: Request,
 { params }: { params: { id: string } }
) {
 try {
  const session = await auth();
  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const formData = await req.formData();
  let results: RaceCheckProps | undefined;

  try {
   const resultsData = formData.get("results");
   if (resultsData) {
    const parsedResults = JSON.parse(resultsData as string);
    // Validate the parsed results has the expected shape
    if (typeof parsedResults === "object" && parsedResults !== null) {
     results = parsedResults as RaceCheckProps;
    }
   }
  } catch (error) {
   console.error("Error parsing results:", error);
   results = undefined;
  }

  // Handle image upload if a new image is provided
  let imageUrl = "";
  const eventImage = formData.get("image") as File;
  if (eventImage && eventImage.size > 0) {
   const eventName = formData.get("name")?.toString() || "events";

   imageUrl = (await uploadFile(eventImage, eventName)) || "";
  }

  const { db } = await connectToDatabase();

  // Check if event exists
  const existingEvent = await db.collection("events").findOne({
   _id: new ObjectId(params.id),
  });

  if (!existingEvent) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  // Prepare update data
  const updateData: {
   name: FormDataEntryValue | null;
   date: FormDataEntryValue | null;
   time: FormDataEntryValue | null;
   location: FormDataEntryValue | null;
   description: FormDataEntryValue | null;
   maxParticipants: number;
   updatedAt: string;
   image?: string;
   results?: RaceCheckProps;
  } = {
   name: formData.get("name"),
   date: formData.get("date"),
   time: formData.get("time"),
   location: formData.get("location"),
   description: formData.get("description"),
   maxParticipants: parseInt(formData.get("maxParticipants") as string) || 0,
   updatedAt: new Date().toISOString(),
  };

  // Only update image if a new one was uploaded
  if (imageUrl) {
   updateData.image = imageUrl;
  }

  // Only update results if new results were provided
  if (results) {
   updateData.results = results;
  }

  const result = await db
   .collection("events")
   .updateOne({ _id: new ObjectId(params.id) }, { $set: updateData });

  if (result.matchedCount === 0) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  // Get the updated event
  const updatedEvent = await db.collection("events").findOne({
   _id: new ObjectId(params.id),
  });

  if (!updatedEvent) {
   return NextResponse.json(
    { success: false, message: "Error al recuperar el evento actualizado" },
    { status: 500 }
   );
  }

  const serializedEvent: EventResponse = {
   _id: updatedEvent._id.toString(),
   name: updatedEvent.name,
   date: updatedEvent.date,
   time: updatedEvent.time,
   location: updatedEvent.location,
   description: updatedEvent.description,
   maxParticipants: updatedEvent.maxParticipants,
   image: updatedEvent.image,
   results: updatedEvent.results,
   createdBy: updatedEvent.createdBy,
   createdAt: updatedEvent.createdAt,
   updatedAt: updatedEvent.updatedAt,
  };

  return NextResponse.json({
   success: true,
   data: [serializedEvent],
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
 { params }: { params: { id: string } }
) {
 try {
  const session = await auth();
  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const { db } = await connectToDatabase();

  const result = await db.collection("events").deleteOne({
   _id: new ObjectId(params.id),
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
