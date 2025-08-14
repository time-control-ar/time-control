import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';
import { getRunnerTicket, searchEvents } from '@/services/event';
import RunnerTicket from '@/components/ui/runner-ticket';
import { TicketResponse } from '@/lib/schemas/racecheck.schema';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams?.eventId as string;
  const dorsal = resolvedSearchParams?.dorsal as string;

  let ticket: TicketResponse | null = null;
  if (eventId && dorsal) {
    console.log("Buscando ticket para eventId:", eventId, "dorsal:", dorsal);
    ticket = await getRunnerTicket(eventId, dorsal);
  }
  const events = await searchEvents({ query: "" });

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">

      <div className="px-4 md:px-6 w-full flex justify-between items-center max-w-5xl mx-auto">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      {ticket ? (
        <div className="m-auto max-w-[700px] max-h-[80vh] flex flex-col gap-4">
          <RunnerTicket runner={ticket.runner} event={ticket.event} metrics={ticket.metrics} />
        </div>
      ) : (
        <EventsListSearch eventsData={events ?? []} />
      )}
    </div>
  );
}
