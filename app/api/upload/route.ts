import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/server/uploadService";

export async function POST(req: NextRequest) {
 const formData = await req.formData();
 const file: File | undefined = formData.get("file") as File;
 const eventId: string | undefined = formData.get("eventId")?.toString();

 if (!file || !eventId)
  return NextResponse.json(
   { error: "Faltan datos requeridos (imagen o eventId)" },
   { status: 400 }
  );

 const blobUrl = await uploadFile(file, eventId);
 return NextResponse.json({
  success: true,
  data: { url: blobUrl },
 });
}
