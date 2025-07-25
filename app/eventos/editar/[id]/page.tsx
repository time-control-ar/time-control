import EventForm from '@/components/events/event-form'
import { EventResponse } from '@/lib/schemas/event.schema'
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { db } = await connectToDatabase();
  const event = (await db
    .collection("events")
    .findOne({ _id: new ObjectId(id) })) as EventResponse | null;

  const serializedEvent = event ? { ...event, _id: event._id.toString(), location: event.location } : null;

  return (
    <div className="font-[family-name:var(--font-geist-sans)] relative bg-white dark:bg-gray-950 items-center justify-center">
      <EventForm event={serializedEvent} />
    </div>
  )
}
