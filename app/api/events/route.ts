import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
 eventCreateSchema,
 eventResponseSchema,
} from "@/lib/schemas/event.schema";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
 try {
  const session = await auth();

  if (!session?.user) {
   return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { db } = await connectToDatabase();
  const events = await db.collection("events").find({}).toArray();

  return NextResponse.json({
   data: events,
   message: "Eventos obtenidos exitosamente",
  });
 } catch (error) {
  console.error("Error obteniendo eventos:", error);
  return NextResponse.json(
   { error: "Error interno del servidor" },
   { status: 500 }
  );
 }
}

export async function POST(req: Request) {
 try {
  const session = await auth();

  if (!session?.user) {
   return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await req.formData();

  // Validar datos del formulario
  const validationResult = eventCreateSchema.safeParse({
   name: formData.get("name"),
   date: formData.get("date"),
   time: formData.get("time"),
   location: formData.get("location"),
   description: formData.get("description"),
   maxParticipants: formData.get("maxParticipants")
    ? parseInt(formData.get("maxParticipants") as string)
    : undefined,
   image: formData.get("image"),
   results: formData.get("results"),
   parsedResults: formData.get("parsedResults"),
  });

  if (!validationResult.success) {
   return NextResponse.json(
    { error: "Datos inválidos", details: validationResult.error.errors },
    { status: 400 }
   );
  }

  const { data } = validationResult;
  const { db } = await connectToDatabase();

  // Procesar archivos si existen
  let imageUrl = null;
  let resultsUrl = null;

  if (data.image && data.image instanceof File) {
   // Aquí implementarías la lógica para subir la imagen
   // Por ejemplo, a Cloudinary, AWS S3, etc.
   imageUrl = `uploads/images/${Date.now()}_${data.image.name}`;
  }

  if (data.results && data.results instanceof File) {
   // Aquí implementarías la lógica para subir el archivo de resultados
   resultsUrl = `uploads/results/${Date.now()}_${data.results.name}`;
  }

  // Crear el evento en MongoDB
  const newEvent = {
   name: data.name,
   date: data.date,
   time: data.time,
   location: data.location,
   description: data.description,
   maxParticipants: data.maxParticipants,
   image: imageUrl,
   results: resultsUrl,
   parsedResults: data.parsedResults,
   categories: data.categories,
   participants: data.participants,
   createdBy: session.user.id,
   createdAt: new Date().toISOString(),
   updatedAt: new Date().toISOString(),
  };

  const result = await db.collection("events").insertOne(newEvent);

  const createdEvent = {
   _id: result.insertedId.toString(),
   ...newEvent,
  };

  // Validar la respuesta
  const responseValidation = eventResponseSchema.safeParse(createdEvent);
  if (!responseValidation.success) {
   console.error("Error validando respuesta:", responseValidation.error);
  }

  return NextResponse.json(createdEvent, { status: 201 });
 } catch (error) {
  console.error("Error creando evento:", error);
  return NextResponse.json(
   { error: "Error interno del servidor" },
   { status: 500 }
  );
 }
}
