import EventForm from '@/components/events/event-form'
import { getEventById } from '@/lib/server/eventService';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const event = await getEventById(id)

  return (
    <div className="font-[family-name:var(--font-geist-sans)] relative bg-white dark:bg-gray-950 items-center justify-center">
      <EventForm event={event} />
    </div>
  )
}
