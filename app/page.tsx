import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import RunnerTicket from '@/components/ui/runner-ticket';
import { SignInButton } from '@/components/ui/sign-in-button';
import { searchEvents } from '@/lib/server/eventService';
import { obtainTicketServer } from '@/lib/server/ticketService';


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams?.eventId as string;
  const dorsal = resolvedSearchParams?.dorsal as string;

  const events = await searchEvents({ query: "" });
  const ticket = eventId && dorsal ? await obtainTicketServer(eventId, dorsal) : null;


  return (
    <>
      <div className="font-[family-name:var(--font-geist-sans)] min-h-screen">
        <div className="w-full flex flex-col gap-4 relative">
          <div className="px-6 w-full flex justify-between items-center max-w-5xl mx-auto">
            <AnimatedLogo />

            <div className="flex items-center gap-2">
              <ModeToggle />
              <SignInButton />
            </div>
          </div>

          {ticket ?
            <RunnerTicket runner={ticket} event={events?.[0]} /> :
            <EventsListSearch eventsData={events ?? []} />
          }
        </div>
      </div>

    </>
  );

}
