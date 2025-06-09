import { NextResponse } from "next/server"

let events: any[] = []

export async function GET() {
  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const location = formData.get('location') as string

  const image = formData.get('image') 
  const results = formData.get('results') 

  const newEvent = {
    id: Date.now(),
    name,
    date,
    time,
    location,
    image: image instanceof File ? image.name : null, 
    results: results instanceof File ? results.name : null
  }

  events.push(newEvent)

  return NextResponse.json(newEvent, { status: 201 })
}
