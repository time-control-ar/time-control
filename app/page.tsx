import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';
import { searchEvents } from '@/services/event';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const eventId = resolvedSearchParams?.eventId as string;
  const dorsal = resolvedSearchParams?.dorsal as string;

  console.log(eventId, dorsal)

  // Solo intentar obtener el ticket si tenemos tanto eventId como dorsal
  // let ticket = null;
  // let event = null;

  // if (eventId && dorsal) {
  //   console.log("Buscando ticket para eventId:", eventId, "dorsal:", dorsal);
  //   ticket = await obtainTicketServer(eventId, dorsal);

  //   if (ticket) {
  //     // Si encontramos el ticket, necesitamos el evento correspondiente
  //     const { getEventById } = await import('@/lib/server/eventService');
  //     event = await getEventById(eventId);
  //     console.log("Ticket encontrado:", ticket);
  //     console.log("Evento encontrado:", event?.name);
  //   } else {
  //     console.log("No se pudo obtener el ticket");
  //   }
  // }
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

      <EventsListSearch eventsData={events ?? []} />
    </div>
  );
}
