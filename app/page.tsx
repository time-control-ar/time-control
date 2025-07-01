import EventsListSearch from '@/components/events/events-list-search';
import { ModeToggle } from '@/components/mode-toggle';
import AnimatedLogo from "@/components/ui/animated-logo";
import { SignInButton } from '@/components/ui/sign-in-button';
import { MenuIcon } from 'lucide-react';

export default function Home() {

  return (
    <div className="flex flex-col h-screen font-[family-name:var(--font-geist-sans)] bg-white dark:bg-gray-950 overflow-hidden">

      <div className="px-6 w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MenuIcon className="w-5 h-5 text-gray-900 dark:text-white mt-2" />
          <AnimatedLogo />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <EventsListSearch />

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
