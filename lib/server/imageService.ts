import { BlobServiceClient } from "@azure/storage-blob";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const AZURE_STORAGE_CONNECTION_STRING =
 process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = "time-control";

export interface ImageInfo {
 url: string;
 blobName: string;
 eventId: string;
}

export async function deleteImageFromAzure(imageUrl: string): Promise<boolean> {
 try {
  if (!imageUrl || !imageUrl.includes("timecontrol.blob.core.windows.net")) {
   console.log("URL de imagen no válida para Azure:", imageUrl);
   return false;
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
   AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  // Extraer el nombre del blob de la URL
  const urlParts = imageUrl.split("/");
  const blobName = urlParts.slice(-2).join("/"); // events/timestamp.ext

  console.log("Eliminando blob:", blobName);

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();

  console.log("Imagen eliminada exitosamente de Azure");
  return true;
 } catch (error) {
  console.error("Error eliminando imagen de Azure:", error);
  return false;
 }
}

export async function replaceEventImage(
 eventId: string,
 newImageFile: File,
 oldImageUrl?: string
): Promise<string> {
 try {
  // Eliminar imagen anterior si existe
  if (oldImageUrl) {
   await deleteImageFromAzure(oldImageUrl);
  }

  // Subir nueva imagen
  const newImageUrl = await uploadFile(newImageFile, `events/${eventId}`);

  // Actualizar la base de datos
  const { db } = await connectToDatabase();
  await db.collection("events").updateOne(
   { _id: new ObjectId(eventId) },
   {
    $set: {
     image: newImageUrl,
     updatedAt: new Date().toISOString(),
    },
   }
  );

  return newImageUrl;
 } catch (error) {
  console.error("Error reemplazando imagen del evento:", error);
  throw error;
 }
}

export async function uploadFile(file: File, path: string): Promise<string> {
 console.log("Iniciando procesamiento de imagen...");

 // Convertir a buffer
 const originalBuffer = Buffer.from(await file.arrayBuffer());
 console.log("Buffer original creado:", originalBuffer.length, "bytes");

 // Armar nombre del archivo
 const fileExtension = file.name.split(".").pop();
 const timestamp = Date.now();
 const blobName = `${path}/${timestamp}.${fileExtension}`;
 console.log("Nombre del blob generado:", blobName);

 // Conectar con Azure Blob
 console.log("Conectando con Azure Blob Storage...");
 const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
 );
 const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
 console.log("Conexión establecida con el contenedor:", CONTAINER_NAME);

 // Asegurarse que el contenedor exista
 console.log("Verificando existencia del contenedor...");
 await containerClient.createIfNotExists();
 console.log("Contenedor verificado/creado exitosamente");

 const blockBlobClient = containerClient.getBlockBlobClient(blobName);
 console.log("Cliente de blob creado para:", blobName);

 // Subir imagen
 console.log("Iniciando subida de imagen...");
 await blockBlobClient.uploadData(originalBuffer, {
  blobHTTPHeaders: { blobContentType: file.type },
 });
 console.log("Imagen subida exitosamente");

 const imageUrl = blockBlobClient.url;
 console.log("URL de imagen generada:", imageUrl);

 return imageUrl;
}

export async function getEventImageInfo(
 eventId: string
): Promise<ImageInfo | null> {
 try {
  const { db } = await connectToDatabase();
  const event = await db
   .collection("events")
   .findOne({ _id: new ObjectId(eventId) });

  if (!event || !event.image) {
   return null;
  }

  // Extraer el nombre del blob de la URL
  const urlParts = event.image.split("/");
  const blobName = urlParts.slice(-2).join("/");

  return {
   url: event.image,
   blobName,
   eventId,
  };
 } catch (error) {
  console.error("Error obteniendo información de imagen del evento:", error);
  return null;
 }
}
