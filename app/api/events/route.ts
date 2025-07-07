import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { EventResponse } from "@/services/eventService";
import { obtainEventsServer } from "@/lib/server/eventService";
import { NextResponse } from "next/server";
import { uploadFile } from "../upload/route";
import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";

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

  const newEvent = {
   name: formData.get("name"),
   date: formData.get("date"),
   time: formData.get("time"),
   location: formData.get("location"),
   description: formData.get("description"),
   maxParticipants: parseInt(formData.get("maxParticipants") as string) || 0,
   image: imageUrl,
   results: results || {},
   createdBy: session?.user?.email || "",
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
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
   time: createdEvent.time,
   location: createdEvent.location,
   description: createdEvent.description,
   maxParticipants: createdEvent.maxParticipants,
   image: createdEvent.image,
   results: createdEvent.results,
   createdBy: createdEvent.createdBy,
   createdAt: createdEvent.createdAt,
   updatedAt: createdEvent.updatedAt,
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
