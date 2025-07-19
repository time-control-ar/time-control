import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';
import { obtainEventsServer } from '@/lib/server/eventService';

export default async function Home() {
  const events = await obtainEventsServer();

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] bg-white dark:bg-gray-950 relative">

      <div className="px-6 w-full flex justify-between items-center max-w-7xl mx-auto">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <EventsListSearch eventsData={events} />
    </div>
  );

}
