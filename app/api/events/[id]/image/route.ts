import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import {
 replaceEventImage,
 deleteImageFromAzure,
} from "@/lib/server/imageService";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
  const session = await auth();
  if (!session?.user) {
   return NextResponse.json(
    { success: false, message: "No autorizado" },
    { status: 401 }
   );
  }

  const formData = await req.formData();
  const imageFile = formData.get("image") as File;
  const deleteOldImage = formData.get("deleteOldImage") === "true";

  if (!imageFile) {
   return NextResponse.json(
    { success: false, message: "No se proporcionó imagen" },
    { status: 400 }
   );
  }

  const resolvedParams = await params;
  // Verificar que el evento existe
  const { db } = await connectToDatabase();
  const existingEvent = await db.collection("events").findOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (!existingEvent) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  // Reemplazar imagen
  const oldImageUrl = deleteOldImage ? existingEvent.image : undefined;
  const newImageUrl = await replaceEventImage(
   resolvedParams.id,
   imageFile,
   oldImageUrl
  );

  return NextResponse.json({
   success: true,
   data: { imageUrl: newImageUrl },
   message: "Imagen actualizada exitosamente",
  });
 } catch (error) {
  console.error("Error al actualizar imagen del evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}

export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
  const session = await auth();
  if (!session?.user) {
   return NextResponse.json(
    { success: false, message: "No autorizado" },
    { status: 401 }
   );
  }

  const resolvedParams = await params;
  // Verificar que el evento existe y obtener la imagen actual
  const { db } = await connectToDatabase();
  const existingEvent = await db.collection("events").findOne({
   _id: new ObjectId(resolvedParams.id),
  });

  if (!existingEvent) {
   return NextResponse.json(
    { success: false, message: "Evento no encontrado" },
    { status: 404 }
   );
  }

  if (!existingEvent.image) {
   return NextResponse.json(
    { success: false, message: "El evento no tiene imagen" },
    { status: 404 }
   );
  }

  // Eliminar imagen de Azure
  const deleted = await deleteImageFromAzure(existingEvent.image);

  if (deleted) {
   // Actualizar la base de datos para remover la referencia a la imagen
   await db.collection("events").updateOne(
    { _id: new ObjectId(resolvedParams.id) },
    {
     $set: {
      image: "",
      updatedAt: new Date().toISOString(),
     },
    }
   );

   return NextResponse.json({
    success: true,
    message: "Imagen eliminada exitosamente",
   });
  } else {
   return NextResponse.json(
    { success: false, message: "Error al eliminar la imagen" },
    { status: 500 }
   );
  }
 } catch (error) {
  console.error("Error al eliminar imagen del evento:", error);
  return NextResponse.json(
   { success: false, message: "Error interno del servidor" },
   { status: 500 }
  );
 }
}
