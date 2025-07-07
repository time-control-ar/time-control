import { BlobServiceClient } from "@azure/storage-blob";
import { NextRequest } from "next/server";
// import sharp from "sharp";

const AZURE_STORAGE_CONNECTION_STRING =
 process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = "time-control";

export async function uploadFile(file: File, path: string) {
 console.log("Iniciando procesamiento de imagen...");

 // Convertir a buffer y redimensionar (por ejemplo, 800px de ancho)
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

 // Subir imagen editada
 console.log("Iniciando subida de imagen...");
 await blockBlobClient.uploadData(originalBuffer, {
  blobHTTPHeaders: { blobContentType: file.type },
 });
 console.log("Imagen subida exitosamente");

 const imageUrl = blockBlobClient.url;
 console.log("URL de imagen generada:", imageUrl);

 return imageUrl;
}

export async function POST(
 req: NextRequest
): Promise<{ error?: string; url?: string }> {
 const formData = await req.formData();
 const file: File | undefined = formData.get("file") as File;
 const eventId: string | undefined = formData.get("eventId")?.toString();

 if (!file || !eventId)
  return { error: "Faltan datos requeridos (imagen o eventId)" };

 const blobUrl = await uploadFile(file, eventId);
 return { url: blobUrl };
}
