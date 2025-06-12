import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
 try {
  const params = request.nextUrl.searchParams;

  const { data } = await axios.get("https://api.example.com/events", {
   params: {
    name: params.get("name"),
    date: params.get("date"),
    time: params.get("time"),
   },
  });

  return NextResponse.json({
   data,
   message: "Events fetched successfully",
  });
 } catch (error) {
  return NextResponse.json(
   { error: "Failed to fetch events", message: error },
   { status: 500 }
  );
 }
}

export async function POST(req: Request) {
 const formData = await req.formData();

 const name = formData.get("name") as string;
 const date = formData.get("date") as string;
 const time = formData.get("time") as string;
 const location = formData.get("location") as string;

 const image = formData.get("image");
 const results = formData.get("results");

 const newEvent = {
  id: Date.now(),
  name,
  date,
  time,
  location,
  image: image instanceof File ? image.name : null,
  results: results instanceof File ? results.name : null,
 };

 events.push(newEvent);

 return NextResponse.json(newEvent, { status: 201 });
}
