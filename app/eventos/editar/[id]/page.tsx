import EventForm from '@/components/events/event-form'
import { getEventById } from '@/lib/server/eventService'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditarEvento({ params }: PageProps) {
  const event = await getEventById(params.id)

  return <EventForm event={event} />
}
