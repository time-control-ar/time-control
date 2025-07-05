import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { EventResponse, obtainEvents } from "@/services/eventService";
import { NextResponse } from "next/server";

export async function GET() {
 try {
  const session = await auth();

  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const events = await obtainEvents();

  return NextResponse.json({ success: true, data: events });
 } catch (error) {
  console.error("Error al obtener eventos:", error);
  return NextResponse.json({ success: false, data: [] }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
  const body = await req.json();
  const session = await auth();
  console.log("insertando evento");
  console.log(body);

  if (!session?.user)
   return NextResponse.json({ success: false, data: [] }, { status: 401 });

  const { db } = await connectToDatabase();
  const result = await db.collection("events").insertOne(body);

  return NextResponse.json({
   success: true,
   data: [result] as unknown as EventResponse[],
  });
 } catch (error) {
  console.error("Error al crear evento:", error);
  return NextResponse.json({ success: false, data: [] }, { status: 500 });
 }
}
