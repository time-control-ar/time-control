import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING =
 process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = "time-control";

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
