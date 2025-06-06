import { NextResponse } from "next/server";

let events: any[] = [];

export async function GET() {
    return NextResponse.json(events);
}

export async function POST(req: Request) {
    const data = await req.json();
    const newEvent = { id: Date.now(), ...data}
    events.push(newEvent);
    return NextResponse.json(newEvent, {status:201})
}