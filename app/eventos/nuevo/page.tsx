import EventForm from '@/components/events/event-form'

export default function Page() {
  return (
    <div className="flex flex-col h-full font-[family-name:var(--font-geist-sans)] relative bg-white dark:bg-gray-950 overflow-y-auto items-center justify-center">
      <EventForm />
    </div>
  )
}
