import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";

export default function Home() {

  return (
    <div className="flex flex-col h-screen sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white dark:bg-gray-950 overflow-hidden">

      <div className="px-6 w-full flex justify-between items-center pb-3">
        <AnimatedLogo />
        <ModeToggle />
      </div>

      <EventsListSearch />

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
