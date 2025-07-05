import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';
import { EventResponse, obtainEvents } from '@/services/eventService';

export default async function Home() {
  const events = (await obtainEvents()) as unknown as Array<EventResponse>;

  return (
    <div className="flex flex-col h-screen font-[family-name:var(--font-geist-sans)] relative bg-white dark:bg-gray-950 overflow-y-auto">

      <div className="px-6 w-full flex justify-between items-center">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      {events?.length > 0 ? (
        <EventsListSearch
          eventsData={events}
        />
      ) : (
        <div className="p-10 w-full flex justify-center items-center0">
          <p className='text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight'>
            No hay eventos
          </p>
        </div>
      )}

    </div>
  );

}
