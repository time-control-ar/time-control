import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { EventResponse } from "@/services/eventService";
import { obtainEventsServer } from "@/lib/server/eventService";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/server/uploadService";
import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";
import { ObjectId } from "mongodb";

export async function GET() {
 try {
  const session = await auth();

  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const events = await obtainEventsServer();

  return NextResponse.json({ success: true, data: events });
 } catch (error) {
  console.error("Error al obtener eventos:", error);
  return NextResponse.json({ success: false, data: [] }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
  const session = await auth();
  if (!session?.user)
   return NextResponse.json(
    { success: false, message: "No autorizado" },
    { status: 401 }
   );

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

  // Handle image upload if provided
  let imageUrl = "";
  const eventImage = formData.get("image") as File;
  if (eventImage && eventImage.size > 0) {
   imageUrl = (await uploadFile(eventImage, "events")) || "";
  }

  // Parse location as object
  let location = { lat: -34.397, lng: 150.644 };
  try {
   const locationData = formData.get("location");
   if (locationData) {
    location = JSON.parse(locationData as string);
   }
  } catch (error) {
   console.error("Error parsing location:", error);
  }

  // Parse types array
  const types: string[] = [];
  for (const [key, value] of formData.entries()) {
   if (key.startsWith("type[") && key.endsWith("]")) {
    types.push(value as string);
   }
  }

  const newEvent = {
   name: formData.get("name"),
   date: formData.get("date"),
   startTime: formData.get("startTime"),
   endTime: formData.get("endTime"),
   location: location,
   locationName: formData.get("locationName"),
   description: formData.get("description"),
   maxParticipants: parseInt(formData.get("maxParticipants") as string) || 0,
   image: imageUrl,
   results: results || {},
   createdBy: session?.user?.email || "",
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
   type: types,
  };
  const { db } = await connectToDatabase();
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

  const serializedEvent: EventResponse = {
   _id: createdEvent._id.toString(),
   name: createdEvent.name,
   date: createdEvent.date,
   startTime: createdEvent.startTime,
   endTime: createdEvent.endTime,
   location: {
    lat: createdEvent.location.lat,
    lng: createdEvent.location.lng,
   },
   locationName: createdEvent.locationName,
   description: createdEvent.description,
   maxParticipants: createdEvent.maxParticipants,
   image: createdEvent.image,
   results: createdEvent.results,
   createdBy: createdEvent.createdBy,
   createdAt: createdEvent.createdAt,
   updatedAt: createdEvent.updatedAt,
   type: createdEvent.type,
  };

  return NextResponse.json({
   success: true,
   data: [serializedEvent],
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
