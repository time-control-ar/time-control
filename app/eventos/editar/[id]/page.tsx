import EventForm from '@/components/events/event-form'
import { getEventById } from '@/services/event'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarEvento({ params }: PageProps) {
  const resolvedParams = await params
  const event = await getEventById(resolvedParams?.id ?? '')

  return <EventForm event={event} />
}
