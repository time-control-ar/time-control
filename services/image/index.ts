"use server";

import { del, put } from "@vercel/blob";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const uploadImage = async (
 eventId: string,
 fileName: string,
 file: File,
 type: "image" | "logo"
) => {
 try {
  const blob = await put(fileName, file, {
   access: "public",
   addRandomSuffix: true,
   contentType: file.type,
   token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  //  update the event image to the new blob url
  const { db } = await connectToDatabase();

  await db
   .collection("events")
   .updateOne({ _id: new ObjectId(eventId) }, { $set: { [type]: blob.url } });

  return blob;
 } catch (error) {
  console.log("error uploadImage", error);
  throw error;
 }
};

export const deleteImage = async (
 eventId: string,
 fileUrl: string,
 type: "image" | "logo"
) => {
 try {
  console.log("deleting image", fileUrl);
  const blob = await del(fileUrl, {
   token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const { db } = await connectToDatabase();
  await db
   .collection("events")
   .updateOne({ _id: new ObjectId(eventId) }, { $set: { [type]: "" } });

  return blob;
 } catch (error) {
  console.log("error deleteImage", error);
  throw error;
 }
};
